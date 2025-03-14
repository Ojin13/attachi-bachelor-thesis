import { store } from "~/store";
import { updateProfile, getAuth, signOut } from "firebase/auth";
import { pbkdf2Sync } from "pbkdf2";
import { PasscodeStatus, ServerAction, VerifierType, type LoginData, type NewPasswordVerifier } from "~/types";
import { YesNoValue, type User } from "~/types";

/**
 * Composable function that handles all user management operations
 * like initialization of the user, deleting user account etc..
 * @param activeLoader - Reference to the loader state which activates UI loader element
 */
export function useUserManagement(activeLoader: Ref<boolean>) {
    const userName: Ref<string> = ref(store.state.auth.userName);
    const nameTypingTimer: Ref<any> = ref(null);

    // Composables
    const { deletePreferenceValue, getPreferenceValue, setPreferenceValue } = usePreferences();
    const { reloadRouter } = useIonicRouter();
    const { callFire } = useFirebaseConnector();

    /**
     * Updates the username in the store and sends a request to also update it
     * in the database and in the firebase user profile. Update is called only
     * after the user stops typing for 1 second to avoid unnecessary requests.
     * @returns void
     */
    const updateUserName = () => {
        store.dispatch("save_username", userName.value);
        clearTimeout(nameTypingTimer.value);

        let timeBeforeRequest = 1000;

        // Wait for typingInterval to finish and then send update request
        nameTypingTimer.value = setTimeout(function () {
            const currentUser = getAuth().currentUser;
            if (!currentUser) {
                return;
            }

            updateProfile(currentUser, { displayName: userName.value });
            callFire({ action: ServerAction.updateUser, specificAction: "updateUserName", newUserName: userName.value });
        }, timeBeforeRequest);
    };

    /**
     * Deletes the user account and all the data associated with it.
     * This function firstly deletes all contacts by callinng deleteContact
     * endpoint and after that it deletes the user account itself by calling
     * deleteUser endpoint. After deletion, user is signed out of the current
     * session and redirected to the login page.
     * @returns void
     */
    const deleteUserAccount = async () => {
        activeLoader.value = true;

        // Get ID of all contacts of this user
        let contactKeys = Object.keys(store.state.userData.contacts);
        let contactIDs: Number[] = [];

        for (let i = 0; i < contactKeys.length; i++) {
            contactIDs.push(parseInt(contactKeys[i]));
        }

        // Delete all contacts from the store
        for (let i = 0; i < contactIDs.length; i++) {
            store.commit("deleteContact", contactIDs[i]);
        }

        // Delete persistent preferences tied to user
        deletePreferenceValue(store.state.auth.UID + "-recoveryCodeCreationSuggested");
        deletePreferenceValue(store.state.auth.UID + "-hasPasscode");

        // Perform the deletion of user and contacts in the database
        await callFire({ action: ServerAction.deleteContact, id: contactIDs });
        await callFire({ action: ServerAction.deleteUser });

        activeLoader.value = false;
        signOut(getAuth());
        reloadRouter("/login");
    };

    /**
     * Retrieves the profile picture of the user from the store.
     * If the profile picture is not ready yet (it is not a base64 image),
     * an empty string is returned.
     * @returns Profile picture of the user as a base64 string or an empty string if not set
     */
    const getProfilePic = (): string => {
        const imageFromStore = store.state.auth.profilePicture;

        if (!imageFromStore.startsWith("data:image") && !imageFromStore.startsWith("http") && !imageFromStore.startsWith("blob")) {
            return "";
        } else {
            return store.state.auth.profilePicture;
        }
    };

    /**
     * Fetches the passcode status of the user from the preferences
     * and returns true if user has active passcode.
     * @returns True if the user has a passcode set, otherwise false
     */
    const hasPasscode = async (): Promise<boolean> => {
        const passcodeStatus = await getPreferenceValue(store.state.auth.UID + "-hasPasscode");
        return passcodeStatus == PasscodeStatus.userHasPasscode;
    };

    /**
     * Fetches the recovery code status of the user from the preferences
     * and returns true if user has recovery code.
     * @returns True if the user has a recovery code set, otherwise false
     */
    const hasRecoveryCode = async (): Promise<boolean> => {
        const recoveryCodeStatus: YesNoValue = (await getPreferenceValue("hasRecoveryCode")) as YesNoValue;
        return recoveryCodeStatus == YesNoValue.Yes;
    };

    /**
     * Initializes the new session for the current user by calling the initUser
     * endpoint. This endpoint required LoginData and derivedKey from the user
     * password. This key is derived to keep the password obscured in transit.
     * On successful initialization, returns User object and saves it to the
     * preferences.
     *
     * @param data - LoginData object with user credentials
     * @returns User object with the encryption key
     */
    const initUser = (data: LoginData): Promise<User | null> => {
        let derivedKey = deriveKeyFromSecret(data.password, true);

        return callFire({
            action: ServerAction.initUser,
            name: data.name,
            email: data.email,
            hashedUserPassword: derivedKey,
        }).then(async (user: User) => {
            if (user) {
                await saveEncryptionData(user);
                return user;
            }

            return null;
        });
    };

    /**
     * Helper function to save encryption data to the preferences
     * @param user - User object with encryption key and recovery code status
     * @returns void
     */
    const saveEncryptionData = async (user: User) => {
        await setPreferenceValue("encryptionKey", user.encryptionKey);
        await setPreferenceValue("hasRecoveryCode", user.hasRecoveryCode);
    };

    /**
     * Changes the user password by calling the changePassword endpoint. Requires
     * verifier, which is either the old password or the recovery code. This is provided
     * as a NewPasswordVerifier object. Returns a promise that has passwordChanged property
     * set to true if the password was changed successfully.
     * @param data - NewPasswordVerifier object with new password and verifier
     * @returns Promise<any> with passwordChanged property
     */
    const changePassword = async (data: NewPasswordVerifier) => {
        data.action = ServerAction.changePassword;

        // This will be used to change Firebase user password via Firebase SDK
        data["plaintextPassword"] = data.newPassword;

        // This will be used to re-encrypt the the encryption key with the new password
        let derivedKeyFromNewPassword = deriveKeyFromSecret(data.newPassword) as string;
        data.newPassword = derivedKeyFromNewPassword;

        // If current password is provided, save it as a verifier
        if (data.verifirerType == VerifierType.OldPassword) {
            let derivedKeyFromOldPassword = deriveKeyFromSecret(data.verifier) as string;
            data.verifier = derivedKeyFromOldPassword;
        }

        return await callFire(data);
    };

    /**
     * Derives the key from the secret using pbkdf2Sync with the provided salt.
     * @param secret - Secret to derive the key from
     * @param bothSystems - If true, returns both old and new system derived keys
     * @returns Derived key as a hex string
     */
    const deriveKeyFromSecret = (secret: string, bothSystems: boolean = false) => {
        // These are public information, just for in transit obfuscation
        // Salt should be at least as long as the hash output, that is 32 bytes or 64 characters
        const saltForPassword = "EeFxBeRl6emUx8wza5LAdsnJlF5QF44agEn4XBJh7r1iBBf18rH723coMvTrfpDa";
        const clientSideIterations = 5000;
        const clientSideDigets = "sha512";
        const clientSideKeyLength = 32;

        const newSystem = pbkdf2Sync(secret, saltForPassword, clientSideIterations, clientSideKeyLength, clientSideDigets).toString("hex");

        // Used for migration from old to new encryption system
        if (bothSystems) {
            const saltForPassword = "a98008b26bef5f8dbcbd8cefae2161ebcc63a597336ae";
            return {
                oldSystem: pbkdf2Sync(secret, saltForPassword, 8, 256, "sha512").toString("hex"),
                newSystem: newSystem,
            };
        } else {
            return newSystem;
        }
    };

    return {
        userName,
        updateUserName,
        getProfilePic,
        deleteUserAccount,
        hasPasscode,
        hasRecoveryCode,
        initUser,
        changePassword,
    };
}
