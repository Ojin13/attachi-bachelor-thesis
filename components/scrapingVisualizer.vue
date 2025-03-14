<template>
    <div ref="stepsElement" class="scrapper__stepBox">
        <div v-for="step in scrapingSteps" :key="step.id">
            <p v-if="step.highlight == true" class="scrapper__stepBox--highlight small bold">
                <span class="gray small scrapper__stepBox--time">{{ step.time }}</span
                >{{ step.text }}
            </p>

            <p v-else class="small">
                <span class="gray small scrapper__stepBox--time">{{ step.time }}</span
                >{{ step.skipFoundPrefix ? "" : "Found:" }} {{ step.text }}
            </p>
        </div>
    </div>
</template>

<script setup>
const { getCurrentRoute } = useIonicRouter();

const emit = defineEmits(["scrapingFinished"]);
const props = defineProps({
    scrappedData: {
        type: Array,
        required: true,
        default: Array,
    },
    waitingForCalibration: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const visualizingInterval = 1000;
const numberOfFailedAttempts = ref(0);
const currentSourceIndex = ref(0);
const lastStepIndex = ref(0);
const scrapingSteps = ref([]);
const sourceType = ref("Google");
const stepsElement = ref(null);
const currentStageHeaderVisualized = ref(false);

const visualizeNextStep = () => {
    scrollDown();

    // Stop visualization if the user navigated away from the current page
    if (getCurrentRoute().name != "auth-contacts-scraper") {
        return;
    }

    // Check if there are any data to visualize
    if (props.scrappedData.length == 0) {
        setTimeout(() => {
            visualizeNextStep();
        }, visualizingInterval);
        return;
    }

    const consoleTime = getConsoleTime();
    const currentSource = props.scrappedData[currentSourceIndex.value];

    if (!currentSource) {
        console.log("Next source is not available yet. Waiting for it to be available...");
        // In case that one source failed an infinite loop will be created by waiting for the next source.
        // To prevent this, wait max 20 seconds and then consider the scraping as finished
        if (props.waitingForCalibration == false) {
            numberOfFailedAttempts.value++;
        }

        if (numberOfFailedAttempts.value >= 20) {
            console.log("Scraping finished due to the maximum number of failed attempts reached");
            emit("scrapingFinished");
            return;
        }

        setTimeout(() => {
            visualizeNextStep();
        }, visualizingInterval);
        return;
    } else {
        numberOfFailedAttempts.value = 0;
    }

    // Check if any data are available - if not, only stage heading is available
    if (!currentSource.data) {
        scrapingSteps.value.push({ time: "[" + consoleTime + "]", text: currentSource.stageHeading, highlight: true });
        scrollDown();

        if (currentSource.visualizationType == "Finished") {
            setTimeout(() => {
                console.log("Scraping finished");
                emit("scrapingFinished");
            }, visualizingInterval * 2);
        } else {
            currentStageHeaderVisualized.value = false;
            currentSourceIndex.value++;
            lastStepIndex.value = 0;
            visualizeNextStep();
        }

        return;
    }

    setTimeout(
        () => {
            const currentKey = currentSource.data[lastStepIndex.value];

            if (currentKey) {
                // Check if this is the start of the new source to a
                if (lastStepIndex.value == 0 && !currentStageHeaderVisualized.value) {
                    // Print stage heading only if there are more than one steps already.
                    // This prevents double heading on the start of scraping as there is
                    // already a default heading from onMounted hook
                    if (scrapingSteps.value.length > 1) {
                        scrapingSteps.value.push({ time: "[" + consoleTime + "]", text: currentSource.stageHeading, highlight: true });
                    }

                    sourceType.value = currentSource.visualizationType;
                    currentStageHeaderVisualized.value = true;
                    visualizeNextStep();
                    return;
                }

                const stepData = {
                    time: "[" + consoleTime + "]",
                    text: currentKey,
                };

                if (sourceType.value == "Google") {
                    stepData.text = "Mentions on: " + currentKey;
                } else if (sourceType.value == "AI") {
                    stepData.skipFoundPrefix = true;
                }

                scrapingSteps.value.push(stepData);
                scrollDown();
                lastStepIndex.value++;
            } else {
                // Check if the current source is finished
                if (lastStepIndex.value >= currentSource.data.length) {
                    currentSourceIndex.value++;
                    lastStepIndex.value = 0;
                    currentStageHeaderVisualized.value = false;
                }
            }

            scrollDown();
            visualizeNextStep();
        },
        getRandomDelayInRange(50, 250),
    );
};

const getRandomDelayInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const scrollDown = () => {
    if (stepsElement.value) {
        nextTick(() => {
            stepsElement.value.scrollTop = stepsElement.value.scrollHeight;
        });
    }
};

const getConsoleTime = () => {
    const date = new Date();
    const hours = (date.getHours() < 10 ? "0" : "") + date.getHours();
    const minutes = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    const seconds = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
    const time = hours + ":" + minutes + ":" + seconds;

    return time;
};

onMounted(() => {
    scrapingSteps.value.push({ time: "[" + getConsoleTime() + "]", text: "🔥 Starting online presence lookup", highlight: true });
    visualizeNextStep();
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.scrapper {
    &__stepBox {
        background-color: $scraper-visualizer-background-color;
        padding: 10px;
        width: 100%;
        height: 350px;
        overflow-y: scroll;
        display: flex;
        flex-direction: column;
        margin-top: 10px;
        margin-bottom: 25px;
        border-radius: $default-border-radius;
        text-align: left;

        p {
            color: white;
            margin-bottom: 0px;
        }

        &--time {
            font-family: "CourierPrime";
            margin-right: 10px;
        }

        &--highlight {
            color: $primary-action-color !important;
        }
    }
}
</style>
