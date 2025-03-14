import { store } from "~/store";
import { ServerAction, type Contact, type SlideData, type ContactPicture } from "~/types";

/**
 * Composables function that handles the management of contact images
 * @param contactBasicData - Vue3 ref to the basic data of the contact (name, description, etc.)
 */
export function useContactImages(contactBasicData: Ref<Contact>) {
    const { callFire } = useFirebaseConnector();

    /**
     * Adds new image to the contact media and sets it as profile picture
     * if there is no profile picture set. Also updates the contact in Vuex.
     * @param imageName - Name of the image to be added
     * @param imageLocalURL - Local URL of the image to be added
     * @returns void
     */
    const addNewContactImage = (imageName: string, imageLocalURL: string): void => {
        if (contactBasicData.value.pictures.length == 0) {
            callFire({
                action: ServerAction.updateContactPicture,
                contact_id: contactBasicData.value.id,
                new_profile_pic_name: imageName,
            });
        }

        let newPicture: ContactPicture = { url: imageLocalURL, media_name: imageName };
        if (contactBasicData.value.pictures.length == 0) {
            contactBasicData.value.profilePic = newPicture;
        }

        contactBasicData.value.pictures.push(newPicture);
        updateContactBasicDataStore();
    };

    /**
     * Updates profile picture of the contact and saves it to the DB and Vuex.
     * @param newProfilePicture - New profile picture to be set
     * @returns void
     */
    const updateProfilePicture = (newProfilePicture: ContactPicture | undefined = undefined) => {
        contactBasicData.value.profilePic = newProfilePicture;
        updateContactBasicDataStore();

        callFire({
            action: ServerAction.updateContactPicture,
            contact_id: contactBasicData.value.id,
            new_profile_pic_name: newProfilePicture != undefined ? newProfilePicture.media_name : undefined,
        });
    };

    /**
     * Deletes image from the contact media and updates the Vuex.
     * If the deleted image was the profile picture, the next image in the contact media
     * will be set as profile picture. If there are no more images, the profile
     * picture will be set to null.
     * @param currentSlideData - Data of the current slide (image) to be deleted
     * @returns void
     */
    const deleteContactImage = (currentSlideData: Ref<SlideData>) => {
        if (currentSlideData.value.isProfilePic) {
            // If profile pic was the only image for this contact
            if (contactBasicData.value.pictures.length == 1) {
                updateProfilePicture();
            } else {
                // If profile pic was not the only image for this contact, set the next image as profile pic
                updateProfilePicture(contactBasicData.value.pictures[(currentSlideData.value.slideIndex + 1) % contactBasicData.value.pictures.length]);
            }
        }

        // Delete image from firebase storage
        callFire({
            action: ServerAction.manageImages,
            specificAction: "deleteContactImage",
            imageName: contactBasicData.value.pictures[currentSlideData.value.slideIndex].media_name,
            contactID: contactBasicData.value.id,
        });

        // Update local reference to this image
        contactBasicData.value.pictures.splice(currentSlideData.value.slideIndex, 1);
        updateContactBasicDataStore();
    };

    /**
     * Fetches contact images from firebase storage (if they are not already downloaded)
     * and saves them to the contact media array. Fetched images also contain the profile picture
     * if it exists. If so, it will be moved to the start of the contact media array.
     * @returns void
     */
    const downloadContactImages = () => {
        // Check if images are not already downloaded
        if (contactBasicData.value.pictures.length > 1) {
            return;
        }

        // Get all image urls
        callFire({ action: ServerAction.manageImages, specificAction: "fetchImage", whatToFetch: "contactImages", contactID: contactBasicData.value.id }).then((response) => {
            if (response) {
                contactBasicData.value.pictures = response;
                if (response.length != 0) {
                    moveProfilePicToStart();
                }
            }
        });
    };

    /**
     * Moves profile picture to the start of the contact media array
     * and updates the contact in Vuex.
     * @returns void
     */
    const moveProfilePicToStart = () => {
        if (!contactBasicData.value.profilePic) {
            return;
        }

        if (contactBasicData.value.profilePic.media_name != null) {
            for (let i = 0; i < contactBasicData.value.pictures.length; i++) {
                if (contactBasicData.value.pictures[i].media_name == contactBasicData.value.profilePic.media_name) {
                    contactBasicData.value.pictures.unshift(contactBasicData.value.pictures.splice(i, 1)[0]);
                    break;
                }
            }
        }

        updateContactBasicDataStore();
    };

    /**
     * Updates contact basic data in the Vuex store
     * @returns void
     */
    const updateContactBasicDataStore = () => {
        store.commit("updateContactData", { contactData: contactBasicData.value, id: contactBasicData.value.id });
    };

    return { addNewContactImage, updateProfilePicture, deleteContactImage, downloadContactImages, moveProfilePicToStart };
}
