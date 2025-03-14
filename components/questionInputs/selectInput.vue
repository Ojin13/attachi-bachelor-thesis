<template>
    <div class="selectInput">
        <select
            :ref="'preset_value_' + questionID"
            v-model="currentValue"
            :class="{ 'selectInput--empty': currentQuestion.answer == '' }"
            class="answer"
            @change="updateFunction(currentQuestion, false, currentValue)"
        >
            <option value="">Select</option>
            <option v-for="(answer, answer_index) in currentQuestion.possible_answers" :key="'question_' + questionID + '_answer_' + answer_index" :value="answer">
                {{ answer }}
            </option>
        </select>
    </div>
</template>

<script setup>
const props = defineProps({
    questionID: {
        type: String,
        required: true,
    },
    updateFunction: {
        type: Function,
        required: true,
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

onBeforeMount(() => {
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

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.answer {
    margin-top: 8px;
}

.selectInput {
    &--empty {
        color: $secondary-text-color !important;
    }
}
</style>
