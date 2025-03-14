<template>
    <AlertPopup
        :isActive="confirmTabActive"
        :header="confirmTabProperties.header"
        :confirmButton="confirmTabProperties.confirmButton"
        :cancelButton="confirmTabProperties.cancelButton"
        @popupResult="alertPopupChange"
    />

    <div class="swiper detailPage__slider" :class="sliderID">
        <div class="swiper-wrapper">
            <div v-if="sliderImages.length != 0" class="detailPage__slider--loader">
                <ion-spinner name="circles"></ion-spinner>
            </div>

            <!-- Placeholder used when no images are available -->
            <label v-if="sliderImages.length == 0" class="detailPage__slider--slide--placeholder--label" for="imageUploadButton">
                <div class="swiper-slide detailPage__slider--slide detailPage__slider--slide--placeholder"></div>
            </label>
        </div>

        <div v-if="sliderImages.length != 0 && showControlPanel" ref="swiperControlPanel" class="detailPage__slider--controlPanel">
            <label for="imageUploadButton">
                <div class="detailPage__slider--controlPanel--item">
                    <img src="~/assets/icons/add-image.svg" />
                </div>
            </label>

            <div v-if="showLikeIcon" class="detailPage__slider--controlPanel--item" @click="openProfilePictureChangePopup()">
                <img src="~/assets/icons/love-bold.svg" />
            </div>

            <div class="detailPage__slider--controlPanel--item" @click="openDeleteImagePopup()">
                <img class="detailPage__slider--controlPanel--item--delete" src="~/assets/icons/delete-black.svg" />
            </div>
        </div>

        <!-- If we need pagination -->
        <div class="swiper-pagination detailPage__slider--slide--pagination">
            <!-- Pagination -->
        </div>
    </div>

    <PhotoUpload :contactID="contactID" :uploadType="'contactImage'" @imageUploaded="addNewImage" />
</template>

<script setup>
import Swiper, { Navigation, Pagination, Manipulation } from "swiper";

const props = defineProps({
    sliderImages: {
        type: Array,
        required: true,
    },
    profilePictureObject: {
        type: Object,
        required: false,
        default: null,
    },
    contactID: {
        type: String,
        required: false,
        default: null,
    },
    deleteImageFunction: {
        type: Function,
        required: true,
    },
    newProfilePictureFunction: {
        type: Function,
        required: true,
    },
    newImageAddedFunction: {
        type: Function,
        required: true,
    },
    showControlPanel: {
        type: Boolean,
        default: true,
        required: false,
    },
});

const confirmTabActive = ref(false);
const confirmTabProperties = ref({
    header: "",
    confirmButton: "",
    cancelButton: "",
});

const popupAction = ref("");
const swiperInstance = ref(null);
const currentSlideIsProfilePic = ref(true);
const currentSlideData = ref({});
const sliderID = ref("");

const addNewImage = (imageName, imageLocalURL) => {
    props.newImageAddedFunction(imageName, imageLocalURL);

    refreshSlider();
    swiperInstance.value.slideTo(swiperInstance.value.slides.length - 1);
};

const showLikeIcon = computed(() => {
    return !(currentSlideIsProfilePic.value || props.sliderImages.length == 1);
});

const openProfilePictureChangePopup = () => {
    confirmTabActive.value = true;
    confirmTabProperties.value.confirmButton = "Yes";
    confirmTabProperties.value.cancelButton = "Cancel";
    confirmTabProperties.value.header = "Set as profile picture?";
    popupAction.value = "changeProfilePicture";
};

const openDeleteImagePopup = () => {
    confirmTabActive.value = true;
    confirmTabProperties.value.header = "Are you sure you want to delete this image?";
    confirmTabProperties.value.confirmButton = "Delete";
    confirmTabProperties.value.cancelButton = "Cancel";
    popupAction.value = "deleteImage";
};

const alertPopupChange = (confirmed) => {
    confirmTabActive.value = false;

    if (confirmed) {
        if (popupAction.value == "deleteImage") {
            props.deleteImageFunction(currentSlideData);

            // Wait for call stack to clear before refreshing the slider
            setTimeout(() => {
                refreshSlider();
            });
        } else if (popupAction.value == "changeProfilePicture") {
            const swiper = swiperInstance.value;
            props.newProfilePictureFunction(props.sliderImages[swiper.activeIndex]);
            currentSlideIsProfilePic.value = true;
        }
    }
};

const refreshSlider = () => {
    const swiper = swiperInstance.value;
    let lastSlide = swiper.activeIndex;
    swiper.removeAllSlides();
    fillSlider();
    swiperInstance.value.slideTo(lastSlide, 0);
};

const addImageToSlider = (imageUrl) => {
    let swiper = swiperInstance.value;

    const randomSlideID = Math.random().toString(36).substring(5);
    swiper.appendSlide('<div id="contactSlide-' + randomSlideID + '" class="swiper-slide detailPage__slider--slide"></div>');
    let slide = document.getElementById("contactSlide-" + randomSlideID);

    if (allowBackgroundCover(imageUrl)) {
        slide.classList.add("detailPage__slider--slide--cover");
    }

    if (slide) {
        slide.style.backgroundImage = "url('" + imageUrl + "')";
    }
};

// Checks if one dimension of the image is x% larger than the other.
// If it its not, the image will be zoomed in to cover the entire slide.
// This will prevent "small" black bars on the sides of the image that are almost square.
const allowBackgroundCover = (imageUrl) => {
    const allowedRangePercentage = 25;

    let image = new Image();
    image.src = imageUrl;

    if (image.height == 0 || image.width == 0) {
        // Wait for load only if necessary to prevent flickering
        image.onload = () => {
            return allowBackgroundCover(imageUrl);
        };
    }

    let x = 0;
    let taller = false;

    if (image.height > image.width) {
        taller = true;
        x = image.height / 100;
    } else {
        taller = false;
        x = image.width / 100;
    }

    if (taller) {
        if (image.width + x * allowedRangePercentage <= image.height) {
            return false;
        }
    } else {
        if (image.height + x * allowedRangePercentage <= image.width) {
            return false;
        }
    }

    return true;
};

const fillSlider = () => {
    if (props.profilePictureObject) {
        addImageToSlider(props.profilePictureObject?.url);
    }

    for (let i = 0; i < props.sliderImages.length; i++) {
        if (props.sliderImages[i].media_name == props.profilePictureObject?.media_name) {
            continue;
        }
        addImageToSlider(props.sliderImages[i].url);
    }

    // Wait for call stack to clear before checking if the current slide is the profile picture
    setTimeout(() => {
        isCurrentSlideProfilePicture();
    });
};

const isCurrentSlideProfilePicture = () => {
    const swiper = swiperInstance.value;

    // Check if the profile picture object and the slider images exist
    if (!props.profilePictureObject || !props.sliderImages) {
        currentSlideIsProfilePic.value = false;
        return false;
    }

    if (!props.sliderImages[swiper.activeIndex]) {
        currentSlideIsProfilePic.value = false;
        return false;
    }

    if (props.sliderImages[swiper.activeIndex].media_name == props.profilePictureObject.media_name) {
        currentSlideIsProfilePic.value = true;
        return true;
    } else {
        currentSlideIsProfilePic.value = false;
        return false;
    }
};

watch(
    () => props.sliderImages,
    () => {
        refreshSlider();
    },
);

onMounted(() => {
    swiperInstance.value = new Swiper("." + sliderID.value, {
        modules: [Navigation, Pagination, Manipulation],
        direction: "horizontal",

        pagination: {
            el: ".swiper-pagination",
            type: "bullets",
            clickable: true,
        },

        on: {
            slideChange: function () {
                isCurrentSlideProfilePicture();
                currentSlideData.value = {
                    slideIndex: swiperInstance.value.activeIndex,
                    isProfilePic: currentSlideIsProfilePic.value,
                };
            },
        },
    });

    fillSlider();
});

onBeforeMount(() => {
    // Generate random ID for the slider
    sliderID.value = "slider-" + Math.random().toString(36).substring(5);

    currentSlideData.value = {
        slideIndex: 0,
        isProfilePic: true,
    };
});

onUnmounted(() => {
    // Free resources when the component is destroyed
    swiperInstance.value.destroy();
});
</script>
