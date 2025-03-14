export const userData = {
    state: () => ({
        contacts: [],
        contactDataPresets: [],
        contactNotes: [],
        groups: [],
        contactChats: [],
        notifications: [],
        canSyncDateAnswers: true,
        dataLoaded: false,
        lastVersionSummary: "",
        lastVersionDesc: "",
        credits: 0,
        nextCreditRecharge: "",
    }),
    mutations: {
        setContacts(state, contacts) {
            state.contacts = contacts;
        },
        setContactDataPresets(state, data) {
            state.contactDataPresets = data;
        },
        setContactNotes(state, data) {
            state.contactNotes = data;
        },
        setGroups(state, groups) {
            state.groups = groups;
        },
        setContactChats(state, chats) {
            state.contactChats = chats;
        },
        setNotifications(state, notifications) {
            state.notifications = notifications;
        },
        setCanSyncDateAnswers(state, canSync) {
            state.canSyncDateAnswers = canSync;
        },
        setDataLoaded(state, loaded) {
            state.dataLoaded = loaded;
        },
        setLastVersionSummary(state, summary) {
            state.lastVersionSummary = summary;
        },
        setLastVersionDesc(state, desc) {
            state.lastVersionDesc = desc;
        },
        setCredits(state, credits) {
            state.credits = credits;
        },
        setNextCreditRecharge(state, date) {
            state.nextCreditRecharge = date;
        },

        updateGroup(state, data) {
            state.groups[data.group_id] = data.group_data;
        },
        updateContactData(state, data) {
            state.contacts[data.id] = data.contactData;
        },
        updateContactDataPresets(state, data) {
            state.contactDataPresets[data.id] = data.presets;
        },
        updateContactNotes(state, data) {
            state.contactNotes[data.id] = data.notes;
        },
        updateContactChats(state, data) {
            state.contactChats[data.id] = data.chat;
        },
        updateNotification(state, data) {
            state.notifications[data.id] = data.notification;
        },
        updateCredits(state, credits) {
            state.credits = credits;
        },
        updateNextCreditRecharge(state, date) {
            state.nextCreditRecharge = date;
        },

        deleteContact(state, id) {
            delete state.contacts[id];
        },
        deleteGroup(state, groupId) {
            delete state.groups[groupId];
        },
        createContact(state, data) {
            state.contacts[data.id] = data.contact;
        },
        createGroup(state, data) {
            state.groups[data.group_id] = data.group;
        },
    },
    actions: {
        resetUserDataStore(context) {
            context.commit("setContacts", []);
            context.commit("setContactDataPresets", []);
            context.commit("setContactNotes", []);
            context.commit("setGroups", []);
            context.commit("setContactChats", []);
            context.commit("setNotifications", []);
            context.commit("setCanSyncDateAnswers", true);
            context.commit("setDataLoaded", false);
            context.commit("setLastVersionSummary", "");
            context.commit("setLastVersionDesc", "");
            context.commit("setCredits", 0);
            context.commit("setNextCreditRecharge", "");
        },
    },
};
