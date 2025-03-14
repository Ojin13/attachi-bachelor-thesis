<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <NavigationPanel :displayLeftIcon="false" :displayRightIcon="false" :navigationTitle="'Contact us 📯'" :navigationDesc="'Our contact information'" />

                <div class="contactUs pageContainer">
                    <div class="contactUs__section">
                        <p class="heading bold">Website</p>
                        <p class="gray"><a href="https://www.attachi.net">www.attachi.net</a></p>
                    </div>

                    <div class="contactUs__section">
                        <p class="heading bold">Email</p>
                        <p class="gray"><a href="mailto:info@attachi.net">info@attachi.net</a></p>
                    </div>

                    <div class="contactUs__section contactUs__section--textarea">
                        <p class="contactUs__section--textarea--heading bold">Send us a message:</p>
                        <p class="contactUs__section--textarea--desc gray medium">
                            Feel free to send us a message, and we will get back to you via email as soon as possible. We look forward to hearing from you :)
                        </p>
                        <textarea v-model="formContent" placeholder="Write your message here"></textarea>

                        <div v-if="showFormError" class="errorMessage__form">
                            <p class="small bold errorMessage__form--text">{{ errorMessage }}</p>
                        </div>

                        <div v-if="showFormSuccess" class="successMessage__form">
                            <p class="small bold successMessage__form--text">{{ successMessage }}</p>
                        </div>

                        <div class="contactUs__section--submitButton" @click="submitForm(createFormPrefix())">
                            <ActionButton :buttonText="'Submit'" />
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";

definePageMeta({
    middleware: ["is-authenticated"],
});

const { errorMessage, successMessage, showFormError, showFormSuccess, formContent, submitForm } = useFeedbackForm();

const createFormPrefix = () => {
    return "CONTACT US FORM:\n\nUsername: " + store.state.auth.userName + "\nEmail: " + store.state.auth.email;
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.contactUs {
    margin-top: 25px;
    &__section {
        margin-bottom: 32px;

        .heading {
            margin-bottom: 0px;
        }

        &--textarea {
            margin-top: 50px;

            &--heading {
                margin-bottom: 0px;
            }

            &--desc {
                margin-bottom: 15px;
            }
        }

        &--submitButton {
            margin-top: 10px;
        }
    }

    textarea {
        width: 100%;
        min-height: 200px;
        border-radius: $default-border-radius;
        border: 2px solid black;
        padding: 20px;
        margin-bottom: 0px;
    }
}
</style>
