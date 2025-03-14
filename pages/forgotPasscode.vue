<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <LoaderOverlay :isActive="activeLoader" />

                <div class="pageContainer resetPasscode">
                    <AppHeader :noBottomOffset="true" :heading="'To reset your passcode, enter your main password'" :showCancelIcon="true" :showNotificationlIcon="false" />

                    <p class="resetPasscode--desc gray">We need to verify it's you in order to allow you to create a new passcode. Please enter your account password.</p>

                    <div class="resetPasscode--image">
                        <img src="~/assets/images/shield_holding.png" />
                    </div>

                    <div class="resetPasscode--inputSection">
                        <PasswordInput :passwordError="passwordError" :passwordPlaceholder="'Your account password'" @updatePassword="(value) => (passwordValue = value)" />

                        <div v-if="passwordError" class="errorMessage__form">
                            <p class="small bold errorMessage__form--text">{{ errorMsg }}</p>
                        </div>
                    </div>

                    <div @click="checkPassword()">
                        <ActionButton :buttonText="'Confirm password'" />
                    </div>

                    <p class="resetPasscode--bottomAction gray" @click="forgotPassword()">Forgot also your password?</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";
import { EmailAuthProvider, getAuth, reauthenticateWithCredential } from "firebase/auth";

definePageMeta({
    middleware: ["is-authenticated"],
});

const { replaceNavigationStack, pushToStack } = useIonicRouter();

const passwordError = ref(false);
const passwordValue = ref("");
const errorMsg = ref("");
const activeLoader = ref(false);

const checkPassword = () => {
    passwordError.value = false;
    if (passwordValue.value == "") {
        passwordError.value = true;
        errorMsg.value = "Please enter your password";
    } else {
        activeLoader.value = true;

        // Reauthenticate user with email and password to check if password is correct
        const emailCredentials = EmailAuthProvider.credential(getAuth().currentUser.email, passwordValue.value);

        reauthenticateWithCredential(getAuth().currentUser, emailCredentials)
            .then(() => {
                activeLoader.value = false;
                store.dispatch("save_reenteredPasscodeForChange", true);
                replaceNavigationStack("/passcodeCreation");
            })
            .catch((e) => {
                activeLoader.value = false;
                passwordError.value = true;
                errorMsg.value = "Sorry, this password is not correct";
                console.log(e);
            });
    }
};

const forgotPassword = () => {
    pushToStack({ path: "/resetPassword", query: { email: getAuth().currentUser.email } });
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.resetPasscode {
    &--desc {
        margin-top: 15px;
        margin-bottom: -25px;
    }

    &--bottomAction {
        text-align: center;
    }

    &--inputSection {
        margin-bottom: 30px;
    }

    &--image {
        text-align: center;
        margin-top: 30px;

        img {
            width: 60%;
            margin-bottom: 25px;
        }
    }
}
</style>
