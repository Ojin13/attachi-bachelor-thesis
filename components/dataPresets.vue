<template>
    <div class="dataPresetsWrapper">
        <!-- Presets -->
        <div v-for="(preset, preset_id) in dataPresets" :key="preset_id" class="detailPage__data__preset">
            <DropdownPanel :dropdownHeading="preset.name" :dropdownDescription="preset.description" :dropdownStats="getPresetProgress(preset)" :dropdownIcon="'📚'">
                <div class="detailPage__data__preset__content">
                    <div v-for="(currentQuestion, questionID) in preset.questions" :key="questionID">
                        <Question :currentPreset="preset" :updateFunction="updateFunction" :currentQuestion="currentQuestion" :contactId="contactId" :class="displayQuestion(questionID)" />
                    </div>
                </div>
            </DropdownPanel>
        </div>
    </div>
</template>

<script setup>
import { store } from "~/store";

const dataPresets = ref({});
const { displayQuestion, getPresetProgress } = useDataPresets(dataPresets);

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

onMounted(() => {
    dataPresets.value = store.state.userData.contactDataPresets[props.contactId];
});
</script>

<style lang="scss" scoped>
.dataPresetsWrapper {
    margin-top: 40px;
}
</style>
