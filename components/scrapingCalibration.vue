<template>
    <div v-if="displayConfirmation">
        <div class="scraper__calibration">
            <div v-if="dataForConfirmation[currentIndex].image">
                <div v-if="dataForConfirmation[currentIndex].image" class="scraper__calibration__image" :style="{ backgroundImage: 'url(' + dataForConfirmation[currentIndex].image + ')' }">
                    <!-- Found image -->
                </div>

                <div v-else class="scraper__calibration__image">
                    <!-- Default image -->
                </div>
            </div>

            <div class="scraper__calibration__text">
                <p class="bold scraper__calibration__text--heading">Is this the right person?</p>
                <p class="gray medium">{{ dataForConfirmation[currentIndex].title }}</p>

                <div class="scraper__calibration__text__buttons">
                    <div class="scraper__calibration__text__buttons--wrapper" @click="confirmProfile()" @touchstart="highLight" @touchend="unhighLight">
                        <p class="bold">Yes</p>
                    </div>
                    <div class="scraper__calibration__text__buttons--wrapper" @click="nextOne()" @touchstart="highLight" @touchend="unhighLight">
                        <p class="bold">No</p>
                    </div>
                </div>

                <a v-if="false" target="_blank" :href="dataForConfirmation[currentIndex].link">Open</a>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const { highlightButton, unhighlightButton } = useButton("button--active", false);
const emit = defineEmits(["dataConfirmed", "noMatch"]);
const props = defineProps({
    displayConfirmation: {
        type: Boolean,
        required: true,
        default: true,
    },
    dataForConfirmation: {
        type: Array,
        required: true,
        default() {
            return [];
        },
    },
});

const currentIndex = ref(0);

const nextOne = () => {
    if (currentIndex.value < props.dataForConfirmation.length - 1) {
        currentIndex.value++;
    } else {
        emit("noMatch");
        currentIndex.value = 0;
    }
};

const confirmProfile = () => {
    emit("dataConfirmed", props.dataForConfirmation[currentIndex.value].link);
    currentIndex.value = 0;
};

const highLight = (event) => {
    highlightButton(event);
    Haptics.impact({ style: ImpactStyle.Light });
};

const unhighLight = (event) => {
    unhighlightButton(event);
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.scraper {
    &__calibration {
        display: flex;

        &__image {
            background-color: $placeholder-action-color;
            $image-preview-size: 150px;
            flex-shrink: 0;
            background-image: url("~/assets/images/people.png");
            width: $image-preview-size;
            height: $image-preview-size;
            border-radius: $default-border-radius;
        }

        &__text {
            padding-left: 12px;

            p {
                margin-bottom: 5px;
            }

            &__buttons {
                margin-top: 20px;
                display: flex;

                &--wrapper {
                    margin-right: 20px;
                }

                p {
                    text-align: center;
                    min-width: 70px;
                    padding: 8px 15px;
                    border-radius: $default-border-radius;
                    background-color: $placeholder-action-color;
                }
            }
        }
    }
}
</style>
