<template>
    <div class="autoExpandingTextArea">
        <ion-textarea
            v-model="inputValue"
            :disabled="!allowInput"
            :placeholder="inputPlaceholder"
            :class="customClasses"
            :auto-grow="true"
            :rows="1"
            @keydown="(event) => checkNewLine(event)"
            @keyup="(event) => updateValue(event)"
        >
        </ion-textarea>
    </div>
</template>

<script setup>
const emit = defineEmits(["updateFunction"]);
const props = defineProps({
    initialValue: {
        type: String,
        required: true,
    },
    inputPlaceholder: {
        type: String,
        required: false,
        default: "",
    },
    customClasses: {
        type: String,
        required: false,
        default: "",
    },
    allowInput: {
        type: Boolean,
        required: false,
        default: true,
    },
});

const inputValue = ref("");

/**
 * @ionic/vue, component ion-alert with input options of "checkbox" type, somehow
 * prevents detection of "Enter" key press, so we need to manually add a new line on keydown event.
 * This is probably Ionic bug - report in later. Ion-alert is used to resolve confirmation of dependencies updates in
 * dateInput.vue component - if input type in createModalInputs() is not "checkbox", this is not needed.
 *
 * Read more abut this here:
 * https://ionicframework.com/docs/api/alert#inputs
 */
const checkNewLine = (e) => {
    if (e.code == "Enter" || e.keyCode == 13 || e.key == "Enter") {
        inputValue.value += "\n";
    }
};

const updateValue = () => {
    emit("updateFunction", inputValue.value);
};

// Watch for external changes of textarea value
watch(
    () => props.initialValue,
    (newValue) => {
        if (newValue !== inputValue.value) {
            inputValue.value = newValue;
        }
    },
);

onMounted(() => {
    setTimeout(() => {
        inputValue.value = props.initialValue;
    });
});
</script>

<style lang="scss" scoped>
@import "/assets/sass/variables";

.autoExpandingTextArea {
    margin-top: -10px;
}
</style>
