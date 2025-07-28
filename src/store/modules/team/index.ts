// profile/index.ts
import { Module } from 'vuex';
import { getters } from '@/store/modules/team/getters';
import { actions } from '@/store/modules/team/actions'
import { mutations } from '@/store/modules/team/mutations'
import { TeamState } from '@/store/modules/team/types';
import { RootState } from '@/store/types';


export const state: TeamState = {
    calendarEvents: [],
    currentIH: [],
    usernames: [],
    entityClassesList: [],
    globalSettings: {
       site_name: "",
       environment_level: "",
       it_contact: null,
       time_zone: null,
       default_permissions: {}
    },
    auditEntries: [],
    totalAuditCount: 0,
    gameResults: [],
    metricResults: [],
    specialMetric: [],
    userActivity: {},
};

const namespaced: boolean = true;

export const team: Module<TeamState, RootState> = {
    namespaced,
    state,
    getters,
    actions,
    mutations
};