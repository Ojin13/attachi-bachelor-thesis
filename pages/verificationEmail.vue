<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <div class="pageContainer">
                    <AppHeader :showNotificationlIcon="false" :noBottomOffset="true" :heading="'Verification email sent!'" />

                    <p class="gray encryptionForm__description">
                        Thats it! We just sent you a verification mail to your email address. Please open the verification link in the mail to confirm your email address and then login again. Remember
                        to also check your spam folder. 🔒
                    </p>

                    <div class="encryptionForm__image">
                        <img src="~/assets/images/shield_holding.png" />
                    </div>

                    <div @click="popFromStack()">
                        <ActionButton :buttonText="'Done. Back to Login'" :customClasses="'encryptionForm__actionButton'" />
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
const { popFromStack } = useIonicRouter();
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.encryptionForm {
    &__image {
        text-align: center;

        img {
            width: 85%;
        }
    }

    &__form {
        margin-top: 30px;

        &--cancel {
            text-align: center;
        }
    }

    &__description {
        margin-top: 20px;
    }

    &__actionButton {
        margin-top: 50px;
        margin-bottom: 20px;
    }
}
</style>
