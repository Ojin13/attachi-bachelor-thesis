<template>
    <div class="groupPanel">
        <div class="groupPanel__content" @click="openGroup()">
            <div class="groupPanel__content__image" :class="[getCustomClasses]">
                <!-- image -->
            </div>

            <div class="groupPanel__content__info">
                <div class="groupPanel__content__info--top">
                    <p class="bold large2">{{ groupData.groupName }}</p>

                    <div class="groupPanel__content__info--desc">
                        <p class="medium2">{{ groupData.groupDesc }}</p>
                    </div>
                </div>

                <!-- Group members preview -->
                <div v-if="displayMembers" class="groupPanel__content__info__members">
                    <div v-for="contactID in getPreviewMembers" :key="contactID" class="groupPanel__content__info__members--member">
                        <img :src="getProfilePictureByContactID(contactID)" />
                    </div>

                    <div v-if="getNumberOfMembers > numberOfPreviewMembers" class="groupPanel__content__info__members--others">
                        <p class="medium">+{{ getNumberOfMembers - numberOfPreviewMembers }}</p>
                    </div>
                </div>

                <div v-if="displayAddToGroup">
                    <p class="groupPanel__content__info--addToGroup bold medium">Add to group</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const { pushToStack } = useIonicRouter();
const { getProfilePictureByContactID } = useContactManagement(null, null);

const props = defineProps({
    groupData: {
        type: Object,
        required: true,
    },
    displayMembers: {
        type: Boolean,
        required: true,
        default: true,
    },
    displayAddToGroup: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const numberOfPreviewMembers = ref(3);

const openGroup = () => {
    Haptics.impact({ style: ImpactStyle.Light });
    pushToStack({ path: "/auth/groups/groupPage", query: { groupID: props.groupData.groupId } });
};

const getNumberOfMembers = computed(() => {
    return Object.keys(props.groupData.groupMembers).length;
});

const getPreviewMembers = computed(() => {
    return props.groupData.groupMembers.slice(0, numberOfPreviewMembers.value);
});

const getCustomClasses = computed(() => {
    if (!props.groupData.isSmartGroup) {
        return "";
    }

    let customClasses = ["groupPanel__content__image--fullsize"];

    switch (props.groupData.groupId) {
        // Element according to zodiac sign
        case "AirElementGroup":
            customClasses.push("groupPanel__content__image--air");
            return customClasses;
        case "EarthElementGroup":
            customClasses.push("groupPanel__content__image--earth");
            return customClasses;
        case "FireElementGroup":
            customClasses.push("groupPanel__content__image--fire");
            return customClasses;
        case "WaterElementGroup":
            customClasses.push("groupPanel__content__image--water");
            return customClasses;

        default:
            return "";
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.groupPanel {
    width: 47%;
    min-height: 80px;
    text-align: left;
    background-color: $secondary-action-color;
    border-radius: $default-border-radius;
    margin-bottom: 20px;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);

    &__content {
        height: 100%;

        &__image {
            width: 100%;
            height: 125px;
            flex-shrink: 0;
            background-color: $placeholder-action-color;
            border-radius: $default-border-radius;
            background-image: url("../assets/images/people.png");
            background-position: center;
            background-size: 75%;

            &--fullsize {
                background-size: 100%;
            }

            &--air {
                background-image: url("../assets/images/smartGroups/airElement.webp");
            }

            &--earth {
                background-image: url("../assets/images/smartGroups/earthElement.webp");
            }

            &--fire {
                background-image: url("../assets/images/smartGroups/fireElement.webp");
            }

            &--water {
                background-image: url("../assets/images/smartGroups/waterElement.webp");
            }
        }

        &__info {
            display: flex;
            flex-wrap: wrap;
            align-content: space-between;
            padding: 12px;
            height: calc(100% - 125px);

            h2 {
                margin-bottom: 0px;
            }

            &--top {
                width: 100%;
                margin-bottom: 5px;

                p {
                    margin-bottom: 2px;
                }
            }

            &--desc {
                display: flex;
                color: $focus-text-color;

                p {
                    margin-bottom: 0px;
                }
            }

            &--addToGroup {
                color: $primary-action-color;
                margin-bottom: 0px;
                margin-top: 5px;
            }

            &__members {
                display: flex;
                align-items: center;
                margin-top: 5px;

                &--member {
                    margin-right: 5px;

                    img {
                        $preview-image-size: 25px;
                        width: $preview-image-size;
                        height: $preview-image-size;
                        object-fit: cover;
                        border-radius: $default-border-radius;
                        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
                    }
                }

                &--others {
                    p {
                        margin-bottom: 0px;
                    }
                }
            }
        }
    }
}
</style>
