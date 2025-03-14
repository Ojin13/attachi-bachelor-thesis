<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <div class="pageContainer">
                    <AppHeader :showNotificationlIcon="false" :noBottomOffset="true" :heading="'New update is here 🎉 Let\'s see what\'s new'" />
                    <p class="gray updateNews__summary" v-html="getUpdateSummary()"></p>

                    <div class="updateNews__content">
                        <h2>News and fixes:</h2>
                        <div v-html="getUpdateDesc()"></div>
                    </div>

                    <div class="updateNews__image">
                        <img src="~/assets/images/shield_holding.png" />
                    </div>

                    <div @click="confirmNews()">
                        <ActionButton :buttonText="'Continue to application'" />
                    </div>

                    <p v-if="false" class="updateNews__details gray medium" @click="goToNews()">See complete update description</p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";

const { replaceNavigationStack } = useIonicRouter();

const goToNews = () => {
    window.open("https://www.attachi.net/", "_system");
};

const confirmNews = () => {
    replaceNavigationStack("/auth/contacts");
};

const getUpdateDesc = () => {
    return store.state.userData.lastVersionDesc;
};

const getUpdateSummary = () => {
    return store.state.userData.lastVersionSummary;
};
</script>

<style lang="scss">
@use "sass:math";
@import "/assets/sass/variables";

.updateNews {
    &__image {
        text-align: center;

        img {
            width: 85%;
        }
    }

    &__summary {
        margin-top: 20px;
    }

    &__actionButton {
        margin-top: 20px;
        margin-bottom: 20px;
    }

    &__details {
        text-align: center;
    }

    &__content {
        margin-top: 30px;

        ul {
            margin-top: 10px;
        }

        li {
            margin-bottom: 10px;

            &::marker {
                color: $primary-action-color;
                //font-size: 25px;
                transform: scale(1.5);
            }
        }
    }
}
</style>
