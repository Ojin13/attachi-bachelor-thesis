<template>
    <div class="phoneNumber">
        <input :ref="'preset_value_' + questionID" v-model="currentValue" type="number" placeholder="Phone number" class="answer" @keyup="updateFunction(currentQuestion, false, currentValue)" />
        <img src="~/assets/icons/phone.svg" />
        <p v-if="currentQuestion.answer" class="phoneNumber__button small" @click="callNumber(currentQuestion.answer)">Call this number</p>
    </div>
</template>

<script setup>
defineProps({
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

const callNumber = (number) => {
    window.open("tel:" + number, "_blank");
};

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
    margin-right: 8px;
    padding: 10px;
    font-size: 14px;
    height: 32px;
    width: 100%;
}

.phoneNumber {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;

    img {
        width: 15px;
        height: 15px;
        position: relative;
        bottom: 2px;
        transform: scale(1.5);
    }

    &__button {
        border: 2px solid $primary-text-color;
        border-radius: $default-border-radius;
        background-color: $primary-action-color;
        padding: 5px;
        margin-bottom: 0px;
        color: $primary-text-color !important;
        text-decoration: none;
    }
}
</style>
