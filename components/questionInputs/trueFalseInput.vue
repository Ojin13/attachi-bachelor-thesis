<template>
    <div class="trueFalseInput">
        <div>
            <div class="form-group">
                <button type="button" class="btn btn-left btn-secondary" :class="{ active: currentValue == 'true' }" @click="updateInput('true')">
                    <span>Yes</span>
                </button>

                <button type="button" class="btn btn-right btn-secondary" :class="{ active: currentValue == 'false' }" @click="updateInput('false')">
                    <span>No</span>
                </button>

                <div v-if="currentValue" class="trueFalseInput__reset">
                    <img src="~/assets/icons/delete.svg" @click="updateInput('')" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
const emit = defineEmits(["updateFunction"]);
const props = defineProps({
    questionID: {
        type: String,
        required: true,
    },
    updateFunction: {
        default: null,
        type: Function,
        required: false,
    },
    preset: {
        type: Object,
        required: true,
    },
    currentQuestion: {
        type: Object,
        required: true,
    },
});

const currentValue = ref(props.currentQuestion.answer);

const updateInput = (newValue) => {
    Haptics.impact({ style: ImpactStyle.Light });
    currentValue.value = newValue;
    if (props.updateFunction) {
        props.updateFunction(props.currentQuestion, false, currentValue.value);
    } else {
        emit("updateFunction", newValue);
    }
};

onBeforeMount(() => {
    if (!props.currentQuestion.answer && props.currentQuestion.value) {
        currentValue.value = props.currentQuestion.value;
    }

    watch(
        () => props.currentQuestion.answer,
        (newVal) => {
            if (newVal !== currentValue.value) {
                currentValue.value = newVal;
            }
        },
    );
});
</script>

<style lang="scss">
@use "sass:math";
@import "/assets/sass/variables";

.form-group {
    margin-top: 8px;
    margin-bottom: 10px;
    padding: 0px;

    .btn-secondary {
        background-color: $secondary-background-color;
        border-radius: 0px;
        transition: 0.5s !important;
        width: 60px;
        padding: 10px;
        min-width: 8px;

        span {
            color: $secondary-text-color;
            font-size: $medium-font-size;
        }
    }

    .btn-left {
        border-top-left-radius: $default-border-radius;
        border-bottom-left-radius: $default-border-radius;
    }

    .btn-right {
        border-top-right-radius: $default-border-radius;
        border-bottom-right-radius: $default-border-radius;
    }

    .btn-secondary.active {
        background-color: $primary-action-color !important;
        width: 65px;
        z-index: 0 !important;

        span {
            color: $primary-text-color;
        }
    }
}

.trueFalseInput {
    &__reset {
        display: inline-block;
        margin-left: 5px;
        position: relative;
        top: 3px;

        img {
            $imageSize: 18px;
            fill: $secondary-text-color;
            width: $imageSize;
            height: $imageSize;
            margin-left: 10px;
        }
    }
}
</style>
