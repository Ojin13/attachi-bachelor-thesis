<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <div class="pageContainer">
                    <AppHeader heading="Your groups 🔗" />

                    <SearchBar :searchPlaceholder="'Search groups by name'" @searchFilter="setFilter" />

                    <ActionPanel :numberOfResults="countFilteredItems" :actionButtonText="'Create new group'" :actionButtonLink="'/auth/groups/newGroup'" />

                    <!-- Smart groups dropdown -->
                    <div v-if="displaySmartGroupsDropdown">
                        <DropdownPanel
                            :dropdownHeading="'Smart auto-groups'"
                            :dropdownDescription="'Auto-grouping based on similarities.'"
                            :dropdownStats="Object.keys(smartGroups).length + 'x'"
                            :dropdownIcon="'🎩'"
                            :initiallyOpen="true"
                            :flexContainer="true"
                        >
                            <GroupPanel v-for="group in smartGroups" :key="group.groupId" :displayMembers="true" :groupData="group" />
                        </DropdownPanel>
                    </div>

                    <!-- Custom groups dropdown -->
                    <div v-if="displayCustomGroupsDropdown">
                        <DropdownPanel
                            :dropdownHeading="'Your custom groups'"
                            :dropdownDescription="'All your manually created groups.'"
                            :dropdownStats="Object.keys(customGroups).length + 'x'"
                            :dropdownIcon="'📖'"
                            :flexContainer="true"
                            :initiallyOpen="true"
                        >
                            <GroupPanel v-for="group in customGroups" :key="group.groupId" :displayMembers="true" :groupData="group" />
                        </DropdownPanel>
                    </div>

                    <!-- Filters -->
                    <div v-else-if="!displaySmartGroupsDropdown" class="groupList__noResults">
                        <!-- Filtered groups result (mix of smart and custom groups) -->
                        <div v-if="countFilteredItems > 0 && currentFilterTerm != ''" class="groupList__groups">
                            <GroupPanel v-for="group in filterItems" :key="group.groupId" :displayMembers="true" :groupData="group" />
                        </div>

                        <!-- No results -->
                        <div v-else>
                            <h1 v-if="currentFilterTerm == ''" class="gray">You don't have any contact groups yet. It's time to create some.</h1>
                            <h1 v-else class="gray">This filter does not match any of your groups.</h1>
                            <img src="~/assets/images/power_standing.png" />
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";
import { useSmartGroups } from "~/composables/useSmartGroups";

definePageMeta({
    middleware: ["is-authenticated"],
});

// allGroups contains all groups, both smart and custom (use for filtering)
const allGroups = ref({});

// smartGroups contains only smart groups
const smartGroups = ref({});
const customGroups = ref({});

const { currentFilterTerm, filterItems, countFilteredItems, setFilter, setFilterBy } = useFilters(allGroups);
const { generateSmartGroups } = useSmartGroups();

const displaySmartGroupsDropdown = computed(() => {
    return currentFilterTerm.value == "" && Object.keys(smartGroups.value).length > 0;
});

const displayCustomGroupsDropdown = computed(() => {
    return countFilteredItems.value > 0 && currentFilterTerm.value == "" && countFilteredItems.value != Object.keys(smartGroups.value).length > 0;
});

const filterOnlyCustomGroups = () => {
    const customGroups = {};

    for (const group in allGroups.value) {
        if (Object.hasOwn(allGroups.value[group], "isSmartGroup") == false || allGroups.value[group].isSmartGroup == false) {
            customGroups[group] = allGroups.value[group];
        }
    }

    return customGroups;
};

onMounted(() => {
    allGroups.value = store.state.userData.groups;
    smartGroups.value = generateSmartGroups(store.state.userData.contactDataPresets);
    customGroups.value = filterOnlyCustomGroups();
    setFilterBy(["groupName"]);

    store.subscribe((mutation) => {
        if (mutation.type == "deleteGroup" || mutation.type == "createGroup") {
            allGroups.value = store.state.userData.groups;
            customGroups.value = filterOnlyCustomGroups();
        }

        // On data preset update, regenerate smart groups
        if (mutation.type == "updateContactDataPresets") {
            const currentStoreGroups = store.state.userData.groups;

            // Delete all current smart groups
            for (const group in currentStoreGroups) {
                if (Object.hasOwn(allGroups.value[group], "isSmartGroup") && allGroups.value[group].isSmartGroup == true) {
                    delete currentStoreGroups[group];
                }
            }

            // Generate new smart groups
            smartGroups.value = generateSmartGroups(store.state.userData.contactDataPresets);

            // Update list of all groups
            allGroups.value = store.state.userData.groups;
        }
    });
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.groupList {
    &__groups {
        margin-top: 20px;
        padding-bottom: 35px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        opacity: 1;
        transition: all 0.35s ease-in-out !important;
    }

    &__groups.collapsing {
        display: flex !important;
        padding-bottom: 0px;
        opacity: 0;
    }

    &__groups.show {
        opacity: 1;
    }

    &__groups.hide {
        opacity: 0;
    }

    &__noResults {
        margin-top: 50px;
        text-align: center;

        img {
            width: 60%;
            opacity: 50%;
        }

        h1 {
            text-align: left;
        }
    }
}
</style>
