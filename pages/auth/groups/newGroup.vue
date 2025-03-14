<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <LoaderOverlay :isActive="activeLoader" />

                <div class="pageContainer">
                    <AppHeader :showNotificationlIcon="false" :heading="'New group 🔗'" :showCancelIcon="true" :cancelIconLink="'/auth/groups'" />

                    <div class="swiper newGroupSwiper">
                        <div class="swiper-wrapper swiper-no-swiping">
                            <!-- Slides -->
                            <div class="swiper-slide newGroup__slide">
                                <div class="newGroup__image">
                                    <img src="~/assets/images/power_standing.png" />
                                </div>

                                <div class="newGroup__textInput">
                                    <ion-textarea
                                        v-model="newGroupName"
                                        :placeholder="'Whats the name of this group'"
                                        class="textInput__clear newGroup__ionTextArea large2 bold"
                                        :auto-grow="true"
                                        :rows="1"
                                    >
                                    </ion-textarea>
                                </div>
                            </div>

                            <div class="swiper-slide newGroup__slide">
                                <div class="newGroup__image">
                                    <img src="~/assets/images/working_on_smartphone.png" />
                                </div>

                                <div class="newGroup__textInput">
                                    <ion-textarea
                                        v-model="newGroupDesc"
                                        :placeholder="'Short description of this group'"
                                        class="textInput__clear newGroup__ionTextArea large2 bold"
                                        :auto-grow="true"
                                        :rows="1"
                                    >
                                    </ion-textarea>
                                </div>
                            </div>

                            <div class="swiper-slide newGroup__slide">
                                <div class="newGroup__imageUpload newGroup__imageUpload--group newGroup__imageUpload--selected">
                                    <!--Image -->
                                </div>

                                <div class="newGroup__summaryText">
                                    <h1>{{ newGroupName == "" ? "No name" : newGroupName }}</h1>
                                    <p class="gray">{{ newGroupDesc == "" ? "No description of this group" : newGroupDesc }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="newGroup__buttons">
                        <div @click="nextButtonClicked()">
                            <ActionButton :buttonText="buttonText" :customClasses="'newGroup__nextSlideButton'" />
                        </div>

                        <div v-if="isOnFirstSlide" class="newGroup__buttons__skipButton" @click="popFromStack()">
                            <p>Cancel</p>
                        </div>

                        <div class="newGroup__buttons__backButton" :class="{ 'newGroup__buttons__backButton--hide': isOnFirstSlide }">
                            <p>Back</p>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import Swiper, { Navigation, Pagination } from "swiper";
import { store } from "~/store";
import { ServerAction } from "~/types";

definePageMeta({
    middleware: ["is-authenticated"],
});

const { popFromStack, replaceNavigationStack } = useIonicRouter();
const { callFire } = useFirebaseConnector();

const newGroupName = ref("");
const newGroupDesc = ref("");
const activeLoader = ref(false);
const buttonText = ref("Next");
const isOnFirstSlide = ref(true);
const swiperInstance = ref(null);

const createNewGroup = () => {
    const newGroupData = {
        groupName: newGroupName.value,
        groupDesc: newGroupDesc.value,
        isSmartGroup: false,
        groupMembers: [],
    };

    activeLoader.value = true;

    callFire({
        action: ServerAction.manageGroup,
        specificAction: "createGroup",
        name: newGroupData.groupName,
        description: newGroupData.groupDesc,
    }).then((response) => {
        activeLoader.value = false;

        if (response) {
            console.log("New group created");
            newGroupData.groupId = response.id;
            store.commit("createGroup", { group: newGroupData, group_id: newGroupData.groupId });

            // Must reset the navigation stack to avoid going back to the new group page
            replaceNavigationStack({ path: "/auth/groups/groupPage", query: { groupID: newGroupData.groupId } });
        }
    });
};

const nextButtonClicked = () => {
    let swiper = document.querySelector(".newGroupSwiper").swiper;

    if (swiper) {
        // check if user is on last slide and animation finished
        if (swiper.activeIndex == swiper.slides.length - 1 && !swiper.animating) {
            createNewGroup();
        }
    }
};

onMounted(() => {
    swiperInstance.value = new Swiper(".newGroupSwiper", {
        modules: [Navigation, Pagination],
        direction: "horizontal",
        loop: false,
        noSwiping: true,
        noSwipingClass: "swiper-no-swiping",

        navigation: {
            nextEl: ".newGroup__nextSlideButton",
            prevEl: ".newGroup__buttons__backButton",
        },

        on: {
            slideChange: function () {
                if (this.activeIndex == 0) {
                    isOnFirstSlide.value = true;
                } else {
                    isOnFirstSlide.value = false;
                }

                if (this.activeIndex == this.slides.length - 1) {
                    buttonText.value = "Create new group";
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

.newGroup {
    &__container {
        padding-bottom: 0px;
    }

    &__image {
        opacity: 0.5;
        margin-bottom: 32px;
        margin-top: 32px;
        text-align: center;

        img {
            width: 90%;
        }
    }

    &__ionTextArea {
        border-bottom: 1px solid gray !important;
    }

    &__imageUpload {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        flex-wrap: wrap;
        width: 100%;
        height: 325px;
        margin-top: 32px;
        border-radius: $default-border-radius;
        padding: 20px;
        border: 3px dashed $secondary-text-color;

        &--selected {
            border: none;
        }

        &--group {
            background-image: url("~/assets/images/people.png");
        }

        &--label {
            width: 100%;
        }

        &--placeholder {
            text-align: center;
        }

        svg {
            width: 55px;
            height: 55px;
            fill: $secondary-text-color;
        }

        h1 {
            text-align: center;
            width: 100%;
            margin: 0px;
            margin-top: 10px;
        }
    }

    &__buttons {
        text-align: center;
        padding-top: 0px;

        &__backButton {
            &--hide {
                display: none;
            }
        }
    }

    &__textInput {
        margin-top: 32px;
        margin-bottom: 32px;

        textarea {
            color: $primary-text-color;
            font-size: $large-font-size;

            &::placeholder {
                color: $secondary-text-color;
            }
        }
    }

    &__summaryText {
        h1 {
            margin: 0px;
            margin-top: 15px;
        }

        p {
            margin-top: 5px;
        }
    }
}
</style>
