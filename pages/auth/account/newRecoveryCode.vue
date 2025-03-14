<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <div v-if="recoveryCodeExists" class="recoveryCode__beforeGeneration">
                    <NavigationPanel :displayLeftIcon="false" :displayRightIcon="false" :navigationTitle="'Re-generate recovery code 🔒'" :navigationDesc="'For reseting forgotten password'" />
                    <h1>New recovery code</h1>
                </div>

                <div class="pageContainer">
                    <div v-if="recoveryCodeExists == false">
                        <AppHeader :showNotificationlIcon="false" :noBottomOffset="true" :heading="'New recovery code'" :centerHeading="true" />
                    </div>

                    <div class="recoveryCode__image">
                        <img src="~/assets/images/shield_holding.png" />
                    </div>

                    <NewRecoveryCode :popFromStackOnFinish="true" :redirectionURL="'/auth/account/settings'" />
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
const { hasRecoveryCode } = useUserManagement();

definePageMeta({
    middleware: ["is-authenticated"],
});

// Determine existance of recovery code
const recoveryCodeExists = ref(false);

onBeforeMount(async () => {
    recoveryCodeExists.value = await hasRecoveryCode();
});
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

    &__btn {
        margin-top: 50px;
    }

    &__beforeGeneration {
        margin-top: 50px;

        h1 {
            text-align: center;
        }
    }
}
</style>
