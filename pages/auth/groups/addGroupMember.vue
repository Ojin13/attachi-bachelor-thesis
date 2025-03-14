<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <NavigationPanel :displayLeftIcon="false" :displayRightIcon="false" :navigationTitle="'Manage group members'" :navigationDesc="groupData.groupName" />

                <div class="pageContainer addToGroup__wrapper">
                    <SearchBar :searchPlaceholder="'Search contacts by name'" @searchFilter="setFilter" />

                    <div class="addToGroup__header">
                        <p class="bold">{{ countFilteredItems }} results:</p>
                    </div>

                    <div v-if="countFilteredItems > 0" class="groupList__contacts">
                        <ContactPanel
                            v-for="contact in filterItems"
                            :key="contact.id"
                            :headerIconClasses="groupData.groupMembers.includes(contact.id) ? 'remove' : 'add'"
                            :allowClickEvent="false"
                            :showIcon="true"
                            :contactData="contact"
                            :showGroups="false"
                            @headerIconClicked="editButtonClicked(contact)"
                        />
                    </div>

                    <div v-else class="groupList__noResults">
                        <h1 v-if="currentFilter == ''" class="gray">You don't have any contacts yet. It's time to add some.</h1>
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
import { ServerAction } from "~/types";

definePageMeta({
    middleware: ["is-authenticated"],
});

const groupData = ref({});
const contactList = ref({});
const { countFilteredItems, filterItems, setFilter, setFilterBy } = useFilters(contactList);
const { getCurrentRoute, popFromStack } = useIonicRouter();
const { callFire } = useFirebaseConnector();

const editButtonClicked = (contact) => {
    let action = "";
    if (groupData.value.groupMembers.includes(contact.id)) {
        groupData.value.groupMembers.splice(groupData.value.groupMembers.indexOf(contact.id), 1);
        action = "removeMemberFromGroup";
    } else {
        groupData.value.groupMembers.push(contact.id);
        action = "addMemberToGroup";
    }

    store.commit("updateGroup", { group_data: groupData.value, group_id: groupData.value.groupId });

    callFire({
        action: ServerAction.manageGroup,
        specificAction: action,
        group_id: groupData.value.groupId,
        member_id: contact.id,
    });
};

onMounted(() => {
    if (!getCurrentRoute().query.groupId) {
        console.error("No groupId provided in route params.");
        popFromStack();
    } else {
        groupData.value = store.state.userData.groups[getCurrentRoute().query.groupId];
    }

    if (store.state.userData.contacts) {
        contactList.value = store.state.userData.contacts;
    } else {
        console.error("No contacts found in store.");
        popFromStack();
    }

    setFilterBy(["name"]);
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.groupList {
    &__noResults {
        margin-top: 50px;

        img {
            width: 100%;
            opacity: 50%;
        }
    }
}

.addToGroup {
    &__wrapper {
        margin-top: 30px;
    }
}
</style>
