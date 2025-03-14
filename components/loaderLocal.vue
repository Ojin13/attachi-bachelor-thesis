<template>
    <div v-if="isActive" class="loadingIndicator">
        <div class="loadingIndicator__content">
            <ion-spinner mode="ios" name="bubbles"></ion-spinner>
            <p class="gray small2">{{ loadingText }}</p>
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

    loadingText: {
        type: String,
        required: false,
        default: "Loading ...",
    },
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

$transitionTime: 0.5s;

.loadingIndicator {
    display: flex;
    justify-content: center;
    align-items: center;

    &__content {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        width: 75%;
        height: 125px;
        position: relative;
        transition: all $transitionTime ease-in-out;
        text-align: center;

        p {
            width: 100%;
        }
    }
}

ion-spinner {
    --color: #{$loader-color};
    $size: 50px;
    width: $size;
    height: $size;
}
</style>
