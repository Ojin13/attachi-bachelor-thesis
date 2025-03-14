<template>
    <div ref="dropdownElement" class="dropdownPanel" :class="{ 'not-collapsed': initiallyOpen }" @click="toggleDropdown()">
        <p class="dropdownPanel--name bold">
            <span v-if="dropdownIcon == 'instagramIcon'" class="dropdownPanel--icon">
                <img src="~/assets/images/socials/instagramLogo.png" />
            </span>

            <span v-else-if="dropdownIcon == 'facebookIcon'" class="dropdownPanel--icon">
                <img src="~/assets/images/socials/facebookLogo.png" />
            </span>

            <span v-else-if="dropdownIcon == 'twitterIcon'" class="dropdownPanel--icon">
                <img src="~/assets/images/socials/twitterLogo.png" />
            </span>

            <span v-else-if="dropdownIcon == 'youtubeIcon'" class="dropdownPanel--icon">
                <img src="~/assets/images/socials/youtubeLogo.png" />
            </span>

            <span v-else-if="dropdownIcon == 'pinterestIcon'" class="dropdownPanel--icon">
                <img src="~/assets/images/socials/pinterestLogo.png" />
            </span>

            <span v-else-if="dropdownIcon == 'tiktokIcon'" class="dropdownPanel--icon">
                <img src="~/assets/images/socials/tiktokLogo.png" />
            </span>

            <span v-else-if="dropdownIcon == 'redditIcon'" class="dropdownPanel--icon">
                <img src="~/assets/images/socials/redditLogo.png" />
            </span>

            <span v-else-if="dropdownIcon == 'quoraIcon'" class="dropdownPanel--icon">
                <img src="~/assets/images/socials/quoraLogo.png" />
            </span>

            <span v-else-if="dropdownIcon == 'snapchatIcon'" class="dropdownPanel--icon">
                <img src="~/assets/images/socials/snapchatLogo.png" />
            </span>

            <span v-else-if="dropdownIcon != ''" class="dropdownPanel--icon">{{ dropdownIcon }}</span>

            {{ dropdownHeading }}
        </p>

        <div class="dropdownPanel__rightSection">
            <p class="dropdownPanel__rightSection--stats bold">{{ dropdownStats }}</p>
            <img src="~/assets/icons/arrow.svg" />
        </div>

        <div class="dropdownPanel--desc">
            <p class="gray">{{ dropdownDescription }}</p>
        </div>
    </div>

    <div ref="dropdownWrapperElement" class="dropdownPanel__wrapper" :class="{ 'dropdownPanel__wrapper--active': initiallyOpen }">
        <div ref="dropdownWrapperElementInner" class="dropdownPanel__wrapper--inner" :class="{ 'dropdownPanel__wrapper--scroll': scrollContent }">
            <!-- Do not render content of closed dropdown -->
            <div v-show="isOpen" :class="{ 'dropdownPanel__wrapper--flex': flexContainer }">
                <slot>
                    <!-- Content -->
                </slot>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const emit = defineEmits(["stateChange"]);
const props = defineProps({
    dropdownHeading: {
        type: String,
        required: true,
        default: "",
    },

    dropdownDescription: {
        type: String,
        required: false,
        default: "",
    },

    dropdownStats: {
        type: String,
        required: false,
        default: "",
    },

    dropdownIcon: {
        type: String,
        required: true,
        default: "📚",
    },

    initiallyOpen: {
        type: Boolean,
        required: false,
        default: false,
    },

    flexContainer: {
        type: Boolean,
        required: false,
        default: false,
    },

    delayActivation: {
        type: Boolean,
        required: false,
        default: false,
    },

    scrollContent: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const isOpen = ref(false);
const openingTimer = ref(null);
const dropdownElement = ref(null);
const dropdownWrapperElement = ref(null);
const dropdownWrapperElementInner = ref(null);

const openingLength = 500;

const toggleDropdown = () => {
    Haptics.impact({ style: ImpactStyle.Light });
    dropdownElement.value.classList.toggle("not-collapsed");
    dropdownWrapperElement.value.classList.toggle("dropdownPanel__wrapper--active");

    clearTimeout(openingTimer.value);

    if (isOpen.value) {
        // For closing - delay the deactivation to prevent flickering
        openingTimer.value = setTimeout(() => {
            const currentState = dropdownWrapperElement.value.classList.contains("dropdownPanel__wrapper--active");
            isOpen.value = currentState;

            if (props.scrollContent && currentState) {
                setDropdownHeight(false);
            } else {
                setDropdownHeight(false, true);
            }

            emit("stateChange", isOpen.value);
        }, openingLength);

        setDropdownHeight(false, true);
    } else {
        // For opening - activate with no delay
        isOpen.value = true;

        /**
         * Since safari does not support overflow anchoring, we need to manually set the height of the inner element
         * with overflow: scroll. This prevents scroll jumping when content is added to the dropdown, above the current view.
         * To avioid unnecessary scrolling, the height of the inner element is recalculated every time the dropdown is opened.
         * This mechanism is employed only on Apple devices - all other devices will use overflow-anchor automatically.
         * https://stackoverflow.com/questions/60678734/insert-elements-on-top-of-something-without-changing-visible-scrolled-content
         * https://caniuse.com/?search=overflow-anchor
         */
        if (props.scrollContent) {
            setDropdownHeight();
        }

        emit("stateChange", isOpen.value);
    }
};

const checkInitialOpen = () => {
    if (props.initiallyOpen) {
        isOpen.value = true;
    }
};

const setDropdownHeight = (delay = true, setAutoHeight = false) => {
    if (setAutoHeight) {
        dropdownWrapperElementInner.value.style.height = "auto";
        return;
    }

    setTimeout(
        () => {
            const innerHeight = dropdownWrapperElementInner.value.offsetHeight;
            dropdownWrapperElementInner.value.style.height = `${innerHeight}px`;
        },
        delay ? openingLength : 0,
    );
};

onMounted(() => {
    checkInitialOpen();

    // If props.initiallyOpen is dermined dynamically, it will be slightly delayed.
    // To avoid inconsistent state between parent and this component, we check the
    // initial open with small delay so all props are ready.
    if (props.delayActivation) {
        setTimeout(() => {
            checkInitialOpen();

            if (props.scrollContent && isOpen.value) {
                setDropdownHeight();
            }
        }, 250);
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.dropdownPanel {
    margin-top: 25px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 10px;

    p {
        margin-bottom: 0px;
    }

    img {
        width: 12px;
        transition: 0.3s;
        transform: rotate(90deg);
    }

    &--icon {
        margin-right: 5px;

        img {
            width: 25px;
            transform: rotate(0deg) !important;
            position: relative;
            top: 6px;
            border-radius: $default-border-radius;
        }
    }

    &--desc {
        text-align: left;
        flex: 1 1 100%;
    }

    &__rightSection {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;

        &--stats {
            color: $primary-action-color;
            margin-right: 15px;
        }
    }

    &__wrapper {
        display: grid;
        grid-template-rows: 0fr;
        transition: all 0.25s linear;
        opacity: 0;

        &--active {
            grid-template-rows: 1fr;
            opacity: 1;
        }

        &--inner {
            overflow: hidden;
            padding-left: 2px;
            padding-right: 2px;
            padding-bottom: 15px;
        }

        &--scroll {
            overflow: scroll;
        }

        &--flex {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
        }
    }
}

.dropdownPanel.not-collapsed {
    img {
        transform: rotate(-90deg);
    }
}
</style>
