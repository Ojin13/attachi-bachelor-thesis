<template>
    <ion-page>
        <ion-content force-overscroll="false">
            <div class="screenContainer">
                <LoaderOverlay :isActive="activeLoader" />

                <div v-if="resetWithOldPassword">
                    <NavigationPanel :displayLeftIcon="false" :displayRightIcon="false" :navigationTitle="'Change your password 🔒'" :navigationDesc="'Create a new password for your account'" />

                    <h1 class="passwordReset__beforeChangeHeader">{{ appHeaderHeading }}</h1>
                </div>

                <div class="pageContainer">
                    <AppHeader v-if="!resetWithOldPassword" :showNotificationlIcon="false" :noBottomOffset="true" :heading="appHeaderHeading" :showCancelIcon="true" />

                    <div class="passwordReset__image">
                        <img src="~/assets/images/shield_holding.png" />
                    </div>

                    <!-- STEP 1: Verify recovery code -->
                    <div v-if="!showNewPasswordForm && !newRecoveryCodeGenerated && !resetWithOldPassword">
                        <div class="passwordReset__form">
                            <div v-if="showEmailInput">
                                <p class="bold">Your email address:</p>
                                <input v-model="emailAdress" :class="{ error: emailError }" type="text" placeholder="frodo@baggins.com" />
                            </div>

                            <div v-if="emailError" class="errorMessage__form">
                                <p class="small bold errorMessage__form--text">Please enter valid email</p>
                            </div>
                        </div>

                        <RecoveryCodeInput :errorSubmission="recoveryCodeError" :showPasteButton="true" :showCopyButton="false" @updateRecoveryCode="(value) => (recoveryCode = value)" />
                        <RecoveryCodeInfoDropdown />

                        <div @click="validateSecret()">
                            <ActionButton :buttonText="'Try to use recovery code'" :customClasses="'passwordReset__actionButton'" />
                        </div>
                    </div>

                    <!-- STEP 1: Verify current password -->
                    <div v-if="!showNewPasswordForm && resetWithOldPassword && !passwordWasChanged">
                        <div class="passwordReset__form">
                            <p class="bold">Your current password:</p>
                            <PasswordInput :passwordError="currentPasswordError" @updatePassword="(value) => (currentPassword = value)" />

                            <div v-if="currentPasswordError" class="errorMessage__form">
                                <p class="small bold errorMessage__form--text">This password is not correct</p>
                            </div>
                        </div>

                        <div @click="validateSecret()">
                            <ActionButton :buttonText="'Verify current password'" :customClasses="'passwordReset__actionButton'" />
                        </div>
                    </div>

                    <!-- STEP 2: Create new password -->
                    <div v-if="showNewPasswordForm">
                        <div class="passwordReset__form">
                            <p class="bold">New password:</p>

                            <div class="passwordReset__form--newPasswords">
                                <PasswordInput :passwordPlaceholder="'Your new password'" :passwordError="newPasswordError" @updatePassword="(value) => (newPassword = value)" />
                                <PasswordInput :passwordPlaceholder="'Your new password again'" :passwordError="newPasswordError" @updatePassword="(value) => (newPasswordCheck = value)" />
                            </div>

                            <div v-if="newPasswordError" class="errorMessage__form">
                                <p class="small bold errorMessage__form--text">{{ errorMsg }}</p>
                            </div>

                            <PasswordComplexityIndicator :password="newPassword" />
                        </div>

                        <div @click="createNewPassword()">
                            <ActionButton :buttonText="'Change password'" :customClasses="'passwordReset__actionButton'" />
                        </div>
                    </div>

                    <!-- STEP 3: Generate new recovery code -->
                    <div v-if="newRecoveryCodeGenerated && !resetWithOldPassword">
                        <div class="passwordReset__form">
                            <p class="bold">Your new recovery code:</p>
                            <RecoveryCodeInput :disableIput="true" :showPasteButton="false" :showCopyButton="true" :recoveryCodeInitialValue="newRecoveryCodeValue" />

                            <div class="recoveryCode__info">
                                <p class="bold">What now?</p>
                                <p class="gray">
                                    The recovery code you entered was used and your password was changed.<br /><br />Please save your new recovery code (previous one was invalidated) and login to your
                                    account with your new password.
                                </p>
                            </div>

                            <RecoveryCodeInfoDropdown />
                        </div>

                        <ConfirmTab ref="confirmationTab" @confirmAction="customConfirmationAction">
                            <div @click="requestSaveConfirmation()">
                                <ActionButton :buttonText="'I saved my new Recovery code'" :customClasses="'passwordReset__actionButton'" />
                            </div>
                        </ConfirmTab>
                    </div>

                    <!-- STEP 3: Inform about successfull pasword change -->
                    <div v-if="passwordWasChanged">
                        <div class="passwordReset__form">
                            <p class="bold">What now?</p>
                            <p class="gray">
                                Your new password was setup and your data were re-encrypted with this new secret - next time you try to login on this or any other device, please use your new password
                                together with your email.
                            </p>

                            <div @click="finishPasswordChange()">
                                <ActionButton :buttonText="'Finish password change'" :customClasses="'passwordReset__actionButton'" />
                            </div>
                        </div>
                    </div>

                    <div v-if="!newRecoveryCodeGenerated && !passwordWasChanged">
                        <p class="passwordReset--cancel" @click="popFromStack()">Back</p>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { YesNoValue } from "~/types";

const activeLoader = ref(false);
const { popFromStack, getCurrentRoute, reloadRouter } = useIonicRouter();

const {
    validateSecret,
    createNewPassword,
    errorMsg,
    recoveryCodeError,
    emailError,
    newPasswordError,
    currentPasswordError,
    appHeaderHeading,
    recoveryCode,
    emailAdress,
    showEmailInput,
    showNewPasswordForm,
    newRecoveryCodeGenerated,
    newRecoveryCodeValue,
    newPassword,
    newPasswordCheck,
    currentPassword,
    passwordWasChanged,
    resetWithOldPassword,
} = useRecoveryCode(activeLoader);

// Element reference
const confirmationTab = ref(null);

const customConfirmationAction = (confirmAction) => {
    if (confirmAction == "continue") {
        finishPasswordChange();
    }
};

const finishPasswordChange = () => {
    // If user came from auth section
    if (resetWithOldPassword.value) {
        popFromStack();
    } else {
        reloadRouter("/login");
    }
};

const requestSaveConfirmation = () => {
    confirmationTab.value.setConfirmationTabData(
        "You can't view your new Recovery code again. Make sure to save it.",
        "If you forget your password, you can't change it and decrypt your data without this new recovery code. Keep it safe.",
        "continue",
        "I saved my new Recovery code",
    );
};

onMounted(() => {
    const route = getCurrentRoute();

    if (route.query.email) {
        emailAdress.value = route.query.email;
        showEmailInput.value = false;
    }

    if (route.query.userKnowsCurrentPassword == YesNoValue.true) {
        resetWithOldPassword.value = true;
        appHeaderHeading.value = "To change your password please enter your current password";
    } else {
        appHeaderHeading.value = "To reset your password please enter your recovery code";
    }
});
</script>

<style lang="scss">
@use "sass:math";
@import "/assets/sass/variables";

.passwordReset {
    &__image {
        text-align: center;

        img {
            width: 75%;
        }
    }

    &__form {
        p {
            margin-bottom: 10px;
        }
    }

    &--cancel {
        text-align: center;
    }

    &__actionButton {
        margin-top: 20px;
        margin-bottom: 20px;
    }

    &__beforeChangeHeader {
        padding: 20px;
        padding-bottom: 0px;
    }
}
</style>
