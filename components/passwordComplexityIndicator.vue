<template>
    <div class="passwordComlexityIndicator" :class="{ 'passwordComlexityIndicator--hide': !renderComponent }">
        <p class="bold">Password strength:</p>
        <div class="passwordComlexityIndicator__progressBar">
            <ProgressBar :changeColors="true" :variant="progressBarType" :big="true" :progressPercentage="passwordComplexityProgress" />
        </div>

        <div class="passwordComlexityIndicator__bruteForceInfo">
            <p v-if="password.length > 0" class="medium">{{ estimatedBruteForceTimeInfoText }}</p>
            <p v-else class="medium gray">{{ defaultBruteForceTimeInfoText }}</p>
            <p class="medium bold">{{ estimatedBruteForceTime }}</p>
        </div>
    </div>
</template>

<script setup>
import estimateBruteForceTime from "~/utils/bruteforceEstimator";

const props = defineProps({
    password: {
        type: String,
        required: true,
    },
    renderComponent: {
        type: Boolean,
        default: true,
    },
});

const defaultBruteForceTimeInfoText = "Enter password to see how long it would roughly take to crack it with a computer by trying every possible combination.";
const estimatedBruteForceTime = ref("");
const estimatedBruteForceTimeInfoText = ref("");
const passwordComplexityProgress = ref(0);
const progressBarType = ref("danger");

watch(() => props.password,
    (newVal) => {
        let bruteforceData = estimateBruteForceTime(newVal);
        estimatedBruteForceTime.value = bruteforceData.result;
        estimatedBruteForceTimeInfoText.value = bruteforceData.infoText;

        if (bruteforceData.years >= 1) {
            // Very strong
            passwordComplexityProgress.value = 100;
            progressBarType.value = "success";
        } else if (bruteforceData.months >= 1) {
            // Strong
            passwordComplexityProgress.value = 75;
            progressBarType.value = "success";
        } else if (bruteforceData.weeks >= 1) {
            // Good
            passwordComplexityProgress.value = 60;
            progressBarType.value = "warning";
        } else if (bruteforceData.days >= 1) {
            // Good
            passwordComplexityProgress.value = 50;
            progressBarType.value = "warning";
        } else if (bruteforceData.hours >= 1) {
            // Weak
            passwordComplexityProgress.value = 25;
            progressBarType.value = "warning";
        } else if (bruteforceData.minutes >= 1) {
            // Very weak
            passwordComplexityProgress.value = 15;
            progressBarType.value = "danger";
        } else {
            // Turbo weak
            passwordComplexityProgress.value = 5;
            progressBarType.value = "danger";
        }

        if (props.password.length == 0) {
            passwordComplexityProgress.value = 0;
            estimatedBruteForceTime.value = "";
        }
    },
);
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.passwordComlexityIndicator {
    min-height: 125px;
    margin-top: 10px;

    p {
        margin-bottom: 5px;
    }

    &--hide {
        display: none;
    }

    &__progressBar {
        .progress {
            width: 100% !important;
        }
    }

    &__bruteForceInfo {
        margin-top: 5px;

        p {
            margin-bottom: 0px;
        }
    }
}
</style>
