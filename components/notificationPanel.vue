<template>
    <div class="notificationPanel--container">
        <div :key="notification.id" :class="{ 'notificationPanel--read': notification.read }" class="notificationPanel" @click="readNotification()">
            <div class="notificationPanel--image placeholder-loading">
                <img v-if="notification.imageUrl != ''" :src="notification.imageUrl" />
                <img v-else src="~/assets/images/paper_fly.png" />
            </div>

            <div class="notificationPanel--info">
                <p v-if="notification.read" class="small">{{ getCreationDate() }}</p>
                <p v-else class="medium bold notificationPanel--info--new">New notification ✨</p>
                <p class="bold">{{ notification.heading }}</p>
                <p class="gray medium">{{ notification.contentPreview }}</p>
                <p class="notificationPanel--info--more small">More >></p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { store } from "~/store";
import { ServerAction } from "~/types";
import { formatDate } from "~/utils/timeFormater";

const { pushToStack } = useIonicRouter();
const { callFire } = useFirebaseConnector();
const props = defineProps({
    notificationObject: {
        type: Object,
        required: true,
    },
});

const notification = ref({});
const readNotification = () => {
    Haptics.impact({ style: ImpactStyle.Light });
    pushToStack({ path: "/auth/notificationDetail", query: { notificationID: notification.value.id } });

    if (notification.value.read) {
        return;
    }

    callFire({
        action: ServerAction.readNotification,
        notificationId: notification.value.id,
    }).then(() => {
        notification.value.read = true;
        store.commit("updateNotification", { id: notification.value.id, notification: notification.value });
    });
};

const getCreationDate = () => {
    return formatDate(notification.value.creationDate);
};

onBeforeMount(() => {
    notification.value = props.notificationObject;
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.notificationPanel {
    margin-top: 20px;
    padding: 5px;
    border-radius: $default-border-radius;
    background-color: $secondary-action-color;
    border-top: 1px solid $placeholder-action-color;
    display: flex;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

    $image-size: 75px;

    &--image {
        width: $image-size;
        height: $image-size;
        background-color: $placeholder-action-color;
        border-radius: $default-border-radius;
        margin-right: 15px;
        display: flex;
        flex-shrink: 0;
        align-items: flex-start;
        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

        img {
            width: $image-size;
            border-radius: $default-border-radius;
        }
    }

    &--info {
        min-height: $image-size;
        width: 100%;

        h2 {
            margin-bottom: 0px;
        }

        p {
            margin-bottom: 0px;
        }

        &--new {
            color: $primary-action-color;
        }

        &--more {
            margin-top: 5px;
        }
    }

    &--read {
        background-color: $secondary-action-color;
    }
}
</style>
