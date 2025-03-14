<template>
    <ion-page>
        <ion-content force-overscroll="false">
            <div class="screenContainer">
                <LoaderOverlay :isActive="true" />

                <!-- This page is just a cross-road/loading placeholder -->

                <div class="pageContainer">
                    <AppHeader :heading="'Your contacts 📚'" />

                    <SearchBar />

                    <ActionPanel :numberOfResults="0" :actionButtonText="'Create new contact'" />

                    <div class="fakeContactList">
                        <ContactPanel v-for="fakeContactPanel in 4" :key="fakeContactPanel.id" :showOnlyLoading="true" :contactData="{}" />
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
const { initialFetchAllData } = useInitialFetch();

definePageMeta({
    middleware: ["is-authenticated"],
    alias: ["/"],
});

const { getCurrentRoute, rebaseNavigationStack, reloadRouter } = useIonicRouter();

onMounted(() => {
    initialFetchAllData()
        .then(() => {
            if (getCurrentRoute().name == "auth-loadingScreen") {
                rebaseNavigationStack("/auth/contacts");
            }
        })
        .catch(() => {
            reloadRouter("/login");
        });
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.fakeContactList {
    margin-top: 20px;
}
</style>
