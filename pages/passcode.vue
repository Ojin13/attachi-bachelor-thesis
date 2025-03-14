<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer" :class="{ 'pageContainer--shake': shakeScreen }">
                <div class="pageContainer">
                    <AppHeader :noBottomOffset="true" :showNotificationlIcon="false" :heading="'Enter your passcode'" :centerHeading="true" />
                    <p v-if="!isForced" class="gray passcode__description">Please enter your passcode to access your saved data.</p>
                </div>

                <div class="passcode">
                    <NumberKeyboard :correctPasscode="correctPasscode" @submitPasscode="passcodeSubmitted" />
                    <p class="gray" @click="forgotPasscode()">Forgot your passcode?</p>
                    <p v-if="isForced" @click="cancelForcedPasscode()">Cancel</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { Haptics } from "@capacitor/haptics";
import { store } from "~/store";

definePageMeta({
    middleware: ["is-authenticated"],
});

onMounted(async () => {
    correctPasscode.value = await getPasscodeByUser(store.state.auth.UID);
});

/* Composables */
const { getPasscodeByUser } = usePasscode();
const { getCurrentRoute, replaceNavigationStack, pushToStack, popFromStack } = useIonicRouter();

const correctPasscode = ref("");
const shakeScreen = ref(false);
const isForced = getCurrentRoute().query.forcePasscode;

const forgotPasscode = () => {
    pushToStack("/forgotPasscode");
};

const cancelForcedPasscode = () => {
    popFromStack();
};

const passcodeSubmitted = (passcodeData) => {
    if (passcodeData.isValid == true) {
        store.dispatch("save_enteredPasscode", true);

        if (getCurrentRoute().query.forcePasscode) {
            store.dispatch("save_reenteredPasscodeForChange", true);
            replaceNavigationStack("/passcodeCreation");
        } else {
            replaceNavigationStack("/auth/contacts");
        }
    } else {
        shakeScreen.value = true;
        const errorDuration = 500;
        Haptics.vibrate({ duration: errorDuration });

        setTimeout(() => {
            shakeScreen.value = false;
        }, errorDuration);
    }
};
</script>

<style lang="scss">
@use "sass:math";
@import "/assets/sass/variables";

.passcode {
    text-align: center;

    &__description {
        margin-top: 15px;
        text-align: center;
    }
}
</style>
