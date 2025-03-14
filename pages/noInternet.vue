<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <LoaderOverlay :isActive="activeLoader" />

                <div class="pageContainer">
                    <AppHeader :showNotificationlIcon="false" :noBottomOffset="true" :heading="'You are not connected to the Internet'" />
                    <p class="gray noInternet__description">It seems that your internet connection was lost. Please try again, when you are online.</p>

                    <div class="noInternet__image">
                        <img src="~/assets/icons/no-internet.svg" />
                    </div>

                    <div @click="tryToReconnect()">
                        <ActionButton :buttonText="'Try to reconnect'" :customClasses="'noInternet__actionButton'" />
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
const { replaceNavigationStack } = useIonicRouter();
const activeLoader = ref(false);

const tryToReconnect = () => {
    activeLoader.value = true;

    setTimeout(() => {
        if (!navigator.onLine) {
            activeLoader.value = false;
        }

        replaceNavigationStack("/auth/contacts");
    }, 1000);
};
</script>

<style lang="scss">
@use "sass:math";
@import "/assets/sass/variables";

.noInternet {
    &__image {
        text-align: center;

        img {
            width: 200px;
            margin-top: 50px;
            margin-bottom: 50px;
        }
    }

    &__description {
        margin-top: 20px;
    }

    &__actionButton {
        margin-top: 20px;
        margin-bottom: 20px;
    }
}
</style>
