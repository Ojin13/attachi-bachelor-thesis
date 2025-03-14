<template>
    <ion-page>
        <ion-content force-overscroll="false" class="">
            <div class="screenContainer">
                <NavigationPanel
                    :leftIconURL="contactBasicData.profilePic == undefined ? '' : contactBasicData.profilePic.url"
                    :navigationTitle="'Online information lookup'"
                    :navigationDesc="'Public information about this contact'"
                />

                <div class="pageContainer scraper">
                    <div class="scrapingSwiper swiper swiper-no-swiping">
                        <div class="swiper-wrapper">
                            <!-- Start scraping slide -->
                            <div class="swiper-slide scraper__firstSlide">
                                <h1>Gather data online</h1>
                                <p class="scraper--intro gray">
                                    Search social networks, websites and other online sources for public information about this person. The more information you provide, the better the results.
                                </p>

                                <div class="scraper__magnifier">
                                    <img src="~/assets/images/magnifying-glass.png" />
                                </div>

                                <div class="scraper__credits">
                                    <p class="scraper__credits--amount bold medium">Your credits: {{ getCredits }}<img src="~/assets/images/credits.png" /></p>
                                    <p class="scraper__credits--rechargeDate medium gray">Next free recharge {{ getRechargeDate }}</p>
                                </div>
                                <div @click="startScraping()">
                                    <ActionButton :specialButtonText="'credit_cost'" />
                                </div>

                                <div v-if="creditError" class="errorMessage__form errorMessage__form--center">
                                    <p class="medium2 bold errorMessage__form--text">You don't have enough credits.</p>
                                </div>

                                <p :id="scrapingHelperTrigger" class="medium bold gray">How does this work?</p>
                            </div>

                            <!-- Scraping visualization slide -->
                            <div class="swiper-slide">
                                <div class="scraper--loadingHeader">
                                    <h1>Searching the person</h1>
                                    <ion-spinner name="circles"></ion-spinner>
                                </div>

                                <p class="scraper--subheader bold gray">
                                    Name: <span class="scraper--subheader--value medium black">{{ contactBasicData.name }}</span>
                                </p>
                                <p class="scraper--subheader bold gray">
                                    Nickname: <span class="scraper--subheader--value medium black">{{ getNickname(true) }}</span>
                                </p>

                                <ScrapingVisualizer :waitingForCalibration="showDataConfirmation" :scrappedData="scrapedDataForVisualization" @scrapingFinished="goToResults()" />

                                <ScrapingCalibration
                                    :displayConfirmation="showDataConfirmation"
                                    :dataForConfirmation="dataForConfirmation"
                                    @dataConfirmed="linkedInFound($event)"
                                    @noMatch="linkedInNotFound()"
                                />
                            </div>

                            <!-- Results slide -->
                            <div class="swiper-slide">
                                <ScrapedResults
                                    v-if="showResults"
                                    :scrapedData="mappedScrapedData"
                                    :contactBasicData="contactBasicData"
                                    :contactDataPresets="contactDataPresets"
                                    :updateFunction="updateContactDataPreset"
                                    :newNoteFunction="createNewNote"
                                    :updateDescFunction="updateContactDesc"
                                    :questionProvider="getQuestionByID"
                                />
                            </div>
                        </div>
                    </div>

                    <ScrapingHelp :triggerElement="scrapingHelperTrigger" />
                    <PrivacyConsent />
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import { store } from "~/store";
import Swiper from "swiper";
import { ServerAction } from "~/types";

definePageMeta({
    middleware: ["is-authenticated"],
});

// Already known contact data
const contactBasicData = ref({});
const contactDataPresets = ref({});
const contactNotes = ref({});

// Scraped data data
const proxyCurlData = ref({});
const googleSearchData = ref({});
const filesSearchData = ref({});
const instagramData = ref({});
const facebookData = ref({});
const twitterData = ref({});
const youtubeData = ref({});
const otherSocialsData = ref({});
const nicknameData = ref({});

const scrapedDataForVisualization = ref([]);
const creditsNeededForScraping = 10;
const creditError = ref(false);
const showResults = ref(false);
const scrapingHelperTrigger = "open-scraping-helper";
const swiperInstance = ref(null);

// Scraping flow consists out of several stages.
// Stages are not neccessary visualized in order because some might take longer to scrape needed data.
// Stage 1: LinkedIn profile search on Proxycurl - takes time to load which means it will by probably visualized later
// Stage 2: General google search + personal website lookup
// Stage 3: Filetype search
// Stage 4: Instagram search
// Stage 5: Facebook search
// Stage 6: Twitter search
// Stage 7: Youtube search
// Stage 8: Wikipedia search
// Stage 9: Other social networks search (TikTok, Pinterest, Reddit, etc.)
// Stage 10: Personal website/blog search
// Stage 11: Nickname search
const numberOfScrapingStages = 11;
let currentScrapingStage = 0;

const mappedScrapedData = ref({});
let startedScraping = false;
let scrapingToken = null;

const { callFire } = useFirebaseConnector();
const { getCurrentRoute, popFromStack } = useIonicRouter();
const { mapScrapedData, addSummaryToMappedData, findPersonalWebsite, findWikipediaPage, pretifyObjectKeys, makeGoogleSearchQuery } = useScraper(contactBasicData, contactDataPresets, contactNotes);
const { updateContactBasicData, updateContactDataPreset } = useContactManagement(contactBasicData, contactDataPresets);
const { createNewNote } = useCustomNotes(contactNotes, parseInt(getCurrentRoute().query.contactID));
const { getQuestionByID } = useDataPresets(contactDataPresets);
const { prepareConfirmationUI, dataForConfirmation, showDataConfirmation } = useScrapingCalibration();

const updateContactDesc = (newDesc) => {
    contactBasicData.value.description = newDesc;
    updateContactBasicData("desc", newDesc);
};

const getCredits = computed(() => {
    return store.state.userData.credits;
});

const goToResults = async () => {
    // Check if any source failed to load and if so, manually finish the scraping
    if (currentScrapingStage < numberOfScrapingStages) {
        await finalizeScraping();
        swiperInstance.value.slideNext();
        showResults.value = true;
        return;
    }

    swiperInstance.value.slideNext();
    showResults.value = true;
};

const startScraping = async () => {
    // Check if user has enough credits
    // is just a simple UI check. Real check is done on the server.
    const numberOfCredits = Number(store.state.userData.credits);

    if (numberOfCredits < creditsNeededForScraping) {
        creditError.value = true;
        return;
    } else {
        if (startedScraping) {
            return;
        }

        startedScraping = true;
        creditError.value = false;
        store.commit("setCredits", numberOfCredits - creditsNeededForScraping);
        swiperInstance.value.slideNext();
    }

    // Ask for scraping token
    const tokenData = await callFire({ action: ServerAction.requestScrapingToken });
    scrapingToken = tokenData.scrapingToken;

    // Check if contact already has saved LinkedIn profile (100)
    // or if it shoud be searched first
    const hasLinkedIn = getQuestionByID(100).answerID ? true : false;

    if (hasLinkedIn) {
        standardScaperFlow();
    } else {
        // After going through all dataForConfirmation, system will trigger standardScaperFlow
        const likedInLookup = await googleSearch("LinkedInLookup");

        if (likedInLookup != null) {
            scrapedDataForVisualization.value.push(prepareConfirmationUI(likedInLookup));
        } else {
            console.log("No LinkedIn profile found. Skipping to next stage.");
            linkedInNotFound();
        }
    }
};

const standardScaperFlow = async (customProfile = null, linkedinProfileFound = true) => {
    // #1 Scrape LinkedIn profile

    if (linkedinProfileFound) {
        if (customProfile) {
            proxyCurlSearch(customProfile);
        } else {
            proxyCurlSearch();
        }
    }

    // #2 Google search
    googleSearch("genericSearch").then((googleSearchData) => {
        // #3 Personal website/blog lookup from Google search results
        tryToFindPersonalWebsite(googleSearchData);
    });

    // #4 Google search for files containing contact's name
    googleSearch("fileSearch");

    // #5 Wikipedia search
    wikipediaSearch();

    // #6 Instagram search
    socialNetworkProfileSearch(42, "InstagramLookup", "🖼️ Searching Instagram profile");

    // #7 Facebook search
    socialNetworkProfileSearch(40, "FacebookLookup", "📘 Searching Facebook profile");

    // #8 Twitter search
    socialNetworkProfileSearch(43, "TwitterLookup", "🐦 Searching Twitter profile");

    // #9 Youtube search
    socialNetworkProfileSearch(107, "YoutubeLookup", "📺 Searching Youtube profile");

    // #10 Other social networks search
    otherSocialsSearch();

    // #11 Nickname search
    nicknameSearch();
};

const tryToFindPersonalWebsite = (googleSearchResults) => {
    let personalWebsite = null;

    if (googleSearchResults) {
        personalWebsite = findPersonalWebsite(googleSearchResults);
    }

    const personalWebsiteVisualization = {
        visualizationType: "default",
        stageHeading: "🌍 Looking for personal website/blog",
    };

    if (personalWebsite) {
        personalWebsiteVisualization.data = ["Personal website with " + personalWebsite.confidence + "% confidence"];
    }

    checkForScrapingCompletion(personalWebsiteVisualization);
};

const tryToFindWikipedia = (googleSearchResults) => {
    let wikipediaPage = null;

    if (googleSearchResults) {
        wikipediaPage = findWikipediaPage(googleSearchResults);
    }

    const wikiVisualization = {
        visualizationType: "default",
        stageHeading: "🌍 Looking for Wikipedia page",
    };

    if (wikipediaPage) {
        wikiVisualization.data = ["Wikipedia page with " + wikipediaPage.confidence + "% confidence"];
    }

    checkForScrapingCompletion(wikiVisualization);
};

const checkForScrapingCompletion = (newScrapedBatch) => {
    currentScrapingStage++;
    scrapedDataForVisualization.value.push(newScrapedBatch);

    if (currentScrapingStage >= numberOfScrapingStages) {
        finalizeScraping();
    }
};

const finalizeScraping = async () => {
    mappedScrapedData.value = mapScrapedData({
        proxyCurl: proxyCurlData.value,
        googleSearch: googleSearchData.value,
        fileSearch: filesSearchData.value,
        instagram: instagramData.value,
        facebook: facebookData.value,
        twitter: twitterData.value,
        youtube: youtubeData.value,
        otherSocials: otherSocialsData.value,
        nicknameData: nicknameData.value,
    });

    const summarizingProgress = ["Making sense of web results", "Trying to filter people with the same name", "Creating a summary..."];

    const summaryVisualization = {
        visualizationType: "AI",
        stageHeading: "🤖 Analyzing found data wit AI",
        data: summarizingProgress,
    };

    scrapedDataForVisualization.value.push(summaryVisualization);

    await addSummaryToMappedData();

    scrapedDataForVisualization.value.push({
        visualizationType: "Finished",
        stageHeading: "🏆 Data gathering completed",
    });
};

const wikipediaSearch = async () => {
    const wikipediaSearchResults = await googleSearch("WikipediaLookup");
    tryToFindWikipedia(wikipediaSearchResults);
};

const proxyCurlSearch = async (customProfile = null) => {
    let profileURL = "";

    if (customProfile) {
        profileURL = customProfile;
    } else {
        // Get LinkedIn profile URL
        let linkedInQuestion = getQuestionByID(100);

        if (linkedInQuestion) {
            profileURL = linkedInQuestion.answer;
        }

        if (!profileURL) {
            console.error("No LinkedIn profile URL found.");
            return;
        }
    }

    // Remove the language part from the LinkedIn profile URL
    let parts = profileURL.split("/");
    if (parts[parts.length - 3] == "in") {
        if (parts[parts.length - 1].length > 0) {
            parts.pop();
            profileURL = parts.join("/");
        }
    }

    const linkedinData = await callFire({
        action: ServerAction.linkedInScrapper,
        specificAction: "getProfileDataByURL",
        scrapingToken: scrapingToken,
        linkedinProfileUrl: profileURL,
    });

    if (linkedinData) {
        proxyCurlData.value = linkedinData;
    }

    checkForScrapingCompletion({
        visualizationType: "LinkedIn",
        stageHeading: "🔥 Starting lookup for specific data",
        data: pretifyObjectKeys(proxyCurlData.value),
    });
};

const googleSearch = async (searchEngineType, exactMatching = null, searchedTerm = null) => {
    const googleSearchResults = await callFire({
        action: ServerAction.googleSearchEngine,
        searchTerm: makeGoogleSearchQuery(searchEngineType, exactMatching, searchedTerm),
        scrapingToken: scrapingToken,
        searchEngineType: searchEngineType == "fileSearch" ? "genericSearch" : searchEngineType,
    });

    let anyResults = true;
    if (!googleSearchResults?.items || googleSearchResults?.items.length == 0) {
        anyResults = false;
    }

    const googleKeysForVisualization = [];
    if (anyResults) {
        googleSearchResults.items.forEach((item) => {
            let fileFormatShort = "";
            if (item.fileFormat) {
                fileFormatShort = item.fileFormat.split("/")[0];
            }
            googleKeysForVisualization.push(item.displayLink + (searchEngineType == "fileSearch" ? " - " + fileFormatShort : ""));
        });
    }

    // Check if current search type should visualize
    // found websites. If it's not, just return the data
    if (searchEngineType == "genericSearch") {
        googleSearchData.value = googleSearchResults.items;

        checkForScrapingCompletion({
            visualizationType: "Google",
            stageHeading: "🌍 Starting online presence lookup",
            data: googleKeysForVisualization,
        });
    }

    if (searchEngineType == "fileSearch") {
        filesSearchData.value = googleSearchResults.items;

        checkForScrapingCompletion({
            visualizationType: "Google",
            stageHeading: "📁 Searching mentions in files like PDF etc...",
            data: googleKeysForVisualization,
        });
    }

    if (!anyResults) {
        return null;
    }

    return googleSearchResults.items;
};

const otherSocialsSearch = async () => {
    const otherSocials = await googleSearch("OtherSocialNetworksLookup", false);

    if (otherSocials) {
        otherSocialsData.value = otherSocials;
    }

    checkForScrapingCompletion({
        visualizationType: "Google",
        stageHeading: "🧑 Searching smaller social networks",
    });
};

const getNickname = (returnUnknown = false) => {
    let nickname = getQuestionByID(28).answer;
    let childhoodNickname = getQuestionByID(27).answer;

    if (!nickname && !childhoodNickname) {
        if (returnUnknown) {
            return "not provided";
        }
        return null;
    } else if (!nickname && childhoodNickname) {
        return childhoodNickname;
    }

    return nickname;
};

const nicknameSearch = async () => {
    let nickname = getNickname();
    if (!nickname) {
        currentScrapingStage++;
        return;
    }

    const nicknameSearchResults = await googleSearch("nicknameSearch", true, nickname);

    if (nicknameSearchResults) {
        nicknameData.value = nicknameSearchResults;
    }

    checkForScrapingCompletion({
        visualizationType: "Google",
        stageHeading: "🎲 Searching nickname mentions",
    });
};

const socialNetworkProfileSearch = async (questionID, searchEngineType, visualizerHeading) => {
    const currentProfileQuestion = getQuestionByID(questionID);
    const socialProfileAlreadyKnown = currentProfileQuestion.answerID ? true : false;

    if (!socialProfileAlreadyKnown) {
        const googleSearchResults = await googleSearch(searchEngineType);

        if (googleSearchResults) {
            if (searchEngineType == "FacebookLookup") {
                facebookData.value = googleSearchResults;
            } else if (searchEngineType == "TwitterLookup") {
                twitterData.value = googleSearchResults;
            } else if (searchEngineType == "YoutubeLookup") {
                youtubeData.value = googleSearchResults;
            } else if (searchEngineType == "InstagramLookup") {
                instagramData.value = googleSearchResults;
            } else if (searchEngineType == "OtherSocialNetworksLookup") {
                otherSocialsData.value = googleSearchResults;
            }
        }

        checkForScrapingCompletion({
            visualizationType: "Google",
            stageHeading: visualizerHeading,
        });
    } else {
        // If social profile is already known, don't search for it
        currentScrapingStage++;
    }
};

/*
    const getInstagramProfileNameFromURL = (profileURL) => {

        // check if profile URL is only username or full URL
        if(profileURL.includes("instagram.com/")){

            // Get everything after instagram.com/
            profileURL = profileURL.split("instagram.com/")[1];

            // Remove everything after the username
            if(profileURL.includes("/")){
                return profileURL.split("/")[0];
            }
        }

        return profileURL;
    }
    */

const linkedInFound = async (profileURL) => {
    showDataConfirmation.value = false;
    const linkedInQuestion = getQuestionByID(100);
    linkedInQuestion.answer = profileURL;
    updateContactDataPreset(linkedInQuestion, true);
    standardScaperFlow(profileURL);
};

const linkedInNotFound = () => {
    showDataConfirmation.value = false;
    currentScrapingStage++;
    standardScaperFlow(null, false);

    // Evem if LinkedIn was not found, we still need to call scraping endpoint for LinkedIn
    // since it will charge the second half of the credits (5 on the start for scrapingToken, and another 5 on linkedin scraping...)
    callFire({
        action: ServerAction.linkedInScrapper,
        specificAction: "chargeForNoProfileFound",
        scrapingToken: scrapingToken,
    });
};

const getRechargeDate = computed(() => {
    if (!store.state.userData.nextCreditRecharge) {
        return "";
    }

    const rechargeDate = new Date(store.state.userData.nextCreditRecharge);

    // Get distance in days between today and the recharge date
    const distance = Math.floor((rechargeDate - new Date()) / (1000 * 60 * 60 * 24));

    if (distance <= 0) {
        return "is tomorrow";
    }

    return distance + " in" + (distance == 1 ? " day" : " days");
});

onMounted(() => {
    callFire({ action: ServerAction.getCredits }).then((res) => {
        store.commit("setCredits", res.credits);
        store.commit("setNextCreditRecharge", res.nextAutoRecharge);
    });

    swiperInstance.value = new Swiper(".scrapingSwiper", {
        direction: "horizontal",
        noSwipingClass: "swiper-no-swiping",
        noSwiping: true,
        loop: false,
    });
});

onBeforeMount(() => {
    if (!getCurrentRoute().query.contactID) {
        console.error("No contact ID provided in route params.");
        popFromStack("/auth/contacts");
    } else {
        contactBasicData.value = store.state.userData.contacts[getCurrentRoute().query.contactID];
        contactDataPresets.value = store.state.userData.contactDataPresets[getCurrentRoute().query.contactID];
        contactNotes.value = store.state.userData.contactNotes[getCurrentRoute().query.contactID];
    }

    if (swiperInstance.value) {
        swiperInstance.value.destroy();
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.scraper {
    &__firstSlide {
        text-align: center;
    }

    &--intro {
        padding: 0px 10px;
    }

    &--loadingHeader {
        display: flex;
        align-items: center;

        h1 {
            margin-right: 10px;
        }

        ion-spinner {
            position: relative;
            top: 5px;
        }
    }

    &--subheader {
        margin-bottom: 0px;
        display: inline-block;
        margin-right: 20px;

        &--value {
            color: black;
            margin-left: 5px;
        }
    }

    &__credits {
        margin-bottom: 15px;
        padding: 0px 10px;

        p {
            margin-bottom: 5px;
        }

        &--amount {
            justify-content: center;
            display: flex;
            align-items: center;
            img {
                width: 18px;
                margin-left: 3px;
            }
        }
    }

    &__magnifier {
        text-align: center;
        img {
            width: 75%;
            margin-top: 25px;
            margin-bottom: 25px;
        }
    }

    .swiper-wrapper {
        align-items: start;
    }
}
</style>
