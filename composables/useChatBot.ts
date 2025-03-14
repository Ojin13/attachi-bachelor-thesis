import SelfTyper from "~/utils/selfTyper";
import { store } from "~/store";
import { ServerAction, type ChatMessage, type Contact, type ContactNote, type DataPreset } from "~/types";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

/**
 * Composables function that handles all operation related to the chat with the AI.
 * This also extends to the control of the UI elements of the chat.
 * @param contactBasicData - Vue3 ref to the basic data of the contact (name, description, etc.)
 * @param contactDataPresets - Vue3 ref to the data presets of the contact
 * @param contactNotes - Vue3 ref to the notes of the contact
 */
export function useChatBot(contactBasicData: Ref<Contact>, contactDataPresets: Ref<DataPreset[]>, contactNotes: Ref<ContactNote[]>) {
    const isTyping = ref(false);
    const messages: Ref<ChatMessage[]> = ref([]);
    const activeLoader = ref(false);
    const allAnswered = ref(false);
    const currentCustomMessage = ref("");

    // Composables
    const { callFire } = useFirebaseConnector();
    const { createPrompt, preparePremadePrompts, premadePrompts } = usePromptCreator(contactBasicData, contactDataPresets, contactNotes);

    // Element references
    const messagesContainer: any = ref(null);
    const listOfQuesions: any = ref(null);

    /**
     * This function sends a new message to the chat, be it a user message or a bot message.
     * If its a user message, it will be sent to the AI for processing and the response will be sent back
     * by recursively calling this function again with the response. Also handles the UI elements of the chat
     * like the loader and the typing animation.
     * @param message - The message to be sent
     * @param isBotMessage - Boolean flag to indicate if the message is from the bot
     * @returns void
     */
    const sendNewMessage = (message: ChatMessage, isBotMessage = false) => {
        if (isBotMessage == false) {
            Haptics.impact({ style: ImpactStyle.Medium });
        }

        messages.value[Object.keys(messages.value).length] = {
            question_id: message.question_id,
            id: message.id,
            text: message.text,
            isMyMessage: message.isMyMessage,
            timeSent: message.timeSent,
        };

        // Save chat history in Vuex
        store.commit("updateContactChats", { chat: messages.value, id: contactBasicData.value.id });

        let typerController = new TyperController(3, 10, 5);

        nextTick(() => {
            if (message.isFirstBotMessage || !isBotMessage) {
                if (messagesContainer.value) {
                    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
                }
            }
        });

        if (isBotMessage) {
            isTyping.value = true;

            setTimeout(() => {
                let typerElement = document.getElementById("message_" + message.id);
                if (!typerElement) {
                    return;
                }

                new SelfTyper(typerElement, typerController);
                if (typerController.typerList.length > 0) {
                    let hasMultipleMessages = false;
                    if (message.restOfMessages) {
                        if (message.restOfMessages.length > 0) {
                            hasMultipleMessages = true;
                        }
                    }

                    if (hasMultipleMessages) {
                        typerController.typerList[0].setFinishedTypingFunction(() => {
                            setTimeout(() => {
                                sendNewMessage(
                                    {
                                        question_id: message.question_id,
                                        id: new Date().toLocaleTimeString() + Math.floor(Math.random() * 1000000),
                                        text: message.restOfMessages ? message.restOfMessages[0] : "",
                                        restOfMessages: message.restOfMessages ? message.restOfMessages.slice(1) : [],
                                        isMyMessage: false,
                                        timeSent: new Date().toLocaleTimeString(),
                                    },
                                    true,
                                );
                            }, 250);
                        });
                    } else {
                        typerController.typerList[0].setFinishedTypingFunction(() => {
                            if (listOfQuesions.value) {
                                listOfQuesions.value.style.display = "block";
                            }
                            activeLoader.value = false;
                            isTyping.value = false;
                        });
                    }

                    typerController.typerList[0].selfType();
                }
            });

            return;
        }

        listOfQuesions.value.style.display = "none";
        activeLoader.value = true;

        if (message.isCustomMessage != true) {
            premadePrompts.value[message.question_id].answered = true;

            // Check if all premadePrompts were already asked
            let hasUnansweredQuestion = false;
            for (let id in premadePrompts.value) {
                if (premadePrompts.value[id].answered == false) {
                    hasUnansweredQuestion = true;
                    break;
                }
            }

            if (!hasUnansweredQuestion) {
                allAnswered.value = true;
            } else {
                allAnswered.value = false;
            }
        }

        callFire({ action: ServerAction.chatWithBot, prompt: createPrompt(message.question_id, currentCustomMessage.value, messages) })
            .then((response: any) => {
                // Split message by new line
                let messagesByNewLine = [];

                messagesByNewLine = response.content.split("\n");

                // Remove empty messages
                messagesByNewLine = messagesByNewLine.filter(function (messagePart: string) {
                    return messagePart != "";
                });

                // Send first bot message
                sendNewMessage(
                    {
                        question_id: message.question_id,
                        id: new Date().toLocaleTimeString() + Math.floor(Math.random() * 1000000),
                        text: messagesByNewLine[0],
                        restOfMessages: messagesByNewLine.slice(1),
                        isMyMessage: false,
                        isFirstBotMessage: true,
                        timeSent: new Date().toLocaleTimeString(),
                    },
                    true,
                );
            })
            .catch((error) => {
                console.log(error);
                listOfQuesions.value.style.display = "block";

                if (message.isCustomMessage != true) {
                    premadePrompts.value[message.question_id].answered = false;
                }

                sendNewMessage(
                    {
                        question_id: message.question_id,
                        id: new Date().toLocaleTimeString() + Math.floor(Math.random() * 1000000),
                        text: "We are sorry, but an error occured while generating response. There might be a connection problem or chatGPT server might be overloaded. Please try again later.",
                        isMyMessage: false,
                        timeSent: new Date().toLocaleTimeString(),
                    },
                    true,
                );
            });
    };

    /**
     * Helper function to send a custom message to the chat.
     * Custom message is a message that is not a part of the premade prompts.
     * @returns void
     */
    const sendCustomMessage = () => {
        if (currentCustomMessage.value == "") {
            return;
        }

        if (currentCustomMessage.value.length > 500) {
            return;
        }

        sendNewMessage({
            question_id: -1,
            isCustomMessage: true,
            id: Math.floor(Math.random() * 1000000).toString(),
            text: currentCustomMessage.value,
            isMyMessage: true,
            timeSent: new Date().toLocaleTimeString(),
        });

        currentCustomMessage.value = "";
    };

    /**
     * This function initializes the smart scrolling feature of the chat.
     * Smart scrolling is a feature that automatically scrolls the chat to the bottom
     * when the user is not holding the scroll position. This is useful when the user is
     * reading the chat and the bot sends a new message.
     * @returns void
     */
    const initializeSmartScrolling = () => {
        let isHoldingScroll = false;

        messagesContainer.value.addEventListener("touchstart", function () {
            isHoldingScroll = false;
        });

        messagesContainer.value.addEventListener("touchmove", function () {
            isHoldingScroll = true;
        });

        messagesContainer.value.addEventListener("touchend", function () {
            isHoldingScroll = false;
        });

        let curInterval = setInterval(() => {
            if (messagesContainer.value == undefined) {
                clearInterval(curInterval);
                return;
            }

            let distanceFromBottom = messagesContainer.value.scrollHeight - messagesContainer.value.scrollTop - messagesContainer.value.clientHeight;
            if (isTyping.value && distanceFromBottom < 75 && !isHoldingScroll) {
                messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
            }
        }, 10);

        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    };

    /**
     * Computed property that returns all messages from the chat.
     */
    const getMessages = computed(() => {
        return messages.value;
    });

    /**
     * Computed property that returns all premade prompts.
     */
    const getQuestions = computed(() => {
        return premadePrompts.value;
    });

    return {
        messages,
        premadePrompts,
        activeLoader,
        allAnswered,
        currentCustomMessage,
        messagesContainer,
        listOfQuesions,
        getMessages,
        getQuestions,
        sendNewMessage,
        sendCustomMessage,
        preparePremadePrompts,
        initializeSmartScrolling,
    };
}
