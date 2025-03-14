<template>
    <DropdownPanel :dropdownHeading="dropDownHeading" :dropdownDescription="dropdownDescription" :dropdownStats="dropDownStats" :dropdownIcon="dropDownIcon" :initiallyOpen="initiallyOpen">
        <div v-for="item in scrapedData" :key="item.id" class="scrapingResults__item scrapingResults__item--flex">
            <div class="scrapingResults__item--image">
                <img v-if="item.isFile" src="~/assets/images/folderIcon.png" />

                <div v-else-if="item.previewImage" class="scrapingResults__item--image--wrapper">
                    <img :src="item.previewImage" onerror="this.style.display='none'" />
                </div>

                <img v-else src="~/assets/images/website.png" />
            </div>

            <div class="scrapingResults__item--webContent">
                <p class="bold scrapingResults__item--headline medium">{{ getItemTitle(item) }}</p>
                <p class="medium2">{{ item.displayLink }}</p>
                <p class="medium2">{{ item.summary }}</p>

                <a :href="item.link" target="_blank">
                    <div @touchstart="highLight" @touchend="unhighLight">
                        <p class="externalButton medium2 bold"><img src="~/assets/icons/globe.svg" /> Open {{ item.isFile ? " file" : "" }}</p>
                    </div>
                </a>

                <p class="small scrapingResults__item--source">Sourceee: {{ item.source }}</p>

                <div class="scrapingResults__item--buttons">
                    <p @click="saveFunction(item)">
                        <img v-if="!item.saved" src="~/assets/icons/save.svg" />
                        <img v-else src="~/assets/icons/success_checkmark.svg" />
                        {{ getSaveButtonTextFunction(item) }}
                    </p>
                </div>
            </div>
        </div>
    </DropdownPanel>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
const { highlightButton, unhighlightButton } = useButton("button--active", false);

defineProps({
    dropDownHeading: {
        type: String,
        required: true,
    },

    dropdownDescription: {
        type: String,
        required: false,
        default: "",
    },

    dropDownStats: {
        type: String,
        required: true,
    },

    dropDownIcon: {
        type: String,
        required: true,
    },

    initiallyOpen: {
        type: Boolean,
        required: false,
        default: false,
    },

    scrapedData: {
        type: Object,
        required: true,
    },

    saveFunction: {
        type: Function,
        required: true,
    },

    getSaveButtonTextFunction: {
        type: Function,
        required: true,
    },
});

const getItemTitle = (item) => {
    if (item.isFile) {
        return item.title + " - " + item.fileExtension;
    } else {
        return item.title;
    }
};

const highLight = (event) => {
    highlightButton(event);
    Haptics.impact({ style: ImpactStyle.Light });
};

const unhighLight = (event) => {
    unhighlightButton(event);
};
</script>
