// import { App } from "@capacitor/app";
import { useBackButton } from "@ionic/vue";

/**
 * This composable function registers a new custom handler for the hardware back button.
 * Since we are using custom logic for navigation stacks, we need to handle the hardware back button manually.
 * Hardware back button is a physical button (virtual on newer models ) on Android devices that allows users
 * to navigate back in the app.
 */
export default function useHardwareBackButton() {
    const { popFromStack } = useIonicRouter();
    /**
     * For more information about the handler priority, check the official documentation:
     *
     * Priority 100 ... Dismiss modals, popups, and overlays
     * Prioriry 99  ... Dismiss ion-menu
     * Priority 0   ... Default ion-router navigation
     *
     * https://ionicframework.com/docs/developing/hardware-back-button#internal-framework-handlers
     */
    const priority = 75;

    /**
     * This function registers a custom handler for the hardware back button which
     * still allows dissmissing modals, popups, and overlays as well as the ion-menu,
     * but prevents the default ion-router navigation. This navigation will be handled
     * here with custom logic as we save navigation stack manually for better control.
     */
    const registerCustomBackButtonHandler = async () => {
        useBackButton(priority, async () => {
            // This will navigate back according to custom navigation stacks.
            // If the location is not found in the stack, it will do nothing.
            popFromStack("", true);
        });
    };

    return { registerCustomBackButtonHandler };
}
