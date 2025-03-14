<template>
    <div class="recoveryCodeContainer">
        <div v-if="showPasteButton" class="recoveryCode--heading">
            <p class="bold">Your recovery code:</p>

            <div class="recoveryCode__copyPaste--button" @click="pasteCode()">
                <img src="~/assets/icons/copy.svg" />
                <p>{{ pasteCodeButtonText }}</p>
            </div>
        </div>

        <div class="recoveryCode">
            <input
                v-for="codeSection in 4"
                :ref="(el) => (recoveryCodeInput[codeSection] = el)"
                :key="codeSection"
                v-model="recoveryCode[codeSection - 1]"
                class="recoveryCode__tab"
                :class="{ error: errorSubmission }"
                maxlength="4"
                :disabled="disableIput"
                @keydown="refocusRecoveryCodeInput(codeSection, $event)"
                @keyup="$emit('updateRecoveryCode', reconstructRecoveryCode())"
            />
        </div>

        <div v-if="errorSubmission" class="errorMessage__form">
            <p class="small bold errorMessage__form--text">This recovery code is not valid</p>
        </div>

        <div v-if="showCopyButton" class="recoveryCode__copyPaste">
            <div class="recoveryCode__copyPaste--button" @click="copyCode()">
                <img src="~/assets/icons/copy.svg" />
                <p>{{ copyCodeButtonText }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Clipboard } from "@capacitor/clipboard";
const emit = defineEmits(["updateRecoveryCode"]);

const props = defineProps({
    disableIput: {
        type: Boolean,
        required: false,
        default: false,
    },

    showCopyButton: {
        type: Boolean,
        required: false,
        default: true,
    },

    showPasteButton: {
        type: Boolean,
        required: false,
        default: false,
    },

    recoveryCodeInitialValue: {
        type: String,
        required: false,
        default: "",
    },

    errorSubmission: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const copyCodeButtonText = ref("Copy");
const pasteCodeButtonText = ref("Paste");
const recoveryCodeInput = ref([]);
const recoveryCode = ref(["", "", "", ""]);

const copyCode = async () => {
    await Clipboard.write({ string: reconstructRecoveryCode() });
    copyCodeButtonText.value = "Copied!";
};

const getClipBoardValue = async () => {
    const text = await Clipboard.read();
    return text.value;
};

const pasteCode = () => {
    getClipBoardValue().then((text) => {
        text = text.replace(/-/g, "");

        // Split text into array of 4 characters
        let codeArray = text.match(/.{1,4}/g);

        for (let i = 0; i < codeArray.length; i++) {
            recoveryCode.value[i] = codeArray[i];
        }

        console.log("Recovery code pasted!");
        pasteCodeButtonText.value = "Pasted!";

        requestAnimationFrame(() => {
            emit("updateRecoveryCode", reconstructRecoveryCode());
        });
    });
};

const refocusRecoveryCodeInput = (codeSection, e) => {
    let pressedDelete = e.key == "Backspace" || e.key == "Delete" || e.keyCode === 8 || e.keyCode === 46;

    // Check if should focus next input
    if (recoveryCode.value[codeSection - 1].length == 4) {
        if (codeSection != 4 && recoveryCode.value[codeSection] == "" && !pressedDelete) {
            recoveryCodeInput.value[codeSection + 1].focus();
        }
    }

    // Check if should focus previous input
    if (pressedDelete && recoveryCode.value[codeSection - 1] == "") {
        e.preventDefault();

        if (codeSection != 1) {
            recoveryCodeInput.value[codeSection - 1].focus();
        }
    }
};

const reconstructRecoveryCode = () => {
    let reconstructedRecoveryCode = "";

    for (let i = 0; i < 4; i++) {
        reconstructedRecoveryCode += recoveryCode.value[i];

        if (i != 3) {
            reconstructedRecoveryCode += "-";
        }
    }

    return reconstructedRecoveryCode;
};

onBeforeMount(() => {
    if (props.recoveryCodeInitialValue != "") {
        let codeArray = props.recoveryCodeInitialValue.replace(/-/g, "").match(/.{1,4}/g);

        for (let i = 0; i < codeArray.length; i++) {
            recoveryCode.value[i] = codeArray[i];
        }
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.recoveryCode {
    display: flex;
    justify-content: space-between;

    &--heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        margin-top: 15px;

        p {
            margin-bottom: 0px;
        }
    }

    &__tab {
        border-radius: $default-border-radius;
        background-color: $placeholder-action-color;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px 0px;
        min-width: 60px;
        width: 23%;
        text-align: center;

        // Its monospace font so it looks like a code
        font-family: "CourierPrime";
    }

    &__copyPaste {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 15px;
        cursor: pointer;
        margin-bottom: 30px;

        p {
            margin: 0px;
        }

        &--button {
            display: flex;

            img {
                width: 20px;
                height: 20px;
                margin-right: 10px;
                position: relative;
                top: 2px;
            }
        }
    }
}
</style>
