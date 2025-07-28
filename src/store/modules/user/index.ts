// profile/index.ts
import { Module } from 'vuex';
import { getters } from '@/store/modules/user/getters';
import { actions } from '@/store/modules/user/actions'
import { mutations } from '@/store/modules/user/mutations'
import { UserState } from '@/store/modules/user/types';
import { RootState } from '@/store/types';


export const state: UserState = {
    loginInProgress: false,
    loginExpiration: new Date(),
    user: undefined,
    userApiKeys: [],
    firehose: undefined,
    firehoseReconnectTask: undefined,
    firehoseRequestsInProgress: [],
    showQuickSettings: false,
    searchText: '',
    searchResults: undefined,
    showSearchOverlay: false,
    notificationsRemaining: 0
};

const namespaced: boolean = true;

export const user: Module<UserState, RootState> = {
    namespaced,
    state,
    getters,
    actions,
    mutations
};