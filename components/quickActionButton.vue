<template>
    <ion-fab slot="fixed" vertical="bottom" horizontal="end" class="quickActionButton" :class="{ 'quickActionButton--hidden': !showButton }">
        <ion-fab-button @click="mediumFeedback()">
            <ion-icon :icon="ioniconsAddCircle"></ion-icon>
        </ion-fab-button>

        <ion-fab-list side="top">
            <ion-fab-button @click="goToPage('/auth/contacts/chatBot')">
                <ion-icon :icon="ioniconsChatboxEllipses"></ion-icon>
            </ion-fab-button>

            <ion-fab-button @click="goToPage('/auth/contacts/scraper')">
                <ion-icon :icon="ioniconsGlobeOutline"></ion-icon>
            </ion-fab-button>
        </ion-fab-list>
    </ion-fab>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const { pushToStack } = useIonicRouter();

const props = defineProps({
    pageTarget: {
        type: String,
        required: true,
        default: "/auth/contacts",
    },

    redirectQueryParams: {
        type: Object,
        required: false,
        default: null,
    },

    scrollActivationPoint: {
        type: Number,
        required: false,
        default: 0,
    },

    iconType: {
        type: String,
        required: false,
        default: "chat",
    },

    currentScrollDepth: {
        type: Number,
        required: false,
        default: 0,
    },
});

const showButton = ref(false);

const handleScroll = () => {
    if (props.currentScrollDepth >= props.scrollActivationPoint) {
        showButton.value = true;
    } else {
        showButton.value = false;
    }
};

const goToPage = (pageTarget, redirectQueryParams = null) => {
    Haptics.impact({ style: ImpactStyle.Light });

    if (!redirectQueryParams) {
        redirectQueryParams = props.redirectQueryParams;
    }

    pushToStack({ path: pageTarget, query: redirectQueryParams });
};

const mediumFeedback = () => {
    Haptics.impact({ style: ImpactStyle.Medium });
};

onMounted(() => {
    watch(() => props.currentScrollDepth,
        () => {
            handleScroll();
        },
    );
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.quickActionButton {
    position: fixed;
    bottom: 30px;
    right: 20px;
    z-index: 1000;
    opacity: 1;
    transition: 300ms;

    &--hidden {
        bottom: -50px;
        opacity: 0;
    }
}

ion-fab-button {
    --background: #{$placeholder-action-color};
    --background-activated: #{$placeholder-action-color};
    --background-hover: #{$placeholder-action-color};
    --box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
    --color: black;
}
</style>
