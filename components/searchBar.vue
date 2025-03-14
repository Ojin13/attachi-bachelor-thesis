<template>
    <div class="searchBar" :class="additionalClasses">
        <input v-model="searchFilter" type="text" :placeholder="searchPlaceholder" :class="{ 'searchBar--empty': searchFilter == '' }" @keyup="$emit('searchFilter', searchFilter)" />

        <div v-if="searchFilter != ''" class="searchBar--clear" @click="clearFilter()">
            <img src="~/assets/icons/close-gray.svg" />
        </div>
    </div>
</template>

<script setup>
const emit = defineEmits(["searchFilter"]);

defineProps({
    additionalClasses: {
        type: String,
        required: false,
        default: "",
    },

    searchPlaceholder: {
        type: String,
        required: false,
        default: "Search contacts by name",
    },
});

const searchFilter = ref("");

const clearFilter = () => {
    searchFilter.value = "";
    emit("searchFilter", searchFilter.value);
};
</script>

<style lang="scss" scoped>
@use "sass:math";
@import "/assets/sass/variables";

.searchBar {
    margin-bottom: 20px;
    position: relative;

    input {
        background-color: $menu-background-color;
        border: 2px solid $secondary-text-color;
        font-size: $small-font-size;
        background-position: 95% center;
        background-size: 15px;
        margin-bottom: 0px;
        padding: 12px 20px;
        padding-right: 12%;
    }

    &--empty {
        background-image: url(../assets/icons/search.svg);
    }

    &--clear {
        position: absolute;
        cursor: pointer;
        margin-top: -6px;
        margin-right: 8px;
        width: 20px;
        top: 17px;
        right: 0;
    }

    img {
        width: 12px;
        height: 12px;
    }
}
</style>
