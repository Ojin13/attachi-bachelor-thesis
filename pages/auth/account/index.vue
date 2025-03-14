<template>
    <ion-page>
        <ion-content force-overscroll="false">
            <div class="screenContainer">
                <div class="pageContainer">
                    <AppHeader :heading="'Account'" />

                    <div class="account">
                        <div class="account--topSection">
                            <div class="account__tab" @click="goToPage('/auth/account/settings')">
                                <div class="account__tab__image">
                                    <div class="account__tab__image--placeholder">
                                        <img :src="$store.state.auth.profilePicture" onerror="this.style.display='none'" />
                                    </div>
                                </div>

                                <div class="account__tab__text">
                                    <p class="account__tab__text--header bold">{{ formatName }}</p>
                                    <p class="account__tab__text--mail medium gray">Account settings</p>
                                </div>

                                <div class="account__tab__edit">
                                    <img src="~/assets/icons/pencil.svg" />
                                </div>
                            </div>

                            <div class="verticalMenu">
                                <div class="verticalMenu__tab" @click="goToPage('/auth/account/contactUs')">
                                    <div class="verticalMenu__tab--icon">
                                        <img src="~/assets/icons/email.svg" />
                                    </div>
                                    <p class="medium">Contact us or give feedback</p>

                                    <div class="verticalMenu__tab--arrow">
                                        <img src="~/assets/icons/arrow-gray.svg" />
                                    </div>
                                </div>

                                <div class="verticalMenu__tab" @click="goToPage('/auth/account/faq')">
                                    <div class="verticalMenu__tab--icon">
                                        <img src="~/assets/icons/question.svg" />
                                    </div>
                                    <p class="medium">Frequently Asked Questions</p>

                                    <div class="verticalMenu__tab--arrow">
                                        <img src="~/assets/icons/arrow-gray.svg" />
                                    </div>
                                </div>

                                <div class="verticalMenu__tab" @click="goToPage('/auth/account/bugReport')">
                                    <div class="verticalMenu__tab--icon">
                                        <img src="~/assets/icons/bug.svg" />
                                    </div>
                                    <p class="medium">Report a bug</p>

                                    <div class="verticalMenu__tab--arrow">
                                        <img src="~/assets/icons/arrow-gray.svg" />
                                    </div>
                                </div>

                                <div class="verticalMenu__tab" @click="goToPage('/auth/account/buyMeCoffee')">
                                    <div class="verticalMenu__tab--icon verticalMenu__tab--icon--coffee">
                                        <img src="~/assets/icons/coffee.svg" />
                                    </div>
                                    <p class="medium">Buy me a coffee</p>

                                    <div class="verticalMenu__tab--arrow">
                                        <img src="~/assets/icons/arrow-gray.svg" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ConfirmTab ref="confirmationTab" @confirmAction="customConfirmationAction">
                            <div class="account__logout" @click="requestLogout()">
                                <img src="~/assets/icons/logout.svg" />
                                <p class="bold medium">Log out from this account</p>
                            </div>
                        </ConfirmTab>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { signOut, getAuth } from "firebase/auth";
import { store } from "~/store";

definePageMeta({
    middleware: ["is-authenticated"],
});

// Element reference
const confirmationTab = ref(null);

const { pushToStack, reloadRouter } = useIonicRouter();

const goToPage = (address) => {
    Haptics.impact({ style: ImpactStyle.Light });
    pushToStack(address);
};

const customConfirmationAction = async (confirmAction) => {
    if (confirmAction == "logout") {
        await signOut(getAuth());
        reloadRouter("/login");
    }
};

const formatName = computed(() => {
    const name = store.state.auth.userName;
    return name.substring(0, 25) + (name.length > 25 ? "..." : "");
});

const requestLogout = () => {
    Haptics.impact({ style: ImpactStyle.Heavy });
    confirmationTab.value.setConfirmationTabData("Are you sure you want to log out?", "You will have to enter your password to decrypt your data the next time you login.", "logout");
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.account {
    height: calc(100vh - 45px - 80px - 120px - 50px);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &__tab {
        width: 100%;
        height: 75px;
        background-color: $secondary-background-color;
        border-radius: $default-border-radius;
        display: flex;
        align-items: center;
        overflow: hidden;
        margin-bottom: 10%;

        &__image {
            padding-left: 15px;

            &--placeholder {
                background-image: url("~/assets/icons/account.svg");
                border-radius: 50%;
                background-color: $secondary-text-color;
                padding: 0px;
                margin: 0px;
                width: 55px;
                height: 55px;
            }

            img {
                width: 55px;
                height: 55px;
                border-radius: 50%;
                object-fit: cover;
            }
        }

        &__text {
            padding-left: 15px;

            p {
                margin-bottom: 0px;
                position: relative;
            }

            &--header {
                top: 1px;
            }

            &--mail {
                bottom: 1px;
            }
        }

        &__edit {
            margin-left: auto;
            padding-right: 20px;
            position: relative;
            top: 2px;

            img {
                width: 15px;
                height: 15px;
            }
        }
    }

    &__logout {
        margin-bottom: 32px;
        padding: 10px 15px;
        background-color: $secondary-background-color;
        border-radius: $default-border-radius;
        display: flex;
        align-items: center;

        p {
            margin-bottom: 0px;
            color: $delete-color;
        }

        img {
            width: 15px;
            height: 15px;
            margin-right: 15px;
            position: relative;
            top: 1px;
        }
    }
}
</style>
