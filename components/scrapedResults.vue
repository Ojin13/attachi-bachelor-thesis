<template>
    <div class="scrapingResults__backgroundImage__wrapper">
        <div class="scrapingResults__backgroundImage" :style="{ backgroundImage: 'url(' + getCoverImage + ')' }">
            <!-- Background image -->
        </div>
    </div>

    <div class="scrapingResults__profilePicture__wrapper">
        <div class="scrapingResults__profilePicture--placeholder">
            <div class="scrapingResults__profilePicture" :style="{ backgroundImage: 'url(' + getProfilePicture + ')' }">
                <!-- Profile picture -->
            </div>
        </div>
    </div>

    <div class="scrapingResults__name">
        <h1 class="bold">{{ contactBasicData.name }}</h1>
    </div>

    <SocialNetworks :centerIcons="true" :showHeading="false" :customSocials="getScrapedSocials" :dataPresets="contactDataPresets" />

    <DropdownPanel :dropdownHeading="'Summary'" :dropdownDescription="'Short briefing about the person'" :dropdownIcon="'🗨️'" :initiallyOpen="true">
        <div class="scrapingResults__summary">
            <p ref="scrapedSummaryElement" class="medium">{{ scrapedData.summaryByAI }}</p>
        </div>
    </DropdownPanel>

    <div class="scrapingResults__list">
        <!-- Proxycurl results -->
        <ScrapedDataDropdown
            v-if="displayScrapedDataCategory(scrapedData.data)"
            :dropdownStats="getWebsitesDropdownStats(scrapedData.data)"
            :saveFunction="saveInformation"
            :getSaveButtonTextFunction="getSaveButtonText"
            :scrapedData="scrapedData.data"
        />

        <!-- Google Programmable Search Engine results -->
        <div v-for="scrapedItem in getScrapedDataCategories" :key="scrapedItem.id">
            <ScrapedWebsitesDropdown
                v-if="displayScrapedDataCategory(scrapedItem.data)"
                :dropdownHeading="scrapedItem.name"
                :dropDownStats="getWebsitesDropdownStats(scrapedItem.data)"
                :dropDownIcon="scrapedItem.icon"
                :initiallyOpen="false"
                :scrapedData="scrapedItem.data"
                :saveFunction="saveInformation"
                :getSaveButtonTextFunction="getSaveButtonText"
            />
        </div>
    </div>

    <ion-alert
        trigger="present-alert"
        header="Replace existing answer?"
        :sub-header="getModalText()"
        :message="'Current answer: ' + getOriginalAnswer()"
        :buttons="getModalButtons()"
        :is-open="mergingModalOpen"
        @didDismiss="setOpen(false)"
    ></ion-alert>
</template>

<script setup>
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { QuestionDataType, YesNoValue } from "~/types";
import SelfTyper from "~/utils/selfTyper";

const props = defineProps({
    scrapedData: {
        type: Object,
        required: true,
    },
    updateFunction: {
        type: Function,
        required: true,
    },
    questionProvider: {
        type: Function,
        required: true,
    },
    newNoteFunction: {
        type: Function,
        required: true,
    },
    updateDescFunction: {
        type: Function,
        required: true,
    },
    contactBasicData: {
        type: Object,
        required: true,
    },
    contactDataPresets: {
        type: Object,
        required: true,
    },
});

const mergingModalOpen = ref(false);
const currentQuestion = ref(null);
const currentScrapedItem = ref(null);
const scrapedSummaryElement = ref(null);
const typerController = new TyperController(30, 1, 1);

const displayScrapedDataCategory = (data) => {
    if (data && data.length > 0) {
        return true;
    }
    return false;
};

const getScrapedDataCategories = computed(() => {
    const categories = [
        {
            name: "Articles and mentions online",
            icon: "📖",
            data: props.scrapedData.websites,
        },
        {
            name: "Files and documents",
            icon: "📁",
            data: props.scrapedData.files,
        },
        {
            name: "Nickname mentions",
            icon: "🎲",
            data: props.scrapedData.nicknameResults,
        },
        {
            name: "Instagram",
            icon: "instagramIcon",
            data: props.scrapedData.instagramProfiles,
        },
        {
            name: "Facebook",
            icon: "facebookIcon",
            data: props.scrapedData.facebookProfiles,
        },
        {
            name: "Twitter",
            icon: "twitterIcon",
            data: props.scrapedData.twitterProfiles,
        },
        {
            name: "Youtube",
            icon: "youtubeIcon",
            data: props.scrapedData.youtubeProfiles,
        },
        {
            name: "Reddit",
            icon: "redditIcon",
            data: props.scrapedData.redditProfiles,
        },
        {
            name: "Quora",
            icon: "quoraIcon",
            data: props.scrapedData.quoraProfiles,
        },
        {
            name: "Pinterest",
            icon: "pinterestIcon",
            data: props.scrapedData.pinterestProfiles,
        },
        {
            name: "TikTok",
            icon: "tiktokIcon",
            data: props.scrapedData.tiktokProfiles,
        },
        {
            name: "Snapchat",
            icon: "snapchatIcon",
            data: props.scrapedData.snapchatProfiles,
        },
    ];

    return categories;
});

const getScrapedSocials = computed(() => {
    return props.scrapedData.socials;
});

const getCoverImage = computed(() => {
    return props.scrapedData.backgroundImage;
});

const getProfilePicture = computed(() => {
    return props.scrapedData.linkedInProfilePicture;
});

const setOpen = (state) => {
    mergingModalOpen.value = state;
};

const getOriginalAnswer = () => {
    if (currentQuestion.value) {
        if (currentQuestion.value.originalAnswer == YesNoValue.true) {
            return YesNoValue.Yes;
        }

        if (currentQuestion.value.originalAnswer == YesNoValue.false) {
            return YesNoValue.No;
        }

        return currentQuestion.value.originalAnswer ? currentQuestion.value.originalAnswer : "Not available";
    }
};

const getSaveButtonText = (scrapedItem) => {
    if (scrapedItem.saveAsType == "question") {
        return scrapedItem.saved ? "Saved" : "Save to question";
    } else if (scrapedItem.saveAsType == "note") {
        if (scrapedItem.isFile) {
            return scrapedItem.saved ? "Saved" : "Save link to file as note";
        } else {
            return scrapedItem.saved ? "Saved" : "Save as note";
        }
    } else if (scrapedItem.saveAsType == "contactDescription") {
        return scrapedItem.saved ? "Saved" : "Save as contact description";
    } else {
        return scrapedItem.saved ? "Saved" : "Save";
    }
};

const getModalButtons = () => {
    const modalButtons = [
        {
            text: "Replace",
            handler: () => {
                currentQuestion.value.answer = currentScrapedItem.value.value;
                props.updateFunction(currentQuestion.value, true);
                delete currentQuestion.value.originalAnswer;
                currentScrapedItem.value.saved = true;
            },
        },
    ];

    if (currentQuestion.value?.questionDataType == QuestionDataType.text) {
        modalButtons.push({
            text: "Merge answers",
            handler: () => {
                currentQuestion.value.answer = currentQuestion.value.originalAnswer + "\n\n\n--- Also found this online ---\n" + currentScrapedItem.value.value;
                props.updateFunction(currentQuestion.value, true);
                delete currentQuestion.value.originalAnswer;
                currentScrapedItem.value.saved = true;
            },
        });
    }

    modalButtons.push({
        text: "Cancel",
    });

    return modalButtons;
};

const getModalText = () => {
    if (currentQuestion.value?.questionDataType == QuestionDataType.text) {
        return "This question already has an answer, do you want to replace it or merge the answers?";
    }

    return "This question already has an answer, do you want to replace it?";
};

const getWebsitesDropdownStats = (websites) => {
    if (!websites) {
        return "";
    }

    if (websites.length) {
        return websites.length + " x";
    }
};

const saveInformation = (scrapedItem) => {
    if (scrapedItem.saved) {
        return;
    }

    Haptics.impact({ style: ImpactStyle.Light });

    // Save scraped item as a new note
    if (scrapedItem.saveAsType == "note") {
        let customNoteText = scrapedItem.value;

        // Check if scrapedItem is a website - if so, it needs to be
        // modified before saving as a note
        if (scrapedItem.source == "Google") {
            customNoteText = modifyScrapedWebsiteNote(scrapedItem);
        }

        props.newNoteFunction(customNoteText);
        scrapedItem.saved = true;
        return;
    }

    // Save scraped item as a contact description
    if (scrapedItem.saveAsType == "contactDescription") {
        props.updateDescFunction(scrapedItem.value);
        scrapedItem.saved = true;
        return;
    }

    // Save scraped item as a question
    if (scrapedItem.saveAsType == "question") {
        const question = props.questionProvider(scrapedItem.questionID);
        currentQuestion.value = question;

        if (scrapedItem.source == "Google") {
            scrapedItem.value = scrapedItem.link;
        }

        // If the question already has an answer, decide
        // whether to replace or merge the answers
        if (currentQuestion.value.answer) {
            if (currentQuestion.value.answer == scrapedItem.value) {
                scrapedItem.saved = true;
                return;
            }

            if (!currentQuestion.value.originalAnswer) {
                currentQuestion.value.originalAnswer = currentQuestion.value.answer;
            }

            currentScrapedItem.value = scrapedItem;

            setOpen(true);
            return;
        }

        // If this is brand new answer, save it straight away
        if (!currentQuestion.value.answer || currentQuestion.value.answer == "") {
            currentQuestion.value.answer = scrapedItem.value;
            props.updateFunction(currentQuestion.value, true);
            scrapedItem.saved = true;
        }
    }
};

const modifyScrapedWebsiteNote = (scrapedWebsite) => {
    let customText = "Mentioned on a website " + scrapedWebsite.displayLink + "\n\n";
    customText += scrapedWebsite.title + "\n\n";
    customText += scrapedWebsite.summary + "\n\n";
    customText += "Link:\n" + scrapedWebsite.link;

    return customText;
};

onMounted(() => {
    new SelfTyper(scrapedSummaryElement.value, typerController, true);
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.scrapingResults {
    $negativeOffset: -125px;

    &__backgroundImage {
        width: 100%;
        height: 250px;
        background-size: cover;
        border-radius: $default-border-radius;

        &__wrapper {
            background-image: url("~/assets/images/leafes.jpg");
            border-radius: 10px;
        }
    }

    &__name {
        text-align: center;
        margin-top: $negativeOffset;
    }

    &__summary {
        text-align: justify;
        padding-right: 10px;
    }

    &__profilePicture {
        width: 250px;
        height: 250px;
        border: 5px solid black;
        background-size: cover;
        margin: auto;
        border-radius: $default-border-radius;

        &--placeholder {
            background-image: url("~/assets/images/person.png");
            border-radius: $default-border-radius;
            margin: auto;
            width: 250px;
            height: 250px;
        }

        &__wrapper {
            position: relative;
            top: $negativeOffset;
        }
    }

    &__list {
        overflow: hidden;
        padding-left: 2px;
        padding-right: 2px;
        padding-bottom: 15px;
    }

    &__proxyCurl {
        &--list {
            display: flex;
            flex-wrap: wrap;
            flex-direction: column-reverse;
        }
    }
}
</style>
