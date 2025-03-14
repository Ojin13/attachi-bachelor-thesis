<template>
    <div>
        <!-- Nuxt3 error template -->
    </div>
</template>

<script setup>
/**
 * If user is redirected to this page, it means that there was an runtime error in the application.
 * In that case redirect user to the index which will either refetch all data or show the login page
 * based on the user's authentication status.
 */
onBeforeMount(() => {
    navigateTo("/");
});
</script>
