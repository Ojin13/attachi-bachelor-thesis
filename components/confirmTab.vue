<template>
    <div class="confirmTab">
        <!-- Slot for content that will trigger confirmation tab -->
        <slot />

        <div class="confirmTab__darken" :class="{ 'confirmTab__darken--active': isActive }">
            <!-- Darkness overlay -->
        </div>

        <div class="confirmTab__content" :class="{ 'confirmTab__content--active': isActive }">
            <h1>{{ confirmationHeading }}</h1>
            <p class="gray bold">{{ confirmationDesc }}</p>

            <div class="confirmTab__content--buttons">
                <div @click="confirmAction()">
                    <ActionButton :customClasses="isCriticalAction ? 'actionButton--critical' : ''" :buttonText="confirmButtonText" />
                </div>
                <p @click="closeConfirmationTab()">{{ cancelButtonText }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const emit = defineEmits(["confirmAction"]);
const isActive = ref(false);
const confirmationHeading = ref("Are you sure?");
const confirmationDesc = ref("This action cannot be undone.");
const confirmButtonText = ref("Yes, I'm sure");
const cancelButtonText = ref("Cancel");
const confirmationAction = ref(null);

const openConfirmationTab = () => {
    isActive.value = true;
};

const closeConfirmationTab = () => {
    Haptics.impact({ style: ImpactStyle.Light });
    isActive.value = false;
};

const confirmAction = () => {
    closeConfirmationTab();
    emit("confirmAction", confirmationAction.value);
};

const setConfirmationTabData = (heading, desc, confirmAction, confirmText = "Yes, I'm sure", cancelText = "Cancel") => {
    confirmationHeading.value = heading;
    confirmationDesc.value = desc;
    confirmButtonText.value = confirmText;
    cancelButtonText.value = cancelText;
    confirmationAction.value = confirmAction;
    openConfirmationTab();
};

defineExpose({ setConfirmationTabData, closeConfirmationTab });
defineProps({
    isCriticalAction: {
        type: Boolean,
        required: false,
        default: false,
    },
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

$transitionTime: 0.5s;

.confirmTab {
    &__darken {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.75);
        transition: opacity $transitionTime ease-in-out;
        opacity: 0;
        z-index: 10000;
        transform: scale(0);

        &--active {
            transform: scale(1);
            opacity: 1;
        }
    }

    &__content {
        padding: 32px;
        position: fixed;
        bottom: -100%;
        left: 0;
        width: 100%;
        border-top-left-radius: 25px;
        border-top-right-radius: 25px;
        max-width: 500px;
        background-color: $primary-background-color;
        z-index: 10001;
        transition: all $transitionTime ease-in-out;

        &--active {
            bottom: 0;
        }

        &--buttons {
            text-align: center;
        }
    }
}
</style>
