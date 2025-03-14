import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { usePasswordValidation } from "../index";
import { store } from "~/store";
import {
    createUserWithEmailAndPassword,
    reauthenticateWithCredential,
    signInWithEmailAndPassword,
    sendEmailVerification,
    linkWithCredential,
    EmailAuthProvider,
    updateProfile,
    signOut,
    getAuth,
} from "firebase/auth";

/**
 * Composable function that handles the Email/Password Sign-In process
 * @param activeLoader - Reference to the loader state which activates UI loader element
 */
export function useEmailSignIn(activeLoader: Ref<boolean>) {
    const { replaceNavigationStack, rebaseNavigationStack } = useIonicRouter();
    const { validatePassword } = usePasswordValidation();
    const { initUser } = useUserManagement(activeLoader);
    const { deletePreferenceValue } = usePreferences();
    const errorLogin = ref(false);
    const emailError = ref(false);
    const passwordError = ref(false);
    const errorMsg = ref("");
    const password = ref("");
    const passwordCheck = ref("");
    const email = ref("");
    const nickname = ref("");

    /**
     * Creates a new Firebase user account with email and password.
     * On success, sends a verification email and logs out the user.
     * @returns void, but on success it redirects the user to the verificationEmail page
     */
    const createUserWithEmail = async () => {
        errorLogin.value = false;
        emailError.value = false;
        passwordError.value = false;

        // Check if email and nickname are not empty
        if (email.value == "" || nickname.value == "") {
            errorLogin.value = true;
            errorMsg.value = "Pleasse enter valid name and email";
            return;
        }

        // Validate password
        const passwordValidationError = validatePassword(password, passwordCheck);
        if (passwordValidationError != null) {
            errorLogin.value = true;
            passwordError.value = true;
            errorMsg.value = passwordValidationError;
            return;
        }

        // Create user in Firebase auth (Not in DB yet)
        activeLoader.value = true;

        createUserWithEmailAndPassword(getAuth(), email.value, password.value)
            .then(async () => {
                const currentUser = getAuth().currentUser;
                if (currentUser != null) {
                    await updateProfile(currentUser, { displayName: nickname.value });
                    sendVerificationEmailAndLogOut();
                }
            })
            .catch((e) => {
                errorLogin.value = true;
                activeLoader.value = false;

                if (e.code == "auth/email-already-in-use") {
                    errorMsg.value = "This email is already taken";
                    emailError.value = true;
                } else if (e.code == "auth/weak-password") {
                    errorMsg.value = "Password must be 6 characters long";
                    passwordError.value = true;
                } else if (e.code == "auth/invalid-email") {
                    errorMsg.value = "This email address is not valid";
                    emailError.value = true;
                } else {
                    errorMsg.value = "Can't create new user accont at the moment";
                }
                console.log(e);
            });
    };

    /**
     * Signs in the user using email and password - this is performed even after
     * Google/Apple login in order for user to manually enter the password, which is needed
     * for encryption keys...
     * @returns void, but on success it redirects the user to the auth section
     */
    const loginUserWithEmail = async () => {
        errorLogin.value = false;
        emailError.value = false;
        passwordError.value = false;

        if (email.value == "" || password.value == "") {
            errorLogin.value = true;
            errorMsg.value = "Enter both email and password";
            return;
        }

        // Try to login with provided credentials
        activeLoader.value = true;

        signInWithEmailAndPassword(getAuth(), email.value, password.value)
            .then(() => {
                const currentUser = getAuth().currentUser;

                if (currentUser == null) {
                    console.error("User is not logged in - can't prepare login session.");
                    return;
                }

                if (currentUser.emailVerified) {
                    prepareLoginSession();
                } else {
                    sendVerificationEmailAndLogOut();
                }
            })
            .catch((e: any) => {
                Haptics.impact({ style: ImpactStyle.Heavy });
                errorLogin.value = true;
                activeLoader.value = false;
                if (e.code == "auth/wrong-password") {
                    errorMsg.value = "Sorry, this password is not correct";
                    passwordError.value = true;
                } else if (e.code == "auth/user-not-found") {
                    errorMsg.value = "This email is not registered";
                    emailError.value = true;
                } else if (e.code == "auth/invalid-email") {
                    errorMsg.value = "This email address is not valid";
                    emailError.value = true;
                } else if (e.code == "auth/invalid-login-credentials") {
                    // This error code is a merge of wrong-password and user-not-found
                    // It is used in the backend to prevent user enumeration. This behavior
                    // is not officially documented yet, but it is used in the Firebase JS SDK
                    // Read more: https://github.com/firebase/firebase-js-sdk/issues/7661
                    errorMsg.value = "Invalid login credentials";
                } else {
                    errorMsg.value = "Can't login at the moment";
                }

                console.log(e);
            });
    };

    /**
     * Without verifying user email, the email/password login provider
     * will be replaced by any other type of login provider (e.g. Google)
     * when user logs in with that third-party login provider, using the same
     * still unverified email address...
     * @returns void, but on success it redirects the user to the verificationEmail page
     * and logs out the user
     */
    const sendVerificationEmailAndLogOut = async () => {
        console.log("Sending verification email and logging out");
        const currentUser = getAuth().currentUser;
        if (currentUser != null) {
            await sendEmailVerification(currentUser);
            await signOut(getAuth());
            replaceNavigationStack({ path: "/verificationEmail" });
        } else {
            console.error("User is not logged in - can't send verification email and log out.");
        }
    };

    /**
     * Prepares the login session by initializing the user in the store
     * and fetching the encryption keys from the server
     * @returns void, but on success it redirects the user to the auth section
     */
    const prepareLoginSession = () => {
        errorLogin.value = false;
        const user = getAuth().currentUser;
        if (user == null) {
            return;
        }

        // Initialize the user in the store
        store.dispatch("save_UID", user.uid);
        store.dispatch("save_username", user.displayName);
        store.dispatch("save_email", user.email);

        // Fetch the encryption keys from the server
        initUser({ name: user.displayName as string, password: password.value, email: user.email as string })
            .then(() => {
                console.log("User initialized");
                store.dispatch("save_enteredPasscode", true);
                rebaseNavigationStack("/");
            })
            .catch((error) => {
                console.log(error);
            });
    };

    /**
     * Creates the encryption keys for the user from the his/her password
     * and links the third-party login provider (Apple, Google) account with
     * new email/password. This way user has encryption key even with third-party
     * login provider. Allows to login with both third-party and email/password.
     * @returns void, but on success it redirects the user to the auth section
     */
    const createUserEncryptionKeys = async () => {
        errorLogin.value = false;
        const passwordValidationError = validatePassword(password, passwordCheck);

        if (passwordValidationError != null) {
            errorLogin.value = true;
            passwordError.value = true;
            errorMsg.value = passwordValidationError;
            return;
        }

        console.log("Creating encryption key...");
        activeLoader.value = true;

        // Following checks are redundant, but they are here for the sake of the
        // possibly null warning prevention for currentUser object
        const currentUser = getAuth().currentUser;
        if (currentUser == null) {
            console.error("User is not logged in - can't check user validity.");
            return false;
        }

        if (currentUser.email == null) {
            console.error("User email is not set - can't check user validity.");
            return false;
        }

        // Link users third-party login provider (Apple, Google) account with
        // new email/password login provider to create the encryption key from the password
        const credential = EmailAuthProvider.credential(currentUser.email, password.value);
        linkWithCredential(currentUser, credential)
            .then(() => {
                console.log("Account linked with email and password");
                prepareLoginSession();
            })
            .catch((e) => {
                console.log(e);
                errorLogin.value = true;
                errorMsg.value = "Can't create the encryption password the moment. Try it again later";
                activeLoader.value = false;
            });
    };

    /**
     * Verifies the user encryption keys by reauthenticating the user with email and password.
     * If the password is correct, the decryption of the encryption keys was successful on the server.
     * @returns void, but on success it redirects the user to the auth section
     */
    const verifyUserEncryptionKeys = async () => {
        errorLogin.value = false;
        if (password.value == "") {
            errorLogin.value = true;
            errorMsg.value = "Please enter your encryption password";
            return;
        }

        console.log("Checking encryption key...");
        activeLoader.value = true;

        // Following checks are redundant, but they are here for the sake of the
        // possibly null warning prevention for currentUser object
        const currentUser = getAuth().currentUser;
        if (currentUser == null) {
            console.error("User is not logged in - can't check user validity.");
            return false;
        }

        if (currentUser.email == null) {
            console.error("User email is not set - can't check user validity.");
            return false;
        }

        // Reauthenticate user with email and password to check if password is correct
        const credential = EmailAuthProvider.credential(currentUser.email, password.value);
        reauthenticateWithCredential(currentUser, credential)
            .then(() => {
                console.log("Successfully reauthenticated with email and password");
                prepareLoginSession();
            })
            .catch((e) => {
                Haptics.impact({ style: ImpactStyle.Heavy });
                activeLoader.value = false;
                errorLogin.value = true;
                errorMsg.value = "Sorry, this password is not correct";
                console.log(e);
            });
    };

    /**
     * Signs out the user and resets the store to the initial state
     * @returns void
     */
    const signOutUser = async () => {
        console.log("Signing out");

        // Reset the user data in store
        store.dispatch("nuxtClientInit");
        store.dispatch("resetUserDataStore");

        // Delete session preferences
        await deletePreferenceValue("encryptionKey");
        await deletePreferenceValue("hasRecoveryCode");

        // Wait for call stack clear to prevent errors in missing DOM references
        setTimeout(() => {
            if (getAuth().currentUser != null) {
                signOut(getAuth());
            }
        });
    };

    return {
        createUserWithEmail,
        loginUserWithEmail,
        createUserEncryptionKeys,
        verifyUserEncryptionKeys,
        signOutUser,
        errorLogin,
        emailError,
        passwordError,
        errorMsg,
        password,
        passwordCheck,
        email,
        nickname,
    };
}
