<template>
    <div class="appHeader">
        <div v-if="!isAndroid()" class="safeArea">
            <!-- Safe area for iOS -->
        </div>

        <div class="appHeader__infoPanel" :class="{ 'appHeader__logo--android': isAndroid() }">
            <div class="appHeader--logo">
                <img src="~/assets/icons/logo_text.svg" />
            </div>

            <div v-if="showCancelIcon" class="appHeader__iconZone">
                <img src="~/assets/icons/close.svg" class="appHeader--close" />
                <div class="appHeader__close--clickableArea" @click="clickCancelButton(cancelIconLink)"></div>
            </div>

            <div v-if="showNotificationlIcon" class="appHeader__notifications" @click="clickNotificationButton()">
                <img src="~/assets/icons/notification.svg" class="appHeader__notifications--icon" />
                <p v-if="getNumberOfNotifications != ''" class="appHeader__notifications--text bold">{{ getNumberOfNotifications }}</p>
                <div class="appHeader__notifications--clickableArea"></div>
            </div>
        </div>

        <h1 class="appHeader__heading" :class="{ 'appHeader__heading--noBottomOffset': noBottomOffset, 'appHeader__heading--centered': centerHeading }">{{ heading }}</h1>
    </div>
</template>

<script setup>
import { store } from "~/store";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const { pushToStack, popFromStack } = useIonicRouter();

const clickNotificationButton = () => {
    Haptics.impact({ style: ImpactStyle.Light });
    pushToStack("/auth/notifications");
};

const clickCancelButton = (location) => {
    Haptics.impact({ style: ImpactStyle.Light });
    popFromStack(location);
};

defineProps({
    heading: {
        type: String,
        required: true,
        default: "",
    },

    showCancelIcon: {
        type: Boolean,
        required: false,
        default: false,
    },

    showNotificationlIcon: {
        type: Boolean,
        required: false,
        default: true,
    },

    cancelIconLink: {
        type: String,
        required: false,
        default: "",
    },

    noBottomOffset: {
        type: Boolean,
        required: false,
        default: false,
    },

    centerHeading: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const isAndroid = () => {
    return Capacitor.getPlatform() === "android";
};

const getNumberOfNotifications = computed(() => {
    let numberOfNotifications = 0;

    if (!store.state.userData.notifications) {
        return "";
    }

    Object.keys(store.state.userData.notifications).forEach(function (key) {
        if (store.state.userData.notifications[key].read == false) {
            numberOfNotifications++;
        }
    });

    if (numberOfNotifications == 0) {
        return "";
    }

    if (numberOfNotifications >= 100) {
        return "99+";
    }

    return numberOfNotifications;
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.appHeader {
    margin-top: var(--safe-area-top);

    &__close {
        &--clickableArea {
            position: absolute;
            width: 40px;
            height: 40px;
            top: -12px;
            right: -12px;
        }
    }

    &__iconZone {
        position: relative;
    }

    &__infoPanel {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    &--logo img {
        width: 125px;
    }

    &--close {
        width: 15px !important;
        height: 15px;
        position: relative;
    }

    &__notifications {
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;

        &--clickableArea {
            position: absolute;
            width: 40px;
            height: 40px;
        }

        &--icon {
            width: 25px !important;
            height: 25px;
            position: relative;
        }

        &--text {
            margin-bottom: 0px;
            margin-left: 5px;
        }
    }

    &__heading {
        margin-top: 45px;
        white-space: pre-wrap;
        word-wrap: break-word;

        &--noBottomOffset {
            margin-bottom: 0px;
        }

        &--centered {
            text-align: center;
        }
    }
}

.safeArea {
    background-color: $primary-background-color;
    width: 100%;
    height: calc(var(--safe-area-top) - (var(--safe-area-top) / 5));
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
}
</style>
