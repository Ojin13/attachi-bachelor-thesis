import { Haptics, ImpactStyle } from "@capacitor/haptics";

/**
 * Composable function that handles the button animations and haptic feedback
 * @param classToTrigger - The class that triggers the animation
 * @param triggerOnParent - If the parent element should be triggered instead of the clicked element
 * @param animateButton - If the button should animate when unhighlighted
 */
export function useButton(classToTrigger: string, triggerOnParent: boolean, animateButton: boolean = false) {
    let animationTimeout: any = null;

    /**
     * Get the clicked element
     * @param event - The event object
     * @returns The clicked element as a HTMLElement or null
     */
    const getClickedElemet = (event: Event): HTMLElement | null => {
        const element = event.target as HTMLElement;

        return triggerOnParent || element.tagName != "DIV" ? element.parentElement : element;
    };

    /**
     * Highlight the button when it is clicked
     * Also, triggers a light haptic feedback
     * @param event - The event object
     * @returns void
     */
    const highlightButton = (event: Event): void => {
        const clickedElement = getClickedElemet(event);

        if (clickedElement) {
            Haptics.impact({ style: ImpactStyle.Light });

            // Reset animation of clicked element (trigger reflow)
            clickedElement.classList.remove(classToTrigger);
            void clickedElement.offsetWidth;
            clearTimeout(animationTimeout);

            clickedElement.classList.add(classToTrigger);
        }
    };

    /**
     * Unhighlight the button when the click is released
     * @param event - The event object
     * @returns void
     */
    const unhighlightButton = (event: Event): void => {
        const clickedElement = getClickedElemet(event);
        if (clickedElement) {
            if (animateButton) {
                animationTimeout = setTimeout(() => {
                    clickedElement.classList.remove(classToTrigger);
                }, 750);
            } else {
                clickedElement.classList.remove(classToTrigger);
            }
        }
    };

    return { highlightButton, unhighlightButton };
}
