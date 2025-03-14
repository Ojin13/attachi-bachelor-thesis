import { store } from "~/store";
import { ServerAction, type ContactNote } from "~/types";

/**
 * Composables function that handles the creation, deletion, and
 * updating of notes for specified contact ID.
 * @param notes - Vue3 ref to existing notes array
 * @param contactID - ID of the contact to manage notes for
 */
export function useCustomNotes(notes: Ref<ContactNote[]>, contactID: number) {
    const newNoteText = ref("");
    const noteTypingTimers: any = ref([]);
    const isSavingNewNote = ref(false);
    const { callFire } = useFirebaseConnector();

    /**
     * Creates a new note for the contact and updates the notes array
     * @param customNoteText - Text for the new note
     * @returns void
     */
    const createNewNote = (customNoteText: string = "") => {
        if (customNoteText != "") {
            newNoteText.value = customNoteText;
        }

        if (newNoteText.value == "" || isSavingNewNote.value) {
            return;
        } else {
            isSavingNewNote.value = true;
        }

        callFire({
            action: ServerAction.manageNotes,
            specificAction: "createNote",
            contact_id: contactID,
            quick_note_text: newNoteText.value,
            localTime: Math.round(new Date().getTime() / 1000).toString(),
        }).then((response) => {
            isSavingNewNote.value = false;
            if (response) {
                const newNote: ContactNote = {
                    id: response.id,
                    text: newNoteText.value,
                    lastUpdateDate: response.last_modification_date,
                };

                notes.value[response.id] = newNote;
                newNoteText.value = "";
                store.commit("updateContactNotes", { notes: notes.value, id: contactID });
            }
        });
    };

    /**
     * Deletes a note with the given noteID and updates the notes array
     * @param noteID ID of the note to be deleted
     * @returns void
     */
    const deleteNote = (noteID: number | string) => {
        delete notes.value[noteID as number];
        store.commit("updateContactNotes", { notes: notes.value, id: contactID });

        callFire({
            action: ServerAction.manageNotes,
            specificAction: "deleteNote",
            contact_id: contactID,
            quick_note_id: parseInt(noteID as string),
        });
    };

    /**
     * Updates the note with the given noteID
     * @param noteID ID of the note to be updated
     * @param noteText New text for the note
     * @returns void
     */
    const updateNote = (noteID: number | string, noteText: string) => {
        notes.value[noteID as number].text = noteText;
        store.commit("updateContactNotes", { notes: notes.value, id: contactID });

        clearTimeout(noteTypingTimers.value[noteID]);
        let timeBeforeRequest = 1000;

        // Wait for typingInterval to finish and then send request
        noteTypingTimers.value[noteID] = setTimeout(function () {
            callFire({
                action: ServerAction.manageNotes,
                specificAction: "updateNote",
                contact_id: contactID,
                quick_note_id: parseInt(noteID as string),
                updated_note_text: noteText,
            });
        }, timeBeforeRequest);
    };

    return {
        isSavingNewNote,
        newNoteText,
        createNewNote,
        deleteNote,
        updateNote,
    };
}
