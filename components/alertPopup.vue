<template>
    <ion-alert
        :is-open="isActive"
        :header="header"
        :sub-header="subHeader"
        :buttons="[
            {
                text: cancelButton,
                role: 'cancel',
            },
            {
                text: confirmButton,
                role: 'confirm',
            },
        ]"
        @didDismiss="logResult($event)"
    >
    </ion-alert>
</template>

<script setup>
defineProps({
    header: {
        type: String,
        default: "Are you sure?",
        required: true,
    },
    subHeader: {
        type: String,
        default: "",
        required: false,
    },
    confirmButton: {
        type: String,
        default: "Yes",
        required: false,
    },
    cancelButton: {
        type: String,
        default: "Cancel",
        required: false,
    },
    isActive: {
        type: Boolean,
        default: false,
        required: true,
    },
});

const emit = defineEmits(["popupResult"]);
const logResult = (ev) => {
    emit("popupResult", ev.detail.role == "confirm" ? true : false);
};
</script>
