<template>
    <div class="allKnownInformationWrapper">
        <DropdownPanel
            :dropdownHeading="'All known information'"
            :dropdownDescription="'Answered questions from all categories'"
            :dropdownStats="getNumberOfItems + 'x'"
            :dropdownIcon="'📌'"
            :delayActivation="true"
            :initiallyOpen="initiallyOpen"
            :scrollContent="noScrollAnchoringSupport"
            @stateChange="reloadKnownAnswers"
        >
            <div class="detailPage__data__preset__content">
                <div v-for="(currentQuestion, questionID) in getAllKnownAnswers" :key="questionID">
                    <Question v-if="currentQuestion" :currentPreset="getPresetByQuestionID(questionID)" :currentQuestion="currentQuestion" :contactId="contactId" :updateFunction="updateFunction" />
                </div>

                <div v-if="Object.keys(getAllKnownAnswers).length == 0">
                    <p class="gray large2 spacer">No questions answered yet.</p>
                </div>
            </div>
        </DropdownPanel>

        <div class="allKnownInformationWrapper__heading">
            <p class="medium2 gray">Question categories</p>
        </div>
    </div>
</template>

<script setup>
import { Capacitor } from "@capacitor/core";
import { store } from "~/store";

const dataPresets = ref({});
const allQuestions = ref({});
const allEverAnsweredQuestions = ref({});
const initiallyOpen = ref(false);
const rememberAll = ref(true);

const { getListOfAllQuestions, getPresetByQuestionID } = useDataPresets(dataPresets);
const { filterItems, setFilterBy } = useFilters(allQuestions, true);

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

const reloadKnownAnswers = (dropDownOpen) => {
    rememberAll.value = dropDownOpen;
    allEverAnsweredQuestions.value = filterItems.value;
};

const getNumberOfItems = computed(() => {
    return Object.keys(filterItems.value).length;
});

const noScrollAnchoringSupport = computed(() => {
    return Capacitor.getPlatform() === "ios";
});

/**
 * Get all questions with answers + all questions that previously were answered
 * but later the answer was removed - this is to prevent empty answers from
 * disapearing when user wants to rewrite the answer and have to delete the old one
 * first... For example:
 *
 * 1.) Age = 30  ..... Answer is in list of all answered question
 *
 * 2.) User wants to rewrite answer to 20 and therefore deletes 30.
 *     Deleting 30 means that answer is now empty and should disapear from the list
 *     of all answered questions. But we want to keep it in the list so user can
 *     rewrite it to 20 without the need to search the question again. Therefore
 *     it should stay in the list of all answered question even if empty.
 *
 *
 */
const getAllKnownAnswers = computed(() => {
    let res = filterItems.value;

    if (rememberAll.value == true) {
        for (const key in allEverAnsweredQuestions.value) {
            if (!filterItems.value[key]) {
                res[key] = allEverAnsweredQuestions.value[key];
            }
        }
    } else {
        for (const key in filterItems.value) {
            if (!filterItems.value[key].answer) {
                delete res[key];
            }
        }
    }

    return res;
});

// Remember what questions were answered before
watch(
    () => filterItems.value,
    (newValue, oldValue) => {
        if (rememberAll.value) {
            allEverAnsweredQuestions.value = oldValue;
        } else {
            allEverAnsweredQuestions.value = newValue;
        }
    },
);

onMounted(() => {
    setFilterBy(["answer"]);
    dataPresets.value = store.state.userData.contactDataPresets[props.contactId];
    allQuestions.value = getListOfAllQuestions();
    allEverAnsweredQuestions.value = filterItems.value;

    if (getNumberOfItems.value > 0) {
        initiallyOpen.value = true;
    } else {
        rememberAll.value = false;
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.allKnownInformationWrapper {
    border-bottom: 1px dashed $secondary-text-color;
    margin-bottom: 50px;

    &__heading {
        margin: auto;
        text-align: center;

        p {
            position: relative;
            padding-right: 10px;
            padding-left: 10px;
            bottom: -18px;
            background: $primary-background-color;
            display: inline-block;
        }
    }
}

.spacer {
    margin-bottom: 84px;
}
</style>
