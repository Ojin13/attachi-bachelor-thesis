<template>
    <ion-modal :is-open="isOpen" :initial-breakpoint="0.75" :breakpoints="[0, 0.75, 1]" @didDismiss="modalDismissed">
        <ion-content class="ion-padding">
            <ImageSlider
                ref="contactImageSlider"
                :sliderImages="contactBasicData.pictures"
                :profilePictureObject="contactBasicData.profilePic"
                :contactID="contactBasicData.id"
                :deleteImageFunction="deleteContactImage"
                :newProfilePictureFunction="updateProfilePicture"
                :newImageAddedFunction="addNewContactImage"
            />

            <div class="pageContainer detailPage pageContainer--noTop">
                <EntityHeader :triggerGroupModal="false" :contactId="contactBasicData.id" :showContactGroups="true" />

                <div class="detailPage--progressSection">
                    <p class="bold progressContainer__header">🧠 Contact progress</p>
                    <div class="progressContainer">
                        <ProgressBar :big="true" :progressPercentage="calculateContactCompleteness()" />
                    </div>
                </div>

                <div class="detailPage__data">
                    <CustomNotes :contactId="contactBasicData.id" />
                    <ContactOnlyKnownData :contactId="contactBasicData.id" :updateFunction="updateContactDataPreset" />
                    <DataPresets :contactId="contactBasicData.id" :updateFunction="updateContactDataPreset" />
                </div>
            </div>
        </ion-content>
    </ion-modal>
</template>

<script setup>
import { store } from "~/store";

const props = defineProps({
    contactId: {
        type: String,
        required: true,
    },
});

const isOpen = ref(false);
const contactBasicData = ref({});
const contactDataPresets = ref({});

const { calculateContactCompleteness } = useDataPresets(contactDataPresets);
const { updateContactDataPreset } = useContactManagement(contactBasicData, contactDataPresets);

const { addNewContactImage, deleteContactImage, downloadContactImages, moveProfilePicToStart, updateProfilePicture } = useContactImages(contactBasicData);

watch(
    () => props.contactId,
    (newValue) => {
        if (newValue) {
            openContact();
        }
    },
);

const openContact = () => {
    contactBasicData.value = store.state.userData.contacts[props.contactId];
    contactDataPresets.value = store.state.userData.contactDataPresets[props.contactId];
    downloadContactImages();
    moveProfilePicToStart();
    isOpen.value = true;
};

const modalDismissed = () => {
    isOpen.value = false;
};
</script>

<style lang="scss">
@use "sass:math";
@import "/assets/sass/variables";

:host(.modal-sheet) .modal-wrapper {
    border-top-left-radius: 25px !important;
    border-top-right-radius: 25px !important;
}
</style>
