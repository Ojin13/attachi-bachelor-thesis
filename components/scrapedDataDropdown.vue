<template>
    <DropdownPanel :dropdownHeading="'Specific information'" :dropdownDescription="'Details that might be useful'" :dropdownStats="dropdownStats" :dropdownIcon="'🔗'" :initiallyOpen="false">
        <div class="scrapingResults__proxyCurl--list">
            <div v-for="scrapedItem in scrapedData" :key="scrapedItem.id" class="scrapingResults__item">
                <div class="detailPage__data__preset__questionPanel--sideLine">
                    <!-- Side line -->
                </div>

                <p class="bold scrapingResults__item--headline medium">{{ scrapedItem.name }}</p>

                <div class="scrapingResults__item--content">
                    <div>
                        <AutoExpandtextArea
                            v-if="!scrapedItem.isTrueFalseItem"
                            :allowInput="scrapedItem.saved ? false : true"
                            :bottomOffset="20"
                            :initialValue="scrapedItem.value"
                            :customClasses="'textInput__clear answer medium2' + (scrapedItem.saved ? ' gray' : '')"
                            :inputPlaceholder="'Add answer'"
                            @updateFunction="updateAnswer($event, scrapedItem)"
                        />

                        <TrueFalseInput v-else :currentQuestion="scrapedItem" :questionID="scrapedItem.id" :preset="scrapedItem" @updateFunction="updateAnswer($event, scrapedItem)" />

                        <a v-if="scrapedItem.isURL == true" :href="scrapedItem.value" target="_blank">
                            <div @touchstart="highLight" @touchend="unhighLight">
                                <p class="externalButton medium2 bold"><img src="~/assets/icons/globe.svg" /> Open</p>
                            </div>
                        </a>

                        <p class="small scrapingResults__item--source">
                            <img src="~/assets/icons/globe.svg" />
                            Source: {{ scrapedItem.source }}
                        </p>
                    </div>

                    <div class="scrapingResults__item--buttons">
                        <p @click="saveFunction(scrapedItem)">
                            <img v-if="!scrapedItem.saved" src="~/assets/icons/save.svg" />
                            <img v-else src="~/assets/icons/success_checkmark.svg" />
                            {{ getSaveButtonTextFunction(scrapedItem) }}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </DropdownPanel>
</template>

<script setup>
import TrueFalseInput from "./questionInputs/trueFalseInput.vue";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const { highlightButton, unhighlightButton } = useButton("button--active", false);

defineProps({
    dropdownStats: {
        type: String,
        required: true,
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

const updateAnswer = (newAnswer, scrapedItem) => {
    scrapedItem.value = newAnswer;
};

const highLight = (event) => {
    highlightButton(event);
    Haptics.impact({ style: ImpactStyle.Light });
};

const unhighLight = (event) => {
    unhighlightButton(event);
};
</script>
