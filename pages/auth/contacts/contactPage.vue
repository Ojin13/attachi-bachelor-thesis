<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding" :scroll-events="true" @ionScroll="updateScrollDepth">
            <QuickActionButton
                :pageTarget="'/auth/contacts/chatBot'"
                :redirectQueryParams="{ contactID: contactBasicData.id, completeness: calculateContactCompleteness() }"
                :scrollActivationPoint="500"
                :currentScrollDepth="currentScrollDepth"
            />

            <div class="screenContainer">
                <NavigationPanel
                    :displayLeftIcon="true"
                    :navigationTitle="contactBasicData.name"
                    :navigationDesc="'Contact page'"
                    :leftIconURL="contactBasicData.profilePic != undefined ? contactBasicData.profilePic.url : ''"
                    :isSticky="true"
                    :currentScrollDepth="currentScrollDepth"
                    :scrollActivationPoint="50"
                />

                <GoBackButtonBig :backLocation="'/auth/contacts'" />

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
                    <EntityHeader :contactId="contactBasicData.id" :showContactGroups="true" />

                    <SocialNetworks :dataPresets="contactDataPresets" />

                    <div class="detailPage__actionButtons">
                        <div class="detailPage__actionButtons--button" @click="contactActionButtonClicked('/auth/contacts/scraper')">
                            <IconButton :iconType="'globe'" :buttonText="'Gather online info'" />
                        </div>

                        <div class="detailPage__actionButtons--button" @click="contactActionButtonClicked('/auth/contacts/chatBot')">
                            <IconButton :iconType="'magic'" :buttonText="'Analyze with AI'" />
                        </div>
                    </div>

                    <div class="detailPage--progressSection">
                        <p class="bold progressContainer__header">🧠 Contact progress</p>
                        <div class="progressContainer">
                            <ProgressBar :big="true" :progressPercentage="calculateContactCompleteness()" />
                        </div>
                    </div>

                    <div class="detailPage__data">
                        <!-- Search results -->
                        <PresetSearchResults :updateFunction="updateContactDataPreset" :contactId="contactBasicData.id" @filterActive="setFilterStatus" />

                        <LoaderLocal :isActive="!showPresets" :loadingText="'Loading contact'" />

                        <!-- Normal ordering -->
                        <div v-if="!filterIsActive && showPresets">
                            <CustomNotes :contactId="contactBasicData.id" />
                            <ContactOnlyKnownData :contactId="contactBasicData.id" :updateFunction="updateContactDataPreset" />
                            <DataPresets :contactId="contactBasicData.id" :updateFunction="updateContactDataPreset" />
                        </div>
                    </div>

                    <ConfirmTab ref="confirmationTab" @confirmAction="customConfirmationAction">
                        <div class="detailPage__deleteEntity" @click="requestContactDeletion()">
                            <div class="detailPage__deleteEntity--icon">
                                <img src="~/assets/icons/delete-user.svg" alt="Delete icon" />
                            </div>
                            <p>Delete this contact</p>
                        </div>
                    </ConfirmTab>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { store } from "~/store";

definePageMeta({
    middleware: ["is-authenticated"],
});

const contactBasicData = ref({});
const contactDataPresets = ref({});
const filterIsActive = ref(false);
const showPresets = ref(false);
const currentScrollDepth = ref(0);

// Element reference
const confirmationTab = ref(null);

/* Composables */
const { pushToStack, getCurrentRoute, popFromStack } = useIonicRouter();
const { calculateContactCompleteness } = useDataPresets(contactDataPresets);
const { updateContactBasicDataStore, deleteContact, updateContactDataPreset } = useContactManagement(contactBasicData, contactDataPresets);
const { addNewContactImage, deleteContactImage, downloadContactImages, moveProfilePicToStart, updateProfilePicture } = useContactImages(contactBasicData);

const requestContactDeletion = () => {
    Haptics.impact({ style: ImpactStyle.Heavy });
    confirmationTab.value.setConfirmationTabData(
        "Are you sure you want to delete this contact?",
        "Once you delete this contact, all it's data will be permanently deleted and it won't be possible to recover them. Are you sure?",
        "deleteContact",
    );
};

const contactActionButtonClicked = (location) => {
    Haptics.impact({ style: ImpactStyle.Light });
    pushToStack({ path: location, query: { contactID: contactBasicData.value.id } });
};

const updateScrollDepth = async (event) => {
    const scrollElement = await event.target.getScrollElement();
    currentScrollDepth.value = scrollElement.scrollTop;
};

const setFilterStatus = (status) => {
    filterIsActive.value = status;
};

const customConfirmationAction = (confirmAction) => {
    if (confirmAction == "deleteContact") {
        deleteContact(contactBasicData.value.id);
    }
};

onMounted(() => {
    downloadContactImages();
    moveProfilePicToStart();

    // Show Presets and custom notes only after page transition is done.
    // This greatly speeds up the initial page load and prevent lags.
    setTimeout(() => {
        showPresets.value = true;
    }, 500);
});

onBeforeMount(() => {
    const route = getCurrentRoute();
    if (route.query.contactID == undefined) {
        console.error("No contact ID provided in route params.");
        popFromStack("/auth/contacts");
    } else {
        // Load Contact Basic Data
        contactBasicData.value = store.state.userData.contacts[route.query.contactID];
        updateContactBasicDataStore();

        // Load Data Presets
        if (store.state.userData.contactDataPresets[contactBasicData.value.id]) {
            contactDataPresets.value = store.state.userData.contactDataPresets[contactBasicData.value.id];
        }
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.saveNoteButton {
    display: inline-block;
    border-radius: $default-border-radius;
    padding: 8px 22px;
    margin-bottom: 5px;
    color: $primary-text-color !important;
    text-decoration: none;
    margin-top: 5px;
    background: -webkit-linear-gradient(0deg, #90bf74, #a4bf74);
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}

.notePlaceholder {
    &::placeholder {
        color: $secondary-text-color;
        font-weight: normal;
    }
}
</style>
