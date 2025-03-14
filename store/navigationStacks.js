export const navigationStacks = {
    state: () => ({
        contactsStack: ["/auth/contacts"],
        groupsStack: ["/auth/groups"],
        accountStack: ["/auth/account"],
    }),

    mutations: {
        setContactStack(state, newStack) {
            state.contactsStack = newStack;
        },

        setGroupStack(state, newStack) {
            state.groupsStack = newStack;
        },

        setAccountStack(state, newStack) {
            state.accountStack = newStack;
        },
    },

    actions: {
        resetNavigationStacks(context) {
            context.commit("setContactStack", ["/auth/contacts"]);
            context.commit("setGroupStack", ["/auth/groups"]);
            context.commit("setAccountStack", ["/auth/account"]);
        },
    },
};
