<template>
    <ion-page>
        <!-- Mobile bottom menu and tabbed view -->
        <ion-tabs @ionTabsDidChange="tabClicked($event)">
            <ion-router-outlet />

            <ion-tab-bar v-if="!isAtLoadingScreen" slot="bottom" :translucent="true" mode="ios" class="mainMenu" :class="{ 'mainMenu--hide': !showMenu }">
                <ion-tab-button tab="contacts" href="/auth/contacts">
                    <img v-show="currentTab != 'contacts'" src="~/assets/icons/book.svg" />
                    <img v-show="currentTab == 'contacts'" src="~/assets/icons/book-green.svg" />
                    <p class="medium2 bold">Contacts</p>
                </ion-tab-button>
                <ion-tab-button tab="groups" href="/auth/groups">
                    <img v-show="currentTab != 'groups'" src="~/assets/icons/groups.svg" />
                    <img v-show="currentTab == 'groups'" src="~/assets/icons/groups-green.svg" />
                    <p class="medium2 bold">Groups</p>
                </ion-tab-button>
                <ion-tab-button tab="account" href="/auth/account">
                    <img v-show="currentTab != 'account'" src="~/assets/icons/account.svg" />
                    <img v-show="currentTab == 'account'" src="~/assets/icons/account-green.svg" />
                    <p class="medium2 bold">Account</p>
                </ion-tab-button>
            </ion-tab-bar>
        </ion-tabs>
    </ion-page>
</template>

<script setup>
import { YesNoValue } from "~/types";

const { getCurrentRoute } = useIonicRouter();
const route = getCurrentRoute();
const showMenu = ref(true);
const currentTab = ref("contacts");

const displayMenuPaths = ["/auth/contacts", "/auth/groups", "/auth/account", "/auth/notifications", "/auth/notificationDetail"];

const checkForCriticalActionToDisallowLiveUpdate = () => {
    if (route.path == "/auth/contacts/scraper" || route.path == "/auth/contacts/chatBot") {
        localStorage.allowReloadApp = YesNoValue.false;
    } else {
        localStorage.allowReloadApp = YesNoValue.true;
    }
};

const tabClicked = (event) => {
    currentTab.value = event.tab;
};

const isAtLoadingScreen = computed(() => {
    return route.path == "/";
});

watch(
    () => route.path,
    () => {
        checkForCriticalActionToDisallowLiveUpdate();

        for (let i = 0; i < displayMenuPaths.length; i++) {
            if (route.path == displayMenuPaths[i] || route.path == displayMenuPaths[i] + "/") {
                showMenu.value = true;
                return;
            }
        }

        showMenu.value = false;
    },
);
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.mainMenu {
    border-top: 1px solid $secondary-background-color;
    transition: all 0.2s ease;
    opacity: 1;
    height: $bottomMobileMenuHeight;

    &--hide {
        opacity: 0;
        height: 0px;
        padding: 0px;
        margin: 0px;
        overflow: hidden;
        border: none;
    }

    ion-label {
        font-size: $medium-font-size;
    }

    ion-tab-button {
        svg,
        img {
            width: 25px;
            fill: $secondary-text-color;
        }

        svg.svg-stroked {
            stroke: $secondary-text-color;
        }

        p {
            margin-bottom: 0px;
            margin-top: 5px;
            color: $secondary-text-color;
        }
    }

    ion-tab-button.tab-selected {
        svg {
            fill: $deep-green;
        }

        svg.svg-stroked {
            stroke: $deep-green;
        }

        p {
            color: $primary-text-color;
        }
    }
}
</style>
