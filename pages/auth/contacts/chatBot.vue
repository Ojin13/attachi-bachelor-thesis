<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer screenContainer--full">
                <NavigationPanel
                    :displayRightIcon="true"
                    :rightIconAddress="'/auth/contacts/chatBotFAQ'"
                    :leftIconURL="contactBasicData.profilePic == undefined ? '' : contactBasicData.profilePic.url"
                    :navigationTitle="'Character analysis'"
                    :navigationDesc="'AI mental model simulation'"
                />

                <div class="chatBot">
                    <div ref="messagesContainer" class="chatBot__messages" :class="{ 'chatBot__messages--noMessages': Object.keys(messages).length == 0 }">
                        <div>
                            <h1>This is start of your conversation. Ask me some question.</h1>
                            <p class="medium gray">
                                We recommend completing this contact from at least 25% before using this chatbot. Currently, you have answered {{ calculateContactCompleteness() }}% of the contact
                                questions. More available premade prompts will unlock as you answer relevant information. The more information you provide about this contact, the better the chatbot
                                becomes.
                            </p>
                        </div>

                        <div ref="messages__list" class="chatBot__messages__list">
                            <div
                                v-for="message in getMessages"
                                :key="message.id"
                                :class="[message.isMyMessage ? 'chatBot__messages__message--myMessage' : 'chatBot__messages__message--botMessage']"
                                class="chatBot__messages__message"
                            >
                                <div class="chatBot__messages__message--text msgText">
                                    <p :id="'message_' + message.id">{{ message.text }}</p>
                                </div>
                                <div class="chatBot__messages__message--time msgTime">
                                    <p class="gray mini">{{ message.timeSent }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="chatBot__questions">
                    <div ref="listOfQuesions" class="questions__list">
                        <div class="chatBot__freeChat">
                            <input v-model="currentCustomMessage" class="chatBot__freeChat--input input--iconRight" type="text" placeholder="Write your message here" />

                            <div class="chatBot__freeChat--sendIcon" @click="sendCustomMessage()">
                                <img v-if="currentCustomMessage != '' && currentCustomMessage.length <= 500" src="~/assets/icons/send-dark.svg" />
                                <img v-else src="~/assets/icons/send.svg" />
                            </div>
                        </div>

                        <div v-if="currentCustomMessage.length > 500" class="chatBot__freeChat--errors">
                            <p class="small">Max length of the message is 500 letters.<br />Your message has {{ currentCustomMessage.length }} letters.</p>
                        </div>

                        <div class="chatBot__questions__list--container">
                            <p class="gray medium chatBot__questions__desc">Or try our premade questions:</p>

                            <div
                                v-for="(question, index) in getQuestions"
                                :key="question.id + Math.floor(Math.random() * 1000000)"
                                :ref="'question__' + question.id"
                                class="chatBot__questions--question"
                                :class="{ 'chatBot__questions--question--hidden': question.answered == true }"
                                @click="
                                    sendNewMessage({
                                        question_id: question.id,
                                        id: question.id + Math.floor(Math.random() * 1000000),
                                        text: question.text,
                                        isMyMessage: true,
                                        timeSent: new Date().toLocaleTimeString(),
                                    })
                                "
                            >
                                <p class="bold">
                                    <span class="chatBot__questions--question--number">{{ index }}. </span>{{ question.text }}
                                </p>
                                <p class="chatBot__questions--question--desc medium gray">{{ question.desc }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="chatBot__questions--other">
                        <LoaderLocal :loadingText="'Generating response. It might take a while.'" :isActive="activeLoader" />
                        <h1 v-if="allAnswered && !activeLoader" class="gray">All available questions already answered.</h1>
                    </div>
                </div>

                <PrivacyConsent />
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";

definePageMeta({
    middleware: ["is-authenticated"],
});

const contactBasicData = ref({});
const contactDataPresets = ref({});
const contactNotes = ref({});

/* Composables */
const { getCurrentRoute, popFromStack } = useIonicRouter();
const { calculateContactCompleteness } = useDataPresets(contactDataPresets);
const {
    messages,
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
} = useChatBot(contactBasicData, contactDataPresets, contactNotes);

onMounted(() => {
    initializeSmartScrolling();
    preparePremadePrompts();
});

onBeforeMount(() => {
    const route = getCurrentRoute();

    if (!route.query.contactID) {
        console.error("No contact ID provided in route params.");
        popFromStack();
        return;
    }

    if (store.state.userData.contactChats[getCurrentRoute().query.contactID]) {
        messages.value = store.state.userData.contactChats[route.query.contactID];

        // Check if last message is from me and if it is, delete it.
        // This situation can happen when user sends a message and then
        // leaves the page before receiving the response from the chatBot.
        for (let i = Object.keys(messages.value).length - 1; i >= 0; i--) {
            if (messages.value[i].isMyMessage) {
                delete messages.value[i];
            } else {
                break;
            }
        }
    }

    // Initialize contact data that will be provided to chatBot
    contactBasicData.value = store.state.userData.contacts[getCurrentRoute().query.contactID];
    contactDataPresets.value = store.state.userData.contactDataPresets[getCurrentRoute().query.contactID];
    contactNotes.value = store.state.userData.contactNotes[getCurrentRoute().query.contactID];
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.chatBot {
    $answerHeight: 30vh;
    $topNavigationHeight: 90px;

    &__messages {
        padding: 32px;
        padding-bottom: 0px;
        overflow: scroll;
        height: calc(100vh - $topNavigationHeight - $answerHeight);

        &__list {
            padding: 25px 0px;
        }

        &--noMessages {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        &__message {
            display: flex;
            flex-wrap: wrap;

            &--text {
                border-radius: $default-border-radius;
                padding: 8px 15px;
                width: 90%;
                transition: 1s;

                p {
                    margin-bottom: 0px;
                }
            }

            &--time {
                width: 100%;
                margin-top: 3px;
            }

            &--myMessage {
                justify-content: flex-end;
                align-items: flex-end;

                .msgText {
                    background: -webkit-linear-gradient(0deg, $primary-action-color, #a4bf74);
                    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
                }

                .msgTime {
                    text-align: right;
                    margin-right: 10px;
                }
            }

            &--botMessage {
                justify-content: flex-start;
                align-items: flex-start;

                .msgText {
                    background-color: $secondary-background-color;
                }

                .msgTime {
                    text-align: left;
                    margin-left: 10px;
                }
            }
        }
    }

    &__questions {
        width: 100%;
        height: $answerHeight;
        position: absolute;
        bottom: 0;
        text-align: center;
        overflow: scroll;
        background-color: $menu-background-color;

        border-top-left-radius: 20px;
        border-top-right-radius: 20px;
        outline: 3px solid black;

        &--other {
            padding: 20px;

            .loadingIndicator {
                margin-top: 30px;
            }
        }

        &__list {
            &--container {
                padding: 20px;
                padding-top: 0px;
            }
        }

        &__header {
            text-align: left;
            margin: 0;
            margin-bottom: 5px;
        }

        &__desc {
            text-align: center;
            margin: 0;
            margin-top: 5px;
            margin-bottom: 15px;
            color: $focus-text-color;
        }

        &--question {
            box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            border-radius: $default-border-radius;
            background-color: $secondary-action-color;
            padding: 15px;
            margin-bottom: 15px;
            text-align: left;
            // border-top: 10px solid $placeholder-action-color;

            &--desc {
                margin: 0px;
            }

            &--number {
                color: $delete-color;
            }

            &--hidden {
                display: none;
            }

            p {
                margin-bottom: 0px;
            }
        }
    }

    &__freeChat {
        display: flex;
        justify-content: center;
        padding: 0px 20px;
        position: relative;
        margin-top: 20px;
        margin-bottom: 10px;

        &--errors {
            padding: 0px 20px;

            p {
                color: $delete-color;
            }
        }

        &--input {
            width: 100%;
            height: 48px;
            border-radius: 20px 0px 0px 20px;
            padding-right: 0px;
            margin-bottom: 0px;
        }

        &--sendIcon {
            width: 20%;
            height: 48px;

            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 0px 20px 20px 0px;
            background-color: $secondary-background-color;

            img {
                height: 23px;
                position: relative;
                cursor: pointer;
            }
        }
    }
}
</style>
