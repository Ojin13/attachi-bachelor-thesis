<template>
    <ion-page>
        <ion-content force-overscroll="false" class="ion-padding">
            <div class="screenContainer">
                <LoaderOverlay :isActive="activeLoader" />

                <div class="pageContainer">
                    <AppHeader :showNotificationlIcon="false" :heading="'New contact 📚'" :showCancelIcon="true" :cancelIconLink="'/auth/contacts'" />

                    <div class="swiper newContactSwiper">
                        <!-- Additional required wrapper -->
                        <div class="swiper-wrapper swiper-no-swiping">
                            <!-- Slides -->
                            <div class="swiper-slide newContact__slide">
                                <div class="newContact__image">
                                    <img src="~/assets/images/working_on_pc.png" />
                                </div>

                                <div class="newContact__textInput">
                                    <ion-textarea
                                        v-model="newContactName"
                                        :placeholder="'Whats the name of this person'"
                                        class="textInput__clear newContact__ionTextArea large2 bold"
                                        :auto-grow="true"
                                        :rows="1"
                                    >
                                    </ion-textarea>
                                </div>
                            </div>

                            <div class="swiper-slide newContact__slide">
                                <div class="newContact__image">
                                    <img src="~/assets/images/working_on_smartphone.png" />
                                </div>

                                <div class="newContact__textInput">
                                    <ion-textarea
                                        v-model="newContactDesc"
                                        :placeholder="'Short description of this person'"
                                        class="textInput__clear newContact__ionTextArea large2 bold"
                                        :auto-grow="true"
                                        :rows="1"
                                    >
                                    </ion-textarea>
                                </div>
                            </div>

                            <div class="swiper-slide newContact__slide">
                                <input id="contactImage" type="file" name="contactImage" style="display: none" :accept="allowedFileFormats" @change="contactPictureUpdated" />

                                <label for="contactImage" class="newContact__imageUpload--label">
                                    <div
                                        class="newContact__imageUpload"
                                        :class="{ 'newContact__imageUpload--selected': newContactImageLink != '' }"
                                        :style="{ 'background-image': 'url(' + newContactImageLink + ')' }"
                                    >
                                        <div v-if="newContactImageLink == ''" class="newContact__imageUpload--placeholder">
                                            <img src="~/assets/icons/images.svg" />
                                            <h1 class="gray">Choose image</h1>
                                        </div>
                                    </div>
                                </label>

                                <div class="newContact__textInput newContact__textInput--margin">
                                    <h1 class="gray">Select profile picture of this person</h1>
                                </div>
                            </div>

                            <div class="swiper-slide newContact__slide">
                                <div
                                    v-if="newContactImageLink != ''"
                                    class="newContact__imageUpload newContact__imageUpload--selected"
                                    :style="{ 'background-image': 'url(' + newContactImageLink + ')' }"
                                >
                                    <!-- Custom Image -->
                                </div>

                                <div v-else class="newContact__imageUpload newContact__imageUpload--noContactImage">
                                    <!--Placeholder -->
                                </div>

                                <div class="newContact__summaryText">
                                    <h1>{{ newContactName == "" ? "No name" : newContactName }}</h1>
                                    <p class="gray">{{ newContactDesc == "" ? "No description of this person" : newContactDesc }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="newContact__buttons">
                        <div @click="nextButtonClicked()">
                            <ActionButton :buttonText="buttonText" :customClasses="'newContact__nextSlideButton'" />
                        </div>

                        <div v-if="isOnFirstSlide" class="newContact__buttons__skipButton" @click="popFromStack()">
                            <p>Cancel</p>
                        </div>

                        <div class="newContact__buttons__backButton" :class="{ 'newContact__buttons__backButton--hide': isOnFirstSlide }">
                            <p>Back</p>
                        </div>
                    </div>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup>
import Swiper, { Navigation, Pagination } from "swiper";
import { store } from "~/store";
import { ServerAction } from "~/types";

definePageMeta({
    middleware: ["is-authenticated"],
});

const { getContactNotesAndPresets } = useInitialFetch();
const { popFromStack, replaceNavigationStack } = useIonicRouter();
const { callFire } = useFirebaseConnector();
const { uploadImage } = useImageUpload();
const newContactName = ref("");
const newContactDesc = ref("");
const newContactImageLink = ref("");
const newContactImageFile = ref(null);
const allowedFileFormats = ref("image/jpeg, image/png, image/tiff ,image/webp, image/gif");
const activeLoader = ref(false);
const buttonText = ref("Next");
const isOnFirstSlide = ref(true);
const swiperInstance = ref(null);

const contactPictureUpdated = (e) => {
    let files = e.target.files || e.dataTransfer.files;
    if (!files.length) {
        console.log("No file selected");
        return;
    }

    newContactImageFile.value = files[0];
    newContactImageLink.value = URL.createObjectURL(files[0]);
};

const nextButtonClicked = () => {
    let swiper = document.querySelector(".newContactSwiper").swiper;
    if (swiper) {
        // check if user is on last slide and animation finished
        if (swiper.activeIndex == swiper.slides.length - 1 && !swiper.animating) {
            createNewContact();
        }
    }
};

const createNewContact = () => {
    console.log("Sending create contact request");

    let newContactData = {
        name: newContactName.value,
        description: newContactDesc.value,
        userUID: store.state.auth.UID,
        pictures: [],
    };

    activeLoader.value = true;

    callFire({
        action: ServerAction.createContact,
        name: newContactName.value,
        description: newContactDesc.value,
    }).then((newContactID) => {
        newContactData.id = newContactID;

        let contactPicture;

        if (newContactImageFile.value != null) {
            let pictureName = Date.now().toString();

            // Upload image to store
            uploadImage(newContactImageFile.value, pictureName, "contactImage", newContactID, true);

            // Set it to pictures
            contactPicture = { url: newContactImageLink.value, media_name: pictureName };
            newContactData.pictures.push(contactPicture);

            // Set it as profile picture
            callFire({
                action: ServerAction.updateContactPicture,
                contact_id: newContactID,
                new_profile_pic_name: pictureName,
            }).then(() => {
                console.log("Uploaded picture setted to DB as profile picture.");
            });

            newContactData.profilePic = contactPicture;
        }

        store.commit("createContact", { contact: newContactData, id: newContactID });

        getContactNotesAndPresets(newContactID).then(() => {
            activeLoader.value = false;
            replaceNavigationStack({ path: "/auth/contacts/contactPage", query: { contactID: newContactData.id } });
        });
    });
};

onMounted(() => {
    swiperInstance.value = new Swiper(".newContactSwiper", {
        modules: [Navigation, Pagination],
        direction: "horizontal",
        loop: false,
        noSwiping: true,
        noSwipingClass: "swiper-no-swiping",

        navigation: {
            nextEl: ".newContact__nextSlideButton",
            prevEl: ".newContact__buttons__backButton",
        },

        on: {
            slideChange: function () {
                if (this.activeIndex == 0) {
                    isOnFirstSlide.value = true;
                } else {
                    isOnFirstSlide.value = false;
                }

                if (this.activeIndex == this.slides.length - 1) {
                    buttonText.value = "Create new contact";
                } else {
                    buttonText.value = "Next";
                }
            },
        },
    });
});

onBeforeUnmount(() => {
    if (swiperInstance.value) {
        swiperInstance.value.destroy();
    }
});
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.swiper {
    width: 100%;
}

.newContact {
    &__container {
        padding-bottom: 0px;
    }

    &__image {
        opacity: 0.5;
        margin-bottom: 32px;
        text-align: center;

        img {
            width: 90%;
        }
    }

    &__ionTextArea {
        border-bottom: 1px solid gray !important;
    }

    &__imageUpload {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        flex-wrap: wrap;
        width: 100%;
        height: 325px;
        margin-top: 32px;
        border-radius: $default-border-radius;
        padding: 20px;
        border: 3px dashed $secondary-text-color;

        &--selected {
            border: none;
        }

        &--label {
            width: 100%;
        }

        &--placeholder {
            text-align: center;
        }

        &--noContactImage {
            background-image: url("~/assets/images/person.png");
            border: none;
        }

        img {
            width: 55px;
            height: 55px;
        }

        h1 {
            text-align: center;
            width: 100%;
            margin: 0px;
            margin-top: 10px;
        }
    }

    &__textInput {
        &--margin {
            margin-bottom: 25px;
        }
    }

    &__buttons {
        text-align: center;
        padding-top: 0px;

        &__backButton {
            &--hide {
                display: none;
            }
        }
    }

    &__summaryText {
        h1 {
            margin: 0px;
            margin-top: 15px;
        }

        p {
            margin-top: 5px;
        }
    }
}
</style>
