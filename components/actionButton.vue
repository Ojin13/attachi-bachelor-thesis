<template>
    <div :class="['button', 'actionButton', customClasses]" @touchstart="highLight" @touchend="unhighLight">
        <p v-if="specialButtonText == 'credit_cost'" class="actionButton--creditCost">Start search (10 <img src="~/assets/images/credits.png" />)</p>

        <p v-else>{{ buttonText }}</p>
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
    specialButtonText: {
        type: String,
        required: false,
        default: "",
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

.actionButton {
    width: 100%;
    text-align: center;
    background: -webkit-linear-gradient(0deg, $primary-action-color, #a4bf74);

    &--critical {
        background: -webkit-linear-gradient(0deg, $delete-color, #fb7069);

        p {
            color: white;
        }
    }

    p {
        padding: 15px 20px;
    }

    &--creditCost {
        justify-content: center;
        display: flex;
        align-items: center;

        img {
            width: 20px;
            margin-left: 2px;
        }
    }
}
</style>
