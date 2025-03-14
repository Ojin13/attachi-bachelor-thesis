<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <div class="pageContainer">
                    <div class="notifications">
                        <AppHeader :noBottomOffset="true" :heading="'Notifications'" :showCancelIcon="true" :showNotificationlIcon="false" :cancelIconLink="''" />
                        <p class="notifications--desc gray">Place to see whats new around here</p>

                        <div v-if="hasNotifications" class="notifications--list">
                            <NotificationPanel v-for="notification in notifications" :key="notification.id" :notificationObject="notification" />
                        </div>

                        <div v-else class="notifications__noNotifications">
                            <h1 class="gray">You don't have any notifications yet.</h1>
                            <img src="~/assets/icons/shelf.svg" />
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";

definePageMeta({
    middleware: ["is-authenticated"],
});

const notifications = ref({});

const hasNotifications = computed(() => {
    return Object.keys(notifications.value).length > 0;
});

onMounted(() => {
    notifications.value = store.state.userData.notifications;
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.notifications {
    &--list {
        display: flex;
        flex-flow: column-reverse;
        margin-bottom: 100px;
    }

    &--desc {
        margin-top: 5px;
        margin-bottom: 0px;
    }

    &__noNotifications {
        margin-top: 10vh;
        text-align: center;

        img {
            width: 100px;
            height: 100px;
            margin-top: 25px;
            margin-bottom: 20px;
        }
    }
}
</style>
