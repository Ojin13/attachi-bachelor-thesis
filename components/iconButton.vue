<template>
    <div :class="['button', 'iconButton', customClasses]" @touchstart="highLight" @touchend="unhighLight">
        <div class="iconButton--icon">
            <img v-if="iconType == 'globe'" src="~/assets/icons/globe.svg" />
            <img v-if="iconType == 'magic'" src="~/assets/icons/magic.svg" />
        </div>

        <p class="bold">{{ buttonText }}</p>
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
const { highlightButton, unhighlightButton } = useButton("button--active", true);

defineProps({
    buttonText: {
        type: String,
        required: true,
        default: "I am button",
    },
    customClasses: {
        type: String,
        required: false,
        default: "",
    },
    iconType: {
        type: String,
        required: false,
        default: "globe",
    },
});

const highLight = (event) => {
    highlightButton(event);
    Haptics.impact({ style: ImpactStyle.Light });
};

const unhighLight = (event) => {
    unhighlightButton(event);
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

$iconSize: 20px;

.iconButton {
    display: flex;
    align-items: center;
    background-color: $placeholder-action-color;

    &--icon {
        img {
            width: $iconSize;
            height: $iconSize;
            margin-left: 10px;
            position: relative;
            top: 1px;
        }
    }

    p {
        margin-bottom: 0px;
        padding: 10px 15px;
        font-size: $medium-font-size;

        @media (max-width: 400px) {
            font-size: $small-font-size;
        }
    }
}
</style>
