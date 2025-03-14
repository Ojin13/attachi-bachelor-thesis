<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <GoBackButtonBig :backLocation="'/auth/groups'" />

                <div class="detailPage__image detailPage__image--groupPlaceholder">
                    <!-- Group default image -->
                </div>

                <div class="pageContainer detailPage pageContainer--noTop">
                    <div class="detailPage__name">
                        <AutoExpandtextArea
                            v-if="!groupData.isSmartGroup"
                            :bottomOffset="35"
                            :initialValue="groupData.groupName"
                            :customClasses="'textInput__clear large bold'"
                            :inputPlaceholder="'Group name'"
                            @updateFunction="updateName($event)"
                        />

                        <h1 v-else>{{ groupData.groupName }}</h1>
                    </div>

                    <div class="detailPage__desc">
                        <p v-if="!groupData.isSmartGroup" class="detailPage__desc--header bold">Short description of this group</p>

                        <AutoExpandtextArea
                            v-if="!groupData.isSmartGroup"
                            :bottomOffset="35"
                            :initialValue="groupData.groupDesc"
                            :customClasses="'textInput__clear gray'"
                            :inputPlaceholder="'Group description'"
                            @updateFunction="updateDesc($event)"
                        />

                        <p v-else>{{ groupData.groupDesc }}</p>
                    </div>

                    <ActionPanel
                        :numberOfResults="groupData.groupMembers.length"
                        :actionButtonText="'Manage members'"
                        :actionButtonLink="'/auth/groups/addGroupMember'"
                        :actionButtonLinkParams="{ groupId: groupData.groupId }"
                        :showActionButton="!groupData.isSmartGroup"
                        :actionButtonReplacementText="'🎩 Smart group'"
                    />

                    <div v-if="false" class="detailPage__searchBar">
                        <p class="bold">Search group members</p>
                        <SearchBar :additionalClasses="'detailPage__searchBar--input'" />
                    </div>

                    <div v-if="Object.keys(membersOfGroup).length > 0" class="detailPage__data--contacts">
                        <ContactPanel v-for="contact in membersOfGroup" :key="contact.id" :allowClickEvent="false" :showIcon="false" :contactData="contact" @click="openContact(contact)" />
                    </div>

                    <div v-else class="groupList__noResults">
                        <h1 class="gray">This group has no members. It's time to add some.</h1>
                        <img src="~/assets/images/working_on_smartphone.png" />
                    </div>

                    <ConfirmTab ref="confirmationTab" @confirmAction="customConfirmationAction">
                        <div v-if="!groupData.isSmartGroup" class="detailPage__deleteEntity" @click="requestGroupDeletion()">
                            <div class="detailPage__deleteEntity--icon">
                                <img src="~/assets/icons/delete-user.svg" />
                            </div>
                            <p>Delete this group</p>
                        </div>
                    </ConfirmTab>
                </div>
            </div>

            <ContactModal :contactId="modalContactID" />
        </ion-content>
    </ion-page>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { store } from "~/store";
import { ServerAction } from "~/types";

definePageMeta({
    middleware: ["is-authenticated"],
});

// Element reference
const confirmationTab = ref(null);

const groupName = ref("");
const groupData = ref({});
const contactList = ref({});
const groupUpdateTimer = ref(null);
const modalContactID = ref(null);

const { getCurrentRoute, popFromStack } = useIonicRouter();
const { callFire } = useFirebaseConnector();

const openContact = (contact) => {
    // Reset the value to trigger change in watch
    Haptics.impact({ style: ImpactStyle.Light });
    modalContactID.value = null;
    setTimeout(() => {
        modalContactID.value = contact.id;
    });
};

const requestGroupDeletion = () => {
    Haptics.impact({ style: ImpactStyle.Heavy });
    confirmationTab.value.setConfirmationTabData(
        "Are you sure you want to delete this group?",
        "Members of this group will not be deleted, only the group itself. This action cannot be undone.",
        "deleteGroup",
    );
};

const deleteGroup = (groupID) => {
    callFire({
        action: ServerAction.manageGroup,
        specificAction: "deleteGroup",
        group_id: [groupID],
    }).then(() => {
        console.log("Group " + groupData.value.groupName + " deleted");
    });

    store.commit("deleteGroup", groupID);
    popFromStack("/auth/groups/");
};

const updateName = (name) => {
    groupData.value.groupName = name;
    updateGroupData("name", name);
};

const updateDesc = (desc) => {
    groupData.value.groupDesc = desc;
    updateGroupData("desc", desc);
};

const updateGroupData = (attributeToUpdate, newValue) => {
    let timeBeforeRequest = 1000;

    if (attributeToUpdate == "name") {
        groupData.value.groupName = newValue;
    }

    clearTimeout(groupUpdateTimer.value);
    updateGroupDataStore();

    let timer = setTimeout(function () {
        callFire({
            action: ServerAction.manageGroup,
            specificAction: "updateGroup",
            group_id: groupData.value.groupId,
            name: groupData.value.groupName,
            description: groupData.value.groupDesc,
        }).then(() => {
            console.log("Group " + attributeToUpdate + " updated");
        });
    }, timeBeforeRequest);

    groupUpdateTimer.value = timer;
};

const updateGroupDataStore = () => {
    store.commit("updateGroup", { group_data: groupData.value, group_id: groupData.value.groupId });
};

const customConfirmationAction = (confirmAction) => {
    if (confirmAction == "deleteGroup") {
        deleteGroup(groupData.value.groupId);
    }
};

const membersOfGroup = computed(() => {
    let members = {};
    for (const key in contactList.value) {
        if (groupData.value.groupMembers.includes(contactList.value[key].id)) {
            members[contactList.value[key].id] = contactList.value[key];
        }
    }
    return members;
});

onBeforeMount(() => {
    const route = getCurrentRoute();

    if (!route.query.groupID) {
        console.log("No group ID provided in route params.");
        popFromStack("/auth/groups/");
    } else {
        groupData.value = store.state.userData.groups[route.query.groupID];
        groupName.value = groupData.value.groupName;
        updateGroupDataStore();
    }

    if (store.state.userData.contacts) {
        contactList.value = store.state.userData.contacts;
    } else {
        popFromStack("/auth/groups/");
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.groupList {
    &__groups {
        margin-top: 20px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
    }

    &__noResults {
        margin-top: 50px;

        img {
            width: 100%;
            opacity: 50%;
        }
    }
}
</style>
