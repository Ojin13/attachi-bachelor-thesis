import { getAuth, signOut } from "firebase/auth";
import { store } from "~/store";
import { ServerAction, YesNoValue, type NavigationStack } from "~/types";

export default defineNuxtRouteMiddleware(async (to) => {
    const route = to;
    let redirectConfirmed = false;
    let redirectReason = "";
    let redirectLocation = "";
    const { getPreferenceValue, setPreferenceValue } = usePreferences();
    const { callFire } = useFirebaseConnector();
    const { getPasscodeExistenceByUser } = usePasscode();

    updateNavigationStack();

    /* -------------   Begin router redirection tree   ------------- */
    if ((await noInternetRedirectCheck()) == true) {
        redirectConfirmed = true;
    } else if ((await updatePageRedirectCheck()) == true) {
        redirectConfirmed = true;
    } else if ((await firstOpenRedirectCheck()) == true) {
        redirectConfirmed = true;
    } else if ((await loginRedirectCheck()) == true) {
        redirectConfirmed = true;
    } else if ((await indexPageRedirectCheck()) == true) {
        redirectConfirmed = true;
    } else if ((await passcodePageRedirectCheck()) == true) {
        redirectConfirmed = true;
    } else if ((await createRecoveryCodeRedirectCheck()) == true) {
        redirectConfirmed = true;
    }

    if (redirectConfirmed) {
        return middlewareRedirect(redirectLocation, redirectReason);
    }

    function middlewareRedirect(location: string, reason: string) {
        if (route.path != location) {
            console.log("Redirecting to: " + location + " because: " + reason);
            return navigateTo({ path: location, replace: true });
        }
    }

    async function noInternetRedirectCheck() {
        // Check for internet connection - This property is unreliable.
        // A computer can be connected to a network without having Internet access.
        // Use @capacitor/network for iOS and Android instead - see /layouts/mobile.vue

        if (!navigator.onLine) {
            console.log("No internet connection");
            redirectReason = "No internet connection";
            redirectLocation = "/noInternet";
            return true;
        }
    }

    async function updatePageRedirectCheck(): Promise<boolean> {
        // Before each redirect, make an additional request to the API to get the minimum required version
        // of the app. If the app is not up to date, then the user will be redirected to the update page.
        const currentAppVersion = "13";
        let lastVersionCheckTime = await getPreferenceValue("lastVersionCheckTime");

        if (!lastVersionCheckTime) {
            lastVersionCheckTime = "-1";
        }

        // Check if last version check was more than 30 seconds ago
        let currentTime = new Date().getTime();
        let timeDifference = currentTime - parseInt(lastVersionCheckTime);
        // 1 minute = 60000
        // 1 hour = 3600000
        // 1 day = 86400000
        // 1 week = 604800000
        // 1 month = 2592000000

        if (timeDifference > 30000 || lastVersionCheckTime == "-1") {
            console.log("Checking for new app version");
            setPreferenceValue("lastVersionCheckTime", new Date().getTime().toString());

            callFire({ action: ServerAction.checkVersion }).then(async (minSupportedVersion) => {
                if (parseInt(minSupportedVersion.minimalSupportedVersion) > parseInt(currentAppVersion)) {
                    console.log("Current app version is not up to date!");
                    redirectLocation = "/updatePlease";
                    redirectReason = "Current app version is not up to date!";

                    // Since using await would cause delay in routing, we cant use redirection tree.
                    // For this reason we are redirecting directly here, instead of returning true.
                    middlewareRedirect(redirectLocation, redirectReason);
                } else if (parseInt(minSupportedVersion.minimalSupportedVersion) <= parseInt(currentAppVersion)) {
                    // If user has the latest version, check if he/she has already seen the news for this version
                    let lastNewVersionNews = await getPreferenceValue("lastNewVersionNews");

                    // If user just installed the app, set the lastNewVersionNews to current app version
                    // and do not show the new features of this version.
                    // UserDefaults on iOS and SharedPreferences on Android are persistent so upgrading the app
                    // will not reset the value of lastNewVersionNews.
                    if (!lastNewVersionNews) {
                        console.log("User just installed the app, do not show new version news!");
                        setPreferenceValue("lastNewVersionNews", currentAppVersion);
                        return false;
                    }

                    // If user has seen the news for previous version, but not for current version, show the news
                    if (parseInt(lastNewVersionNews) < parseInt(currentAppVersion)) {
                        // If user has seen the news for previous version, set it to current app version
                        console.log("User has not seen the new version news yet!");
                        setPreferenceValue("lastNewVersionNews", currentAppVersion);
                        store.commit("setLastVersionSummary", minSupportedVersion.lastVersionSummary);
                        store.commit("setLastVersionDesc", minSupportedVersion.lastVersionDescription);
                        redirectLocation = "/newVersionNews";
                        redirectReason = "New version news not seen yet!";
                        middlewareRedirect(redirectLocation, redirectReason);
                    }
                }
            });
        }

        return false;
    }

    async function firstOpenRedirectCheck() {
        // Check if first open value is set and if not, redirect to firstOpen page
        let isFirstOpen = await getPreferenceValue("isFirstOpen");

        if (isFirstOpen == null || isFirstOpen == undefined) {
            redirectLocation = "/firstOpen";
            redirectReason = "First open of this app";
            return true;
        }
    }

    async function loginRedirectCheck() {
        // No need to check for firebase auth state since onAuthStateChanged is already being used
        // Checks if user has encryption keys set and if not, logs him/her out

        let hasEncryptionKeys = true;

        if ((await encryptionKeysAvailable()) == false) {
            hasEncryptionKeys = false;
        }

        if (!hasEncryptionKeys) {
            const auth = getAuth();
            await signOut(auth);
            redirectLocation = "/login";
            redirectReason = "User has no encryption keys";
            return true;
        }
    }

    async function indexPageRedirectCheck() {
        if (route.path == "/") {
            return;
        }

        // Check if user data are loaded and if not, redirect to index page where they will be fetched
        if (store.state.userData.dataLoaded == false) {
            if (route.path != "/passcodeCreation" && route.path != "/recoveryCodeSuggestion") {
                redirectLocation = "/";
                redirectReason = "User data are not loaded yet";
                return true;
            }
        }

        // Prevent multiple recovery code creation suggestions
        let recoveryCodeCreationSuggested = await getPreferenceValue(store.state.auth.UID + "-recoveryCodeCreationSuggested");
        if (route.path == "/recoveryCodeSuggestion" && recoveryCodeCreationSuggested == YesNoValue.Yes) {
            redirectLocation = "/";
            redirectReason = "Recovery code creation suggestion was already suggested";
            return true;
        }
    }

    async function passcodePageRedirectCheck() {
        // Check if vuex is loaded
        if (store.state.auth.UID == "") {
            return;
        }

        let passcodeStatus = await getPasscodeExistenceByUser(store.state.auth.UID);

        // Check if user already provided passcode in current session
        let enteredPasscodeInCurrentSession = store.state.auth.enteredPasscode == null || store.state.auth.enteredPasscode == undefined || store.state.auth.enteredPasscode == "" ? false : true;

        if (passcodeStatus == "userHasPasscode") {
            // If user tries to re-create passcode
            if (route.path == "/passcodeCreation" && store.state.auth.reenteredPasscodeForChange != true) {
                redirectLocation = "/";
                redirectReason = "Passcode was already created";
                return true;
            }

            // If user tries to enter passcode when he/she already did
            if (route.path == "/passcode" && enteredPasscodeInCurrentSession && !route.query.forcePasscode) {
                redirectLocation = "/";
                redirectReason = "Passcode was already entered";
                return true;
            }

            // Allow user to create new passcode after change request or after forgot passcode
            if (store.state.auth.reenteredPasscodeForChange == true && route.path == "/passcodeCreation") {
                return;
            }

            if (route.path != "/forgotPasscode" && route.path != "/passcode" && !enteredPasscodeInCurrentSession) {
                redirectLocation = "/passcode";
                redirectReason = "User did not enter passcode yet";
                return true;
            }
        } else if (passcodeStatus == "userHasNoPasscode") {
            // If user tries to access passcode pages, when he/she skipped passcode creation
            if (route.path == "/forgotPasscode" || route.path == "/passcode") {
                redirectLocation = "/";
                redirectReason = "User did not create passcode yet";
                return true;
            }

            if (route.path == "/passcodeCreation" && !route.query.forcePasscode) {
                redirectLocation = "/";
                redirectReason = "User did not create passcode yet, to create it, it must be forced";
                return true;
            }
        } else {
            // If user was not asked to create passcode before, ask him/her for creation
            if (route.path != "/passcodeCreation") {
                redirectLocation = "/passcodeCreation";
                redirectReason = "User was not asked to create passcode yet";
                return true;
            }
        }
    }

    async function createRecoveryCodeRedirectCheck() {
        // Check if vuex is loaded
        if (store.state.auth.UID == "") {
            return;
        }

        // Check if user has already created recovery code
        let recoveryCodeExistence = await getPreferenceValue("hasRecoveryCode");
        if (recoveryCodeExistence == YesNoValue.Yes) {
            return;
        }

        let recoveryCodeCreationSuggested = await getPreferenceValue(store.state.auth.UID + "-recoveryCodeCreationSuggested");
        if (recoveryCodeCreationSuggested != YesNoValue.Yes) {
            if (route.path != "/recoveryCodeSuggestion" && !route.path.toLowerCase().includes("passcode")) {
                redirectLocation = "/recoveryCodeSuggestion";
                redirectReason = "Recovery code creation was not suggested yet";
                return true;
            }
        }
    }

    function updateNavigationStack() {
        const navigationStacks: NavigationStack[] = [
            {
                stack: store.state.navigationStacks.contactsStack,
                commit: "setContactStack",
                route: "/auth/contacts",
            },
            {
                stack: store.state.navigationStacks.groupsStack,
                commit: "setGroupStack",
                route: "/auth/groups",
            },
            {
                stack: store.state.navigationStacks.accountStack,
                commit: "setAccountStack",
                route: "/auth/account",
            },
        ];

        // This is an additional logic to update navigation stack when swipe back is used
        // as that is not handled by the Ionic router and must be done manually here in the middleware.
        for (let i = 0; i < navigationStacks.length; i++) {
            if (route.path.toLowerCase().includes(navigationStacks[i].route.toLowerCase())) {
                let currentStack = navigationStacks[i].stack;

                if (route.path != currentStack[currentStack.length - 1]) {
                    // Check if user did normal swipe back
                    if (route.path == currentStack[currentStack.length - 2]) {
                        store.commit(navigationStacks[i].commit, currentStack.slice(0, -1));
                    } else {
                        // If back operation led to a different page than the expected one from the stack look further back in the stack
                        let found = false;
                        for (let j = 2; j <= currentStack.length; j++) {
                            if (route.path == currentStack[currentStack.length - j]) {
                                currentStack = currentStack.slice(0, -j + 1);
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            currentStack[currentStack.length - 1] = route.path;
                        }

                        store.commit(navigationStacks[i].commit, currentStack);
                    }
                }
            }
        }

        /*
            console.log("Contact stack: ", store.state.navigationStacks.contactsStack);
            console.log("Group stack: ", store.state.navigationStacks.groupsStack);
            console.log("Account stack: ", store.state.navigationStacks.accountStack);
        */
    }

    async function encryptionKeysAvailable() {
        let encryptionKey = await getPreferenceValue("encryptionKey");
        return encryptionKey != null;
    }
});
