<template>
    <ion-page>
        <ion-content force-overscroll="false">
            <div class="firstOpen screenContainer">
                <div class="firstOpenSwiper swiper">
                    <!-- Additional required wrapper -->
                    <div class="swiper-wrapper">
                        <!-- Slides -->
                        <div class="swiper-slide firstOpen__slide">
                            <div class="firstOpen__heading">
                                <h1>Having trouble keeping up with people around you? Attachi is here to help you!</h1>
                            </div>

                            <div class="firstOpen__image">
                                <img src="~/assets/images/working_on_pc.png" />
                            </div>
                        </div>

                        <div class="swiper-slide firstOpen__slide">
                            <div class="firstOpen__heading">
                                <h1>Analyze and get new info about your contacts, with the power of AI</h1>
                            </div>

                            <div class="firstOpen__image">
                                <img src="~/assets/images/working_on_smartphone.png" />
                            </div>
                        </div>

                        <div class="swiper-slide firstOpen__slide">
                            <div class="firstOpen__heading">
                                <h1>Analyze online presence and activity with our search engine</h1>
                            </div>

                            <div class="firstOpen__image">
                                <img src="~/assets/images/magnifying-glass.png" />
                            </div>
                        </div>

                        <div class="swiper-slide firstOpen__slide">
                            <div class="firstOpen__heading">
                                <h1>Are you ready to start building better relationships?</h1>
                            </div>

                            <div class="firstOpen__image">
                                <img src="~/assets/images/power_standing.png" />
                            </div>
                        </div>
                    </div>

                    <!-- If we need pagination -->
                    <div class="swiper-pagination firstOpen__slide--pagination"></div>
                </div>

                <div class="firstOpen__container">
                    <div class="firstOpen__buttons">
                        <div @click="nextButtonClicked()">
                            <ActionButton :buttonText="buttonText" :customClasses="'firstOpen__nextSlideButton'" />
                        </div>

                        <div class="firstOpen__buttons__skipButton">
                            <p @click="skipIntro()">Skip the introduction</p>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import Swiper, { Navigation, Pagination } from "swiper";
import { YesNoValue } from "~/types";
const { setPreferenceValue } = usePreferences();

definePageMeta({
    middleware: ["is-authenticated"],
});

const { replaceNavigationStack } = useIonicRouter();
const swiperInstance = ref(null);
const buttonText = ref("Next");

const skipIntro = async function () {
    await setPreferenceValue("isFirstOpen", YesNoValue.No);
    replaceNavigationStack("/login");
};

const nextButtonClicked = async function () {
    // get current instance of swiper
    let swiper = document.querySelector(".firstOpenSwiper").swiper;

    if (swiper) {
        // check if user is on last slide and animation finished
        if (swiper.activeIndex == swiper.slides.length - 1 && !swiper.animating) {
            await setPreferenceValue("isFirstOpen", YesNoValue.No);
            replaceNavigationStack("/login");
        }
    }
};

onMounted(() => {
    swiperInstance.value = new Swiper(".firstOpenSwiper", {
        modules: [Navigation, Pagination],
        direction: "horizontal",
        loop: false,

        navigation: {
            nextEl: ".firstOpen__nextSlideButton",
        },

        pagination: {
            el: ".swiper-pagination",
            type: "bullets",
            clickable: true,
        },
        on: {
            slideChange: function () {
                if (this.activeIndex == this.slides.length - 1) {
                    buttonText.value = "I'm ready!";
                } else {
                    buttonText.value = "Next";
                }
            },
        },
    });
});

onBeforeUnmount(() => {
    if (swiperInstance.value) {
        swiperInstance.value.destroy();
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.swiper {
    width: 100%;
}

.firstOpen {
    &__slide {
        padding: 20px;
    }

    &__container {
        padding: 32px;
    }

    &__heading {
        margin-top: 25%;
        text-align: center;
        margin-bottom: 25px;
    }

    &__image {
        margin-bottom: 10%;
        text-align: center;

        img {
            width: 80%;
            margin: auto;
        }
    }

    &__buttons {
        text-align: center;

        &__skipButton {
            display: inline-block;
        }
    }
}
</style>
