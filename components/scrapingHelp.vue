<template>
    <ion-modal :trigger="triggerElement" :initial-breakpoint="0.75" :breakpoints="[0, 0.75, 1]">
        <ion-content class="ion-padding">
            <div class="pageContainer">
                <h1>How does the online data gathering work?</h1>
                <p class="gray">This feature uses the data you provided about this person and tries to search the internet for available public information about this contact.</p>
                <p class="gray">The results may vary based on the initial information you provide and on the online presence of this person.</p>
                <p class="gray">
                    <span style="color: black">Each search costs you 10 credits <img class="inlineCreditSymbol" src="~/assets/images/credits.png" />. You get 100 free credits each month.</span> If you
                    have any remaining credits during the free recharge, they won't be transferred to another recharge cycle. We plan to introduce system for purchasing extra credits in the near
                    future.
                </p>
                <p class="gray">
                    <span style="color: black">Please use this feature responsibly and only for personal purposes.</span> Remember that the internet is not always right and the found data might be
                    completely wrong. Always verify your findings.
                </p>

                <p class="gray">
                    Please remember that the <span style="color: black">name and the nickname of the searched person might be saved in the internal search logs</span> of services providing the search
                    engine in the same way as your regular search history is retained by Google.
                </p>

                <div class="scraper__magnifier--small">
                    <img src="~/assets/images/magnifying-glass.png" />
                </div>
            </div>
        </ion-content>
    </ion-modal>
</template>

<script setup>
defineProps({
    triggerElement: {
        type: String,
        required: true,
    },
});
</script>

<style lang="scss" scoped>
@import "/assets/sass/variables";

.inlineCreditSymbol {
    width: 20px;
    position: relative;
    top: 4px;
}

.scraper {
    &__magnifier--small {
        text-align: center;

        img {
            width: 50%;
        }
    }
}
</style>
