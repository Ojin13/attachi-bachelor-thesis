<template>
    <div class="actionPanel">
        <div class="actionPanel__searchResults">
            <p class="bold large2">{{ numberOfResults }} results</p>
        </div>

        <div v-if="showActionButton" class="button actionPanel__newContactButton" @click="goToLink()" @touchstart="highlightButton" @touchend="unhighlightButton">
            <p>{{ actionButtonText }}</p>
        </div>

        <div v-else class="actionPanel__alternativeText">
            <p class="gray">{{ actionButtonReplacementText }}</p>
        </div>
    </div>
</template>

<script setup>
const { highlightButton, unhighlightButton } = useButton("button--active", true);
const { pushToStack } = useIonicRouter();

const props = defineProps({
    numberOfResults: {
        type: Number,
        default: 0,
        required: true,
    },

    actionButtonText: {
        type: String,
        default: "Click me",
        required: true,
    },

    actionButtonLink: {
        type: String,
        default: "/auth/contacts",
        required: true,
    },

    actionButtonLinkParams: {
        type: Object,
        default: null,
        required: false,
    },

    showActionButton: {
        type: Boolean,
        default: true,
        required: false,
    },

    actionButtonReplacementText: {
        type: String,
        default: "",
        required: false,
    },
});

const goToLink = () => {
    pushToStack({ path: props.actionButtonLink, query: props.actionButtonLinkParams });
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.actionPanel {
    display: flex;
    justify-content: space-between;

    &__searchResults {
        display: flex;
        align-items: center;

        p {
            margin-top: 10px;
            margin-bottom: 5px;
        }
    }

    &__alternativeText {
        align-items: center;
        display: flex;

        p {
            margin: 0px;
        }
    }

    &__newContactButton {
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 6px 15px;
        background: -webkit-linear-gradient(0deg, $primary-action-color, #a4bf74);

        p {
            margin: 0px;
            padding: 0px 15px;
        }
    }
}
</style>
