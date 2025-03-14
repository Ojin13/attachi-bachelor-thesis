<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <GoBackButtonBig />

                <div v-if="notification.imageUrl != ''" class="detailPage__image" :style="{ backgroundImage: 'url(' + notification.imageUrl + ')' }">
                    <!-- Notification custom image -->
                </div>

                <div v-else class="detailPage__image detailPage__image--notificationPlaceholder">
                    <!-- Notification default image -->
                </div>

                <div class="pageContainer detailPage pageContainer--noTop">
                    <p class="notification__date gray">{{ getCreationDate() }}</p>
                    <h1 class="notification__heading">{{ notification.heading }}</h1>

                    <div class="notification__content" v-html="notification.content"></div>

                    <div v-if="notification.link" class="notification__actionButton" @click="openExternalLink()">
                        <ActionButton :buttonText="notification.linkText == '' ? 'See for yourself' : notification.linkText" />
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";
import { formatDate } from "~/utils/timeFormater";

definePageMeta({
    middleware: ["is-authenticated"],
});

const { getCurrentRoute, popFromStack } = useIonicRouter();
const notification = ref({});

const getCreationDate = () => {
    return formatDate(notification.value.creationDate);
};

const openExternalLink = () => {
    window.open(notification.value.link, "_system");
};

onBeforeMount(() => {
    const routeNotificationID = getCurrentRoute().query.notificationID;

    if (!routeNotificationID) {
        console.error("No notificationID provided in route params.");
        popFromStack("/auth/notifications");
    } else {
        notification.value = store.state.userData.notifications[routeNotificationID];
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.notification {
    &__date {
        margin-top: 20px;
        margin-bottom: 10px;
    }

    &__heading {
        margin-top: 0px;
    }

    &__actionButton {
        margin-top: 50px;
    }
}
</style>
