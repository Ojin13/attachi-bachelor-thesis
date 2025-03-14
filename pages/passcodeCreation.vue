<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer" :class="{ 'pageContainer--shake': shakeScreen }">
                <LoaderOverlay :isActive="activeLoader" />

                <div class="pageContainer passcodeCreation">
                    <AppHeader :showNotificationlIcon="false" :noBottomOffset="true" :heading="headingText" :centerHeading="true" />
                    <p class="passcodeCreation--desc gray">You will be asked to enter this passcode every time you open Attachi.</p>
                </div>

                <div class="passcodeSwiper swiper passcodeCreation">
                    <!-- Additional required wrapper -->
                    <div class="swiper-wrapper">
                        <!-- First passcode slide -->
                        <div class="swiper-slide">
                            <NumberKeyboard :validatePasscode="false" @submitPasscode="passcodeSubmitted" />
                            <p class="gray passcodeCreation--bottomAction" @click="skipPasscodeCreation()">I don't want passcode</p>
                        </div>

                        <!-- Confirm passcode slide -->
                        <div class="swiper-slide">
                            <NumberKeyboard :correctPasscode="getValidationPasscode" @submitPasscode="passcodeSubmitted" />
                            <p class="gray passcodeCreation--bottomAction" @click="goBackToFirstSlide()">Back to first step</p>
                        </div>

                        <!-- You are all set up slide -->
                        <div class="swiper-slide">
                            <div class="passcodeCreation--image pageContainer">
                                <img src="~/assets/images/shield_holding.png" />

                                <div @click="finishButtonClicked()">
                                    <ActionButton :buttonText="'Continue'" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { Haptics } from "@capacitor/haptics";
import { store } from "~/store";
import Swiper, { Navigation, Pagination } from "swiper";

definePageMeta({
    middleware: ["is-authenticated"],
});

const { popFromStack } = useIonicRouter();
const { setPasscodeByUser, deletePasscodeByUser, setPasscodeExistenceByUser } = usePasscode();
const headingText = ref("Create your passcode for this device");
const activeLoader = ref(false);
const firstPasscodeValue = ref("");
const shakeScreen = ref(false);
const isVerifingPasscode = ref(false);

const finishButtonClicked = () => {
    popFromStack();
};

const goBackToFirstSlide = () => {
    const swiper = document.querySelector(".passcodeSwiper").swiper;

    if (swiper) {
        headingText.value = "Create your passcode for this device";
        isVerifingPasscode.value = false;
        swiper.slideTo(0);
    }
};

const skipPasscodeCreation = () => {
    setPasscodeExistenceByUser(store.state.auth.UID, "userHasNoPasscode");
    deletePasscodeByUser(store.state.auth.UID);
    store.dispatch("save_enteredPasscode", true);
    finishButtonClicked();
};

const passcodeSubmitted = (passcodeData) => {
    let swiper = document.querySelector(".passcodeSwiper").swiper;

    if (swiper) {
        if (isVerifingPasscode.value == false) {
            firstPasscodeValue.value = passcodeData.passcode;
            headingText.value = "Now please confirm your passcode";
            isVerifingPasscode.value = true;
            swiper.slideNext();
        } else {
            if (passcodeData.isValid == false) {
                shakeScreen.value = true;
                const errorDuration = 500;
                Haptics.vibrate({ duration: errorDuration });

                setTimeout(() => {
                    shakeScreen.value = false;
                }, errorDuration);
            } else {
                setPasscodeExistenceByUser(store.state.auth.UID, "userHasPasscode");
                setPasscodeByUser(store.state.auth.UID, btoa(firstPasscodeValue.value));
                store.dispatch("save_reenteredPasscodeForChange", false);
                store.dispatch("save_enteredPasscode", true);
                headingText.value = "You are all set up!";
                swiper.slideNext();
            }
        }
    }
};

const getValidationPasscode = computed(() => {
    return btoa(firstPasscodeValue.value);
});

onMounted(() => {
    new Swiper(".passcodeSwiper", {
        modules: [Navigation, Pagination],
        direction: "horizontal",
        loop: false,
        allowTouchMove: false,
    });
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.swiper {
    width: 100%;
}

.passcodeCreation {
    text-align: center;

    &--desc {
        margin-top: 15px;
        margin-bottom: 0px;
    }

    &--bottomAction {
        display: inline-block;
    }

    &--image {
        text-align: center;
        margin-top: 30px;

        img {
            width: 100%;
            margin-bottom: 25px;
        }
    }
}
</style>
