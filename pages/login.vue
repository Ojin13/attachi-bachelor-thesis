<template>
    <ion-page>
        <ion-content force-overscroll="false">
            <div class="screenContainer">
                <LoaderOverlay :isActive="activeLoader" />

                <div class="pageContainer">
                    <AppHeader :showNotificationlIcon="false" :heading="'Hello there!\nLogin or register here'" :noBottomOffset="true" />
                </div>

                <div class="login__menu">
                    <div class="login__menu__tab" :class="{ 'login__menu__tab--active': isLoginMode }" @click="setLoginMode(true)">
                        <p>Login</p>
                    </div>

                    <div class="login__menu__tab" :class="{ 'login__menu__tab--active': !isLoginMode }" @click="setLoginMode(false)">
                        <p>Register</p>
                    </div>
                </div>

                <div class="pageContainer">
                    <div class="login__form" :class="{ 'login__form--registration': !isLoginMode }">
                        <div class="login__form__input">
                            <input v-model="email" :class="{ error: emailError }" type="email" placeholder="Your email" />
                        </div>

                        <div class="login__form__input">
                            <input v-if="!isLoginMode" v-model="nickname" type="text" placeholder="Your name" />
                        </div>

                        <PasswordInput :passwordError="passwordError" @updatePassword="(value) => (password = value)" />
                        <PasswordInput :showComponent="!isLoginMode" :passwordPlaceholder="'Your password again'" :passwordError="passwordError" @updatePassword="(value) => (passwordCheck = value)" />
                        <PasswordComplexityIndicator :password="password" :renderComponent="!isLoginMode" />

                        <div v-if="errorLogin" class="errorMessage__form">
                            <p class="small bold errorMessage__form--text">{{ errorMsg }}</p>
                        </div>

                        <div @click="!isLoginMode ? createUserWithEmail() : loginUserWithEmail()">
                            <ActionButton :customClasses="'login__actionButton'" :buttonText="isLoginMode ? 'Login with email' : 'Register with email'" />
                        </div>

                        <p v-if="isLoginMode" class="medium gray login__forgotPassword" @click="pushToStack({ path: '/resetPassword' })">Forgot your password?</p>
                    </div>

                    <div>
                        <p class="medium bold login__alternativeLogin--heading">Or use these guys</p>

                        <div v-if="isAppleDevice()" class="loginButton loginButton--apple">
                            <img class="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-id-idp-button" src="~/assets/images/apple-id-sign-up.png" @click="appleSignIn()" />
                        </div>

                        <div class="loginButton loginButton--google">
                            <img
                                class="firebaseui-idp-button mdl-button mdl-js-button mdl-button--raised firebaseui-id-idp-button"
                                src="~/assets/images/google_login_button.png"
                                @click="googleSingIn()"
                            />
                        </div>
                    </div>

                    <p class="medium2 gray bold login__terms">
                        By using the app you agree to <br /><span><a class="medium2 bold" href="https://www.attachi.net/terms" target="”_blank”">Terms & Conditions</a></span> and
                        <span><a class="medium2 bold" href="https://www.attachi.net/privacy-policy" target="”_blank”">Privacy Policy</a></span>.
                    </p>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { Capacitor } from "@capacitor/core";
import { onAuthStateChanged, getAuth } from "firebase/auth";

const activeLoader = ref(false);
const isLoginMode = ref(true);

/* Composables */
const { getPreferenceValue } = usePreferences();
const { pushToStack, reloadRouter } = useIonicRouter();
const { appleSignIn } = useAppleSignIn(activeLoader);
const { googleSingIn } = useGoogleSignIn(activeLoader);
const { createUserWithEmail, loginUserWithEmail, errorLogin, emailError, passwordError, errorMsg, password, passwordCheck, email, nickname } = useEmailSignIn(activeLoader);

const setLoginMode = (mode) => {
    isLoginMode.value = mode;
    errorLogin.value = false;
    emailError.value = false;
    passwordError.value = false;
};

const isAppleDevice = () => {
    return Capacitor.getPlatform() === "ios";
};

const isUserIsLoggedIn = async () => {
    let encryptionKey = await getPreferenceValue("encryptionKey");

    if (encryptionKey) {
        return await onAuthStateChanged(getAuth(), (user) => {
            if (user) {
                return true;
            }
        });
    }

    return false;
};

onBeforeMount(async () => {
    const alreadyLoggedIn = await isUserIsLoggedIn();

    if (alreadyLoggedIn) {
        reloadRouter("/");
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.login {
    &__form {
        &__input {
            display: flex;
            justify-content: right;
            align-items: center;
        }
    }

    &__forgotPassword {
        text-align: center;
    }

    &__menu {
        width: 100%;
        display: flex;

        $transition_time: 0.3s;

        &__tab {
            width: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            transition: $transition_time;
            border-bottom: 2px solid $secondary-text-color;

            p {
                transition: $transition_time;
                color: $secondary-text-color;
                margin-bottom: 10px;
            }

            &--active {
                border-bottom: 2px solid $primary-text-color;

                p {
                    color: $primary-text-color;
                }
            }
        }
    }

    &__actionButton {
        margin-top: 10px;
    }

    &__terms {
        margin-top: 50px !important;
        text-align: center;
        width: 90%;
        margin: auto;

        a {
            font-weight: bold;
        }
    }

    &__alternativeLogin {
        display: flex;
        width: 100%;
        justify-content: center;

        &--heading {
            text-align: center;
        }
    }
}

.loginButton {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;

    img {
        width: 62%;
        padding: 0px;
        min-height: unset !important;
        border-radius: $default-border-radius;
    }

    &--google {
        img {
            outline: 2px solid rgb(203 203 203);
        }
    }
}
</style>
