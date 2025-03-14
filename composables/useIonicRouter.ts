import type { RouterLocation } from "~/types";
import { useIonRouter } from "@ionic/vue";
import { useRoute, type RouteLocationNormalizedLoaded } from "vue-router";
import { store } from "~/store";

/**
 * Composable function that handles routing and managing the navigation stack.
 * This application uses a custom ionic router which is just an extension of the
 * more typical vue-router. This extension allows non-linear routing, tabbed navigation,
 * navigation stack history and custom transitions between the pages.
 *
 * For more information about the working of the ionic router, please visit:
 * https://ionicframework.com/docs/vue/navigation
 *
 * Furthermore, since this solution uses Nuxt.js, there is no need to define
 * individual routes. This is done automatically by the @nuxtjs/ionic module.
 * For more information about the routing in Nuxt.js in combination with ionic
 * tabbed navigation, please visit:
 * https://ionic.nuxtjs.org/overview/routing
 */
export function useIonicRouter() {
    const router = useIonRouter();
    const route = useRoute();

    // Initialize the navigation stacks for each tab
    let contactNavigationStack = store.state.navigationStacks.contactsStack;
    let groupNavigationStack = store.state.navigationStacks.groupsStack;
    let accountNavigationStack = store.state.navigationStacks.accountStack;

    /**
     * Logs the navigation event to the console.
     * Only for debugging purposes.
     * @param location - The location to navigate to
     * @returns void
     */
    const reportNavigation = (location: string | RouterLocation, navigationType: string): void => {
        let locationName = typeof location == "string" ? location : location.path;
        console.log("REDIRECTING: " + route.name?.toString() + " ===========> " + (locationName == "/" ? "index" : locationName) + "\nNavigation type: " + navigationType);
    };

    /**
     * Pushes a new location to the stack and plays the go forward animation
     * @param location - The location to navigate to
     * @returns void
     */
    const pushToStack = (location: string | RouterLocation): void => {
        reportNavigation(location, "Push to stack");
        router.navigate(location, "forward", "push");

        if (typeof location != "string") {
            location = location.path;
        }

        // Update the navigation stack history for the current tab
        if (location.toLowerCase().includes("/auth/contacts")) {
            store.commit("setContactStack", [...contactNavigationStack, location]);
        }

        if (location.toLowerCase().includes("/auth/groups")) {
            store.commit("setGroupStack", [...groupNavigationStack, location]);
        }

        if (location.toLowerCase().includes("/auth/account")) {
            store.commit("setAccountStack", [...accountNavigationStack, location]);
        }
    };

    /**
     * Pops the current location from the stack and plays the go back animation.
     * If the location is specified, it navigates to the specified location instead of the previous one.
     * Automatically falls back to the root page if there is no previous page to navigate back to.
     *
     * Be aware that this function is for linear navigation, so it might switch tabs if the previous page
     * was in a different tab. To prevent this, we need to specify the location to navigate to and use
     * back() function only if we dont know the previous location.
     *
     * @param location - If specified, the location to navigate back to
     * @param disableUnknownLocationRedirect - If true, the function will not fallback to the root page, nor use the back() function
     * @returns void
     */
    const popFromStack = (location: string = "", disableUnknownLocationRedirect: boolean = false): void => {
        // Try to determine the previous location from our custom navigation stack
        let locationAccordingtoStack;
        if (route.path.toLowerCase().includes("/auth/contacts")) {
            contactNavigationStack = store.state.navigationStacks.contactsStack;
            contactNavigationStack.pop();
            locationAccordingtoStack = contactNavigationStack[contactNavigationStack.length - 1];
            store.commit("setContactStack", contactNavigationStack);
        }

        if (route.path.toLowerCase().includes("/auth/groups")) {
            groupNavigationStack = store.state.navigationStacks.groupsStack;
            groupNavigationStack.pop();
            locationAccordingtoStack = groupNavigationStack[groupNavigationStack.length - 1];
            store.commit("setGroupStack", groupNavigationStack);
        }

        if (route.path.toLowerCase().includes("/auth/account")) {
            accountNavigationStack = store.state.navigationStacks.accountStack;
            accountNavigationStack.pop();
            locationAccordingtoStack = accountNavigationStack[accountNavigationStack.length - 1];
            store.commit("setAccountStack", accountNavigationStack);
        }

        // If the location is not specified, but we have a location from the nav stack, use it
        if (location == "" && locationAccordingtoStack != undefined) {
            location = locationAccordingtoStack;
        }

        if (location != "") {
            reportNavigation(location, "Manual pop and redirect to new location");
            router.navigate(location, "back", "pop");
            return;
        }

        if (disableUnknownLocationRedirect) {
            return;
        }

        // If location is not specified and we dont have a location from the nav stack
        // Fallback to the canGoBack function to determine if we can use back() function.
        if (router.canGoBack()) {
            console.log("Navigating back to previous page with back() function");
            router.back();
        } else {
            // If requested to go back but there is no previous page and no
            // location is specified then fallback to the root page and
            // rebase the whole navigation stack
            console.error("No previous page to navigate back to. Fallback to root page");
            reloadRouter("/");
        }
    };

    /**
     * Pops the current location from the stack and plays the go forward animation
     * Replaces the current stack with the new location, so the user cannot go back to the previous page.
     * User can still go back to the location before the previous one ...
     * This keeps the all locations before replace in the stack history (unlike rebaseNavigationStack).
     *
     * For example:
     * Account --PUSH--> Setings --PUSH--> Confirm passcode --REPLACE--> Set new passcode --POP--> Settings --POP--> Account
     * (After calling the first pop, user is not redirected to Confirm passcode but to the Settings page)
     * @param location - The location to navigate to
     * @returns void
     */
    const replaceNavigationStack = (location: string | RouterLocation): void => {
        reportNavigation(location, "Replace");
        router.navigate(location, "forward", "replace");

        if (typeof location != "string") {
            location = location.path;
        }

        // Update the navigation stack history for the current tab
        if (location.toLowerCase().includes("/auth/contacts")) {
            contactNavigationStack[contactNavigationStack.length - 1] = location;
            store.commit("setContactStack", contactNavigationStack);
        }

        if (location.toLowerCase().includes("/auth/groups")) {
            groupNavigationStack[groupNavigationStack.length - 1] = location;
            store.commit("setGroupStack", groupNavigationStack);
        }

        if (location.toLowerCase().includes("/auth/account")) {
            accountNavigationStack[accountNavigationStack.length - 1] = location;
            store.commit("setAccountStack", accountNavigationStack);
        }
    };

    /**
     * Resets the whole current navigation stack and sets the new location as a new root
     * of the current stack. This means that the user cannot go back to any of the previous locations.
     *
     * For example, if the user enters correct password on dataEncryption page he/she would be
     * redirected with this function to the contactList which would be the new root of the stack.
     *
     * This route transition is not animated - transition is instant.
     *
     * @param location - The location to navigate to
     * @returns void
     */
    const rebaseNavigationStack = (location: string | RouterLocation): void => {
        store.dispatch("resetNavigationStacks");
        reportNavigation(location, "Rebase");
        router.navigate(location, "root", "replace");
    };

    /**
     * Since ion-router implementation for Vue, does not provide a way to
     * reset all navigations stacks, the easiest way to do it is to reload whole page.
     * Example use case is logout of the user and redirect to the login page as we want
     * to clear all navigation stacks and reset the whole application.
     *
     * Also useful for resolving issues caused by reported bug #25213 here:
     * https://github.com/ionic-team/ionic-framework/issues/25213
     *
     * @param location - The location to reload the router to
     * @returns void
     */
    const reloadRouter = (location: string) => {
        window.location.href = location;
    };

    /**
     * Gets the current route inforrmation like route name and query parameters
     * @returns string | undefined
     */
    const getCurrentRoute = (): RouteLocationNormalizedLoaded => {
        return route;
    };

    return { pushToStack, rebaseNavigationStack, popFromStack, getCurrentRoute, replaceNavigationStack, reloadRouter };
}
