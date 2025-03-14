<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <NavigationPanel :displayLeftIcon="false" :displayRightIcon="false" :navigationTitle="'Frequently Asked Questions ❓'" :navigationDesc="'Feel free to ask anything'" />

                <div class="faq pageContainer">
                    <div class="faq__section">
                        <p class="bold">Who can access my data?</p>
                        <p class="gray"><b>Only you.</b> All your data are encrypted with your password, meaning no one can read any of your data without it. Not us, not hackers, only you.</p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">Can I access my data from other devices?</p>
                        <p class="gray"><b>Yes</b>, your data are stored and encrypted in our database, meaning you can access your data on any device where you login to your account.</p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">How can I reset my password?</p>
                        <p class="gray">
                            Since all your data are encrypted with your password, the only way to reset your password is via your <b>recovery code</b>. Your recovery code will decrypt your data so it
                            can be re-encrypted with your new password. It is not the most convenient method, but it keeps your data private.
                        </p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">What if I lost my recovery code?</p>
                        <p class="gray">
                            If you lost your recovery code, you can generate a new one in the account settings. Generating a new recovery code will invalidate the old one. If you can't access your
                            account and therefore can't generate a new recovery code, we unfortunately can't help you. Because all your data are encrypted with your password, we won't be able to
                            decrypt them without your password or recovery code.
                        </p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">Can I change my email address?</p>
                        <p class="gray">Currently, it is not possible to change your email address.</p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">What if I want to delete my account and all my data?</p>
                        <p class="gray">
                            You can always delete your account and all your data in the account settings. Once you delete your account, all your data will be permanently deleted. We do not store any
                            copies or logs.
                        </p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">Is this app free?</p>
                        <p class="gray">Yes, this app is currently free. If you want to support its development, you can buy us a coffee :)</p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">Do you sell any of my data?</p>
                        <p class="gray">
                            <b>Hell no.</b> We take your privacy seriously. We do not sell any of your data, and even if we would want to, we simply can't because all the data are encrypted with your
                            password.
                        </p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">I found a bug, what should I do?</p>
                        <p class="gray">
                            If you find any bug or vulnerability, please don't hesitate to contact us - we will do everything we can to fix it right away. We will also give you free extra search
                            credits if your finding is valid.
                        </p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">Where does the People Search Engine get the data from?</p>
                        <p class="gray">
                            All the data found with our People Search Engine are publicly available online and can be searched manually by Google or other search engines. We just make it easier to
                            detect the information you might be interested in.
                        </p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">Do you save any of my conversations with the AI chatbot?</p>
                        <p class="gray">
                            No, we do not store any of your conversations with the AI. All chat history will be deleted after you close this application or logout. The AI capabilities are provided by
                            the chatGPT API, which does not use your conversations to train new AI models. The chatGPT API stores your conversations for up to 30 days to identify potential abuse, and
                            after 30 days, they delete your conversations. For more information, please visit <a href="https://openai.com/enterprise-privacy/">OpenAI Privacy Policy</a>.
                        </p>
                    </div>

                    <div class="faq__section">
                        <p class="bold">Does the People Search Engine retain search logs?</p>
                        <p class="gray">
                            Our application does not keep any search logs. However, it is necessary to understand that the name and the nickname of the searched person might be saved in the internal
                            search logs of services providing the search engine in the same way as your regular search history is retained by Google.
                        </p>
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
