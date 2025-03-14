import { type Contact, type DataPreset, type Question, type ContactGroup, ContactProperties, ServerAction } from "~/types";
import { getDefaultContactProfilePicture } from "~/utils/defaultProfilePicture";
import { store } from "~/store";

/**
 * Composables function that handles the management of all contact data
 * @param contactBasicData - Vue3 ref to the basic data of the contact (name, description, etc.)
 * @param contactDataPresets - Vue3 ref to the data presets of the contact
 */
export function useContactManagement(contactBasicData: Ref<Contact>, contactDataPresets: Ref<DataPreset[]>) {
    let contactNameTypingTimer: any = null;
    let contactDescTypingTimer: any = null;
    const TIME_BEFORE_REQUEST = 1000;
    const answerTypingTimers: any = ref([]);
    const { popFromStack } = useIonicRouter();
    const { callFire } = useFirebaseConnector();
    const { getDependentQuestions, updateDataPreset, updateAnswerAcrossDataPresets } = useDataPresets(contactDataPresets);

    /**
     * Updates name or description of the contact
     * @param attributeToUpdate - Attribute to update (name or description)
     * @param newValue - new value of the attribute to be updated
     * @returns void
     */
    const updateContactBasicData = (attributeToUpdate: ContactProperties, newValue: string): void => {
        clearTimeout(attributeToUpdate == ContactProperties.name ? contactNameTypingTimer : contactDescTypingTimer);

        const timer = setTimeout(function () {
            callFire({
                action: ServerAction.updateContact,
                contact_id: contactBasicData.value.id,
                attributeToUpdate: attributeToUpdate,
                newValue: newValue,
            });
        }, TIME_BEFORE_REQUEST);

        attributeToUpdate == ContactProperties.name ? (contactNameTypingTimer = timer) : (contactDescTypingTimer = timer);
    };

    /**
     * Updates answer of the provided question in the contact data presets
     * @param question - Question to be updated across all data presets
     * @param skipTimeout - Whether to skip the timeout before sending the request
     * @param newAnswer - New answer to be set for the question. This is used when the question is prop and can't be updated directly
     * @returns void
     */
    const updateContactDataPreset = (question: Question, skipTimeout: boolean = false, newAnswer: string | null = null): void => {
        if (newAnswer != null) {
            question.answer = newAnswer;
        }

        // Prevent sending empty answer to not answered question
        if (question.answer == "" && question.answerID == undefined) {
            updateContactDataPresetsStore();
            return;
        }

        // Update this question across all data sets
        updateAnswerAcrossDataPresets(question);
        question.contact_id = contactBasicData.value.id;
        clearTimeout(answerTypingTimers.value[question.id]);

        let timeBeforeRequest = 1000;

        // If the question is not answered, wait longer before sending the request
        if (question.answerID == undefined) {
            timeBeforeRequest = 3000;
        }

        if (skipTimeout) {
            timeBeforeRequest = 0;
        }

        // Prepare dependencies for the question
        let questionDependencies = getDependentQuestions(question, contactBasicData.value.id);

        answerTypingTimers.value[question.id] = setTimeout(() => {
            updateDataPreset({ dependencies: questionDependencies, question: question }).then(() => {
                updateContactDataPresetsStore();
            });
        }, timeBeforeRequest);
    };

    /**
     * Deletes contact, its media fiels and removes contact from its groups
     * @param contactID - ID of the contact to be deleted
     * @returns void
     */
    const deleteContact = (contactID: number) => {
        // First delete all files in firebase storage
        if (contactBasicData.value.pictures.length > 0) {
            callFire({
                action: ServerAction.manageImages,
                specificAction: "deleteContactImages",
                contactID: contactBasicData.value.id,
            });
        }

        // Then delete contact from DB and store
        callFire({ action: ServerAction.deleteContact, id: [contactID] });
        store.commit("deleteContact", contactID);
        popFromStack("/auth/contacts");

        // Delete this contactID from all groups
        let storeGroups: ContactGroup[] = store.state.userData.groups;
        for (const key in storeGroups) {
            if (storeGroups[key].groupMembers.includes(contactID)) {
                storeGroups[key].groupMembers.splice(storeGroups[key].groupMembers.indexOf(contactID), 1);
                store.commit("updateGroup", { group_data: storeGroups[key], group_id: storeGroups[key].groupId });
            }
        }
    };

    /**
     * Updates contact data presets in the store
     * @returns void
     */
    const updateContactDataPresetsStore = () => {
        store.commit("updateContactDataPresets", { presets: contactDataPresets.value, id: contactBasicData.value.id });
    };

    /**
     * Updates contact basic data in the store
     * @returns void
     */
    const updateContactBasicDataStore = () => {
        store.commit("updateContactData", { contactData: contactBasicData.value, id: contactBasicData.value.id });
    };

    /**
     * Gets the profile picture URL of a contact by its ID
     * @param contactID - The ID of the contact to get the profile picture for
     * @returns {string} - The URL of the profile picture
     */
    const getProfilePictureByContactID = (contactID: number): string => {
        const contactData: Contact[] = store.state.userData.contacts;
        let profilePicURL = null;

        for (let contact in contactData) {
            if (contactData[contact].id == contactID) {
                if (contactData[contactID].profilePic) {
                    profilePicURL = contactData[contactID].profilePic!.url;
                }
            }
        }

        if (!profilePicURL) {
            profilePicURL = getDefaultContactProfilePicture();
        }

        return profilePicURL;
    };

    return { updateContactBasicDataStore, updateContactBasicData, deleteContact, updateContactDataPreset, getProfilePictureByContactID };
}
