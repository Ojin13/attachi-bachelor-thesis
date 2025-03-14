import { store } from "~/store";
import { EmailAuthProvider, getAuth, reauthenticateWithCredential } from "firebase/auth";
import validEmail from "~/utils/emailValidation";
import { ServerAction, VerifierType, type EncryptionKeys } from "~/types";

/**
 * Composable function to handle the password recovery process,
 * validation and creation of recovery codes as well as password change.
 * Also provides reactive variables for UI elements
 * @param activeLoader - Reference to the loader state which activates UI loader element
 */
export function useRecoveryCode(activeLoader: Ref<boolean>) {
    // Composables
    const { validatePassword } = usePasswordValidation();
    const { callFire } = useFirebaseConnector();
    const { setPreferenceValue, deletePreferenceValue } = usePreferences();
    const { changePassword } = useUserManagement(activeLoader);

    // Error indicators
    const errorMsg = ref("");
    const recoveryCodeError = ref(false);
    const emailError = ref(false);
    const newPasswordError = ref(false);
    const currentPasswordError = ref(false);

    // Logic variables
    const appHeaderHeading = ref("");
    const recoveryCode = ref("");
    const emailAdress = ref("");
    const showEmailInput = ref(true);
    const showNewPasswordForm = ref(false);
    const newRecoveryCodeGenerated = ref(false);
    const newRecoveryCodeValue = ref("");
    const newPassword = ref("");
    const newPasswordCheck = ref("");
    const currentPassword = ref("");
    const passwordWasChanged = ref(false);
    const resetWithOldPassword = ref(false);
    const tempEncryptionKeys: Ref<EncryptionKeys> = ref({ encryptionKey: "" });

    const RECOVERY_CODE_LENGTH = 19; // Length of the recovery code including the hyphens

    /**
     * Reset all error indicators to false.
     * This is used on every new validation of the recovery code or password
     */
    const resetErrorIndicators = () => {
        recoveryCodeError.value = false;
        emailError.value = false;
        newPasswordError.value = false;
        currentPasswordError.value = false;
    };

    /**
     * Validates the secret (recovery code or current password)
     * and shows the new password form if the secret is correct
     * @return void
     */
    const validateSecret = () => {
        resetErrorIndicators();

        if (!resetWithOldPassword.value) {
            if (!validEmail(emailAdress.value)) {
                emailError.value = true;
                return;
            }

            if (recoveryCode.value.length != RECOVERY_CODE_LENGTH) {
                recoveryCodeError.value = true;
                return;
            }

            activeLoader.value = true;

            callFire({
                action: ServerAction.checkRecoveryCode,
                recoveryCode: recoveryCode.value,
                email: emailAdress.value,
            })
                .then((response: any) => {
                    activeLoader.value = false;

                    if (!response) {
                        recoveryCodeError.value = true;
                    } else {
                        tempEncryptionKeys.value = {
                            encryptionKey: response.encryptionKey,
                        };

                        showNewPasswordForm.value = true;
                        appHeaderHeading.value = "Recovery code accepted. Please enter your new password";
                        window.scrollTo(0, 0);
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        } else {
            if (currentPassword.value == "") {
                currentPasswordError.value = true;
                return;
            }

            // Reauthenticate user with email and password to check if password is correct
            activeLoader.value = true;
            const currentUser = getAuth().currentUser;

            if (currentUser == null) {
                activeLoader.value = false;
                return;
            }

            if (currentUser.email == null) {
                activeLoader.value = false;
                return;
            }

            const emailCredentials = EmailAuthProvider.credential(currentUser.email, currentPassword.value);

            reauthenticateWithCredential(currentUser, emailCredentials)
                .then(() => {
                    activeLoader.value = false;
                    showNewPasswordForm.value = true;
                    appHeaderHeading.value = "Current password accepted. Please enter your new password";
                    window.scrollTo(0, 0);
                })
                .catch(() => {
                    currentPasswordError.value = true;
                    activeLoader.value = false;
                });
        }
    };

    /**
     * Creates a new password for the user and generates
     * a new recovery code if user reset the password
     * with the recovery code (not with the old password)
     * @return void
     */
    const createNewPassword = async () => {
        resetErrorIndicators();
        const passwordError = validatePassword(newPassword, newPasswordCheck);

        if (passwordError != null) {
            newPasswordError.value = true;
            errorMsg.value = passwordError;
            return;
        }

        activeLoader.value = true;
        const currentUser = getAuth().currentUser;

        // Activate temp encryption keys from the recovery code validation
        if (!resetWithOldPassword.value) {
            await setPreferenceValue("encryptionKey", tempEncryptionKeys.value.encryptionKey);
        }

        let userEmail = resetWithOldPassword.value ? (currentUser ? currentUser.email : "") : emailAdress.value;
        if (!userEmail) {
            activeLoader.value = false;
            return;
        }

        changePassword({
            verifier: resetWithOldPassword.value ? currentPassword.value : recoveryCode.value,
            verifirerType: resetWithOldPassword.value ? VerifierType.OldPassword : VerifierType.RecoveryCode,
            email: userEmail,
            newPassword: newPassword.value,
            action: ServerAction.changePassword,
        })
            .then((response: any) => {
                if (!response) {
                    newPasswordError.value = true;
                    errorMsg.value = "Something went wrong. Please try again later";
                    activeLoader.value = false;
                    return;
                }

                activeLoader.value = false;
                window.scrollTo(0, 0);

                if (resetWithOldPassword.value) {
                    if (response.passwordChanged == true) {
                        appHeaderHeading.value = "Your password has been successfully changed.";
                        passwordWasChanged.value = true;
                        showNewPasswordForm.value = false;

                        // Required to check to prevent typescript from complaining
                        if (currentUser!.email == null) {
                            return;
                        }

                        // It is necessary to reauthenticate user after password change
                        const emailCredentials = EmailAuthProvider.credential(currentUser!.email, newPassword.value);
                        reauthenticateWithCredential(currentUser!, emailCredentials);
                    } else {
                        newPasswordError.value = true;
                        errorMsg.value = "Something went wrong. Please try again later";
                    }
                } else {
                    showNewPasswordForm.value = false;
                    newRecoveryCodeGenerated.value = true;
                    appHeaderHeading.value = "Your password has been changed. Here is your new recovery code";
                    newRecoveryCodeValue.value = response.newRecoveryCode;
                    deletePreferenceValue("encryptionKey");
                    store.dispatch("save_enteredPasscode", true);
                }
            })
            .catch((error) => {
                activeLoader.value = false;
                console.log(error);
            });
    };

    return {
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
    };
}
