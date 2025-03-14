<template>
    <ion-page>
        <ion-content force-overscroll="false">
            <div class="screenContainer">
                <div class="pageContainer">
                    <AppHeader :heading="'Your contacts 📚'" />

                    <SearchBar @searchFilter="setFilter" />

                    <ActionPanel :numberOfResults="Object.keys(filterItems).length" :actionButtonText="'Create new contact'" :actionButtonLink="'/auth/contacts/newContact'" />

                    <div v-if="Object.keys(filterItems).length > 0" class="contactList__contacts">
                        <ContactPanel v-for="contact in filterItems" :key="contact.id" :contactData="contact" />
                    </div>

                    <div v-else class="contactList__noResults">
                        <h1 v-if="currentFilterTerm == ''" class="gray">You don't have any contacts yet. It's time to add some.</h1>
                        <h1 v-else class="gray">This filter does not match any of your contacts.</h1>
                        <img src="~/assets/images/working_on_smartphone.png" />
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";
const contactList = ref({});
const { currentFilterTerm, filterItems, setFilter, setFilterBy } = useFilters(contactList);

definePageMeta({
    middleware: ["is-authenticated"],
});

onMounted(() => {
    contactList.value = store.state.userData.contacts;
    setFilterBy(["name"]);

    // Listen for changes of contacts in the store
    store.subscribe((mutation) => {
        if (mutation.type == "deleteContact" || mutation.type == "createContact") {
            contactList.value = store.state.userData.contacts;
        }
    });
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.contactList {
    &__contacts {
        margin-top: 20px;
        padding-bottom: 35px;
    }

    &__noResults {
        margin-top: 50px;
        text-align: center;

        h1 {
            text-align: left;
        }

        img {
            width: 60%;
            opacity: 50%;
        }
    }
}
</style>
