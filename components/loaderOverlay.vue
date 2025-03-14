<template>
    <div v-if="isActive" class="loadingIndicator" :class="{ 'loadingIndicator--active': isActive }">
        <div class="loadingIndicator__overlay">
            <!-- Darkness overlay -->
        </div>

        <div class="loadingIndicator__content">
            <ion-spinner mode="ios" name="circular"></ion-spinner>
        </div>
    </div>
</template>

<script setup>
defineProps({
    isActive: {
        type: Boolean,
        required: true,
        default: false,
    },
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

$transitionTime: 0.5s;

.loadingIndicator {
    z-index: 100000000000;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;

    &__overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        transition: opacity $transitionTime ease-in-out;
        opacity: 0;
        z-index: 10000;
        transform: scale(0);
        transform: scale(1);
        opacity: 1;
    }

    &__content {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100px;
        height: 100px;
        position: relative;
        border-radius: 25px;
        background-color: $primary-background-color-transparent;
        z-index: 10001;
        transition: all $transitionTime ease-in-out;
    }
}

ion-spinner {
    --color: #{$focus-text-color};
    $size: 50px;
    width: $size;
    height: $size;
}
</style>
