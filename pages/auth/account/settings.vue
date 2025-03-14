<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <LoaderOverlay :isActive="activeLoader" />

                <NavigationPanel :leftIconURL="getProfilePic()" :navigationTitle="'Edit your account'" :navigationDesc="'Account and security setting'" />

                <div class="pageContainer">
                    <div class="settings">
                        <div class="settings">
                            <div class="settings__topSection">
                                <div class="settings__changePhoto">
                                    <label for="imageUploadButton">
                                        <div class="settings__changePhoto__photo" :style="{ 'background-image': 'url(' + $store.state.auth.profilePicture + ')' }">
                                            <div class="settings__changePhoto__photo__overlay">
                                                <div class="settings__changePhoto__photo__overlay--icon">
                                                    <!-- Icon -->
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                </div>

                                <PhotoUpload :customUploadedFileName="'profilePicture'" :encryptImage="false" :uploadType="'userProfilePicture'" @imageUploaded="updateProfilePic" />

                                <div class="settings__changeName">
                                    <p class="gray bold">Your name</p>
                                    <input v-model="userName" type="text" placeholder="Your name" @keyup="updateUserName()" />
                                </div>

                                <div class="settings__infoSection">
                                    <p class="gray bold settings__infoSection--heading">Connected email</p>
                                    <p class="medium bold settings__infoSection--content">{{ getEmailAddress }}</p>
                                    <p class="medium2 settings__infoSection--green">Confirmed</p>
                                </div>

                                <div class="settings__infoSection">
                                    <p class="gray bold settings__infoSection--heading">Credits</p>
                                    <p class="medium bold settings__infoSection--content">Your online search credits: {{ getCredits }}<img src="~/assets/images/credits.png" /></p>
                                    <p class="medium2 settings__infoSection--green">Next free auto recharge {{ getRechargeDate }}</p>
                                </div>

                                <div class="settings__security">
                                    <p class="gray bold settings__security--heading">Security</p>

                                    <div class="verticalMenu">
                                        <div class="verticalMenu__tab" @click="goToAddress('/resetPassword', { userKnowsCurrentPassword: true })">
                                            <div class="verticalMenu__tab--icon">
                                                <img src="~/assets/icons/lock.svg" />
                                            </div>
                                            <p class="medium">Change your password</p>

                                            <div class="verticalMenu__tab--arrow">
                                                <img src="~/assets/icons/arrow-gray.svg" />
                                            </div>
                                        </div>

                                        <div class="verticalMenu__tab" @click="goToAddress(passcodeExists ? '/passcode' : '/passcodeCreation', { forcePasscode: true })">
                                            <div class="verticalMenu__tab--icon">
                                                <img src="~/assets/icons/keyboard.svg" />
                                            </div>
                                            <p class="medium">{{ passcodeExists ? "Change your passcode" : "Setup your passcode" }}</p>

                                            <div class="verticalMenu__tab--arrow">
                                                <img src="~/assets/icons/arrow-gray.svg" />
                                            </div>
                                        </div>

                                        <div class="verticalMenu__tab" @click="goToAddress('/auth/account/newRecoveryCode', { autoGenerateCodeOnVisit: recoveryCodeExists ? 'false' : 'true' })">
                                            <div class="verticalMenu__tab--icon">
                                                <img src="~/assets/icons/health.svg" />
                                            </div>
                                            <p class="medium">{{ recoveryCodeExists ? "Change your recovery code" : "Setup your recovery code" }}</p>

                                            <div class="verticalMenu__tab--arrow">
                                                <img src="~/assets/icons/arrow-gray.svg" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <ConfirmTab ref="confirmationTab" :isCriticalAction="true" @confirmAction="customConfirmationAction">
                        <div class="settings__security--dangerZone">
                            <p class="gray bold settings__security--heading">Danger zone</p>
                            <div class="settings__deleteAccount" @click="accountDeletionRequest()">
                                <img src="~/assets/icons/delete-dark.svg" />
                                <p class="bold medium">Delete your account and all data</p>
                            </div>
                        </div>
                    </ConfirmTab>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

definePageMeta({
    middleware: ["is-authenticated"],
});

const passcodeExists = ref(false);
const recoveryCodeExists = ref(false);
const activeLoader = ref(false);

// Element reference
const confirmationTab = ref(null);

// Composables
const { pushToStack } = useIonicRouter();
const { userName, updateUserName, deleteUserAccount, getProfilePic, hasPasscode, hasRecoveryCode } = useUserManagement(activeLoader);

const getCredits = computed(() => {
    return store.state.userData.credits;
});

const getEmailAddress = computed(() => {
    return store.state.auth.email;
});

const getRechargeDate = computed(() => {
    if (!store.state.userData.nextCreditRecharge) {
        return "";
    }

    const rechargeDate = new Date(store.state.userData.nextCreditRecharge);

    // Get distance in days between today and the recharge date
    const distance = Math.floor((rechargeDate - new Date()) / (1000 * 60 * 60 * 24));

    if (distance <= 0) {
        return "is tomorrow";
    }

    return distance + " in" + (distance == 1 ? " day" : " days");
});

const goToAddress = (address, queryParams = {}) => {
    Haptics.impact({ style: ImpactStyle.Light });
    pushToStack({ path: address, query: queryParams });
};

const updateProfilePic = (_, imageLocalURL) => {
    store.dispatch("save_profilePicture", imageLocalURL);
};

const accountDeletionRequest = () => {
    Haptics.impact({ style: ImpactStyle.Heavy });
    confirmationTab.value.setConfirmationTabData(
        "Do you really want to delete your account and all its data?",
        "Once you delete your account, it cannot be recovered. All your data will be permanently deleted and you will be logged out.",
        "deleteAccount",
    );
};

const customConfirmationAction = (confirmAction) => {
    if (confirmAction == "deleteAccount") {
        setTimeout(() => {
            confirmationTab.value.setConfirmationTabData(
                "Are you really sure? This action cannot be undone.",
                "Just to be sure that this was not a miss click, please confirm that you really want to delete your account.",
                "deleteAccountConfirmed",
            );
        }, 1000);
    } else if (confirmAction == "deleteAccountConfirmed") {
        deleteUserAccount();
    }
};

onMounted(async () => {
    passcodeExists.value = await hasPasscode();
    recoveryCodeExists.value = await hasRecoveryCode();
});

// Subscribe to store updates in order to detect changes in passcode and recovery code
store.subscribe(async (mutation) => {
    if (mutation.type == "set_enteredPasscode") {
        passcodeExists.value = await hasPasscode();
    }

    if (mutation.type == "updateContactDataPresets") {
        recoveryCodeExists.value = await hasRecoveryCode();
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.settings {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    label {
        display: block;
        margin: auto !important;
    }

    &__changePhoto {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 25px;

        $previewSize: 200px;
        $previewRadius: 10%;

        &__photo {
            width: $previewSize;
            height: $previewSize;
            border-radius: $previewRadius;

            &__overlay {
                width: $previewSize;
                height: $previewSize;
                border-radius: $previewRadius;
                background-color: rgba($color: #000000, $alpha: 0.6);

                &--icon {
                    width: $previewSize;
                    height: $previewSize;
                    border-radius: $previewRadius;
                    background-image: url("data:image/svg+xml,%3Csvg fill='%23ffffff' id='Layer_1' height='512' viewBox='0 0 24 24' width='512' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m19.777 6.387h-2.212c-.214 0-.406-.136-.48-.337l-.578-1.592c-.244-.675-.891-1.127-1.608-1.127h-5.797c-.718 0-1.364.452-1.607 1.126l-.579 1.592c-.074.202-.267.338-.48.338h-2.212c-1.557 0-2.822 1.266-2.822 2.821v8.64c0 1.556 1.266 2.821 2.822 2.821h15.555c1.557 0 2.822-1.266 2.822-2.821v-8.64c0-1.556-1.266-2.821-2.822-2.821zm1.623 11.461c0 .895-.729 1.622-1.623 1.622h-15.554c-.895 0-1.623-.728-1.623-1.622v-8.64c0-.895.729-1.622 1.623-1.622h2.212c.716 0 1.361-.452 1.607-1.126l.58-1.594c.072-.2.266-.336.479-.336h5.797c.214 0 .407.136.48.337l.579 1.594c.246.673.892 1.125 1.607 1.125h2.212c.895 0 1.623.728 1.623 1.622v8.64zm-9.4-8.497c-2.261 0-4.1 1.839-4.1 4.1s1.839 4.1 4.1 4.1 4.1-1.839 4.1-4.1-1.839-4.1-4.1-4.1zm0 7c-1.599 0-2.9-1.302-2.9-2.9s1.302-2.9 2.9-2.9 2.9 1.302 2.9 2.9-1.302 2.9-2.9 2.9z'/%3E%3C/svg%3E");
                    background-size: 35px;
                }
            }
        }
    }

    &__infoSection {
        margin-bottom: 30px;

        img {
            width: 18px;
            height: 18px;
            margin-left: 2px;
            top: -1px;
            position: absolute;
        }

        &--content {
            position: relative;
            margin-bottom: 5px;
        }

        &--green {
            color: $deep-green;
        }

        &--heading {
            margin-bottom: 0px;
            margin-top: 15px;
        }
    }

    &__changeName {
        margin-top: 40px;

        p {
            margin-bottom: 10px;
        }
    }

    &__security {
        &--heading {
            margin-bottom: 10px;
            margin-top: 15px;
        }

        &--dangerZone {
            margin-top: 10px;
        }
    }

    &__deleteAccount {
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
            width: 18px;
            height: 18px;
            margin-right: 15px;
        }
    }
}
</style>
