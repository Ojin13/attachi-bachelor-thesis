import { store } from "~/store";
import resolveLink from "~/utils/linkResolver";
import type { DataPreset, Question, SocialNetworks, ListOfSocialsQuestions } from "~/types";

/**
 * Composable function that handles all social networks operations
 * and maping of social networks to coresponing questions.
 * @param contactDataPresets - DataPresets needed to save the social networks
 */
export function useSocialNetworks(contactDataPresets: Ref<DataPreset[]>) {
    const { getQuestionByID } = useDataPresets(contactDataPresets);

    const socialNetworks: Ref<SocialNetworks> = ref({});

    // Mapping of social networks to coresponding questions
    const socialNetworkQuestions: ListOfSocialsQuestions[] = [
        { type: "facebook", questionID: 40 },
        { type: "instagram", questionID: 42 },
        { type: "linkedin", questionID: 100 },
        { type: "reddit", questionID: 105 },
        { type: "twitter", questionID: 43 },
        { type: "wikipedia", questionID: 106 },
        { type: "youtube", questionID: 107 },
        { type: "personalWebsite", questionID: 108 },
        { type: "email", questionID: 41 },
        { type: "phone", questionID: 97 },
        { type: "discord", questionID: 44 },
        { type: "snapchat", questionID: 112 },
        { type: "tiktok", questionID: 111 },
        { type: "quora", questionID: 113 },
        { type: "pinterest", questionID: 110 },
    ];

    /**
     * Determines if any social networks were found either in
     * scraping process or in the contact data presets
     * @returns True if any social network was found
     */
    const anySocialFound = () => {
        return Object.keys(socialNetworks.value).length > 0;
    };

    /**
     * Refreshes the current known social networks with the new ones
     * either from the store or from the custom social networks if provided. Custom ones are
     * the social network profiles found during the scraping.
     * @param customSocialNetworks - Optional custom social networks to set, instead of the ones from the store
     * @returns void
     */
    const setupSocialNetworks = (customSocialNetworks: SocialNetworks | null = null) => {
        // Reset current social networks
        socialNetworks.value = {};

        socialNetworkQuestions.forEach((socialNetwork) => {
            let question: Question;
            const indexedType = socialNetwork.type as keyof SocialNetworks;

            // Get coresponing question for the current social network to
            // check for the answer
            if (customSocialNetworks != null) {
                question = { answer: customSocialNetworks[indexedType] } as Question;
            } else {
                question = getQuestionByID(socialNetwork.questionID);
            }

            // If question was found and has an answer, set as corespondig social network
            if (question) {
                if (question.answer && question.answer !== "") {
                    if (socialNetwork.type == "email" || socialNetwork.type == "phone") {
                        socialNetworks.value[socialNetwork.type] = question.answer;
                    } else {
                        socialNetworks.value[indexedType] = resolveLink({ url: question.answer, type: socialNetwork.type });
                    }
                }
            }
        });
    };

    // Subscribe to the store to detect changes in the data presets.
    // On update, refresh the social networks.
    store.subscribe((mutation: any) => {
        if (mutation.type == "updateContactDataPresets") {
            setupSocialNetworks();
        }
    });

    // Initial setup of the social networks
    onMounted(() => {
        setupSocialNetworks();
    });

    return { socialNetworks, anySocialFound, setupSocialNetworks };
}
