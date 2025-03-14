<template>
    <div v-if="showComponent" class="passwordInput">
        <input
            v-model="passwordValue"
            class="input--iconRight"
            :class="{ error: passwordError }"
            :type="passwordVisible ? 'text' : 'password'"
            :placeholder="passwordPlaceholder"
            @keyup="updatePassword()"
        />
        <div class="passwordInput--showPasswordIcon" @click="changePasswordVisibility()">
            <img v-if="passwordVisible" src="~/assets/icons/eye-open.svg" />
            <img v-else src="~/assets/icons/eye-closed.svg" />
        </div>
    </div>
</template>

<script setup>
const emit = defineEmits(["updatePassword"]);
defineProps({
    showComponent: {
        type: Boolean,
        default: true,
    },
    passwordError: {
        type: Boolean,
        default: false,
    },
    passwordPlaceholder: {
        type: String,
        default: "Your password",
    },
});

const passwordValue = ref("");
const passwordVisible = ref(false);

const changePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value;
};

const updatePassword = () => {
    emit("updatePassword", passwordValue.value);
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.passwordInput {
    display: flex;
    justify-content: right;
    align-items: center;

    &--showPasswordIcon {
        position: absolute;
        cursor: pointer;
        margin-right: 15px;
        margin-top: -5px;
        width: 20px;
    }
}
</style>
