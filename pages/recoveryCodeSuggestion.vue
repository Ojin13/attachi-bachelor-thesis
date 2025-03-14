<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <div class="pageContainer">
                    <AppHeader
                        :showNotificationlIcon="false"
                        :noBottomOffset="true"
                        :heading="confirmedSuggestion ? 'Your new Recovery Code' : 'Do you want to create a Recovery code?'"
                        :centerHeading="true"
                    />

                    <div class="recoveryCode__image">
                        <img src="~/assets/images/shield_holding.png" />
                    </div>

                    <div v-if="!confirmedSuggestion">
                        <div class="recoveryCode__info">
                            <p class="recoveryCode__info--heading bold">What is Recovery code?</p>
                            <p class="gray">Recovery code allows you to decrypt your data and reset your password in case you forget it. You can create it now, or later in settings.</p>
                        </div>

                        <div class="recoveryCode__btn" @click="createRecoveryCode()">
                            <ActionButton :buttonText="'Create recovery code'" />
                        </div>

                        <div class="recoveryCode__later">
                            <p class="gray" @click="completeSuggestion()">I will do it later</p>
                        </div>
                    </div>

                    <div v-else>
                        <NewRecoveryCode :redirectionURL="'/auth/contacts/'" :forceNewCode="true" />
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";
import { YesNoValue } from "~/types";
const { replaceNavigationStack } = useIonicRouter();
const { setPreferenceValue } = usePreferences();

definePageMeta({
    middleware: ["is-authenticated"],
});

const confirmedSuggestion = ref(false);

const createRecoveryCode = () => {
    setPreferenceValue(store.state.auth.UID + "-recoveryCodeCreationSuggested", YesNoValue.Yes);
    setPreferenceValue("hasRecoveryCode", YesNoValue.Yes);
    confirmedSuggestion.value = true;
};

const completeSuggestion = () => {
    setPreferenceValue(store.state.auth.UID + "-recoveryCodeCreationSuggested", YesNoValue.Yes);
    replaceNavigationStack("/");
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.recoveryCode {
    display: flex;
    justify-content: space-between;

    &__image {
        text-align: center;

        img {
            width: 85%;
        }
    }

    &__info {
        &--heading {
            margin-bottom: 10px;
        }
    }

    &__btn {
        margin-top: 50px;
    }

    &__later {
        text-align: center;
    }
}
</style>
