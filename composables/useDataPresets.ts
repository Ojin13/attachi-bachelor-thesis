import type { Contact, DataPreset, DataPresetUpdatePayload, DependentQuestions, Question, UpdatedAnswer, UpdatedAnswers, RequestData } from "~/types";
import { QuestionDataType, ServerAction, YesNoValue } from "~/types";

/**
 * Composable function that handles operations around data presets and questions.
 * @param dataPresets - The data presets to work with.
 */
export function useDataPresets(dataPresets: Ref<DataPreset[]>) {
    const { deriveDependentAnswer } = useDependencyResolver();
    const { callFire } = useFirebaseConnector();

    /**
     * This function is used to generate a "mini" summary of a contact based on some of the
     * most important information. This is used only if contact has no custom description.
     * @param contactData - The contact data to generate the summary for.
     * @param limit - The character limit for the summary.
     * @param forceNew - If true, it will generate a new summary even if the contact has a custom description.
     * @returns The generated summary as a string.
     */
    const generateContactSummary = (contactData: Contact, limit = 180, forceNew = false): string => {
        let desc = "";

        if (contactData.description && !forceNew) {
            desc = contactData.description;
        } else {
            /**
             * 2 - Age
             * 4 - Address
             * 19 - Company
             * 20 - Position
             * 30 - MBTI
             * 64 - Nationality
             */
            const relevantQuestionsForSummary = [2, 4, 19, 20, 30, 64];

            for (let i = 0; i < relevantQuestionsForSummary.length; i++) {
                let question = getQuestionByID(relevantQuestionsForSummary[i]);

                if (!question) {
                    continue;
                }

                if (question.answer != "") {
                    desc += question.answer;

                    if (relevantQuestionsForSummary[i] == 2) {
                        desc += " y.o";
                    }

                    desc += ", ";
                }
            }

            // Remove the last " • " from the string.
            if (desc != "") {
                desc = desc.slice(0, -2);
            }
        }

        // If the description is too long, cut it off and add "..."
        if (desc.length > limit) {
            desc = desc.substring(0, limit) + "...";
            let lastSpaceIndex = desc.lastIndexOf(" ");
            desc = desc.substring(0, lastSpaceIndex) + "...";
        }

        return desc;
    };

    /**
     * Helper function to get a data preset by a question ID. The same question
     * can appear in multiple data presets, this function will return the first
     * data preset that contains the question.
     * @param questionID - The ID of the question to get the preset for.
     * @returns The data preset that contains the question or null if not found.
     */
    const getPresetByQuestionID = (questionID: number | string): DataPreset | null => {
        for (let presetID in dataPresets.value) {
            let preset = dataPresets.value[presetID];

            for (let curQuestionID in preset.questions) {
                if (curQuestionID == questionID) {
                    return preset;
                }
            }
        }

        return null;
    };

    /**
     * Helper function to get a list of all questions from all data presets.
     * @returns An array of all questions from all data presets.
     */
    const getListOfAllQuestions = (): Question[] => {
        let allQuestions: Question[] = [];

        for (let presetID in dataPresets.value) {
            let preset = dataPresets.value[presetID];

            for (let questionID in preset.questions) {
                let question = preset.questions[questionID];
                if (allQuestions[questionID] == undefined) {
                    allQuestions[questionID] = question;
                }
            }
        }

        return allQuestions;
    };

    /**
     * Determines if a question should be displayed based on the answer of its parent question.
     * For example, if the parent question is of type bool and the answer is true, the child question
     * will be displayed. Eg - "Do you have a car?" -> "What is the model of your car?"
     *
     * @param questionID - The ID of the question to determine if it should be displayed.
     * @param forceDisplay - If true, the question will be displayed regardless of the parent question answer.
     * @returns A css class that will hide the question if it should not be displayed.
     */
    const displayQuestion = (questionID: number, forceDisplay = false) => {
        let question = getListOfAllQuestions()[questionID];
        let displayQuestion = false;

        if (!question) {
            return {
                "detailPage__data__preset__questionPanel--hide": true,
            };
        }

        if (forceDisplay) {
            return;
        }

        // If depends on some parent question
        if (question.parentQuestionID) {
            // If parent question exists
            let parentQuestion = getListOfAllQuestions()[question.parentQuestionID];

            if (parentQuestion) {
                // Bool type of question shows child question if parent question is true
                if (parentQuestion.questionDataType == QuestionDataType.bool) {
                    if (parentQuestion.answer == YesNoValue.true) {
                        displayQuestion = true;
                    }
                    // Bool_reverse type of question shows child question if parent question is false
                } else if (parentQuestion.questionDataType == QuestionDataType.boolReverse) {
                    if (parentQuestion.answer == YesNoValue.false) {
                        displayQuestion = true;
                    }
                }
            }
        } else {
            displayQuestion = true;
        }

        return {
            "detailPage__data__preset__questionPanel--hide": displayQuestion == false,
        };
    };

    /**
     * Helper function to get a question by its ID.
     * @param questionID - The ID of the question to get.
     * @returns The question with the specified ID or null if not found.
     */
    const getQuestionByID = (questionID: number): Question => {
        return getListOfAllQuestions()[questionID];
    };

    /**
     * Calculates the completeness of a contact based on the number of
     * answered questions.
     * @returns The completeness of the contact as a percentage.
     */
    const calculateContactCompleteness = (): number => {
        let totalQuestions = 0;
        let totalAnswered = 0;
        let scannedQuestionIDs: number[] = [];

        for (let presetID in dataPresets.value) {
            let preset = dataPresets.value[presetID];

            for (let questionID in preset.questions) {
                let question = preset.questions[questionID];

                if (scannedQuestionIDs.includes(parseInt(questionID))) {
                    continue;
                }

                if (question.parentQuestionID == 0) {
                    scannedQuestionIDs.push(parseInt(questionID));
                    totalQuestions++;
                } else {
                    let parentQuestion = getQuestionByID(question.parentQuestionID);
                    if (parentQuestion) {
                        if (parentQuestion.answer == YesNoValue.true) {
                            totalQuestions++;
                        }
                    }
                }

                if (question.answer != "" && question.answer != undefined && question.answer != null) {
                    totalAnswered++;
                }
            }
        }

        // Count how many percent is answered
        let percent = Math.round((totalAnswered / totalQuestions) * 100);

        if (isNaN(percent)) {
            percent = 0;
        }

        return percent;
    };

    /**
     * Helper function to get number of answered questions in a preset
     * versus the total number of questions as a string. If data preset
     * contains dependent questions, it will only count the dependent
     * questions if the parent question is answered and therefore visible.
     * @param preset - The preset to calculate the progress for.
     * @returns The progress as a string for example "5/10".
     */
    const getPresetProgress = (preset: DataPreset) => {
        let totalQuestions = 0;
        let answeredQuestions = 0;

        for (let questionID in preset.questions) {
            let question = preset.questions[questionID];

            // Get total number of questions
            if (!question.parentQuestionID) {
                totalQuestions++;
            } else {
                let parentQuestion = getQuestionByID(question.parentQuestionID);
                if (parentQuestion) {
                    if (parentQuestion.answer == YesNoValue.true) {
                        totalQuestions++;
                    }
                }
            }

            // Count answered questions
            if (question.answer) {
                if (!question.parentQuestionID) {
                    answeredQuestions++;
                } else {
                    let parentQuestion = getQuestionByID(question.parentQuestionID);
                    if (parentQuestion) {
                        if (parentQuestion.answer == YesNoValue.true) {
                            answeredQuestions++;
                        }
                    }
                }
            }
        }

        return answeredQuestions + "/" + totalQuestions;
    };

    /**
     * Helper function to check if all questions in a list are answered.
     * @param questionIDs - The IDs of the questions to check.
     * @returns True if all questions are answered, false otherwise.
     */
    const checkIfQuestionsAnswered = (questionIDs: number[]): boolean => {
        let answered = true;
        for (let id in questionIDs) {
            let question = getQuestionByID(questionIDs[id]);
            if (question.answer) {
                answered = false;
                break;
            }
        }
        return answered;
    };

    /**
     * Helper function to get all dependent questions of a provided parent question.
     * @param question - The parent question to get the dependent questions for.
     * @param contactID - The ID of the contact to get the dependent questions for.
     * @returns An object containing all dependent questions of the parent question.
     */
    const getDependentQuestions = (question: Question, contactID: number): DependentQuestions => {
        let dependencies: DependentQuestions = {};

        if (question.dependentQuestionIDs) {
            // Load dependent questions from provided ids
            Object.values(question.dependentQuestionIDs).forEach((dependentQuestionID) => {
                let dependentQuestion = getQuestionByID(dependentQuestionID);

                if (dependentQuestion != undefined) {
                    dependentQuestion.dependencies = getDependentQuestions(dependentQuestion, contactID);
                    dependentQuestion.contact_id = contactID;

                    dependencies[String(dependentQuestionID)] = dependentQuestion;
                }
            });
        }

        return dependencies;
    };

    /**
     * This function calls the Firebase function to update the question and its dependencies
     * in the database. The dependencies are also updated locally in the vuex store before
     * sending the request to the server. This is to keep the UI in sync with the database
     * and to prevent delay that would occur if the dependencies were updated on the server.
     *
     * @param data - The request payload with question to update and its dependencies.
     * @returns The result of the update operation and null if the operation failed.
     */
    const updateDataPreset = async (data: DataPresetUpdatePayload) => {
        // Make sure answer is string
        data.question.answer = String(data.question.answer);

        // Prepare payload
        let payload: RequestData = { action: ServerAction.updateDataPresets, ...data.question };

        if (data.dependencies && Object.keys(data.dependencies).length > 0) {
            // Also update dependent questions before sending the request
            Object.keys(data.dependencies).forEach((dependentQuestionID: any) => {
                const derivedAnswer = deriveDependentAnswer(data.question, data.dependencies[dependentQuestionID]);
                if (derivedAnswer) {
                    data.dependencies[dependentQuestionID].answer = derivedAnswer;
                }

                updateAnswerAcrossDataPresets(data.dependencies[dependentQuestionID]);
            });

            payload.dependencies = data.dependencies;
        }

        return callFire(payload).then(async (result) => {
            // Update answerID of dependent questions and all its dependencies across all data presets
            if (result.dependencies) {
                updateDependenciesAnswerID(result.dependencies);
            }

            // Update answer id of the original (parent) across all data presets
            updateAnswerIdAcrossDataPresets(result, result.deleted ? true : false);

            // If deleted
            if (result.deleted) {
                console.log("Answer removed!");
            }

            // If updated
            if (result.updated) {
                console.log("Answer updated!");
            }

            // If created
            if (result.new) {
                console.log("Answer created!");
            }

            return result;
        });
    };

    /**
     * Helper function that recursively update answerID of all provided dependencies and their children.
     * This function is called after we receive the updated dependencies from the server.
     * @param updatedDependencies - The updated dependencies from the server.
     */
    const updateDependenciesAnswerID = (updatedDependencies: UpdatedAnswers) => {
        if (!updatedDependencies) {
            return;
        }

        if (Object.keys(updatedDependencies).length == 0) {
            return;
        }

        Object.values(updatedDependencies).forEach(async (updatedDependency: UpdatedAnswer) => {
            updateAnswerIdAcrossDataPresets(updatedDependency, false);

            // Recursively update all dependencies of current dependent question
            if (updatedDependency.dependencies) {
                if (Object.keys(updatedDependency.dependencies).length > 0) {
                    updateDependenciesAnswerID(updatedDependency.dependencies);
                }
            }
        });
    };

    /**
     * Updates the answer of the provided question across all data presets.
     * This function is called before sending the updated question to the server to
     * prevent the UI from waiting for the server response.
     * @param question - The question to update across all data presets.
     * @returns void
     */
    const updateAnswerAcrossDataPresets = (question: Question) => {
        for (let presetID in dataPresets.value) {
            // Same question can have multiple instances in different data presets
            let currentQuestionInstance = dataPresets.value[presetID].questions[question.id];
            if (currentQuestionInstance) {
                currentQuestionInstance.answer = question.answer;
            }
        }
    };

    /**
     * Updates the answerID of the answered question across all data presets.
     * This function is called after the server responds with the updated answerID.
     * @param answer - The updated answer with the new answerID and questionID.
     * @param deleteAnswer - If true, the answer was deleted from the database and it should be removed here.
     * @returns void
     */
    const updateAnswerIdAcrossDataPresets = (answer: UpdatedAnswer, deleteAnswer: boolean = false) => {
        let questionID = answer.question_id;

        for (let presetID in dataPresets.value) {
            let currentQuestionInstance = dataPresets.value[presetID].questions[questionID];
            if (currentQuestionInstance) {
                if (deleteAnswer) {
                    delete currentQuestionInstance.answerID;
                } else {
                    if (answer.id) {
                        currentQuestionInstance["answerID"] = answer.id;
                    }
                }
            }
        }
    };

    return {
        generateContactSummary,
        getPresetByQuestionID,
        getListOfAllQuestions,
        displayQuestion,
        getPresetProgress,
        calculateContactCompleteness,
        checkIfQuestionsAnswered,
        getDependentQuestions,
        updateDataPreset,
        updateAnswerAcrossDataPresets,
        getQuestionByID,
    };
}
