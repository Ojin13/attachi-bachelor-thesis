<template>
    <ion-app>
        <ion-router-outlet />
    </ion-app>
</template>

<script setup>
import * as LiveUpdates from "@capacitor/live-updates";
import { Network } from "@capacitor/network";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { SafeArea } from "capacitor-plugin-safe-area";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { store } from "./store";
import { YesNoValue } from "./types";

// Composables
const { reloadRouter, replaceNavigationStack } = useIonicRouter();
const { generateSmartGroups } = useSmartGroups();
const { getPasscodeExistenceByUser } = usePasscode();
const { signOutUser } = useEmailSignIn();
const { registerCustomBackButtonHandler } = useHardwareBackButton();
const touchDuration = ref(0);
const touchStart = ref(new Date());
const touchEnd = ref(new Date());

const isTextInput = (node) => {
    return ["INPUT"].includes(node.nodeName) !== -1 || ["TEXTAREA"].includes(node.nodeName) !== -1;
};

const prepareSafeArea = () => {
    SafeArea.getSafeAreaInsets().then(({ insets }) => {
        const minTopInset = 30;
        document.documentElement.style.setProperty(`--safe-area-top`, `${insets.top < minTopInset ? minTopInset : insets.top}px`);
    });
};

const handleAutoKeyboardDismiss = () => {
    document.addEventListener("touchstart", function () {
        touchStart.value = new Date();
    });

    document.addEventListener(
        "touchend",
        function (e) {
            touchEnd.value = new Date();
            touchDuration.value = touchEnd.value - touchStart.value;

            // If touch duration is less than 100ms and the target element is not a text input and the active element is a text input, blur the active element
            // This allows scrolling without closing the keyboard and closing it on a short tap which is more user friendly.
            if (touchDuration.value < 100) {
                if (!isTextInput(e.target) && isTextInput(document.activeElement)) {
                    document.activeElement.blur();
                }
            }
        },
        false,
    );
};

// https://capacitorjs.com/docs/apis/network
// Add listener to check internet connection status
// and redirect to noInternet if offline
const handleLostInternetConnection = () => {
    Network.addListener("networkStatusChange", (status) => {
        console.log("Network status changed: " + status);

        if (status == "none") {
            reloadRouter("/noInternet");
        }
    });
};

// https://capacitorjs.com/docs/apis/app
// Add listener to check if app was closed and if so save lastOpenTime
const handleResuming = () => {
    App.addListener("appStateChange", ({ isActive }) => {
        if (!isActive) {
            console.log("App closed");
            store.dispatch("save_lastOpenTime", new Date().getTime());
        }
    });

    // Add listener for resume event
    App.addListener("resume", async () => {
        if (localStorage.shouldReloadApp === YesNoValue.true && localStorage.allowReloadApp === YesNoValue.true) {
            // Reload if live update is available and no critical action is in progress
            await LiveUpdates.reload();
        } else {
            handleLiveUpdateCheck();
        }

        // Check if lastOpenTime is more than X minutes ago and if so requre entering passcode again
        let requirePasscodeAfterMinutes = 2;
        let requirePasscode = false;
        let lastOpenTime = store.state.auth.lastOpenTime;

        let timeDifferenceInMinutes = 0;
        let timeDifferenceInSeconds = 0;

        if (lastOpenTime && typeof lastOpenTime === "number") {
            let currentTime = new Date().getTime();
            let timeDifference = currentTime - lastOpenTime;
            timeDifferenceInMinutes = Math.round(timeDifference / 60000);
            timeDifferenceInSeconds = Math.round(timeDifference / 1000);

            if (timeDifferenceInMinutes >= requirePasscodeAfterMinutes) {
                requirePasscode = true;
            } else {
                console.log("App was last opened " + timeDifference / 1000 + " seconds ago. No need to require passcode again yet.");
            }
        } else {
            console.log("Last time app was opened is unknown. Require passcode again");
            requirePasscode = true;
        }

        if (requirePasscode) {
            getPasscodeExistenceByUser(store.state.auth.UID).then((passcodeExists) => {
                if (passcodeExists == "userHasPasscode") {
                    console.log("App was last opened more than " + timeDifferenceInMinutes + " minutes ago (" + timeDifferenceInSeconds + " seconds ago). Require passcode again");
                    store.dispatch("save_enteredPasscode", null);
                    replaceNavigationStack("/passcode");
                }
            });
        }
    });
};

const handleFireAuthStateChange = () => {
    // Listen for firebase auth state changes
    onAuthStateChanged(getAuth(), (user) => {
        if (!user) {
            console.log("Firebase auth state changed - user is not logged in.");
            signOutUser();
        } else {
            store.dispatch("save_UID", user.uid);
            store.dispatch("save_username", user.displayName);
            store.dispatch("save_email", user.email);
        }
    });
};

const handleLiveUpdateCheck = async () => {
    if (Capacitor.isNativePlatform()) {
        const result = await LiveUpdates.sync();
        localStorage.shouldReloadApp = result.activeApplicationPathChanged;
    }
};

const watchSmartGroups = () => {
    store.subscribe((mutation) => {
        // On data preset update, regenerate smart groups
        if (mutation.type == "updateContactDataPresets") {
            generateSmartGroups(store.state.userData.contactDataPresets);
        }
    });
};

onMounted(() => {
    // Attach global event listeners
    prepareSafeArea();
    registerCustomBackButtonHandler();
    handleAutoKeyboardDismiss();
    handleLostInternetConnection();
    handleResuming();
    handleFireAuthStateChange();
    handleLiveUpdateCheck();
    watchSmartGroups();
});
</script>

<style lang="scss" scoped>
@import "/assets/sass/variables";

.version_header {
    position: absolute;
    top: 10px;
    left: 10px;
    color: gray;
}

.app {
    background-color: $primary-background-color;
    width: 100%;
    height: 100vh;
    position: absolute;
    top: 0;
}
</style>
