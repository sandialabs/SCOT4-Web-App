import { GetterTree } from 'vuex';
import { Audit, Settings, TeamState } from './types';
import { RootState } from '@/store/types';

export const getters: GetterTree<TeamState, RootState> = {
    calendarEvents(state): Array<any>{
        const calendarEventsCopy: Array<any> = [ ...state.calendarEvents ]
        for (const event of calendarEventsCopy) {
            if (event.start_date) {
                event.start_date = new Date(event.start_date)
            }
            if (event.end_date) {
                event.end_date = new Date(event.end_date)
            }
        }
        return calendarEventsCopy
    },

    entityClassesList(state):Array<any>{
        return state.entityClassesList
    },
    
    currentIH(state): Array<any>{
        return state.currentIH
    },

    usernames(state): Array<string> {
        return state.usernames
    },

    globalSettings(state): Settings {
        return state.globalSettings
    },

    auditEntries(state): Array<Audit> {
        return state.auditEntries
    },

    totalAuditCount(state): number {
        return state.totalAuditCount
    },

    gameResults(state): Array<any> {
        return state.gameResults
    },

    metricResults(state): Array<any> {
        return state.metricResults
    },

    specialMetric(state): Array<any> {
        return state.specialMetric
    },
    
    userActivity(state): any {
        return state.userActivity
    }
}