<template>
    <div class="detailPage__data__notes">
        <AlertPopup :isActive="confirmTabActive" :header="'Are you sure you want to delete this note?'" :confirmButton="'Yes'" :cancelButton="'Cancel'" @popupResult="alertPopupChange" />

        <DropdownPanel
            :dropdownHeading="'Your custom notes'"
            :dropdownDescription="'When premade questions are not enough'"
            :dropdownStats="Object.keys(contactCustomNotes).length + 'x'"
            :dropdownIcon="'📖'"
        >
            <div id="dropdownContent-notes" class="detailPage__data__notes--content">
                <div class="detailPage__data__preset__questionPanel">
                    <div class="detailPage__data__preset__questionPanel--sideLine">
                        <!-- Side line -->
                    </div>

                    <p class="bold">Add new note</p>

                    <div class="textAreaInput">
                        <AutoExpandtextArea
                            :bottomOffset="20"
                            :initialValue="newNoteText"
                            :customClasses="'textInput__clear medium gray2 answer'"
                            :inputPlaceholder="'Write here'"
                            @updateFunction="newNoteText = $event"
                        />

                        <p class="bold medium saveNoteButton" :class="{ gray: newNoteText == '' }" @click="createNewNote()">{{ isSavingNewNote ? "Saving note ..." : "Create note" }}</p>
                    </div>
                </div>

                <div class="detailPage__data__notes--reverseOrder">
                    <div v-for="(cur_note, noteID) in contactCustomNotes" :key="noteID" class="detailPage__data__preset__questionPanel">
                        <div class="detailPage__data__preset__questionPanel--sideLine">
                            <!-- Side line -->
                        </div>

                        <p class="medium bold">Note from {{ formatTimestamp(cur_note.lastUpdateDate) }}</p>

                        <div class="textAreaInput">
                            <AutoExpandtextArea
                                :bottomOffset="20"
                                :initialValue="cur_note.text"
                                :customClasses="'textInput__clear medium gray2 answer'"
                                :inputPlaceholder="'Edit your note here'"
                                @updateFunction="updateNote(noteID, $event)"
                            />

                            <a v-if="containsLink(cur_note.text)" :href="getLinkedURL(cur_note.text)" target="_blank">
                                <div @touchstart="highLight" @touchend="unhighLight">
                                    <p class="externalButton medium2 bold"><img src="~/assets/icons/globe.svg" />Open linked website</p>
                                </div>
                            </a>

                            <div class="detailPage__data__preset__questionPanel__deleteButton">
                                <div class="detailPage__data__preset__questionPanel__deleteButton--container" @click="openDeleteNotePopup(noteID)">
                                    <img src="~/assets/icons/delete.svg" />
                                    <p class="small bold">Delete note</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DropdownPanel>
    </div>
</template>

<script setup>
import { store } from "~/store";
import { formatTimestamp } from "~/utils/timeFormater";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const { highlightButton, unhighlightButton } = useButton("button--active", false);

const props = defineProps({
    contactId: {
        type: String,
        required: true,
    },
});

const contactCustomNotes = ref([]);
const confirmTabActive = ref(false);
const noteToBeDeleted = ref(null);
const { isSavingNewNote, newNoteText, createNewNote, deleteNote, updateNote } = useCustomNotes(contactCustomNotes, props.contactId);

const openDeleteNotePopup = (noteId) => {
    confirmTabActive.value = true;
    noteToBeDeleted.value = noteId;
};

const alertPopupChange = (confirmed) => {
    confirmTabActive.value = false;

    if (confirmed) {
        deleteNote(noteToBeDeleted.value);
    }
};

const getLinkedURL = (note) => {
    let matchedURL = note.match(/(http|https):\/\/[^\s,]+/);
    return matchedURL ? matchedURL[0] : "";
};

const containsLink = (note) => {
    return note.includes("http://") || note.includes("https://");
};

const highLight = (event) => {
    highlightButton(event);
    Haptics.impact({ style: ImpactStyle.Light });
};

const unhighLight = (event) => {
    unhighlightButton(event);
};

// Initialize contact custom notes from store
onMounted(() => {
    contactCustomNotes.value = store.state.userData.contactNotes[props.contactId];
});
</script>
