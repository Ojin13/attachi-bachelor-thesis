<template>
    <div class="navigationPanel__container" :class="{ navigationPanel__container__sticky: isSticky, 'navigationPanel__container__sticky--active': showTopBar }">
        <div class="navigationPanel" :class="{ 'navigationPanel--android': isAndroid() }">
            <div class="navigationPanel__arrowBack" :class="{ 'navigationPanel__arrowBack--bigMargin': !displayLeftIcon }">
                <div class="navigationPanel__arrowBack--clickArea" @click="goBackArrowClicked()">
                    <!-- Clickable zone -->
                </div>
                <img src="~/assets/icons/arrow.svg" />
            </div>

            <div v-if="displayLeftIcon && leftIconURL" class="navigationPanel__image" :style="{ 'background-image': 'url(' + leftIconURL + ')' }">
                <!-- Custom image -->
            </div>

            <div v-else-if="displayLeftIcon" class="navigationPanel__image navigationPanel__image--default">
                <!-- Default image -->
            </div>

            <div class="navigationPanel__header">
                <p class="navigationPanel__header--title bold">{{ navigationTitle ? prepareTitle() : "No name provided" }}</p>
                <p class="navigationPanel__header--desc gray bold">{{ navigationDesc }}</p>
            </div>

            <div v-if="displayRightIcon" class="navigationPanel__leftIcon" @click="rightIconClicked()">
                <img src="~/assets/icons/question.svg" />
            </div>
        </div>

        <div class="navigationPanel__shadow">
            <!-- Shadow menu with heigh -->
        </div>
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

const { popFromStack, pushToStack } = useIonicRouter();
const props = defineProps({
    navigationTitle: {
        type: String,
        required: false,
        default: "",
    },
    navigationDesc: {
        type: String,
        required: false,
        default: "",
    },
    navigationBackAddress: {
        type: String,
        required: false,
        default: null,
    },
    rightIconAddress: {
        type: String,
        required: false,
        default: "/auth/contacts",
    },
    displayRightIcon: {
        type: Boolean,
        required: false,
        default: false,
    },
    displayLeftIcon: {
        type: Boolean,
        required: false,
        default: true,
    },
    leftIconURL: {
        type: String,
        required: false,
        default: "",
    },
    isSticky: {
        type: Boolean,
        required: false,
        default: false,
    },
    scrollActivationPoint: {
        type: Number,
        required: false,
        default: 0,
    },
    currentScrollDepth: {
        type: Number,
        required: false,
        default: 0,
    },
});

const showTopBar = ref(false);

const goBackArrowClicked = () => {
    Haptics.impact({ style: ImpactStyle.Medium });
    if (props.navigationBackAddress) {
        popFromStack(props.navigationBackAddress);
    } else {
        popFromStack();
    }
};

const rightIconClicked = () => {
    Haptics.impact({ style: ImpactStyle.Light });
    pushToStack(props.rightIconAddress);
};

const prepareTitle = () => {
    const maxLength = 50;
    return props.navigationTitle.length > maxLength ? props.navigationTitle.substring(0, maxLength) + "..." : props.navigationTitle;
};

const isAndroid = () => {
    return Capacitor.getPlatform() === "android";
};

const setVisibilityOnScroll = () => {
    if (props.currentScrollDepth > props.scrollActivationPoint) {
        showTopBar.value = true;
    } else {
        showTopBar.value = false;
    }
};

onMounted(() => {
    if (props.isSticky) {
        watch(
            () => props.currentScrollDepth,
            () => {
                setVisibilityOnScroll();
            },
        );
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

$menuHeight: 100px;

.navigationPanel {
    transition: all 0.25s ease-in-out;
    min-height: $menuHeight;
    width: 100%;
    z-index: 100;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 25px;
    padding-bottom: 10px;
    padding-top: calc(var(--safe-area-top) + 10px);

    border-bottom: 1px solid $secondary-background-color;
    background-color: $menu-background-color;
    position: fixed;
    top: 0px;

    &--android {
        padding-top: 10px;
        min-height: 75px;
    }

    &__container {
        &__sticky {
            position: absolute;

            .navigationPanel {
                opacity: 0;
                top: -25vh;
            }

            &--active {
                .navigationPanel {
                    opacity: 1;
                    top: 0px;
                }
            }
        }
    }

    &__shadow {
        height: $menuHeight;
    }

    &__arrowBack {
        width: 16px;
        height: 16px;
        margin-right: 10px;
        position: relative;
        bottom: 5px;
        flex-shrink: 0;

        &--bigMargin {
            margin-right: 25px;
        }

        &--clickArea {
            position: absolute;
            height: 50px;
            width: 50px;
            top: -15px;
            left: -20px;
        }
    }

    &__image {
        margin-right: 15px;
        width: 38px;
        height: 38px;
        border-radius: $default-border-radius;
        background-color: $secondary-text-color;
        background-size: cover;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

        &--default {
            background-image: url("~/assets/images/person.png");
        }
    }

    &__header {
        margin-right: 25px;

        p {
            margin-bottom: 0px;
        }

        &--title {
            position: relative;
            top: 1px;
        }

        &--desc {
            font-size: 12px;
            position: relative;
        }
    }

    &__leftIcon {
        margin-left: auto;
        margin-right: 32px;

        img {
            width: 20px;
            height: 20px;
            min-width: 20px;
            position: relative;
            bottom: 2px;
        }
    }
}
</style>
