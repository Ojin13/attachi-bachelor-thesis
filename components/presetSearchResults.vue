<template>
    <div class="detailPage__searchBar">
        <SearchBar :searchPlaceholder="'Search for characteristics, traits etc ...'" :additionalClasses="'detailPage__searchBar--input'" @searchFilter="setSearchFilter" />
    </div>

    <div class="detailPage__data__filtered">
        <div v-if="Object.keys(filterItems).length <= 0" class="detailPage__noResults">
            <h1 class="gray">This filter does not match any info about this contact.</h1>
            <img src="~/assets/images/working_on_smartphone.png" />
        </div>

        <div v-for="(currentQuestion, questionID) in filterItems" v-else-if="currentFilterTerm != ''" :key="questionID">
            <Question
                :class="displayQuestion(questionID, true)"
                :currentPreset="getPresetByQuestionID(questionID)"
                :currentQuestion="currentQuestion"
                :contactId="contactId"
                :updateFunction="updateFunction"
            />
        </div>
    </div>
</template>

<script setup>
import { store } from "~/store";

const dataPresets = ref({});
const allQuestions = ref({});

const emit = defineEmits(["filterActive"]);
const { getPresetByQuestionID, getListOfAllQuestions, displayQuestion } = useDataPresets(dataPresets);
const { filterItems, currentFilterTerm, setFilter, setFilterBy } = useFilters(allQuestions);

const props = defineProps({
    updateFunction: {
        type: Function,
        required: true,
    },
    contactId: {
        type: String,
        required: true,
    },
});

const setSearchFilter = (filterTerm) => {
    setFilter(filterTerm);
    emit("filterActive", filterTerm != "" ? true : false);
};

onMounted(() => {
    setFilterBy(["questionText", "answer"]);
    dataPresets.value = store.state.userData.contactDataPresets[props.contactId];
    allQuestions.value = getListOfAllQuestions();
});
</script>
