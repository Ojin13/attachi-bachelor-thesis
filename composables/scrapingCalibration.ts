import type { ProfileForConfirmation } from "~/types";

/**
 * Composable function for scraping calibration.
 * Scraping calibarion is a process where user is provided
 * with list of similar profiles and asked to confirm the identity
 * of the person they are looking for.
 */
export function useScrapingCalibration() {
    const showDataConfirmation = ref(false);
    const dataForConfirmation: Ref<ProfileForConfirmation[]> = ref([]);

    /**
     * Maps the raw data from Google search to the array of ProfileForConfirmation
     * which is used for confirmation in the UI
     * @param data - Raw data to be mapped
     */
    const prepareDataForConfirmation = (data: any) => {
        const preparedData: ProfileForConfirmation[] = [];

        data.forEach((item: any) => {
            const formattedItem: ProfileForConfirmation = {};
            let formattedTitle = "";

            formattedItem.link = item.link;
            formattedItem.image = getImageForConfirmation(item);

            formattedTitle = item.title;
            if (item.title.includes("| LinkedIn")) {
                formattedTitle = item.title.replace("| LinkedIn", "");
            }

            formattedItem.title = formattedTitle;
            preparedData.push(formattedItem);
        });

        return preparedData;
    };

    /**
     * Tries to get the profile image from google search results
     * @param item - Item from google search results
     * @returns URL of the image or null
     */
    const getImageForConfirmation = (item: any) => {
        let personImage = "";

        // Try to get cse_thumbnail
        if (item.pagemap?.cse_thumbnail) {
            let cseThumbnail = item.pagemap.cse_thumbnail;

            if (cseThumbnail.length > 0) {
                personImage = cseThumbnail[0].src;
                return personImage;
            }
        }

        // Try to get og:image from metatags
        if (item.pagemap?.metatags) {
            let metatags = item.pagemap.metatags;

            for (let i = 0; i < metatags.length; i++) {
                if (metatags[i]["og:image"]) {
                    personImage = metatags[i]["og:image"];
                    return personImage;
                }
            }
        }

        // Try to get image from cse_image
        if (item.pagemap?.cse_image) {
            let cseImage = item.pagemap.cse_image;

            if (cseImage.length > 0) {
                personImage = cseImage[0].src;
                return personImage;
            }
        }

        return null;
    };

    /**
     * Prepares the UI for confirmation of the data
     * @param rawDataForConfirmation - Raw data from Google search to be confirmed
     * @returns Object with data for the confirmation UI
     */
    const prepareConfirmationUI = (rawDataForConfirmation: any) => {
        dataForConfirmation.value = prepareDataForConfirmation(rawDataForConfirmation);
        showDataConfirmation.value = true;

        return {
            visualizationType: "Google",
            stageHeading: "🔥 Filtering public profiles",
            data: ["Several similar profiles. Please confirm identity for search calibration"],
        };
    };

    return { prepareConfirmationUI, dataForConfirmation, showDataConfirmation };
}
