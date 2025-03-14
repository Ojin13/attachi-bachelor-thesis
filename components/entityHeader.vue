<template>
    <div class="entityHeader">
        <!-- Entity name input -->
        <div class="detailPage__name">
            <AutoExpandtextArea
                :bottomOffset="35"
                :initialValue="contactBasicData.name"
                :customClasses="'textInput__clear large bold'"
                :inputPlaceholder="'Contact name'"
                @updateFunction="updateName($event)"
            />
        </div>

        <!-- Entity groups -->
        <div v-if="showContactGroups" class="detailPage__groups">
            <p v-for="group in smartFilterContactGroups" :key="group.groupId" class="detailPage__groups--group" @click="openGroup(group)">
                {{ group.groupName }}
            </p>
            <p v-if="Object.keys(getContactGroups).length == 0" class="detailPage__groups--group">No groups</p>
        </div>

        <!-- Entity description input -->
        <div class="detailPage__desc">
            <p class="detailPage__desc--header bold">Short description of this person</p>
            <AutoExpandtextArea
                :bottomOffset="20"
                :initialValue="contactBasicData.description"
                :customClasses="'textInput__clear gray'"
                :inputPlaceholder="'Conctact description'"
                @updateFunction="updateDesc($event)"
            />
        </div>
    </div>

    <GroupModal :groupID="modalGroupID" />
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { store } from "~/store";

const props = defineProps({
    contactId: {
        type: String,
        required: true,
    },
    showContactGroups: {
        type: Boolean,
        default: false,
        required: false,
    },
    triggerGroupModal: {
        type: Boolean,
        required: false,
        default: true,
    },
});

const contactBasicData = ref({});
const modalGroupID = ref(null);
const { updateContactBasicData } = useContactManagement(contactBasicData);
const { getContactGroups } = useContactGroups(props.contactId);

const updateName = (name) => {
    contactBasicData.value.name = name;
    updateContactBasicData("name", name);
};

const smartFilterContactGroups = computed(() => {
    let filteredGroups = [];
    let allGroups = getContactGroups.value;
    let customGroups = [];
    let smartGroups = [];

    for (let group in allGroups) {
        if (!allGroups[group].isSmartGroup) {
            customGroups.push(allGroups[group]);
        } else {
            smartGroups.push(allGroups[group]);
        }
    }

    if (customGroups.length >= 5) {
        filteredGroups = customGroups;
    } else {
        filteredGroups = customGroups;

        // Cap max shown smart groups to 5
        for (let i = 0; i < smartGroups.length; i++) {
            if (filteredGroups.length >= 5) {
                break;
            }

            filteredGroups.push(smartGroups[i]);
        }
    }

    return filteredGroups;
});

const updateDesc = (desc) => {
    contactBasicData.value.description = desc;
    updateContactBasicData("desc", desc);
};

const openGroup = (group) => {
    if (!props.triggerGroupModal) {
        return;
    }

    Haptics.impact({ style: ImpactStyle.Light });

    // Reset the value to trigger change in watch
    modalGroupID.value = null;
    setTimeout(() => {
        modalGroupID.value = group.groupId;
    });
};

onMounted(() => {
    contactBasicData.value = store.state.userData.contacts[props.contactId];
});
</script>
