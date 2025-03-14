export const auth = {
    state: () => ({
        UID: "",
        userName: "",
        profilePicture: "",
        email: "",
        lastOpenTime: "",
        enteredPasscode: "",
        reenteredPasscodeForChange: "",
    }),

    mutations: {
        set_username(state, name) {
            state.userName = name;
        },
        set_UID(state, uid) {
            state.UID = uid;
        },
        set_profilePicture(state, picture) {
            state.profilePicture = picture;
        },
        set_email(state, email) {
            state.email = email;
        },
        set_enteredPasscode(state, entered) {
            state.enteredPasscode = entered;
        },
        set_lastOpenTime(state, time) {
            state.lastOpenTime = time;
        },
        set_reenteredPasscodeForChange(state, entered) {
            state.reenteredPasscodeForChange = entered;
        },
    },

    actions: {
        nuxtClientInit(context) {
            context.commit("set_UID", "");
            context.commit("set_username", "");
            context.commit("set_profilePicture", "");
            context.commit("set_email", "");
            context.commit("set_enteredPasscode", "");
            context.commit("set_lastOpenTime", "");
            context.commit("set_reenteredPasscodeForChange", "");
        },
        save_username(context, name) {
            context.commit("set_username", name);
        },
        save_UID(context, id) {
            context.commit("set_UID", id);
        },
        save_profilePicture(context, picture) {
            context.commit("set_profilePicture", picture);
        },
        save_email(context, email) {
            context.commit("set_email", email);
        },
        save_enteredPasscode(context, entered) {
            context.commit("set_enteredPasscode", entered);
        },
        save_lastOpenTime(context, time) {
            context.commit("set_lastOpenTime", time);
        },
        save_reenteredPasscodeForChange(context, entered) {
            context.commit("set_reenteredPasscodeForChange", entered);
        },
    },
};
