/**
 * Composable function that handles common filtering logic shared across the application.
 * @param items Vue3 ref to any object that should be filtered based on the value of selected object properies.
 * @param filterEmpty Determines if filter should simply remove all items with empty value
 */
export function useFilters(items: Ref<any>, filterEmpty: boolean = false) {
    const currentFilterTerm = ref("");
    const filterBy: Ref<string[]> = ref([]);

    /**
     * This Computed property will filter the items based on the current searched word in selected object property.
     * For example you can set filterBy to 'contactName' and currentFilterTerm to 'John' ...
     * Searched term is always transformed to lowercase.
     * @returns Filtered items.
     */
    const filterItems = computed(() => {
        if (currentFilterTerm.value === "" && !filterEmpty) {
            return items.value;
        }

        const result: any = {};
        for (const key in items.value) {
            const item = items.value[key];

            for (const filterByItem in filterBy.value) {
                if (!Object.hasOwn(item, filterBy.value[filterByItem])) {
                    console.error(`Property '${filterBy.value[filterByItem]}' does not exist in the item - cannot filter by it.`);
                    continue;
                }

                const currentValue = item[filterBy.value[filterByItem]];

                if (filterEmpty) {
                    if (currentValue) {
                        result[key] = item;
                    }
                } else {
                    if (currentValue.toLowerCase().includes(currentFilterTerm.value.toLowerCase())) {
                        result[key] = item;
                    }
                }
            }
        }

        return result;
    });

    /**
     * Set the current filter term to the provided value.
     * @param term The term to filter by.
     * @returns void
     */
    const setFilter = (term: string): void => {
        currentFilterTerm.value = term;
    };

    /**
     * Set the object properties to filter by.
     * @param term The term to filter by.
     * @returns void
     */
    const setFilterBy = (term: string[]): void => {
        filterBy.value = term;
    };

    /**
     * Computed property to count the filtered items.
     * @returns The number of filtered items.
     */
    const countFilteredItems = computed(() => {
        return Object.keys(filterItems.value).length;
    });

    return { currentFilterTerm, filterItems, countFilteredItems, setFilter, setFilterBy };
}
