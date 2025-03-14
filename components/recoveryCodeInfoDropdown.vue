<template>
    <div class="recoveryCode__info">
        <DropdownPanel :dropdownHeading="'More about Recovery codes'" :dropdownIcon="'❓'">
            <ul>
                <li class="gray">
                    Recovery codes are used to reset your password in case you forget it. It's not as convinient as changing it via email, as you are used to, but it's way more secure, since we
                    encrypt all your data with your password. It's a trade between conviniece and security.
                </li>
                <li class="gray">Recovery code is for one-use only. Once you use it, we will give you a new one.</li>
                <li class="gray">Recovery code is like a second password, meaning it is a secret! Do not ever share it with anyone.</li>
                <li class="gray">We do not store recovery codes for security reasons, which means you can view it only when its generated, so make sure you save it somewhere safe.</li>
                <li class="gray">If you lose your recovery code, but you still remember your password, you can generate a new recovery code in account settings.</li>
            </ul>
        </DropdownPanel>
    </div>
</template>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.recoveryCode {
    &__info {
        p {
            margin: 0px;
        }

        &--more {
            margin-top: 10px;

            li {
                margin-bottom: 25px;

                &::marker {
                    color: $primary-action-color;
                    transform: scale(1.5);
                }
            }
        }
    }
}
</style>
