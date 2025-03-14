import type { ScrapedWebsite, ScrapedData, RawScrapedData, Contact, DataPreset, ContactNote } from "~/types";
import { DataTypeForPrompt, ServerAction, SaveAsType } from "~/types";

/**
 * Composable function that handles scraping operations and mapping of scraped data
 * @param contactBasicInfo - Contact object with basic information for scraping
 * @param contactDataPresets - Array of DataPreset objects for saving scraped data
 * @param contactNotes - Array of ContactNote objects for saving notes
 */
export function useScraper(contactBasicInfo: Ref<Contact>, contactDataPresets: Ref<DataPreset[]>, contactNotes: Ref<ContactNote[]>) {
    const mappedData: ScrapedData = {
        data: [],
        websites: [],
        otherImages: [],
        similarPeople: [],
        files: [],
        socials: {},
        instagramProfiles: [],
        facebookProfiles: [],
        twitterProfiles: [],
        youtubeProfiles: [],
        redditProfiles: [],
        pinterestProfiles: [],
        quoaraProfiles: [],
        tiktokProfiles: [],
        snapchatProfiles: [],
        nicknameResults: [],
    };

    // Composables
    const { mapProxyCurlData, pretifyObjectKeys } = useProxycurlMapper(contactBasicInfo, mappedData);
    const { mapGoogleSearchData, tryToDetectWebsiteByNameSimilarity } = useGoogleSearchMapper(contactBasicInfo);
    const { createPromptForScrapedData } = usePromptCreator(contactBasicInfo, contactDataPresets, contactNotes);
    const { callFire } = useFirebaseConnector();

    /**
     * Maps RawScrapedData to ScrapedData
     * @param scrapedData RawScrapedData object containing data from standard scraper flow
     * @returns ScrapedData object with mapped data
     */
    const mapScrapedData = (scrapedData: RawScrapedData): ScrapedData => {
        if (scrapedData.proxyCurl) {
            mappedData.data.push(...mapProxyCurlData(scrapedData.proxyCurl));
        }

        if (scrapedData.googleSearch) {
            mappedData.websites.push(...mapGoogleSearchData(scrapedData.googleSearch));
        }

        if (scrapedData.fileSearch) {
            mappedData.files.push(...mapGoogleSearchData(scrapedData.fileSearch, true));
        }

        if (scrapedData.instagram) {
            mappedData.instagramProfiles.push(...mapGoogleSearchData(scrapedData.instagram, false, 42));
        }

        if (scrapedData.facebook) {
            mappedData.facebookProfiles.push(...mapGoogleSearchData(scrapedData.facebook, false, 40));
        }

        if (scrapedData.twitter) {
            mappedData.twitterProfiles.push(...mapGoogleSearchData(scrapedData.twitter, false, 43));
        }

        if (scrapedData.youtube) {
            mappedData.youtubeProfiles.push(...mapGoogleSearchData(scrapedData.youtube, false, 107));
        }

        if (scrapedData.otherSocials) {
            const mappedOtherSocials = mapGoogleSearchData(scrapedData.otherSocials);

            mappedOtherSocials.forEach((socialProfile: ScrapedWebsite) => {
                socialProfile.saveAsType = SaveAsType.question;

                if (socialProfile.displayLink.includes("reddit.com")) {
                    socialProfile.questionID = 105;
                    mappedData.redditProfiles.push(socialProfile);
                } else if (socialProfile.displayLink.includes("pinterest.com")) {
                    socialProfile.questionID = 110;
                    mappedData.pinterestProfiles.push(socialProfile);
                } else if (socialProfile.displayLink.includes("tiktok.com")) {
                    socialProfile.questionID = 111;
                    mappedData.tiktokProfiles.push(socialProfile);
                } else if (socialProfile.displayLink.includes("snapchat.com")) {
                    socialProfile.questionID = 112;
                    mappedData.snapchatProfiles.push(socialProfile);
                } else if (socialProfile.displayLink.includes("quora.com")) {
                    socialProfile.questionID = 113;
                    mappedData.quoaraProfiles.push(socialProfile);
                }
            });
        }

        if (scrapedData.nicknameData) {
            mappedData.nicknameResults.push(...mapGoogleSearchData(scrapedData.nicknameData));
        }

        prepareCustomSocials();

        return mappedData;
    };

    /**
     * This function simply checks if there is only one social profile for each social network
     * and if there is, it sets it as the main social network link as only one result
     * usually means it is the correct one.
     * @returns void
     */
    const prepareCustomSocials = () => {
        if (mappedData.facebookProfiles.length == 1) {
            mappedData.socials.facebook = mappedData.facebookProfiles[0].link;
        }

        if (mappedData.instagramProfiles.length == 1) {
            mappedData.socials.instagram = mappedData.instagramProfiles[0].link;
        }

        if (mappedData.twitterProfiles.length == 1) {
            mappedData.socials.twitter = mappedData.twitterProfiles[0].link;
        }

        if (mappedData.youtubeProfiles.length == 1) {
            mappedData.socials.youtube = mappedData.youtubeProfiles[0].link;
        }

        if (mappedData.redditProfiles.length == 1) {
            mappedData.socials.reddit = mappedData.redditProfiles[0].link;
        }

        if (mappedData.pinterestProfiles.length == 1) {
            mappedData.socials.pinterest = mappedData.pinterestProfiles[0].link;
        }

        if (mappedData.tiktokProfiles.length == 1) {
            mappedData.socials.tiktok = mappedData.tiktokProfiles[0].link;
        }

        if (mappedData.snapchatProfiles.length == 1) {
            mappedData.socials.snapchat = mappedData.snapchatProfiles[0].link;
        }

        if (mappedData.quoaraProfiles.length == 1) {
            mappedData.socials.quora = mappedData.quoaraProfiles[0].link;
        }
    };

    /**
     * This function takes the google search results for the contact name
     * and tries to find the personal website of the contact by comparing the domain
     * with the contact name. If similarity is more then x% (based on levenshtein distance)
     * it is considered a match and the PersonalWebsiteGuess object is returned.
     * If no match is found, null is returned.
     * @param googleSearchData - Google search API response - items property
     * @returns PersonalWebsiteGuess object if match is found, otherwise null
     */
    const findPersonalWebsite = (googleSearchData: any) => {
        const personalWebsite = tryToDetectWebsiteByNameSimilarity(googleSearchData);

        // If contact name and domain are similar
        if (personalWebsite.confidence > 55) {
            mappedData.socials.personalWebsite = personalWebsite.url;

            mappedData.data.push({
                name: "Personal Website",
                value: personalWebsite.url,
                source: "Smart search",
                saveAsType: SaveAsType.question,
                questionID: 108,
                isURL: true,
            });

            return personalWebsite;
        }

        return null;
    };

    /**
     *  This function takes the google search results for the contact name
     * and tries to find the wikipedia page of the contact by comparing the domain
     * with the contact name. If similarity is more then x% (based on levenshtein distance)
     * it is considered a match and the Wikipedia object is returned.
     * If no match is found, null is returned.
     * @param googleSearchData - Google search API response - items property
     * @returns PersonalWebsiteGuess object if match is found, otherwise null
     */
    const findWikipediaPage = (googleSearchData: any) => {
        // Extract Wikipedia page Titles
        let wikipediaPageTitles: string[] = [];
        googleSearchData.forEach((wikiPage: any) => {
            wikipediaPageTitles.push(wikiPage.title.split(" - Wiki")[0]);
        });

        const wikiPage = tryToDetectWebsiteByNameSimilarity(googleSearchData, wikipediaPageTitles);

        if (wikiPage.confidence > 80) {
            mappedData.socials.wikipedia = wikiPage.url;

            mappedData.data.push({
                name: "Wikipedia",
                value: wikiPage.url,
                source: "Smart search",
                saveAsType: SaveAsType.question,
                questionID: 106,
                isURL: true,
            });

            return wikiPage;
        }

        return null;
    };

    /**
     * This function calls the OpenAI API to generate a summary of the scraped data.
     * This summary is then added to the mappedData object and returned.
     * @returns ScrapedData object with added summary
     */
    const addSummaryToMappedData = async (): Promise<ScrapedData> => {
        const websiteSummary = await callFire({ action: ServerAction.chatWithBot, prompt: createPromptForScrapedData(mappedData, DataTypeForPrompt.websites) });
        const individualDataSummary = await callFire({
            action: ServerAction.chatWithBot,
            prompt: createPromptForScrapedData(mappedData, DataTypeForPrompt.individualInformation, websiteSummary.content),
        });
        mappedData.summaryByAI = websiteSummary.content + "\n\n" + individualDataSummary.content;
        return mappedData;
    };

    /**
     * This function creates a google search query from the contact name and
     * adds google search operators for better search results.
     * @param searchEngineType Determines which google search operators to use
     * @param exactMatch If true, the search query will be wrapped in quotes for exact term matching
     * @returns Complete google search query (string)
     */
    const makeGoogleSearchQuery = (searchEngineType: string, exactMatch: boolean | null = null, searchedTerm: string | null) => {
        let searchQuery = "";
        let exactMatching = false;

        if (exactMatch != null) {
            exactMatching = exactMatch;
        } else {
            const contactNameParts = contactBasicInfo.value.name.split(" ");

            // If name has more than 2 parts, don't wrap it in quotes for exact term matching
            // as it is too restrictive
            if (contactNameParts.length <= 2) {
                exactMatching = true;
            }
        }

        if (!searchedTerm) {
            searchedTerm = contactBasicInfo.value.name;
        }

        if (exactMatching) {
            searchQuery = '"' + searchedTerm + '"';
        } else {
            searchQuery = searchedTerm;
        }

        // Add allowed filetypes to search query
        if (searchEngineType == "fileSearch") {
            const searchForFileTypes = [
                "pdf",
                "ps",
                "csv",
                "kml",
                "kmz",
                "gpx",
                "hwp",
                "xls",
                "xlsx",
                "ppt",
                "pptx",
                "doc",
                "docx",
                "odp",
                "ods",
                "odt",
                "rtf",
                "svg",
                "tex",
                "txt",
                "text",
                "bas",
                "c",
                "cc",
                "cpp",
                "cxx",
                "h",
                "hpp",
                "cs",
                "java",
                "pl",
                "py",
                "wml",
                "wap",
                "xml",
            ];
            searchQuery += " filetype:" + searchForFileTypes.join(" OR filetype:");
        }

        return searchQuery;
    };

    return { mapScrapedData, addSummaryToMappedData, findPersonalWebsite, findWikipediaPage, pretifyObjectKeys, makeGoogleSearchQuery };
}
