import type { ContactGroup, DataPresetsOfAllContacts, Question, ContactIDsGroupedByAnswers } from "~/types";
import { QuestionDataType, YesNoValue } from "~/types";
import { store } from "~/store";

export function useSmartGroups() {
    let groupedSameAnswers: ContactIDsGroupedByAnswers = {};

    /**
     * Takes data presets of all contacts and generates smart groups based on the answers
     * @param contactsData - Data presets of all contacts
     * @returns - Array of generated groups
     */
    const generateSmartGroups = (contactsData: DataPresetsOfAllContacts): ContactGroup[] => {
        // Group all the same answers by contacts
        groupedSameAnswers = groupSameAnswersByContacts(contactsData);

        // Generate smart groups from grouped same answers
        let smartGroups: any = {};
        let smartGroupId = 0;

        // Remove existing smart groups in Vuex
        for (let i in store.state.userData.groups) {
            let group = store.state.userData.groups[i];
            if (group.isSmartGroup) {
                store.commit("deleteGroup", group.groupId);
            }
        }

        for (let groupedAnswers in groupedSameAnswers) {
            const questionID = parseInt(groupedAnswers);

            // Create "Is single" group
            if (questionID == 5) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == YesNoValue.false) {
                        smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup(
                            "People that are single",
                            "All your contacts that are in not in any relationship",
                            questionID,
                            answer,
                            "singlePeopleGroup",
                        );
                        continue;
                    }
                }
            }

            // Create sexual orientation groups
            if (questionID == 8) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == "Other" || answer == "Heterosexual") {
                        continue;
                    }

                    smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup(answer + "s", "All your contacts that are " + answer + "s", questionID, answer, "sexualOrientationGroup");
                    continue;
                }
            }

            // Create Students group
            if (questionID == 12) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == YesNoValue.true) {
                        smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup(
                            "People that are still students",
                            "All your contacts that are still studing",
                            questionID,
                            answer,
                            "studentsGroup",
                        );
                        continue;
                    }
                }
            }

            // Create Unemployed group
            if (questionID == 18) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == YesNoValue.false) {
                        smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup("Unemployed people", "All your contacts that unemployed", questionID, answer, "unemployedPeopleGroup");
                        continue;
                    }
                }
            }

            // Create Only child group
            if (questionID == 24) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == YesNoValue.false) {
                        smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup(
                            "People that  are an only child",
                            "All your contacts that don't have any siblings",
                            questionID,
                            answer,
                            "onlyChildGroup",
                        );
                        continue;
                    }
                }
            }

            // Create Left handed group
            if (questionID == 26) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == "Right hand") {
                        continue;
                    }

                    smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup(
                        answer == "Left hand" ? "Left handed" : "Ambidextrous people",
                        "All your contacts that are " + (answer == "Left hand" ? "left handed" : "ambidextrous"),
                        questionID,
                        answer,
                        "leftHandedGroup",
                    );

                    continue;
                }
            }

            // Create MBTI groups
            if (questionID == 30) {
                for (let answer in groupedSameAnswers[questionID]) {
                    smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup(
                        answer + " MBTI type",
                        "All your contacts that are " + answer + " in MBTI typology",
                        questionID,
                        answer,
                        answer + "Group",
                    );
                    continue;
                }
            }

            // Create Element sign groups
            if (questionID == 31) {
                for (let answer in groupedSameAnswers[questionID]) {
                    smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup("People with " + answer + " element", "Based on zodiac sign", questionID, answer, answer + "ElementGroup");
                    continue;
                }
            }

            // Create Zodiac sign groups
            if (questionID == 32) {
                for (let answer in groupedSameAnswers[questionID]) {
                    smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup("People with " + answer + " sign", "Based on birth date", questionID, answer, answer + "SignGroup");
                    continue;
                }
            }

            // Create Eneagram type groups
            if (questionID == 33) {
                for (let answer in groupedSameAnswers[questionID]) {
                    smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup(
                        answer + " Eneagram type",
                        "All your contacts that have " + answer + " Eneagram type",
                        questionID,
                        answer,
                        answer + "EneagramGroup",
                    );
                    continue;
                }
            }

            // Create Chinese zodiac sign groups
            if (questionID == 34) {
                for (let answer in groupedSameAnswers[questionID]) {
                    smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup(
                        "Chinese zodiac sign " + answer,
                        "All your contacts that have Chinese zodiac sign " + answer,
                        questionID,
                        answer,
                        answer + "ChineseZodiacGroup",
                    );
                    continue;
                }
            }

            // Create group for people with tattoos
            if (questionID == 47) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == YesNoValue.true) {
                        smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup("People with a tattoo", "All your contacts that have some tattoo", questionID, answer, "tattooedPeopleGroup");
                    }
                    continue;
                }
            }

            // Create group for people that are adopted
            if (questionID == 54) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == YesNoValue.true) {
                        smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup("Adopted people", "All your contacts that were adopted", questionID, answer, "adoptedPeopleGroup");
                    }
                    continue;
                }
            }

            // Create group for people with PTSD
            if (questionID == 80) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == YesNoValue.true) {
                        smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup(
                            "People with PTSD/trauma",
                            "All your contacts that have PTSD or have experienced trauma in their life",
                            questionID,
                            answer,
                            "ptsdPeopleGroup",
                        );
                    }
                    continue;
                }
            }

            // Create group for married people
            if (questionID == 84) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == YesNoValue.true) {
                        smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup("Married people", "All your contacts that are married", questionID, answer, "marriedPeopleGroup");
                    }
                    continue;
                }
            }

            // Create group for divorced people
            if (questionID == 88) {
                for (let answer in groupedSameAnswers[questionID]) {
                    if (answer == YesNoValue.true) {
                        smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup("Divorced contacts", "All your contacts that are divorced", questionID, answer, "divorcedPeopleGroup");
                    }
                    continue;
                }
            }

            // Create group for Generations
            if (questionID == 99) {
                for (let answer in groupedSameAnswers[questionID]) {
                    smartGroups[smartGroupId + "-" + answer] = initializeSmartGroup(answer, "All your contacts that are from this generation", questionID, answer, answer + "GenerationGroup");
                    continue;
                }
            }

            smartGroupId++;
        }

        // Save generated smart groups to vuex
        for (const smartGroup in smartGroups) {
            store.commit("createGroup", { group: smartGroups[smartGroup], group_id: smartGroups[smartGroup].codeName });
        }

        return smartGroups;
    };

    /**
     * Helper function to initialize new instance of smart group
     * @param groupName Name of the new smart group
     * @param groupDesc Description of the new smart group
     * @param groupID id of the new smart group
     * @param key Key of the new smart group
     * @param codeName Code name of the new smart group
     * @returns New instance of smart group
     */
    const initializeSmartGroup = (groupName: string, groupDesc: string, groupID: number, key: string, codeName: string) => {
        const smartGroup: ContactGroup = {
            groupName: groupName,
            groupDesc: groupDesc,
            groupId: codeName,
            codeName: codeName,
            isSmartGroup: true,
            groupMembers: groupedSameAnswers[groupID][key],
        };

        return smartGroup;
    };

    /**
     * Helper function to group same answers by contacts
     * @param contactsData Data presets of all contacts
     * @returns Grouped same answers by contacts
     */
    const groupSameAnswersByContacts = (contactsData: DataPresetsOfAllContacts): ContactIDsGroupedByAnswers => {
        let groupedSameAnswers: ContactIDsGroupedByAnswers = {};

        for (let contactID in contactsData) {
            const currentContactPresets = contactsData[contactID];

            for (let presetID in currentContactPresets) {
                const currentPreset = currentContactPresets[presetID];

                for (let questionID in currentPreset.questions) {
                    let currentQuestion: Question = currentPreset.questions[questionID];

                    // Filter unanswered questions
                    if (!currentQuestion.answer) {
                        continue;
                    }

                    // Filter questions with free text answers as they are not suitable for grouping
                    if (currentQuestion.questionDataType == QuestionDataType.select || currentQuestion.questionDataType == QuestionDataType.bool) {
                        if (!groupedSameAnswers[currentQuestion.id]) {
                            groupedSameAnswers[currentQuestion.id] = {};
                        }

                        if (!groupedSameAnswers[currentQuestion.id][currentQuestion.answer]) {
                            groupedSameAnswers[currentQuestion.id][currentQuestion.answer] = [];
                        }

                        if (!groupedSameAnswers[currentQuestion.id][currentQuestion.answer].includes(parseInt(contactID))) {
                            groupedSameAnswers[currentQuestion.id][currentQuestion.answer].push(parseInt(contactID));
                        }
                    }
                }
            }
        }

        // Remove "fake groups" with only one contact or with no contacts
        for (let question in groupedSameAnswers) {
            for (let answer in groupedSameAnswers[question]) {
                if (groupedSameAnswers[question][answer].length <= 1) {
                    delete groupedSameAnswers[question][answer];
                }
            }

            if (Object.keys(groupedSameAnswers[question]).length == 0) {
                delete groupedSameAnswers[question];
            }
        }

        return groupedSameAnswers;
    };

    return { generateSmartGroups };
}
