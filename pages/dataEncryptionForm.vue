<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <LoaderOverlay :isActive="activeLoader" />

                <div class="pageContainer">
                    <AppHeader
                        :showNotificationlIcon="false"
                        :noBottomOffset="true"
                        :heading="
                            alreadyHasPassword
                                ? 'Hey ' + getUserName() + '! Please enter your password to decipher your data'
                                : 'Hey ' + getUserName() + '! Now please chose strong password to encrypt all your data'"
                    />

                    <p v-if="!alreadyHasPassword" class="gray encryptionForm__description">
                        We take your privacy seriously, and that's why we want you to choose a strong password, which will be used to encrypt all your data so only you will be able to access them. Not
                        hackers, not us, not anyone but you 🔒
                    </p>

                    <div v-if="alreadyHasPassword" class="encryptionForm__image">
                        <img src="~/assets/images/shield_holding.png" />
                    </div>

                    <div class="encryptionForm__form">
                        <div class="encryptionForm__form__input">
                            <PasswordInput :passwordPlaceholder="'Your password'" :passwordError="errorLogin" @updatePassword="(value) => (password = value)" />
                        </div>

                        <div v-if="!alreadyHasPassword" class="encryptionForm__form__input">
                            <PasswordInput :passwordPlaceholder="'Your password again'" :passwordError="errorLogin" @updatePassword="(value) => (passwordCheck = value)" />
                        </div>

                        <div v-if="errorLogin" class="errorMessage__form">
                            <p class="small bold errorMessage__form--text">{{ errorMsg }}</p>
                        </div>

                        <PasswordComplexityIndicator v-if="!alreadyHasPassword" :password="password" />

                        <div @click="alreadyHasPassword ? verifyUserEncryptionKeys() : createUserEncryptionKeys()">
                            <ActionButton :buttonText="alreadyHasPassword ? 'Decipher your data' : 'Create encryption password'" :customClasses="'encryptionForm__actionButton'" />
                        </div>

                        <div v-if="alreadyHasPassword" @click="redirectToPasswordReset()">
                            <p class="medium bold gray encryptionForm__forgotPassword">Forgot your password?</p>
                        </div>

                        <div @click="cancelDataDecryptionFlow()">
                            <p class="encryptionForm__form--cancel">Cancel and Logout</p>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { signOut, getAuth } from "firebase/auth";
import { YesNoValue } from "~/types";
const activeLoader = ref(false);
const alreadyHasPassword = ref(true);

/* Composables */
const { reloadRouter, pushToStack, popFromStack, getCurrentRoute } = useIonicRouter();
const { createUserEncryptionKeys, verifyUserEncryptionKeys, errorLogin, errorMsg, password, passwordCheck } = useEmailSignIn(activeLoader);

const cancelDataDecryptionFlow = () => {
    signOut(getAuth());
    popFromStack("/login");
};

const redirectToPasswordReset = () => {
    pushToStack({ path: "/resetPassword", query: { email: getAuth().currentUser.email } });
};

const getUserName = () => {
    const currentUser = getAuth().currentUser;
    if (currentUser != null) {
        if (currentUser.displayName.includes(" ")) {
            return currentUser.displayName.split(" ")[0];
        } else {
            return currentUser.displayName;
        }
    } else {
        return "there";
    }
};

onMounted(() => {
    if (getAuth().currentUser == null) {
        console.log("No user found");
        reloadRouter("/login");
        return;
    }

    const currentRoute = getCurrentRoute();
    if (currentRoute.query.newUser != undefined && currentRoute.query.newUser != null) {
        if (currentRoute.query.newUser == YesNoValue.Yes) {
            alreadyHasPassword.value = false;
        } else {
            alreadyHasPassword.value = true;
        }
    } else {
        console.error("newUser query not found. Redirecting to login page.");
        reloadRouter("/login");
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.encryptionForm {
    &__image {
        text-align: center;

        img {
            width: 75%;
        }
    }

    &__forgotPassword {
        text-align: center;
    }

    &__form {
        &--cancel {
            text-align: center;
        }
    }

    &__description {
        margin-top: 20px;
    }

    &__actionButton {
        margin-top: 10px;
        margin-bottom: 20px;
    }
}
</style>
