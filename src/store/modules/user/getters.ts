import { GetterTree } from 'vuex';
import { UserState, User, ApiKey, Notification } from './types';
import { RootState } from '@/store/types';

export const getters: GetterTree<UserState, RootState> = {
    isLoggedIn(state): boolean {
        return state.user != undefined;
    },
    loginInProgress(state): boolean {
        return state.loginInProgress
    },
    loginExpiration(state): Date | null {
        return state.loginExpiration
    },
    currentUser(state): User | undefined {
        return state.user
    },
    userApiKeys(state): Array<ApiKey> {
        return state.userApiKeys
    },
    firehose(state):EventSource | undefined {
        return state.firehose
    },
    
    notifications(state): Array<Notification> | undefined {
        if (state.user?.notifications) {
            return state.user.notifications.sort((a, b) => a.created > b.created ? -1 : 1)
        }
        else {
            return []
        }
    },

    unAckdNotifications(state, getters): number| undefined {
        const filteredNotifications = getters.notifications.filter((el:any) => el.ack == false)
        return filteredNotifications?.length
    },

    notificationsRemaining(state): number {
        return state.notificationsRemaining
    },

    searchResults(state):any | undefined {
        return state.searchResults
    },

    searchText(state): string | undefined {
        return state.searchText
    },

    currentUserPreferences(state): Record<string, any> | undefined {
        if (state.user && state.user.preferences != null) {
            return state.user.preferences
        }
        return {}
    },

    darkMode(state): boolean {
        if (state.user && state.user.preferences != null) {
            if ("darkMode" in state.user.preferences) {
                return state.user.preferences['darkMode']
            }
            else {
                return false
            }
        }
        else {
            return false
        }

    },

    inboxView(state): boolean {
        if (state.user && state.user.preferences != null) {
            if ("inboxView" in state.user.preferences) {
                return state.user.preferences['inboxView']
            }
            else {
                return false
            }
        }
        else {
            return false
        }

    },

    showQuickSettings(state): boolean {
        return state.showQuickSettings
    },

    showSearchOverlay(state): boolean{
        return state.showSearchOverlay
    },

    showPopularity(state): boolean {
        if (state.user && state.user.preferences != null) {
            if ("showPopularity" in state.user.preferences) {
                return state.user.preferences['showPopularity']
            }
            else {
                return false
            }
        }
        else {
            return false
        }
    },

    muteNotifications(state): boolean {
        if (state.user && state.user.preferences != null) {
            if ("muteNotifications" in state.user.preferences) {
                return state.user.preferences['muteNotifications']
            }
            else {
                return false
            }
        }
        else {
            return false
        }

    }
};