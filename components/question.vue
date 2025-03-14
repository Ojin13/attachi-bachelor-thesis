<template>
    <div class="detailPage__data__preset__questionPanel">
        <div class="detailPage__data__preset__questionPanel--sideLine">
            <!-- Side line -->
        </div>

        <p class="bold">{{currentQuestion.questionText}}</p>

        <TextAreaQuestion
            v-if="correctQuestionType(['text', 'number'])"
            :preset="currentPreset"
            :questionID="currentQuestion.id"
            :currentQuestion="currentQuestion"
            :updateFunction="updateFunction"
        />

        <PhoneQuestion
            v-if="correctQuestionType(['phoneNumber'])"
            :preset="currentPreset"
            :questionID="currentQuestion.id"
            :currentQuestion="currentQuestion"
            :updateFunction="updateFunction"
        />

        <TrueFalseQuestion
            v-if="correctQuestionType(['bool', 'bool_reverse'])"
            :preset="currentPreset"
            :questionID="currentQuestion.id"
            :currentQuestion="currentQuestion"
            :updateFunction="updateFunction"
        />
        
        <DateQuestion
            v-if="correctQuestionType(['date'])"
            :preset="currentPreset"
            :questionID="currentQuestion.id"
            :currentQuestion="currentQuestion"
            :updateFunction="updateFunction"
            :contactId="contactId"
        />
        
        <SelectQuestion
            v-if="correctQuestionType(['select'])"
            :preset="currentPreset"
            :questionID="currentQuestion.id"
            :currentQuestion="currentQuestion"
            :updateFunction="updateFunction"
        />
        
        <LinkQuestion
            v-if="correctQuestionType(['url'])"
            :preset="currentPreset"
            :questionID="currentQuestion.id"
            :currentQuestion="currentQuestion"
            :updateFunction="updateFunction"
        />
    </div>
</template>


<script setup>
    import TextAreaQuestion from '../components/questionInputs/textArea.vue';
    import TrueFalseQuestion from '../components/questionInputs/trueFalseInput.vue';
    import DateQuestion from '../components/questionInputs/dateInput.vue';
    import SelectQuestion from '../components/questionInputs/selectInput.vue';
    import LinkQuestion from '../components/questionInputs/URLInput.vue';
    import PhoneQuestion from '../components/questionInputs/phoneInput.vue';

    const props = defineProps({
        updateFunction: {
            type: Function,
            required: true
        },
        currentQuestion: {
            type: Object,
            required: true
        },
        currentPreset: {
            type: Object,
            required: true
        },
        contactId: {
            type: String,
            required: true
        }
    });

    const correctQuestionType = (types) => {
        return types.includes(props.currentQuestion.questionDataType);
    }
</script>
