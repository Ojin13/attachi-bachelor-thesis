import { ServerAction, type Contact, type ContactGroup, type ContactPicture } from "~/types";
import { getAuth } from "firebase/auth";
import { store } from "~/store";
import { getDefaultProfilePicture } from "~/utils/defaultProfilePicture";

/**
 * Composable function that handles the initial fetch of all data from the database
 * and stores it in the Vuex store. Also Initialises the user profile picture.
 */
export function useInitialFetch() {
    const { callFire } = useFirebaseConnector();

    /**
     * Fetches all contact data (data presets, notes, profile pictures), all contact groups,
     * user profile picture, notifications, and credit balance. Saves the data in the Vuex store.
     * Also sets the dataLoaded flag to true in order to prevent re-fetching the data when unnecessary.
     * @returns {Promise<void>}
     */
    const initialFetchAllData = async () => {
        // Get data other than contacts
        initUserProfilePicture();
        getContactGroups();
        getScrapingCredits();
        getNotifications();

        // Load all contacts from DB
        let contacts: Contact[] = await callFire({ action: ServerAction.getContact, getAllContacts: true });
        store.commit("setContacts", contacts);

        // Fetch all cotnact data (notes, data presets, profile pictures)
        await Promise.all(
            Object.keys(contacts).map(async (contactID: string) => {
                let id = parseInt(contactID);

                // Fetch profile picture without blocking the rest of requests
                fetchContactProfilePicture(contacts[id]).then((images) => {
                    if (images) {
                        if (images.length > 0) {
                            contacts[id].profilePic = images[0];
                            store.commit("updateContactData", { contactData: contacts[id], id: id });
                        }
                    }
                });

                await getContactNotesAndPresets(id);
            }),
        );

        // Set data loaded flag to indicate that all data has been fetched which will prevent re-fetching
        // and allow further routing
        store.commit("setDataLoaded", true);
    };

    /**
     * Helper function for fetching the notifications of the current user.
     * Notifications are fetched based on the user's registration date.
     * @returns {Promise<void>} - The notifications of the current user.
     */
    const getNotifications = async () => {
        if (getAuth().currentUser) {
            const currentUser = getAuth().currentUser;
            if (currentUser) {
                let createdAt: string = currentUser.metadata.creationTime as string;
                const formattedDate = new Date(createdAt).toISOString().split("T")[0];

                await callFire({
                    action: ServerAction.getNotifications,
                    userRegistrationDate: formattedDate,
                }).then((notifications) => {
                    store.commit("setNotifications", notifications);
                });
            }
        } else {
            // There might be a delay in the auth object being available
            setTimeout(() => {
                getNotifications();
            }, 1000);
        }
    };

    /**
     * Helper function for fetching the amount of credits of the current user.
     * @returns {Promise<void>} - The amount of credits of the current user and the next auto recharge date.
     */
    const getScrapingCredits = async () => {
        callFire({ action: ServerAction.getCredits }).then((res) => {
            if (res) {
                store.commit("setCredits", res.credits);
                store.commit("setNextCreditRecharge", res.nextAutoRecharge);
            }
        });
    };

    /**
     * Helper function for fetching all contact groups of the current user.
     * @returns {Promise<void>} - The contact groups of the current user.
     */
    const getContactGroups = async () => {
        let groups: ContactGroup[] = await callFire({ action: ServerAction.manageGroup, specificAction: "getGroups" });
        store.commit("setGroups", groups);
    };

    /**
     * Helper function for fetching the profile pictures of a specified contact.
     * @param {Contact} contactData - The contact data to fetch the profile picture for.
     * @returns {Promise<ContactPicture[] | null>} - The profile picture of the contact or null if contact has no profile picture.
     */
    const fetchContactProfilePicture = async (contactData: Contact) => {
        if (contactData.pictures != undefined && contactData.pictures.length != 0) {
            return callFire({
                action: ServerAction.manageImages,
                specificAction: "fetchImage",
                whatToFetch: "contactProfilePicture",
                contactID: contactData.id,
                imageName: contactData.pictures[0].media_name,
            }).then((image: ContactPicture[] | null) => {
                return image;
            });
        }

        return null;
    };

    /**
     * Helper function for fetching the notes and data presets of a specified contact.
     * @param {number} contactID - The ID of the contact to fetch the notes and data presets for.
     * @returns {Promise<void>}
     */
    const getContactNotesAndPresets = async (contactID: number) => {
        const contactData = await callFire({ action: ServerAction.getDataPresets, contact_id: contactID, appendNotes: true });
        if (contactData) {
            store.commit("updateContactNotes", { notes: contactData.notes, id: contactID });
            delete contactData.notes;
            store.commit("updateContactDataPresets", { presets: contactData, id: contactID });
        }
    };

    /**
     * Initialises the user profile picture by fetching it from the database.
     * If user has no profile picture, the default profile picture is set.
     * @returns {Promise<void>}
     */
    const initUserProfilePicture = async () => {
        // Try to fetch user profile picture from database
        callFire({
            action: ServerAction.manageImages,
            specificAction: "fetchImage",
            whatToFetch: "userProfilePicture",
        }).then((imageData: ContactPicture[]) => {
            let setDefaultProfilePicture = false;

            if (imageData) {
                if (imageData.length > 0) {
                    if (imageData[0].url) {
                        store.dispatch("save_profilePicture", imageData[0].url);
                    } else {
                        setDefaultProfilePicture = true;
                    }
                } else {
                    // If no profile picture is found, try to fetch it from
                    // the firebase auth object - if user is registered with
                    // a Google account, firebase auth object will have a photoURL property
                    let user = getAuth().currentUser;
                    if (user?.photoURL) {
                        store.dispatch("save_profilePicture", user.photoURL);
                    } else {
                        setDefaultProfilePicture = true;
                    }
                }
            } else {
                setDefaultProfilePicture = true;
            }

            if (setDefaultProfilePicture) {
                store.dispatch("save_profilePicture", getDefaultProfilePicture());
            }
        });
    };

    return {
        initialFetchAllData,
        fetchContactProfilePicture,
        getContactNotesAndPresets,
        initUserProfilePicture,
    };
}
