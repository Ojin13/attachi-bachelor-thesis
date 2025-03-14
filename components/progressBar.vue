<template>
    <div class="progressBarContainer">
        <div class="progressBar" :class="{ 'progressBar--big': big }">
            <div class="progressBar__progress" :style="{ width: progressPercentage + '%' }" :class="classObject">
                <!-- Progress bar -->
            </div>
        </div>
        <p class="medium2 bold">{{ progressPercentage }}%</p>
    </div>
</template>

<script setup>
const props = defineProps({
    progressPercentage: {
        type: Number,
        required: true,
        default: 0,
    },
    big: {
        type: Boolean,
        required: false,
        default: false,
    },
    changeColors: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const classObject = computed(() => ({
    "progressBar__progress--red": props.changeColors && props.progressPercentage <= 25,
    "progressBar__progress--yellow": props.changeColors && props.progressPercentage > 25 && props.progressPercentage < 50,
}));
</script>

<style lang="scss" scoped>
@import "/assets/sass/variables";

// Source of following animations:
// https://codepen.io/uimax/pen/KgdgGa
@mixin gradient-striped($color: rgba(255, 255, 255, 0.2), $angle: 45deg) {
    background-image: -webkit-linear-gradient($angle, $color 25%, transparent 25%, transparent 50%, $color 50%, $color 75%, transparent 75%, transparent);
    background-image: -o-linear-gradient($angle, $color 25%, transparent 25%, transparent 50%, $color 50%, $color 75%, transparent 75%, transparent);
    background-image: linear-gradient($angle, $color 25%, transparent 25%, transparent 50%, $color 50%, $color 75%, transparent 75%, transparent);
}

@keyframes progress-bar-stripes {
    from {
        background-position: 40px 0;
    }
    to {
        background-position: 0 0;
    }
}

@mixin animation($animation) {
    -webkit-animation: $animation;
    -o-animation: $animation;
    animation: $animation;
}

.progressBarContainer {
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
    align-items: center;

    p {
        margin: 0px;
    }
}

.progressBar {
    width: 82%;
    height: 5px;
    background-color: $secondary-background-color;
    position: relative;
    border-radius: 5px;

    &--big {
        height: 20px;
        width: 84%;
    }
}

.progressBar__progress {
    height: 100%;
    background-color: $progressbar-success-color;
    border-radius: 5px;
    transition: width 0.5s ease-out;
    background-size: 20px 20px;
    background-repeat: repeat;

    @include animation(progress-bar-stripes 3.5s linear infinite);
    @include gradient-striped;

    &--red {
        background-color: $delete-color;
    }

    &--yellow {
        background-color: $warning-color;
    }
}
</style>
