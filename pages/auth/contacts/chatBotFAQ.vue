<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <NavigationPanel :displayLeftIcon="false" :displayRightIcon="false" :navigationTitle="'Frequently Asked Questions'" :navigationDesc="'Artifical Inteligence analysis'" />

                <div class="faq pageContainer">
                    <div class="faq__section">
                        <p class="bold">How can I improve the performance of the chatbot?</p>
                        <p class="gray">
                            The more information you provide about the contact, the better the AI gets. We recommend completing your contact from at least 25% to get good results from the AI and to
                            avoid hallucinations.
                        </p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">Can I believe the answers I get from the chatbot?</p>
                        <p class="gray">
                            Generally, yes, but you should always take the answers you get with a grain of salt. This chatbot tries to be as precise as possible, but sometimes, it may hallucinate
                            random facts. To be sure, double-check the answers you get.
                        </p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">Do you save any of my conversations?</p>
                        <p class="gray">
                            No, we do not store any of your conversations with the AI. All chat history will be deleted after you close this application or logout. The AI capabilities are provided by
                            the chatGPT API, which does not use your conversations to train new AI models. The chatGPT API stores your conversations for up to 30 days to identify potential abuse, and
                            after 30 days, they delete your conversations. For more information, please visit <a href="https://openai.com/enterprise-privacy/">OpenAI Privacy Policy</a>.
                        </p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">I have a prompt that I would like to add to the pre-made questions. What should I do?</p>
                        <p class="gray">Feel free to contact us, and we will add your prompt to the pre-made prompt list in the next update. You can use the contact form in the menu.</p>
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

.faq {
    margin-top: 30px;

    &__section {
        margin-bottom: 40px;
        p {
            margin-bottom: 0px;
        }
    }
}
</style>
