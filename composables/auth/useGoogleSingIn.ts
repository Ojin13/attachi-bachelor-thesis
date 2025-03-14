import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { getAuth, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { ServerAction, YesNoValue } from "~/types";

/**
 * Composable function that handles the Google Sign-In process
 * @param activeLoader - Reference to the loader state which activates UI loader element
 */
export function useGoogleSignIn(activeLoader: Ref<boolean>) {
    const { replaceNavigationStack } = useIonicRouter();
    const { callFire } = useFirebaseConnector();

    /**
     * Signs in the user using Google Sign-In on the native layer with FirebaseAuthentication library
     * and then signs in the user on the web layer using the JS Firebase SDK
     * @returns void, but on success it redirects the user to the dataEncryptionForm
     */
    const googleSingIn = async () => {
        // 1. Create credentials on the native layer
        const result = await FirebaseAuthentication.signInWithGoogle();
        activeLoader.value = true;

        // 2. Sign in on the web layer using the id token
        const credential = GoogleAuthProvider.credential(result.credential?.idToken);
        const auth = getAuth();
        await signInWithCredential(auth, credential).catch((error) => {
            console.error("Error signing in with Google", error);
        });

        // Check if user with the email address from the Google Sign-in already exists in the database.
        // If not, it means that user is not yet registered with email/password, which means that he/she does
        // not have an encryption key yet.
        callFire({ action: ServerAction.checkUserExistence }).then((userExists: boolean) => {
            replaceNavigationStack({ path: "/dataEncryptionForm", query: { newUser: userExists ? YesNoValue.No : YesNoValue.Yes } });
        });
    };

    return { googleSingIn };
}
