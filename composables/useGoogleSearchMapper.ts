import type { Contact, PersonalWebsiteGuess, RawScrapedData, ScrapedWebsite } from "~/types";
import getContactNameDomainSimilarity from "~/utils/domainComparator";
import { SaveAsType } from "~/types";

/**
 * Composable function that maps the data from a Google search to an array of ScrapedWebsite.
 * Also contains a function to try to detect a personal website based on the similarity of the domain name
 * and the contact's name.
 * @param contactBasicInfo - The basic contact information needed to compare search results to the contact name.
 */
export function useGoogleSearchMapper(contactBasicInfo: Ref<Contact>) {
    /**
     * Maps the data from a Google search to an array of ScrapedWebsite.
     * This extends to mapping the data to a specific question based on the source
     * of the search (eg Google search for Instagram maps to a question about Instagram profile).
     * @param googleSearchData - Raw scraped data from a Google search.
     * @param resultsAreFiles - Whether the search results are files or not.
     * @param mapToQuestion - The ID of the question to map the search results to.
     * @returns {ScrapedWebsite[]} - The mapped data to ScrapedWebsite araray.
     */
    const mapGoogleSearchData = (googleSearchData: RawScrapedData, resultsAreFiles: boolean = false, mapToQuestion: number | null = null): ScrapedWebsite[] => {
        const googleSearchMappedData: ScrapedWebsite[] = [];

        Object.keys(googleSearchData).forEach((key) => {
            const value = googleSearchData[key as keyof RawScrapedData];

            // Skip empty values from the search results
            if (!value || (Array.isArray(value) && value.length == 0)) {
                return;
            }

            // Some search results might have a preview image
            // If it exists, save it as a preview image
            let previewImage;
            if (value.pagemap?.cse_image) {
                if (value.pagemap?.cse_image.length >= 1) {
                    previewImage = value.pagemap?.cse_image[0].src;
                }
            }

            // Map the result to a ScrapedWebsite object
            const scrapedWebsiteObject: ScrapedWebsite = {
                title: value.title,
                summary: value.snippet,
                link: value.link,
                displayLink: value.displayLink,
                source: "Google",
                saveAsType: SaveAsType.note,
                previewImage: previewImage,
            };

            if (mapToQuestion) {
                scrapedWebsiteObject.saveAsType = SaveAsType.question;
                scrapedWebsiteObject.questionID = mapToQuestion;
            }

            if (!resultsAreFiles) {
                scrapedWebsiteObject.previewImage = previewImage;
            } else {
                scrapedWebsiteObject.isFile = true;

                if (value.fileFormat) {
                    scrapedWebsiteObject.fileExtension = value.fileFormat.split("/")[0];
                }
            }

            googleSearchMappedData.push(scrapedWebsiteObject);
        });

        return googleSearchMappedData;
    };

    /**
     * Tries to detect a personal website based on the similarity of the domain name and the contact's name.
     * @param googleSearchData - Raw scraped data from a Google search.
     * @param sanitizedDomains - An array of sanitized domain names to compare the contact's name to.
     * @returns {PersonalWebsiteGuess} - The detected personal website and the confidence of the detection.
     */
    const tryToDetectWebsiteByNameSimilarity = (googleSearchData: RawScrapedData, sanitizedDomains: string[] | null = null): PersonalWebsiteGuess => {
        let bestSimilarity = 0;
        let personalWebsite = "";
        let index = 0;

        Object.keys(googleSearchData).forEach((key) => {
            const value = googleSearchData[key as keyof RawScrapedData];

            let domainToCompare = value.displayLink;

            if (sanitizedDomains) {
                domainToCompare = sanitizedDomains[index];
            }

            let currentSimilarity = getContactNameDomainSimilarity(contactBasicInfo.value.name, domainToCompare, sanitizedDomains != null ? true : false);

            if (currentSimilarity > bestSimilarity) {
                bestSimilarity = currentSimilarity;
                personalWebsite = value.link;
            }

            index++;
        });

        let result: PersonalWebsiteGuess = { url: personalWebsite, confidence: bestSimilarity };
        return result;
    };

    return { mapGoogleSearchData, tryToDetectWebsiteByNameSimilarity };
}
