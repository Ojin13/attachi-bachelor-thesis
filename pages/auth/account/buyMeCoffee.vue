<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <NavigationPanel :displayLeftIcon="false" :displayRightIcon="false" :navigationTitle="'Buy me a coffee ☕'" :navigationDesc="'Support the development of this app'" />

                <div class="coffee pageContainer">
                    <div class="coffee__section">
                        <p class="bold">Do you like this app and<br />want to support it?</p>
                        <p class="gray">If so, you can buy us a coffee! We use your donations to make this app better and to continue its development. Thanks for your support!</p>

                        <div style="margin-top: 5vh">
                            <a href="https://www.buymeacoffee.com/attachi" target="_blank">
                                <img src="~/assets/images/buyMeCoffeeButton.jpg" alt="Buy Me A Coffee" style="height: 60px !important; width: 217px !important" />
                            </a>
                        </div>
                    </div>

                    <div class="backgroundImage">
                        <img src="~/assets/images/working_on_smartphone.png" />
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
definePageMeta({
    middleware: ["is-authenticated"],
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.backgroundImage {
    margin-top: 50px;

    img {
        width: 100%;
        opacity: 25%;
    }
}

.coffee {
    margin-top: 25px;
    text-align: center;

    &__section {
        margin-bottom: 40px;
        p {
            margin-bottom: 0px;
        }
    }
}
</style>
