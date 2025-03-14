/**
 * Composable function that provides smooth scrolling functionality.
 * Used for example for closing Dropdowns etc
 */
export function useSmoothScroll() {
    /**
     * Smoothly scrolls to the element with the given ID.
     * @param endX - X coordinate to scroll to
     * @param endY - Y coordinate to scroll to
     * @param duration - Duration of the scroll animation
     * @returns void
     */
    const smoothScrollTo = (endX: number, endY: number, duration: number) => {
        const startX = window.scrollX || window.pageXOffset;
        const startY = window.scrollY || window.pageYOffset;
        const distanceX = endX - startX;
        const distanceY = endY - startY;
        const startTime = new Date().getTime();

        function scroll() {
            const currentTime = new Date().getTime();
            const time = Math.min(1, (currentTime - startTime) / duration);

            // Ease function: easeInOutCubic
            const easedT = time < 0.5 ? 4 * time * time * time : (time - 1) * (2 * time - 2) * (2 * time - 2) + 1;

            window.scrollTo(startX + distanceX * easedT, startY + distanceY * easedT);

            if (time < 1) {
                requestAnimationFrame(scroll);
            }
        }

        requestAnimationFrame(scroll);
    };

    /**
     * Scrolls to the element with the given ID.
     * @param elementID - ID of the element to scroll to
     * @returns void
     */
    const scrollToElement = (elementID: string) => {
        const element = document.getElementById(elementID);

        if (!element) {
            console.error("Element with ID " + elementID + " not found.");
            return;
        }

        let endY = window.scrollY - element.offsetHeight;
        smoothScrollTo(0, endY, 200);
    };

    return { scrollToElement };
}
