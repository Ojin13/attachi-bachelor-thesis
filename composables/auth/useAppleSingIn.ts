import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { getAuth, signInWithCredential, OAuthProvider, updateProfile } from "firebase/auth";
import { ServerAction, YesNoValue } from "~/types";

/**
 * Composable function that handles the Apple ID Sign-In process
 * @param activeLoader - Reference to the loader state which activates UI loader element
 */
export function useAppleSignIn(activeLoader: Ref<boolean>) {
    const { replaceNavigationStack } = useIonicRouter();
    const { callFire } = useFirebaseConnector();

    /**
     * Signs in the user using Apple Sign-In on the native layer with FirebaseAuthentication library
     * and then signs in the user on the web layer using the JS Firebase SDK
     * @returns void, but on success it redirects the user to the dataEncryptionForm
     */
    const appleSignIn = async () => {
        try {
            // Create credentials on the native layer
            const result = await FirebaseAuthentication.signInWithApple({
                scopes: ["email", "name"],
            });

            let appleUsername = "";
            let appleUsernameAvailable = false;

            // Check for Apple username - its available only for the first time user logs in with Apple ID
            if (result.user?.displayName) {
                appleUsername = result.user.displayName;
                appleUsernameAvailable = true;
            }

            activeLoader.value = true;
            const provider = new OAuthProvider("apple.com");

            // Create firebase credentials from OAuth response, for login on web layer
            // Apple Sign-In requires raw Nonce to protect against replay attacks
            const credential = provider.credential({
                idToken: result.credential?.idToken,
                rawNonce: result.credential?.nonce,
            });

            const auth = getAuth();
            signInWithCredential(auth, credential).then(async () => {
                // Save the Apple username to firebase user profile if possible
                if (appleUsernameAvailable) {
                    if (auth.currentUser) {
                        await updateProfile(auth.currentUser, { displayName: appleUsername });
                    }
                }

                // Check if user the email address from the Apple ID already exists in the database.
                // If not, it means that user is not yet registered with email/password, which means that he/she does
                // not have an encryption key yet.
                callFire({ action: ServerAction.checkUserExistence }).then((userExists: boolean) => {
                    replaceNavigationStack({ path: "/dataEncryptionForm", query: { newUser: userExists ? YesNoValue.No : YesNoValue.Yes } });
                });
            });
        } catch (e) {
            // Exception is thrown if user cancels the Apple Sign-In process
            // or if there is some other error
            console.log(e);
        }
    };

    return { appleSignIn };
}
