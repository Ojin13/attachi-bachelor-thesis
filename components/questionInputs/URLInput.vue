<template>
    <div class="URLInput">
        <input :ref="'preset_value_' + questionID" v-model="currentValue" type="text" :placeholder="getPlaceholder()" class="answer" @keyup="updateFunction(currentQuestion, false, currentValue)" />
        <p v-if="currentValue" class="URLInput--hint gray small">* URL / username must be correct for button to work. Your usernam can be found in url of selected social network</p>

        <div @touchstart="highLight" @touchend="unhighLight">
            <p v-if="currentValue" class="externalButton medium2 bold" @click="openLink(currentValue)"><img src="~/assets/icons/globe.svg" /> Open {{ currentQuestion.questionText }}</p>
        </div>
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import resolveLink from "~/utils/linkResolver";

const { highlightButton, unhighlightButton } = useButton("button--active", false);

const props = defineProps({
    questionID: {
        type: Number,
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

const getPlaceholder = () => {
    if (getSocialNetworkType() != "unknown") {
        return "Your profile URL or username";
    }

    return "Enter URL";
};

const highLight = (event) => {
    highlightButton(event);
    Haptics.impact({ style: ImpactStyle.Light });
};

const unhighLight = (event) => {
    unhighlightButton(event);
};

const openLink = (link) => {
    const linkObject = {
        url: link,
    };

    if (getSocialNetworkType() != "unknown") {
        linkObject.type = getSocialNetworkType();
    }

    window.open(resolveLink(linkObject), "_blank");
};

const getSocialNetworkType = () => {
    if (props.questionID == 40) {
        return "facebook";
    }

    if (props.questionID == 42) {
        return "instagram";
    }

    if (props.questionID == 43) {
        return "twitter";
    }

    if (props.questionID == 100) {
        return "linkedin";
    }

    if (props.questionID == 105) {
        return "reddit";
    }

    if (props.questionID == 106) {
        return "wikipedia";
    }

    if (props.questionID == 107) {
        return "youtube";
    }

    return "unknown";
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

.URLInput {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;

    svg {
        fill: $secondary-text-color;
        width: 15px;
        height: 15px;
        position: relative;
        bottom: 2px;
    }

    &--hint {
        width: 100%;
        margin-top: -6px;
        margin-left: 5px;
    }
}
</style>
