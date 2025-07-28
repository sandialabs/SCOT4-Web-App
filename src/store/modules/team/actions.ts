import { ActionTree } from 'vuex';
import { TeamState} from './types';
import { RootState } from '@/store/types';
import Vue from 'vue';


export const actions: ActionTree<TeamState, RootState> = {
    async retrieveCalendarEvents({ commit }, { startRange, endRange }): Promise<any> {

        try {
            const resp = await Vue.prototype.$api.team.getHandlers(startRange, endRange)
            commit('retrieveCalendarEventsSuccess', resp.data)
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveAllEntityClassesGeneralList({ commit }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.retrieveAllEntityClasses()
            commit('retrieveAllEntityClassesGeneralListSuccess', resp.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },
    
    async createCalendarEvent({ commit }, createData: any): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.createHandler(createData)
            commit('createCalendarEventSuccess', resp.data)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async updateCalendarEvent({ commit }, { id, updateData }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.updateHandler(id, updateData)
            commit('updateCalendarEventSuccess', resp.data)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async deleteCalendarEvent({ commit }, id: number): Promise<any> {
        try {
            await Vue.prototype.$api.team.deleteHandler(id)
            commit('deleteCalendarEventSuccess', id)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async retrieveAllUsernames({ commit }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.getAllUsernames()
            commit('retrieveAllUsernamesSuccess', resp.data)
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveGlobalSettings({ commit }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.retrieveGlobalSettings()
            commit('retrieveGlobalSettingsSuccess', resp.data)
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async updateGlobalSettings({ commit }, updateData): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.updateGlobalSettings(updateData)
            commit('updateGlobalSettingsSuccess', resp.data)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async getCurrentIH({ commit }): Promise<any> {

        try{
            const today = new Date()
            const tomorrow: Date|number|string =  new Date(today.getTime() + (24 * 60 * 60 * 1000))
            const resp = await Vue.prototype.$api.team.getHandlers(today.toISOString(), tomorrow.toISOString())
            const incidentHandlers = resp.data.result.filter((h: any) => h?.position?.toLowerCase() == "incident handler")
            commit('getCurrentIHSuccess', incidentHandlers)
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveAuditsWithFilter({ commit }, { abortController, ...filter }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.retrieveAuditsWithFilter(filter, abortController)
            commit('retrieveAuditsSuccess', resp.data)
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
        }
    },

    async deleteAudit({ commit }, auditId): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.deleteAudit(auditId)
            commit('deleteAuditSuccess', resp.data)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async retrieveGameResults({ commit }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.getGameResults()
            commit('retrieveGameResultsSuccess', resp.data)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async retrieveMetricResults({ commit }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.getMetricResults()
            commit('retrieveMetricResultsSuccess', resp.data)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },
    
    async retrieveSpecialMetric({ commit }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.getSpecialMetric()
            commit('retrieveSpecialMetricSuccess', resp.data.result)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async retrieveUserActivity({ commit }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.team.getUserActivity()
            commit('retrieveUserActivitySuccess', resp.data)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    }
}