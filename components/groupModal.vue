<template>
    <ion-modal ref="modal" :is-open="isOpen" :initial-breakpoint="0.75" :breakpoints="[0, 0.75, 1]" @didDismiss="modalDismissed">
        <ion-content class="ion-padding">
            <div class="detailPage__image detailPage__image--low detailPage__image--groupPlaceholder">
                <!-- Group default image -->
            </div>

            <div class="pageContainer detailPage pageContainer">
                <div class="detailPage__name">
                    <h1>{{ groupData.groupName }}</h1>
                </div>

                <div class="detailPage__desc">
                    <p>{{ groupData.groupDesc }}</p>
                </div>

                <div v-if="Object.keys(membersOfGroup).length > 0" class="detailPage__data--contacts">
                    <ContactPanel v-for="contact in membersOfGroup" :key="contact.id" :allowClickEvent="false" :showIcon="false" :contactData="contact" />
                </div>

                <div v-else class="groupList__noResults">
                    <h1 class="gray">This group has no members. It's time to add some.</h1>
                    <img src="~/assets/images/working_on_smartphone.png" />
                </div>
            </div>
        </ion-content>
    </ion-modal>
</template>

<script setup>
import { store } from "~/store";

const props = defineProps({
    groupID: {
        type: String,
        required: true,
    },
});

const isOpen = ref(false);
const groupData = ref({});
const contactList = ref({});

watch(
    () => props.groupID,
    (newValue) => {
        if (newValue) {
            openGroup();
        }
    },
);

const openGroup = () => {
    groupData.value = store.state.userData.groups[props.groupID];
    isOpen.value = true;
};

const modalDismissed = () => {
    isOpen.value = false;
};

const membersOfGroup = computed(() => {
    let members = {};

    if (groupData.value.groupMembers === undefined) {
        return members;
    }

    for (const key in contactList.value) {
        if (groupData.value.groupMembers.includes(contactList.value[key].id)) {
            members[contactList.value[key].id] = contactList.value[key];
        }
    }
    return members;
});

onBeforeMount(() => {
    contactList.value = store.state.userData.contacts;
});
</script>
