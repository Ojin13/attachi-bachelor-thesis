<template>
    <ion-modal :is-open="openConsentModal" :can-dismiss="canDismissConsentModal">
        <ion-header>
            <ion-toolbar>
                <ion-title>Privacy notice ✋</ion-title>

                <ion-buttons slot="start">
                    <ion-button @click="cancelConsent()">Back</ion-button>
                </ion-buttons>

                <ion-buttons slot="end">
                    <ion-button :strong="true" :class="{ notConfirmed: !canDismissConsentModal }" @click="confirmConsent()">Confirm</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>

        <ion-content>
            <div class="pageContainer">
                <h1>Use this tool ethically and only with consent of this contact</h1>
                <p class="gray">
                    You are allowed to use this tool only for <span style="color: black">personal purposes</span>. You should always have
                    <span style="color: black">explicit consent from the analyzed person</span>, stating that you are allowed to use this tool to analyze them.
                </p>

                <div class="scraper__privacyImage">
                    <img src="~/assets/images/privacy.png" />
                </div>
            </div>

            <ion-item>
                <ion-checkbox id="terms" label-placement="start" :checked="canDismissConsentModal" @ionChange="onTermsChanged"> I have consent to use this tool. </ion-checkbox>
            </ion-item>
        </ion-content>
    </ion-modal>
</template>

<script setup>
const { popFromStack } = useIonicRouter();

const openConsentModal = ref(false);
const canDismissConsentModal = ref(false);

const cancelConsent = () => {
    canDismissConsentModal.value = true;
    openConsentModal.value = false;

    console.log("Consent not given.");
    popFromStack();
};

const confirmConsent = () => {
    if (canDismissConsentModal.value) {
        openConsentModal.value = false;
    } else {
        console.log("Consent not given.");
    }
};

const onTermsChanged = (e) => {
    canDismissConsentModal.value = e.detail.checked;
};

onMounted(() => {
    setTimeout(() => {
        openConsentModal.value = true;
    }, 500);
});
</script>

<style lang="scss" scoped>
@import "/assets/sass/variables";

.scraper {
    &__privacyImage {
        text-align: center;

        img {
            width: 75%;
        }
    }
}
</style>
