<template>
    <div v-if="anySocialFound()" class="socialNetworks">
        <p v-if="showHeading" class="bold socialNetworks--heading">{{ heading }}:</p>

        <div class="socialNetworks__list" :class="{ 'socialNetworks--centered': centerIcons, 'socialNetworks--small': smallIcons }">
            <div v-if="socialNetworks.facebook" class="socialNetworks__item">
                <a :href="socialNetworks.facebook" target="_blank">
                    <img src="~/assets/images/socials/facebookLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.instagram" class="socialNetworks__item">
                <a :href="socialNetworks.instagram" target="_blank">
                    <img src="~/assets/images/socials/instagramLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.linkedin" class="socialNetworks__item">
                <a :href="socialNetworks.linkedin" target="_blank">
                    <img src="~/assets/images/socials/linkedinLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.reddit" class="socialNetworks__item">
                <a :href="socialNetworks.reddit" target="_blank">
                    <img src="~/assets/images/socials/redditLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.twitter" class="socialNetworks__item">
                <a :href="socialNetworks.twitter" target="_blank">
                    <img src="~/assets/images/socials/twitterLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.wikipedia" class="socialNetworks__item">
                <a :href="socialNetworks.wikipedia" target="_blank">
                    <img src="~/assets/images/socials/wikipediaLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.youtube" class="socialNetworks__item">
                <a :href="socialNetworks.youtube" target="_blank">
                    <img src="~/assets/images/socials/youtubeLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.personalWebsite" class="socialNetworks__item">
                <a :href="socialNetworks.personalWebsite" target="_blank">
                    <img src="~/assets/images/socials/personalBlog.png" />
                </a>
            </div>

            <div v-if="socialNetworks.email" class="socialNetworks__item">
                <a :href="'mailto:' + socialNetworks.email" target="_blank">
                    <img src="~/assets/images/socials/personalEmail.png" />
                </a>
            </div>

            <div v-if="socialNetworks.phone" class="socialNetworks__item">
                <a :href="'tel:' + socialNetworks.phone" target="_blank">
                    <img src="~/assets/images/socials/phoneNumber.png" />
                </a>
            </div>

            <div v-if="socialNetworks.discord" class="socialNetworks__item">
                <a :href="socialNetworks.discord" target="_blank">
                    <img src="~/assets/images/socials/discordLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.snapchat" class="socialNetworks__item">
                <a :href="socialNetworks.snapchat" target="_blank">
                    <img src="~/assets/images/socials/snapchatLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.tiktok" class="socialNetworks__item">
                <a :href="socialNetworks.tiktok" target="_blank">
                    <img src="~/assets/images/socials/tiktokLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.quora" class="socialNetworks__item">
                <a :href="socialNetworks.quora" target="_blank">
                    <img src="~/assets/images/socials/quoraLogo.png" />
                </a>
            </div>

            <div v-if="socialNetworks.pinterest" class="socialNetworks__item">
                <a :href="socialNetworks.pinterest" target="_blank">
                    <img src="~/assets/images/socials/pinterestLogo.png" />
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    dataPresets: {
        type: Object,
        required: false,
        default: null,
    },
    heading: {
        type: String,
        required: false,
        default: "Contacts information",
    },
    customSocials: {
        type: Object,
        required: false,
        default: null,
    },
    showHeading: {
        type: Boolean,
        required: false,
        default: true,
    },
    centerIcons: {
        type: Boolean,
        required: false,
        default: false,
    },
    smallIcons: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const { socialNetworks, anySocialFound, setupSocialNetworks } = useSocialNetworks(ref(props.dataPresets));

// Detect changes in custom socials
watch(
    () => props.customSocials,
    () => {
        setupSocialNetworks(props.customSocials);
    },
);

onMounted(() => {
    setupSocialNetworks(props.customSocials);
});
</script>

<style lang="scss" scoped>
@import "/assets/sass/variables";

.socialNetworks {
    &--heading {
        margin-bottom: 8px;
    }

    &--centered {
        justify-content: center;
    }

    &__list {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 10px;
    }

    &__item {
        margin-bottom: 10px;
        margin-right: 9px;
        $logoSize: 40px;

        img {
            width: $logoSize;
            height: $logoSize;
            object-fit: contain;
            border-radius: $default-border-radius;
        }

        a {
            display: block;
            width: $logoSize;
            height: $logoSize;
        }
    }

    &--small {
        $smallSize: 20px;
        margin-bottom: 0px;
        margin-top: 5px;

        .socialNetworks__item {
            img,
            a {
                width: $smallSize;
                height: $smallSize;
                border-radius: 4px;
            }
        }
    }
}
</style>
