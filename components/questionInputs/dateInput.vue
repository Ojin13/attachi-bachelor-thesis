<template>
    <div class="dateInputs">
        <input v-model="day" type="number" placeholder="Day" class="dateInputs__day answer" @keyup="formatDate()" />

        <select v-model="month" :class="{ 'selectInput--empty': month == '' }" class="dateInputs__month answer" @change="formatDate()">
            <option value="">Month</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
        </select>

        <input v-model="year" type="number" placeholder="Year" class="dateInputs__year answer" @keyup="formatDate()" />
    </div>

    <!-- Date questions have dependencies - we should prompt users about it -->
    <ion-alert
        :is-open="isModalOpen"
        :header="setModalHeader()"
        :buttons="dependenciesButtons"
        :inputs="createModalInputs()"
        message="Select which dependent questions should also be updated."
        @didDismiss="setModalOpen(false)"
    >
    </ion-alert>
</template>

<script setup>
import { store } from "~/store";

const props = defineProps({
    questionID: {
        type: String,
        required: true,
    },
    updateFunction: {
        type: Function,
        required: true,
    },
    preset: {
        type: Object,
        required: true,
    },
    currentQuestion: {
        type: Object,
        required: true,
    },
    contactId: {
        type: String,
        required: true,
    },
});

const day = ref("");
const month = ref("");
const year = ref("");
const currentValue = ref("");
const openModalTimer = ref(null);

const contactDataPresets = ref(store.state.userData.contactDataPresets[props.contactId]);
const { getQuestionByID } = useDataPresets(contactDataPresets);

const isModalOpen = ref(false);
const dependenciesButtons = [
    {
        text: "Cancel",
        role: "cancel",
        handler: () => {
            modifyDependenciesAndUpdate([]);
        },
    },
    {
        text: "Update selected",
        role: "confirm",
        handler: (data) => {
            modifyDependenciesAndUpdate(data);
        },
    },
];

const setModalOpen = (state) => {
    isModalOpen.value = state;
};

const modifyDependenciesAndUpdate = (dependencies) => {
    // Create a copy of currentQuestion but with updated dependentQuestionIDs
    let updatedQuestion = Object.assign({}, props.currentQuestion);
    updatedQuestion.dependentQuestionIDs = dependencies.map((questionID) => parseInt(questionID));
    props.updateFunction(updatedQuestion, true, currentValue.value);
};

const createModalInputs = () => {
    const inputs = [];

    if (!props.currentQuestion.dependentQuestionIDs) {
        return inputs;
    }

    props.currentQuestion.dependentQuestionIDs.forEach((questionID) => {
        const question = getQuestionByID(questionID);

        if (!question) {
            return;
        }

        inputs.push({
            type: "checkbox",
            checked: true,
            label: question.questionText,
            value: questionID,
        });
    });

    return inputs;
};

const setModalHeader = () => {
    return '"' + props.currentQuestion.questionText + '" determines value of other questions';
};

const formatDate = () => {
    currentValue.value = day.value + "/" + month.value + "/" + year.value;

    if (currentValue.value == "//") {
        currentValue.value = "";
    }

    // Check if value has changed
    if (props.currentQuestion.answer == currentValue.value) {
        return;
    }

    // Confirm update of dependencies
    if (props.currentQuestion.dependentQuestionIDs?.length > 0) {
        clearTimeout(openModalTimer.value);

        openModalTimer.value = setTimeout(() => {
            // If date is not complete, do not update dependencies
            if (!day.value || !month.value || !year.value) {
                modifyDependenciesAndUpdate([]);
            } else {
                setModalOpen(true);
            }
        }, 1000);
    } else {
        props.updateFunction(props.currentQuestion, false, currentValue.value);
    }
};

const initDateValues = () => {
    let dateSplitted = props.currentQuestion.answer.split("/");

    if (props.currentQuestion.answer == "//" || props.currentQuestion.answer == "") {
        day.value = "";
        month.value = "";
        year.value = "";
    } else if (dateSplitted.length == 3) {
        day.value = dateSplitted[0];
        month.value = dateSplitted[1];
        year.value = dateSplitted[2];
    }
    currentValue.value = day.value + "/" + month.value + "/" + year.value;
};

onBeforeMount(() => {
    initDateValues();

    watch(
        () => props.currentQuestion.answer,
        () => {
            initDateValues();
        },
    );
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.answer {
    padding: 10px;
    font-size: $medium-font-size;
    height: 32px;
    margin-right: 10px;
}

.dateInputs {
    display: flex;
    flex-wrap: wrap;
    margin-top: 8px;

    &__day {
        width: 50px;
    }

    &__month {
        width: 110px;
        padding: 0px 10px;
    }

    &__year {
        width: 60px;
    }
}

.selectInput {
    &--empty {
        color: $secondary-text-color !important;
    }
}
</style>
