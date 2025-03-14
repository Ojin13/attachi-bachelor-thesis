import { store } from "~/store";
import type { ContactGroup } from "~/types";

export function useContactGroups(contactID: number) {
    /**
     * Computed property that returns contact groups.
     * @returns Array of groups that the contact is a member of
     */
    const getContactGroups = computed(() => {
        const groups: ContactGroup[] = [];
        const storeGroups: ContactGroup[] = store.state.userData.groups;

        for (const key in storeGroups) {
            if (!Object.hasOwn(storeGroups[key], "groupMembers")) {
                console.warn("Group does not have a groupMembers property.");
                return [];
            }

            if (storeGroups[key].groupMembers.includes(contactID)) {
                groups.push(storeGroups[key]);
            }
        }

        return groups;
    });

    return { getContactGroups };
}
