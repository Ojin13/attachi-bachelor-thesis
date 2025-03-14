<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <div class="pageContainer">
                    <AppHeader :showNotificationlIcon="false" :noBottomOffset="true" :heading="'A new version of this app is available!'" />
                    <p class="gray updateRequired__description">
                        We have detected that you are currently using an outdated version of this app. To continue using it, please update to the newest version to access new features and keep your
                        data secured with our security patches. 🔒
                    </p>

                    <div class="updateRequired__image">
                        <img src="~/assets/images/shield_holding.png" />
                    </div>

                    <div @click="goToStore()">
                        <ActionButton :buttonText="'Update now'" :customClasses="'updateRequired__actionButton'" />
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { Capacitor } from "@capacitor/core";

const goToStore = () => {
    if (Capacitor.getPlatform() === "android") {
        window.open("https://play.google.com/store/apps/details?id=cz.ojin.app", "_system");
    } else {
        window.open("https://apps.apple.com/gb/app/attachi/id6449395592", "_system");
    }
};
</script>

<style lang="scss">
@use "sass:math";
@import "/assets/sass/variables";

.updateRequired {
    &__image {
        text-align: center;

        img {
            width: 85%;
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
