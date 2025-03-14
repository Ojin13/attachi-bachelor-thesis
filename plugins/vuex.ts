import { store } from "@/store";

// Define global $store variable for options API
export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.use(store);
});
