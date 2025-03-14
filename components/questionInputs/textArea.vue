<template>
    <div class="textAreaInput">
        <AutoExpandtextArea
            :bottomOffset="20"
            :initialValue="currentQuestion.answer"
            :customClasses="'textInput__clear gray answer'"
            :inputPlaceholder="'Add answer'"
            @updateFunction="updateAnswer($event)"
        />
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

const updateAnswer = (answer) => {
    currentValue.value = answer;
    props.updateFunction(props.currentQuestion, false, currentValue.value);
};

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
    font-size: $medium-font-size;
    color: $focus-text-color;
}
</style>
