import { type ScrapedData, type Question, type Contact, type DataPreset, type ContactNote, type ChatMessage, type AllPremadePrompts, DataTypeForPrompt, YesNoValue } from "~/types";

/**
 * Composable function for creating prompts for AI model based on scraped data, contact data and chat history
 * @param contactBasicData Contact object with basic user data like name, description, etc.
 * @param contactDataPresets DataPreset object with questions and answers
 * @param contactNotes ContactNote object with notes about the contact
 */
export function usePromptCreator(contactBasicData: Ref<Contact>, contactDataPresets: Ref<DataPreset[]>, contactNotes: Ref<ContactNote[]>) {
    const { checkIfQuestionsAnswered } = useDataPresets(contactDataPresets);
    const premadePrompts: Ref<AllPremadePrompts> = ref({});

    /**
     * This function takes scraped data and creates a prompt for AI model.
     * This process is divided into 2 parts - function is first provided only with
     * scraped websites or only with scraped individual information. After finishing the first
     * prompt, it is used to call the AI. Only then the second prompt is appended to the first one with
     * new additional information and AI is called again. This proved to create better responses from the AI
     * model as it has less data to process at once.
     * @param scrapedResults ScrapedData object that will be summarized by the AI model
     * @param dataType DataTypeForPrompt enum that specifies if the prompt is for websites or individual information
     * @param previousResponse Chat history for the AI model
     * @returns Prompt for AI model (string)
     */
    const createPromptForScrapedData = (scrapedResults: ScrapedData, dataType: DataTypeForPrompt, previousResponse: string | null = null): string => {
        let prompt = "You are sure about following facts about this person: \n\n";
        prompt += createPrompt(-1, "", ref([]));

        prompt += "Now you will be provided with online search results about this person. Use information that you already know to filter out results about someone else. \n\n";
        prompt += "Avoid just repeating provided information. Answer with consistent sentences. Focus on online search website results.\n\n";
        prompt += "Dont anounce start or end of your report. Dont report current time. Make it short. \n\n";
        prompt += addCurrentDateToPrompt();

        if (previousResponse) {
            prompt += "This is your previous response: \n";
            prompt += previousResponse + "\n\n";
            prompt += "Now follow up with additional information about this person from following new data:\n\n";
        } else {
            prompt += "### Information about this person: ###\n\n";

            prompt += "---Saved name of the person---\n";
            prompt += contactBasicData.value.name + "\n";
            prompt += "---End of answer---\n\n";
        }

        if (dataType == DataTypeForPrompt.websites) {
            if (scrapedResults.websites?.length > 0) {
                prompt += "### Online search results: ###\n";
                prompt += "(Remember that some websites might be unrelated or about someone else)\n\n";

                for (let i = 0; i < scrapedResults.websites.length; i++) {
                    let website = scrapedResults.websites[i];

                    prompt += "---" + website.displayLink + "---\n";
                    prompt += "Title:" + website.title + "\n";
                    prompt += "Summary: " + website.summary + "\n";
                    prompt += "---End---\n\n";
                }
            }
        }

        if (dataType == DataTypeForPrompt.individualInformation) {
            if (scrapedResults.data?.length > 0) {
                prompt += "### Information from LinkedIn: ###\n";
                for (let i = 0; i < scrapedResults.data.length; i++) {
                    let data = scrapedResults.data[i];

                    prompt += "---" + data.name + "---\n";
                    prompt += data.value + "\n";
                    prompt += "---End---\n\n";
                }
            }
        }

        return prompt;
    };

    /**
     * This function takes all known information about the contact and creates a prompt
     * from them (questions, notes). After that it append new instructions for the AI model.
     * The insruction can a premade prompt or a custom message.
     * @param id ID of the premade prompt, or -1 for a custom message
     * @param currentCustomMessage Custom message for the AI model
     * @param previousMessages Chat history for the AI model
     * @returns Prompt for AI model (string)
     */
    const createPrompt = (id: number, currentCustomMessage: string = "", previousMessages: Ref<ChatMessage[]>) => {
        let prompt = "### Information about this person: ###\n\n";

        prompt += "---Name of the person---\n";
        prompt += contactBasicData.value.name + "\n";
        prompt += "---End of answer---\n\n";

        if (contactBasicData.value.description != undefined && contactBasicData.value.description != null && contactBasicData.value.description != "") {
            prompt += "---Short summary of this person---\n";
            prompt += contactBasicData.value.description + "\n";
            prompt += "---End of answer---\n\n";
        }

        prompt += addCurrentDateToPrompt();

        let scannedQuestionIDs: number[] = [];

        for (let presetID in contactDataPresets.value) {
            let preset = contactDataPresets.value[presetID];

            for (let questionID in preset.questions) {
                let question: Question = preset.questions[questionID];

                if (scannedQuestionIDs.includes(parseInt(questionID))) {
                    continue;
                }

                scannedQuestionIDs.push(parseInt(questionID));

                if (question.answer != "" && question.answer != undefined && question.answer != null) {
                    let answer = "";

                    if (question.answer == YesNoValue.true) {
                        answer = YesNoValue.Yes;
                    } else if (question.answer == YesNoValue.false) {
                        answer = YesNoValue.No;
                    } else {
                        answer = question.answer;
                    }

                    // If needed_questions is empty, then include all known information
                    if (id != -1) {
                        if (premadePrompts.value[id].needed_questions.length == 0 || premadePrompts.value[id].needed_questions.includes(parseInt(questionID))) {
                            prompt += "---" + question.questionText + "---\n";
                            prompt += answer + "\n";
                            prompt += "---End of answer---\n\n";
                        }
                    } else {
                        prompt += "---" + question.questionText + "---\n";
                        prompt += answer + "\n";
                        prompt += "---End of answer---\n\n";
                    }
                }
            }
        }

        // Add notes about this person
        let addNotes = false;

        if (id != -1) {
            if (Object.keys(contactNotes.value).length > 0 && premadePrompts.value[id].includeNotes) {
                addNotes = true;
            }
        } else {
            // For custom messages, always include notes
            addNotes = true;
        }

        if (addNotes) {
            prompt += "\n\n### Notes about this person: ###\n";

            let noteNumber = 0;
            for (let curNote in contactNotes.value) {
                noteNumber++;
                prompt += "---Start of note " + noteNumber + "---\n" + contactNotes.value[curNote].text + "\n---End of note " + noteNumber + "---\n\n";
            }
        }

        // Add chat history
        // Get my previous message and include everything after it
        if (Object.keys(previousMessages.value).length > 2) {
            prompt += "\n\n### Chat history: ###\n";
            let indexOfMyPrevMessage = 0;

            for (let i = 2; i < Object.keys(previousMessages.value).length; i++) {
                if (previousMessages.value[Object.keys(previousMessages.value).length - i].isMyMessage) {
                    indexOfMyPrevMessage = Object.keys(previousMessages.value).length - i;
                    break;
                }
            }

            for (let i = indexOfMyPrevMessage; i < Object.keys(previousMessages.value).length; i++) {
                let message = previousMessages.value[i];

                if (message.isMyMessage && i != indexOfMyPrevMessage) {
                    continue;
                }

                if (message.isMyMessage) {
                    prompt += "---Start of my previous message---\n" + message.text + "\n---End of my previous message---\n\n---Start of your previous message---\n";
                } else {
                    prompt += message.text + "\n";
                }
            }

            prompt += "---End of your previous message---\n\n";
        }

        prompt += addInstructionToPrompt(id, currentCustomMessage);

        return prompt;
    };

    /**
     * Simple helper function that adds instruction to the prompt based on the ID
     * of the premade prompt or custom message.
     * @param instructionID ID of the premade prompt, or -1 for a custom message
     * @param customInstruction Custom message for the AI model
     * @returns Instruction for the AI model (string)
     */
    const addInstructionToPrompt = (instructionID: number, customInstruction: string = "") => {
        let prompt = "Avoid just repeating provided information. Answer in whole sentences.\n\n";
        prompt += "### Your instruction is to do/answer following: ###\n";

        // Cultural context
        if (instructionID == 1) {
            prompt += "Based on this data, generate short summary of this person.";
        }

        // Quick report
        if (instructionID == 2) {
            prompt += "Based on this data, generate detailed report about this person.";
        }

        if (instructionID == 11) {
            prompt += "Based on this data, summarize this person in rap song.";
        }

        if (instructionID == 4) {
            prompt += "Describe this MBTI type.";
        }

        if (instructionID == 5) {
            prompt += "Describe this Enneagram type.";
        }

        if (instructionID == 5) {
            prompt += "Describe this Enneagram type.";
        }

        if (instructionID == 6) {
            prompt += "Generate a list of popular movies, songs, books etc from the time this person was born.";
        }

        if (instructionID == 7) {
            prompt += "Based on birth date of this person, generate a list of historical events that happened during his/her lifetime.";
        }

        if (instructionID == 8) {
            prompt += "Based on birth date of this person, generate a list of world leaders and famous people that were alive during lifetime of this person.";
        }

        if (instructionID == 9) {
            prompt += "Based on provided data, generate briefing about this person to prepare me for the next meeting with this person.";
        }
        if (instructionID == 10) {
            prompt += "Based on provided data, generate list of gifts which this person could like.";
        }
        if (instructionID == 3) {
            prompt += "Based on provided data, describe what was culture like in a time and place where this person was born.";
        }
        if (instructionID == 12) {
            prompt += "Based on provided data, what is the financial situation of this person, based on his/her salary when you consider his bith place and birth date";
        }

        // Custom message
        if (instructionID == -1) {
            prompt += customInstruction;
        }

        return prompt;
    };

    /**
     * It it necessary to include current date in the prompt, because the AI model
     * was trained on data only up to 2021 and it doesn't know current date.
     * Without this information it sometimes provides wrong answers.
     * (e.g. Age of the contact, based on birth date)
     * @returns String with current date
     */
    const addCurrentDateToPrompt = () => {
        let dateInfo = "---Current date---\n";
        dateInfo += "Today is " + new Date().toLocaleDateString() + "\n";
        dateInfo += "---End of answer---\n\n";

        return dateInfo;
    };

    /**
     * This function initializes premade prompts <AllPremadePrompts>, that will be
     * visuallized in the UI. Some prompts have additional requirements, like some
     * questions that need to be answered before the prompt can be used.
     * @returns void, this only initializes premade prompts
     */
    const preparePremadePrompts = () => {
        premadePrompts.value = {
            1: {
                id: 1,
                text: "Create quick summary of " + contactBasicData.value.name,
                desc: "Based on the data you provided, we will generate short summary of this person.",
                needed_questions: [],
                answered: false,
                includeNotes: false,
            },
            2: {
                id: 2,
                text: "Create detailed report about " + contactBasicData.value.name,
                desc: "Based on the data you provided, we will generate detailed report about this person.",
                needed_questions: [],
                answered: false,
                includeNotes: true,
            },
            11: {
                id: 11,
                text: "Summarize " + contactBasicData.value.name + " in a rap song",
                desc: "Based on the data you provided, we will generate rap song about this person.",
                needed_questions: [],
                answered: false,
                includeNotes: true,
            },
            9: {
                id: 9,
                text: "Prepare me for the next meeting with " + contactBasicData.value.name,
                desc: "Based on the data you provided, we will generate briefing to prepare you for your next meeting with this person.",
                needed_questions: [],
                answered: false,
                includeNotes: true,
            },
            10: {
                id: 10,
                text: "Recommend me some gifts which " + contactBasicData.value.name + " would like.",
                desc: "Based on the data you provided, we will generate a list of gifts which this person could like.",
                needed_questions: [],
                answered: false,
                includeNotes: true,
            },
            3: {
                id: 3,
                text: "What was the culture like in time and place where " + contactBasicData.value.name + " was born.",
                desc: "Based on the data you provided, we will generate a cultural context which probably shaped this person.",
                needed_questions: [1, 3],
                answered: false,
                includeNotes: false,
            },
        };

        // Check for MBTI
        if (checkIfQuestionsAnswered([30])) {
            premadePrompts.value[4] = {
                id: 4,
                text: "Analyse personality of " + contactBasicData.value.name + " with MBTI typology.",
                desc: "This will generate detailed personality profile of this person based on MBTI (Myers-Briggs Type Indicator).",
                needed_questions: [30],
                answered: false,
                includeNotes: false,
            };
        }

        // Check for Enneagram
        if (checkIfQuestionsAnswered([33])) {
            premadePrompts.value[5] = {
                id: 5,
                text: "Analyse personality of " + contactBasicData.value.name + " with Enneagram typology.",
                desc: "This will generate personality profile of this person based on Enneagram typology.",
                needed_questions: [33],
                answered: false,
                includeNotes: false,
            };
        }

        // Check for famous games,books films etc from childhood of this person
        if (checkIfQuestionsAnswered([1])) {
            premadePrompts.value[6] = {
                id: 6,
                text: "What games, films, music etc were famous during " + contactBasicData.value.name + " early years?",
                desc: "This will generate a list of popular games, films, songs or books were popular during early years of this person.",
                needed_questions: [1],
                answered: false,
                includeNotes: false,
            };
        }

        // Check for historical events
        if (checkIfQuestionsAnswered([1])) {
            premadePrompts.value[7] = {
                id: 7,
                text: "What historical events did " + contactBasicData.value.name + " live through?",
                desc: "This will generate list of some interesting historical events which this contact lived through.",
                needed_questions: [1],
                answered: false,
                includeNotes: false,
            };
        }

        // Check for leaders and celebrities
        if (checkIfQuestionsAnswered([1])) {
            premadePrompts.value[8] = {
                id: 8,
                text: "What world leaders and famous people were alive during " + contactBasicData.value.name + " lifetime?",
                desc: "This will generate list of world leaders and famous people which were alive during life of this person.",
                needed_questions: [1],
                answered: false,
                includeNotes: false,
            };
        }

        // Check for salary in context
        if (checkIfQuestionsAnswered([21, 1, 3])) {
            premadePrompts.value[12] = {
                id: 12,
                text: "What is financial situation of " + contactBasicData.value.name + " based on the salary and location?",
                desc: "This will generate simple analysis of financial situation of this person based on his/her location and birth date.",
                needed_questions: [21, 1, 3],
                answered: false,
                includeNotes: false,
            };
        }
    };

    return {
        createPrompt,
        preparePremadePrompts,
        createPromptForScrapedData,
        premadePrompts,
    };
}
