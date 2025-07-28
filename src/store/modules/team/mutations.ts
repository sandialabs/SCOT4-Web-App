// profile/mutations.ts
import { MutationTree } from 'vuex';
import { Audit, Settings, TeamState } from './types';

export const mutations: MutationTree<TeamState> = {
    retrieveCalendarEventsSuccess(state, payload: any) {
        state.calendarEvents = payload.result
    },

    createCalendarEventSuccess(state, payload: any) {
        state.calendarEvents.push(payload)
    },

    updateCalendarEventSuccess(state, payload: any) {
        const event_index = state.calendarEvents.findIndex((e) => e.id == payload.id)
        state.calendarEvents.splice(event_index, 1, payload) // Do it this way to maintain reactivity
    },

    deleteCalendarEventSuccess(state, payload: number) {
        const event_index = state.calendarEvents.findIndex((e) => e.id == payload)
        state.calendarEvents.splice(event_index, 1) // Do it this way to maintain reactivity
    },
    retrieveAllEntityClassesGeneralListSuccess(state, payload: any) {
        
        state.entityClassesList = payload.result
        
    },
    retrieveAllUsernamesSuccess(state, payload: any) {
        state.usernames = payload.result
    },

    getCurrentIHSuccess(state, payload: any){
        state.currentIH = payload
    },

    retrieveGlobalSettingsSuccess(state, payload: Settings) {
        state.globalSettings = payload
    },

    updateGlobalSettingsSuccess(state, payload: Settings) {
        state.globalSettings = payload
    },

    retrieveAuditsSuccess(state, payload: any) {
        state.auditEntries = payload.result
        state.totalAuditCount = payload.totalCount
    },

    deleteAuditSuccess(state, payload: any) {
        if (state.auditEntries) {
            const elementIndex = state.auditEntries.findIndex((a) => a.id == payload.id)
            state.auditEntries.splice(elementIndex, 1) // Remove item from list reactively
        }
    },

    retrieveGameResultsSuccess(state, payload: any) {
        state.gameResults = payload
    },

    retrieveMetricResultsSuccess(state, payload: any) {
        state.metricResults = payload
    },

    retrieveSpecialMetricSuccess(state, payload: any) {
        state.specialMetric = payload
    },
    
    retrieveUserActivitySuccess(state, payload: any) {
        state.userActivity = payload
    }
}