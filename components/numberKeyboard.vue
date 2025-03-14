<template>
    <div class="NumberKeyboard">
        <!-- Input visualizer -->
        <div v-if="visualizeInput" class="NumberKeyboard__code">
            <div v-for="(digit, index) in MAX_PASSCODE_LENGTH" :key="index" class="NumberKeyboard__code__digit">
                <div :class="{ 'NumberKeyboard__code__digit__circle--active': passcodeValue.length > index }" class="NumberKeyboard__code__digit__circle"></div>
            </div>
        </div>

        <!-- Keyboard buttons -->
        <div class="NumberKeyboard__grid">
            <!-- Number buttons 1-9 -->
            <div
                v-for="(number, index) in 9"
                :key="index"
                class="NumberKeyboard__grid__key"
                @touchstart="(event) => keyboardTouch(event, number)"
                @touchend="unhighlightButton"
                @click="(event) => keyboardClick(event, number)"
            >
                <p class="NumberKeyboard__grid__key--number large">{{ number }}</p>
            </div>

            <!-- Remove button -->
            <div
                class="NumberKeyboard__grid__key NumberKeyboard__grid__key--remove"
                @touchstart="(event) => keyboardTouch(event, -1)"
                @touchend="unhighlightButton"
                @click="(event) => keyboardClick(event, -1)"
            >
                <img src="~/assets/icons/remove-button.svg" />
            </div>

            <!-- Middle bottom number 0 button -->
            <div class="NumberKeyboard__grid__key" @touchstart="(event) => keyboardTouch(event, 0)" @touchend="unhighlightButton" @click="(event) => keyboardClick(event, 0)">
                <p class="NumberKeyboard__grid__key--number large">0</p>
            </div>

            <!-- Submit button -->
            <div :class="{ 'NumberKeyboard__grid__key--submit--active': passcodeValue.length >= MIN_PASSCODE_LENGTH }" class="NumberKeyboard__grid__key--submit" @click="submitPasscode()">
                <div class="NumberKeyboard__grid__key--submit--icon">
                    <img src="~/assets/icons/continue-button.svg" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { Capacitor } from "@capacitor/core";

const { MAX_PASSCODE_LENGTH, MIN_PASSCODE_LENGTH, passcodeValue, addDigit, removeDigit, isValidPasscode, resetPasscode } = usePasscode();

const emit = defineEmits(["submitPasscode"]);
const { highlightButton, unhighlightButton } = useButton("NumberKeyboard__grid__key--active", false, true);

const props = defineProps({
    visualizeInput: {
        type: Boolean,
        required: false,
        default: true,
    },
    correctPasscode: {
        type: String,
        required: false,
        default: "",
    },
    validatePasscode: {
        type: Boolean,
        required: false,
        default: true,
    },
});

const submitPasscode = () => {
    const isValid = isValidPasscode(props.correctPasscode);

    if (!isValid && props.validatePasscode) {
        resetPasscode();
    }

    emit("submitPasscode", {
        isValid: props.validatePasscode ? isValid : true,
        passcode: passcodeValue.value,
    });
};

const keyboardTouch = (event, number) => {
    if (Capacitor.getPlatform() != "web") {
        acceptInput(event, number);
    }
};

const keyboardClick = (event, number) => {
    if (Capacitor.getPlatform() == "web") {
        acceptInput(event, number);
    }
};

const acceptInput = (event, number) => {
    highlightButton(event);
    if (number == -1) {
        removeDigit();
    } else {
        addDigit(number);
    }
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.NumberKeyboard {
    &__code {
        margin-top: 15px;
        margin-bottom: 40px;
        min-height: 50px;
        display: flex;
        justify-content: center;

        &__digit {
            &__circle {
                transition: all 0.3s ease-in-out;
                border-radius: 50%;
                margin: 0px;
                width: 0px;
                height: 0px;
                background: -webkit-linear-gradient(0deg, $primary-action-color, #a4bf74);
                box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
            }

            &__circle--active {
                $circle-size: 18px;
                width: $circle-size;
                height: $circle-size;
                margin: 15px;
            }
        }
    }

    &__grid {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        grid-gap: 10px;
        justify-items: center;
        margin-bottom: 30px;

        &__key {
            padding: 20px 30px;
            transform: scale(1);
            background: none;

            &--active {
                animation: keyboardButtonPress 750ms ease-in-out;
                border-radius: $default-border-radius;
            }

            &--number {
                margin: 0px;
            }

            &--remove {
                position: relative;
                top: -3px;

                img {
                    width: 40px;
                    position: relative;
                    top: 2px;
                }
            }

            &--submit {
                border-radius: 50%;
                box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
                background: -webkit-linear-gradient(0deg, $primary-action-color, #a4bf74);
                display: flex;
                justify-content: center;
                align-items: center;
                width: 50px;
                height: 50px;
                position: relative;
                top: 10px;
                transition: all 0.25s ease-in-out;
                transform: scale(0);

                &--active {
                    transform: scale(1);
                }

                &--icon {
                    img {
                        width: 25px;
                        position: relative;
                        top: 2px;
                    }
                }
            }
        }
    }
}

// Create animation for button press
@keyframes keyboardButtonPress {
    0% {
        transform: scale(1);
        background-color: rgba(219, 215, 179, 1);
    }
    12% {
        transform: scale(0.9);
    }
    25% {
        transform: scale(1);
    }
    100% {
        background-color: rgba(219, 215, 179, 0);
    }
}
</style>
