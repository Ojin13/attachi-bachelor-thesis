<template>
    <LoaderOverlay :isActive="loading" />

    <div v-if="recoveryCode != ''">
        <RecoveryCodeInput :disableIput="true" :recoveryCodeInitialValue="recoveryCode" />
    </div>

    <div class="recoveryCode__info">
        <p class="bold">What is it for?</p>
        <p class="gray">Copy and save your recovery code somewhere safe as it is the only way to reset your forgotten password.</p>
    </div>

    <ConfirmTab ref="confirmationTab" @confirmAction="customConfirmationAction">
        <div v-if="recoveryCode != ''" class="recoveryCode__btn" @click="requestRecoveryCodeSave()">
            <ActionButton :buttonText="'I saved my Recovery code'" />
        </div>

        <div v-else class="recoveryCode__btn" @click="requestRecoveryCodeRegeneration()">
            <ActionButton :buttonText="'Generate new Recovery code'" />
        </div>
    </ConfirmTab>
</template>

<script setup>
const props = defineProps({
    redirectionURL: {
        type: String,
        required: false,
        default: "",
    },
    popFromStackOnFinish: {
        type: Boolean,
        required: false,
        default: false,
    },
    forceNewCode: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const loading = ref(false);

// Element reference
const confirmationTab = ref(null);

const { recoveryCode, generateNewCode } = useRecoveryCodeForm(loading);
const { replaceNavigationStack, popFromStack } = useIonicRouter();

const customConfirmationAction = (confirmAction) => {
    if (confirmAction == "continue") {
        if (props.popFromStackOnFinish) {
            popFromStack(props.redirectionURL);
        } else {
            replaceNavigationStack(props.redirectionURL);
        }
    } else if (confirmAction == "generateNewCode") {
        loading.value = true;
        window.scrollTo(0, 0);
        generateNewCode();
    }
};

const requestRecoveryCodeSave = () => {
    confirmationTab.value.setConfirmationTabData(
        "You can't view your Recovery code again. Make sure to save it.",
        "If you forget your password, you can't change it and decrypt your data without this recovery code. Keep it safe.",
        "continue",
        recoveryCode == "" ? "Yes, generete new code" : "I saved my Recovery code",
    );
};

const requestRecoveryCodeRegeneration = () => {
    confirmationTab.value.setConfirmationTabData(
        "Are you sure you want to create new Recovery code?",
        "Remember that this action will invalidate your old Recovery code.",
        "generateNewCode",
        recoveryCode == "" ? "Yes, generete new code" : "I saved my Recovery code",
    );
};

onMounted(() => {
    if (props.forceNewCode) {
        loading.value = true;
        generateNewCode();
    }
});
</script>
