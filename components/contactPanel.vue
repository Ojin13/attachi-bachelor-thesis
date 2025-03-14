<template>
    <div ref="contactPanel" class="contactPanel" @click="openContact()">
        <div class="contactPanel__content">
            <div class="contactPanel__content__imageContainer">
                <div v-if="getProfilePicture()" class="contactPanel__content__image" :style="{ backgroundImage: 'url(' + getProfilePicture() + ')' }">
                    <!-- Custom contact image -->
                </div>

                <div v-else-if="showOnlyLoading || contactData.pictures.length != 0" class="contactPanel__content__image placeholder-loading">
                    <!-- Loading image indicator -->
                </div>

                <div v-else class="contactPanel__content__image contactPanel__content__image--placeholder">
                    <!-- Placeholder image -->
                </div>
            </div>

            <div class="contactPanel__content__info">
                <div class="contactPanel__content__info__header">
                    <p class="bold large2 contactPanel__content__info__header--name">{{ getContactName }}</p>

                    <div v-if="showIcon" :class="headerIconClasses" class="contactPanel__content__info__header--icon" @click="iconClicked()">
                        <!--Icon-->
                    </div>
                </div>

                <!-- Progress bar -->
                <div v-if="!showOnlyLoading" class="progressContainer contactPanel__content__info--progress">
                    <ProgressBar :changeColors="true" :progressPercentage="calculateContactCompleteness()" />
                </div>

                <SocialNetworks v-if="showSocials" :smallIcons="true" :centerIcons="false" :showHeading="false" :dataPresets="contactDataPresets" />

                <div class="contactPanel__content__info--desc">
                    <p class="medium2">{{ generateContactSummary(contactData) }}</p>
                </div>
                <div v-if="showGroups && groupsAreAvailable" class="contactPanel__content__info__groupList">
                    <div v-for="group in getContactGroups" :key="group.groupId">
                        <p v-if="!group.isSmartGroup && group.groupName != ''" class="medium2 bold contactPanel__content__info__group">
                            {{ group.groupName }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { store } from "~/store";

const emit = defineEmits(["headerIconClicked"]);
const props = defineProps({
    contactData: {
        type: Object,
        required: true,
    },

    showIcon: {
        type: Boolean,
        required: false,
        default: false,
    },

    allowClickEvent: {
        type: Boolean,
        required: false,
        default: true,
    },

    headerIconClasses: {
        type: String,
        required: false,
        default: "",
    },

    showGroups: {
        type: Boolean,
        required: false,
        default: true,
    },

    showOnlyLoading: {
        type: Boolean,
        required: false,
        default: false,
    },

    showSocials: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const profilePicture = ref({ url: "", media_name: "" });
const contactDataPresets = ref({});

const { pushToStack } = useIonicRouter();
const { generateContactSummary, calculateContactCompleteness } = useDataPresets(contactDataPresets);
const { getContactGroups } = useContactGroups(props.contactData.id);

const openContact = () => {
    if (props.allowClickEvent) {
        Haptics.impact({ style: ImpactStyle.Light });
        pushToStack({ path: "/auth/contacts/contactPage", query: { contactID: props.contactData.id } });
    }
};

const iconClicked = () => {
    Haptics.impact({ style: ImpactStyle.Light });
    emit("headerIconClicked");
};

const getContactName = computed(() => {
    if (!props.contactData.name && !props.showOnlyLoading) {
        return "No contact name provided";
    }

    if (!props.contactData.name) {
        return "";
    }

    const maxLength = 50;
    return props.contactData.name.length > maxLength ? props.contactData.name.substring(0, maxLength) + "..." : props.contactData.name;
});

const groupsAreAvailable = () => {
    if (!store.state.userData.groups) {
        return false;
    }

    return Object.keys(store.state.userData.groups).length > 0;
};

const getProfilePicture = () => {
    if (!profilePicture.value) {
        return "";
    }
    return profilePicture.value.url;
};

onMounted(() => {
    contactDataPresets.value = store.state.userData.contactDataPresets[props.contactData.id];

    if (props.contactData.profilePic) {
        if (props.contactData.profilePic.url) {
            profilePicture.value = props.contactData.profilePic;
        }
    }

    // Subscribe to store updates in order to detect changes in contact
    store.subscribe((mutation) => {
        if (mutation.type == "updateContactData") {
            if (mutation.payload.id == props.contactData.id) {
                profilePicture.value = mutation.payload.contactData.profilePic;
            }
        }

        if (mutation.type == "updateContactDataPresets") {
            if (mutation.payload.id == props.contactData.id) {
                // Needed to update progress bar
                contactDataPresets.value = mutation.payload.presets;
            }
        }
    });
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.contactPanel {
    width: 100%;
    min-height: 80px;
    background: -webkit-linear-gradient(223deg, $secondary-action-color, #fff9c6);
    border-radius: $default-border-radius;
    padding: 6px;
    margin-bottom: 15px;
    border-top: 1px solid $placeholder-action-color;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

    &__content {
        display: flex;

        &__imageContainer {
            display: flex;
            // align-items: center;
            border-right: 1px solid $placeholder-action-color;
            padding-right: 10px;
        }

        &__image {
            width: 100px;
            height: 100px;
            flex-shrink: 0;
            background-color: $placeholder-action-color;
            border-radius: $default-border-radius;

            &--placeholder {
                background-image: url("../assets/images/person.png");
                background-size: 100%;
                background-repeat: no-repeat;
                background-position: center;
            }
        }

        &__info {
            padding-left: 20px;
            width: 100%;

            &--progress {
                margin-bottom: 3px;
            }

            &__header {
                display: flex;
                justify-content: space-between;

                &--name {
                    margin-top: 5px;
                    margin-bottom: 5px;
                }

                &--icon {
                    width: 40px;
                    height: 20px;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' id='Layer_2' data-name='Layer 2' width='512' height='512' viewBox='0 0 24 24'%3E%3Cpath d='M19,7a1,1,0,0,0-1,1V19.191A1.92,1.92,0,0,1,15.99,21H8.01A1.92,1.92,0,0,1,6,19.191V8A1,1,0,0,0,4,8V19.191A3.918,3.918,0,0,0,8.01,23h7.98A3.918,3.918,0,0,0,20,19.191V8A1,1,0,0,0,19,7Z'/%3E%3Cpath d='M20,4H16V2a1,1,0,0,0-1-1H9A1,1,0,0,0,8,2V4H4A1,1,0,0,0,4,6H20a1,1,0,0,0,0-2ZM10,4V3h4V4Z'/%3E%3Cpath d='M11,17V10a1,1,0,0,0-2,0v7a1,1,0,0,0,2,0Z'/%3E%3Cpath d='M15,17V10a1,1,0,0,0-2,0v7a1,1,0,0,0,2,0Z'/%3E%3C/svg%3E%0A");
                    background-size: 18px;
                    background-position: right;
                }

                .remove {
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' id='Layer_2' data-name='Layer 2' width='512' height='512' viewBox='0 0 24 24'%3E%3Cpath d='M19,7a1,1,0,0,0-1,1V19.191A1.92,1.92,0,0,1,15.99,21H8.01A1.92,1.92,0,0,1,6,19.191V8A1,1,0,0,0,4,8V19.191A3.918,3.918,0,0,0,8.01,23h7.98A3.918,3.918,0,0,0,20,19.191V8A1,1,0,0,0,19,7Z'/%3E%3Cpath d='M20,4H16V2a1,1,0,0,0-1-1H9A1,1,0,0,0,8,2V4H4A1,1,0,0,0,4,6H20a1,1,0,0,0,0-2ZM10,4V3h4V4Z'/%3E%3Cpath d='M11,17V10a1,1,0,0,0-2,0v7a1,1,0,0,0,2,0Z'/%3E%3Cpath d='M15,17V10a1,1,0,0,0-2,0v7a1,1,0,0,0,2,0Z'/%3E%3C/svg%3E%0A");
                }

                .add {
                    background-image: url("data:image/svg+xml,%3Csvg id='Capa_1' enable-background='new 0 0 24 24' height='512' viewBox='0 0 24 24' width='512' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='_x33_'%3E%3Cpath d='m18 2c2.206 0 4 1.794 4 4v12c0 2.206-1.794 4-4 4h-12c-2.206 0-4-1.794-4-4v-12c0-2.206 1.794-4 4-4zm0-2h-12c-3.314 0-6 2.686-6 6v12c0 3.314 2.686 6 6 6h12c3.314 0 6-2.686 6-6v-12c0-3.314-2.686-6-6-6z'/%3E%3C/g%3E%3Cg id='_x32_'%3E%3Cpath d='m12 18c-.552 0-1-.447-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10c0 .553-.448 1-1 1z'/%3E%3C/g%3E%3Cg id='_x31_'%3E%3Cpath d='m6 12c0-.552.447-1 1-1h10c.552 0 1 .448 1 1s-.448 1-1 1h-10c-.553 0-1-.448-1-1z'/%3E%3C/g%3E%3C/svg%3E");
                }
            }

            h2 {
                margin-bottom: 5px;
            }

            &__groupList {
                display: flex;
                flex-wrap: wrap;
                margin-top: 5px;
            }

            &__group {
                border: 1px solid #a9a68a;
                border-radius: $default-border-radius;
                background-color: $placeholder-action-color;
                padding: 2px 5px;
                margin-right: 5px;
                margin-bottom: 2px;
                margin-top: 5px;
                text-align: center;
            }

            &--desc {
                display: flex;
                color: $focus-text-color;

                p {
                    margin-bottom: 0px;
                    margin-top: 2px;
                }
            }
        }
    }
}
</style>
