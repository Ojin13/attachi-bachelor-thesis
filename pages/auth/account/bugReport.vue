<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <NavigationPanel :displayLeftIcon="false" :displayRightIcon="false" :navigationTitle="'Bug hunting 🐛'" :navigationDesc="'Report a bug you found in our app'" />

                <div class="contactUs pageContainer">
                    <div class="contactUs__section contactUs__section--textarea">
                        <p class="contactUs__section--textarea--heading bold">Report a bug:</p>
                        <p class="contactUs__section--textarea--desc gray medium">
                            Our app is still evolving, and we may have missed some bugs here and there. If you find any problem, please tell us what it is and how to reproduce it. We will fix it in
                            our next update. Thanks for being part of our team! 🦾
                        </p>
                        <textarea v-model="formContent" placeholder="Write your message here"></textarea>

                        <div v-if="showFormError" class="errorMessage__form">
                            <p class="small bold errorMessage__form--text">{{ errorMessage }}</p>
                        </div>

                        <div v-if="showFormSuccess" class="successMessage__form">
                            <p class="small bold successMessage__form--text">{{ successMessage }}</p>
                        </div>

                        <div class="contactUs__section--submitButton" @click="submitForm('BUG REPORT')">
                            <ActionButton :buttonText="'Submit'" />
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
definePageMeta({
    middleware: ["is-authenticated"],
});

const { errorMessage, successMessage, showFormError, showFormSuccess, formContent, submitForm } = useFeedbackForm();
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.contactUs {
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
