import { ActionTree } from 'vuex';
import { UserState } from './types';
import { RootState } from '@/store/types';
import Vue from 'vue';
import store from '@/store'
import { Entity, IRElementMeta, IRElementType, LinkedElement } from '../IRElements/types';
import { convertToSnakeCase, convertFromSnakeCase } from '../../../utils/elementUtils'


export const actions: ActionTree<UserState, RootState> = {
    async loginLocalUser({ commit, dispatch }, { username, password }): Promise<any> {
        try {
            commit('loginInProgress')
            const resp = await Vue.prototype.$api.auth.login(username, password)
            commit('loginSuccess', resp.data)
            const user = await Vue.prototype.$api.auth.getCurrentUser()
            commit('userFound', user.data)
            // Connect to firehose manually if logging in with username/password
            dispatch('connectToFirehose')
            dispatch('setFirehoseReconnect', true)
        }
        catch (e: any) {
            commit('loginError')
            commit('errorOccurred', e, { root: true })
        }

    },
    async retrieveUserInfo({ commit }): Promise<any> {
        try {
            const user = await Vue.prototype.$api.auth.getCurrentUser()
            commit('userFound', user.data)
        }
        catch (e: any) {
            commit('loginError')
            commit('errorOccurred', e, { root: true })
        }
    },

    async startAzureAD({ commit }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.auth.startAzureAD();
            return resp.data.url
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return null
        }
    },

    async completeAzureAD({ commit }, token): Promise<any> {
        try {
            commit('loginInProgress')
            const resp = await Vue.prototype.$api.auth.completeAzureAD(token)
            commit('loginSuccess', resp.data)
            const user = await Vue.prototype.$api.auth.getCurrentUser()
            commit('userFound', user.data)
        }
        catch (e) {
            commit('loginError')
            commit('errorOccurred', e, { root: true })
        }
    },

    async logout({ commit }): Promise<any> {
        try {
            await Vue.prototype.$api.auth.logout();
            commit('logoutSuccess')
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async settingsButtonClicked({ commit }): Promise<any> {
        try {
            commit('toggleShowQuickSettings')
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },
    async updateUserPreferences({ commit }, { newUserPreferences }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.user.updateUserMe({ preferences: newUserPreferences })
            commit('updateUserPreferencesSuccess', resp.data)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async updateUserMe({ commit }, { data }) {
        try {
            const resp = await Vue.prototype.$api.user.updateUserMe(data)
            commit('updateUserMeSuccess', resp.data)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async retrieveUserApiKeys({ commit }) {
        try {
            const resp = await Vue.prototype.$api.user.getUserApiKeys()
            commit('retrieveUserApiKeysSuccess', resp.data.result)
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async updateApiKey({ commit }, { key, updateData }) {
        try {
            const resp = await Vue.prototype.$api.user.updateApiKey(key, updateData)
            commit('updateApiKeySuccess', resp.data)
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveNotifications({ commit, state }, { includeAcked, skip, limit } = {}) {
        try {
            const resp = await Vue.prototype.$api.user.retrieveNotifications(includeAcked, skip, limit)
            state.notificationsRemaining = resp.data.totalCount - resp.data.resultCount - (skip||0)
            if (state.notificationsRemaining < 0) {
                state.notificationsRemaining = 0
            }
            commit('retrieveNotificationsSuccess', resp.data)      
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async sendBroadcastNotification({ commit }, { notificationText, priority, expires }){
        try {
            await Vue.prototype.$api.user.sendBroadcastNotification(notificationText, priority, expires)
            return true
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async connectToFirehose({ commit, dispatch, getters, rootGetters }, { reconnect = false } = {}) {
        try {
            commit('connectToFirehose')
            const firehose: EventSource = getters.firehose
            if (firehose) {
                firehose.onmessage = async (e: any) => {
                    const eventData = JSON.parse(e.data)
                    await dispatch('handleFirehoseEvent', {
                        'firehoseEvent': eventData,
                        'user': getters.currentUser,
                        'selectedElement': rootGetters['IRElements/selectedElement'],
                        'selectedElementEntryIds': rootGetters['IRElements/allEntryIds'],
                        'selectedElementFiles': rootGetters['IRElements/selectedElementFiles'],
                        'queueElementType': rootGetters['IRElements/elementType'],
                        'elementListFilterDict': rootGetters['IRElements/elementListFilterDict']
                    })
                }
                firehose.onerror = async () => {
                    await dispatch('disconnectFromFirehose')
                }
                // If we're reconnecting, also retreive item list and selected element again after we connect
                if (reconnect) {
                    firehose.onopen = async () => {
                        if (rootGetters['IRElements/elementType']) {
                            await store.dispatch('IRElements/retrieveElementListWithFilter', { 'elementType': rootGetters['IRElements/elementType'], 'filterDict': rootGetters['IRElements/elementListFilterDict'] })
                        }
                        if (rootGetters['IRElements/selectedElement']) {
                            await store.dispatch('IRElements/reRetrieveElementInList', { 'elementID': rootGetters['IRElements/selectedElement'].id, 'elementType': rootGetters['IRElements/elementType'] })
                        }
                        await dispatch('retrieveNotifications')
                    }
                }
            }
        }
        catch (e) {
            commit('errorOccurred', e, {root:true})
        }
    },

    async handleFirehoseEvent({ commit, state }, { firehoseEvent, user, selectedElement, selectedElementEntryIds, selectedElementFiles, queueElementType, elementListFilterDict }) {
        const eventString = firehoseEvent.what + "|" + firehoseEvent.element_type + "|" + firehoseEvent.element_id
        // Abort early if we are already processing a similar firehose event
        if (state.firehoseRequestsInProgress.includes(eventString)) {
            return
        }
        state.firehoseRequestsInProgress.push(eventString)
        // Short random delay to ease instantaneous load on the API
        await new Promise(r => setTimeout(r, 500 + Math.random() * 2500))
        // Remove from list before processing starts since processing has multiple steps. Maybe move to finally clause later?
        const eventStringIdx = state.firehoseRequestsInProgress.findIndex((e) => e == eventString)
        if (eventStringIdx != -1) {
            state.firehoseRequestsInProgress.splice(eventStringIdx, 1)
        }
        try {
            if (firehoseEvent.what == "create" || firehoseEvent.what == "delete" || firehoseEvent.what == "update") {
                // Pull notifications for this user
                if (firehoseEvent.element_type == 'notification' && firehoseEvent.username == user.username) {
                    if (firehoseEvent.what == "update" && firehoseEvent?.data?.ack) {
                        commit("setNotificationAcked", firehoseEvent.element_id)
                    }
                    else {
                        await store.dispatch('user/retrieveNotifications')
                    }
                }
                // If element list type, re-retrieve the element list (except for item updates and tasks)
                else if (firehoseEvent.element_type == convertToSnakeCase(queueElementType) && queueElementType.toLowerCase() != "entry") {
                    const elementListIds = store.getters['IRElements/elementList'].map((e: IRElementMeta) => e.id)
                    if (firehoseEvent.what != "update") {
                        await store.dispatch('IRElements/retrieveElementListWithFilter', { 'elementType': queueElementType, 'filterDict': elementListFilterDict })
                    }
                    // Only reload the modified element on modify, also pull in selected element again if it was affected
                    if (firehoseEvent.what == "update" && elementListIds.includes(firehoseEvent.element_id) || firehoseEvent.element_id == selectedElement?.id) {
                        await store.dispatch('IRElements/reRetrieveElementInList', { 'elementID': firehoseEvent.element_id, 'elementType': queueElementType })
                    }
                }
                // Entries handled separately
                else if (firehoseEvent.element_type == 'entry') {
                    // Update entry list if entry attached to selected element
                    if ((selectedElementEntryIds().includes(firehoseEvent.element_id) || (firehoseEvent.target_type == convertToSnakeCase(queueElementType) && firehoseEvent.target_id == selectedElement?.id))) {
                        if (firehoseEvent.what == "delete") {
                            store.commit('IRElements/removeEntrySuccess', { 'entryId': firehoseEvent.element_id })
                        }
                        else {
                            await store.dispatch('IRElements/augmentSelectedElementEntries', { 'entryID': firehoseEvent.element_id })
                            await store.dispatch('IRElements/augmentSelectedElementEntities', { 'elementID': firehoseEvent.element_id, 'elementType': IRElementType.Entry, 'showLoading': false })
                        }
                    }
                    // Also search for entries attached to linked elements
                    else {
                        const linkedElements = store.getters['IRElements/selectedElementLinkedElements']
                        if (linkedElements) {
                            let linkedElementId: number | null = null
                            let linkedElementType: IRElementType | null = null
                            let linkedElementIndex: number | null = null
                            if (firehoseEvent.target_type) {
                                const capTargetType = convertFromSnakeCase(firehoseEvent.target_type) || "undefined"
                                if (capTargetType in linkedElements) {
                                    for (const linkedElement of linkedElements[capTargetType]) {
                                        if (linkedElement.element.id == firehoseEvent.target_id) {
                                            linkedElementId = linkedElement.element.id
                                            linkedElementType = capTargetType as IRElementType
                                            linkedElementIndex = linkedElements[capTargetType].findIndex((val: LinkedElement) => val.element.id == linkedElementId)
                                        }
                                    }
                                }
                            }
                            // Sometimes (usually on updates) a firehose event on a linked element entry will come in
                            // without target_type or target_id, so we have to search all of our linked elements for the entry
                            else {
                                for (const capTargetType in linkedElements) {
                                    for (const linkedElement of linkedElements[capTargetType]) {
                                        for (const entry of linkedElement.entries) {
                                            if (entry.id == firehoseEvent.element_id) {
                                                linkedElementId = linkedElement.element.id
                                                linkedElementType = capTargetType as IRElementType
                                                linkedElementIndex = linkedElements[capTargetType].findIndex((val: LinkedElement) => val.element.id == linkedElementId)
                                                break
                                            }
                                        }
                                    }
                                    if (linkedElementId) {
                                        break
                                    }
                                }
                            }
                            if (linkedElementId) {
                                if (firehoseEvent.what == "delete") {
                                    store.commit('IRElements/removeEntrySuccess', {
                                        linkedElementId: linkedElementId,
                                        linkedElementType: linkedElementType,
                                        linkedElementIndex: linkedElementIndex,
                                        entryId: firehoseEvent.element_id
                                    })
                                }
                                else {
                                    await store.dispatch('IRElements/augmentLinkedElementEntries', {
                                        linkedElementId: linkedElementId,
                                        linkedElementType: linkedElementType,
                                        linkedElementIndex: linkedElementIndex,
                                        entryID: firehoseEvent.element_id
                                    })
                                }
                            }
                        }
                    }
                }
                // Also monitor files for deletions and modifications
                else if (firehoseEvent.element_type == 'file' && selectedElementFiles.map((a: any) => a.id).includes(firehoseEvent.element_id)) {
                    await store.dispatch('IRElements/retrieveSelectedElementFilesbyID', { 'elementID': selectedElement.id, 'elementType': queueElementType })
                }
                else if (firehoseEvent.element_type == 'enrichment') {
                    try {
                        // make sure this entity is among the selected Entities (it's actively open in the flair pane)
                        const selectedElementEntityIds = store.getters['IRElements/selectedElementFlairedEntities'].map((e: Entity) => e.id)
                        if (selectedElementEntityIds.includes(firehoseEvent.entity_id)) {
                            // get the enrichment's entity/id
                            const resp = await Vue.prototype.$api.elements.retrieveElementbyID(firehoseEvent.entity_id, IRElementType.Entity)
                            const entity = resp.data
                            const entity_id = entity.id
                            // if in pane, pull all of the entity's enrichments
                            const respEntityEnrichment = await Vue.prototype.$api.elements.retrieveEntityEnrichmentsbyID(entity_id)
                            const enrichments = respEntityEnrichment.data
                            entity.enrichments = enrichments
                            // then try calling the action resetFlairedEnrichmentPivotValue, then addFlairedEntitySuccess to see if that triggers a refresh in the UI (appropriately)
                            await store.dispatch('IRElements/resetFlairedEnrichmentsAndPivotsValue')
                            await store.dispatch('IRElements/addFlairedEntity', {entity:entity})
                        }
                    }
                    catch (e: any) {
                        commit('errorOccurred', e, { root: true })
                    }
                }
                // Monitor entities linked to the selected element
                else if (firehoseEvent.element_type == 'entity') {
                    const selectedElementEntityIds = store.getters['IRElements/selectedElementEntitiesArray'].map((e: Entity) => e.id)
                    if (selectedElementEntityIds.includes(firehoseEvent.element_id)) {
                        await store.dispatch('IRElements/augmentSelectedElementEntitiesById', { 'entityIds': [firehoseEvent.element_id], 'showLoading': false })
                    }
                }
                // Monitor links to/from selected element and all elements currently listed
                else if (firehoseEvent.element_type == 'link') {
                    const elementListIds = store.getters['IRElements/elementList'].map((e: IRElementMeta) => e.id)
                    if (firehoseEvent.v0_type == convertToSnakeCase(queueElementType) && (elementListIds.includes(firehoseEvent.v0_id) || firehoseEvent.v0_id == selectedElement?.id)) {
                        // This will happen on creating a file
                        if (firehoseEvent.v1_type == 'file' && firehoseEvent.v0_id == selectedElement?.id) {
                            await store.dispatch('IRElements/retrieveSelectedElementFilesbyID', { 'elementID': selectedElement.id, 'elementType': selectedElement.ElementType })
                        }
                        // Just reload the element for everything else
                        else {
                            await store.dispatch('IRElements/reRetrieveElementInList', { 'elementID': firehoseEvent.v0_id, 'elementType': queueElementType })
                        }
                    }
                    else if (firehoseEvent.v1_type == convertToSnakeCase(queueElementType) && (elementListIds.includes(firehoseEvent.v1_id) || firehoseEvent.v1_id == selectedElement?.id)) {
                        // Reload signatures if they get updated for the selected element
                        if (firehoseEvent.v0_type == 'signature' && firehoseEvent.v1_id == selectedElement?.id) {
                            if (firehoseEvent.what == "delete") {
                                store.getters['IRElements/selectedElement'].linkedElements.Signature = []
                            }
                            await store.dispatch('IRElements/retrieveLinkedSignaturesById', { 'elementId': selectedElement.id, 'elementType': selectedElement.ElementType })
                        }
                        // For everything else, just reload the element
                        else {
                            await store.dispatch('IRElements/reRetrieveElementInList', { 'elementID': firehoseEvent.v1_id, 'elementType': queueElementType })
                        }
                    }
                }
            }
        }
        catch(e){
            console.log("Error in firehose request", e)
        }
    },

    async disconnectFromFirehose({ commit }){
        try {
            commit('disconnectFromFirehose')
        }
        catch (e) {
            commit('errorOccurred', e, {root:true})
        }
    },

    async setFirehoseReconnect({ dispatch, state, getters }, reconnect: boolean) {
        if (reconnect && !state.firehoseReconnectTask) {
            // Every 10 seconds, reconnect to the firehose if we aren't connected to it
            state.firehoseReconnectTask = setInterval(() => {
                if (getters.firehose == undefined) {
                    dispatch('connectToFirehose', { 'reconnect': true })
                }
            }, 10000)
        }
        else if (!reconnect && state.firehoseReconnectTask) {
            clearInterval(state.firehoseReconnectTask)
            state.firehoseReconnectTask = undefined
        }
    },

    async createApiKey({ commit }) {
        try {
            const resp = await Vue.prototype.$api.user.createApiKey()
            commit('createApiKeySuccess', resp.data)
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async deleteApiKey({ commit }, { key }) {
        try {
            const resp = await Vue.prototype.$api.user.deleteApiKey(key)
            commit('deleteApiKeySuccess', resp.data)
        }
        catch (e) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async performTextSearch({ commit, state }, { searchText, extraFilters = {}, sort = undefined }) {
        try {
            const resp = await Vue.prototype.$api.user.callTextSearch(searchText, extraFilters, sort)
            state.searchText = searchText
            commit('userSearchSuccess', { "data": resp.data })
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async clearSearchResults({ commit }) {
        try {
            commit('clearSearchResults')
        }
        catch (e: any) {
                commit('errorOccurred', e, { root: true })
    }
},

    async changeShowSearchOverlay({ commit }, {value}){
        try {
            commit('changeShowSearchOverlay', value)
        }
        catch (e: any) {
                commit('errorOccurred', e, { root: true })
    }
    },

    async ackNotifications({ commit }, {notifications}) {
        try {
            const notificationIds = notifications.filter((el: any) => !el.ack).map((el: any) => el.id)
            if (notificationIds.length > 0) {
                const resp = await Vue.prototype.$api.user.ackNotifications(notificationIds)
                commit('ackNotificationsSuccess', resp.data)
            }
        }
        catch (e: any) {
                commit('errorOccurred', e, { root: true })
    }},

    async getFavorites({ commit }) {
        try {
            const resp = await Vue.prototype.$api.user.getFavorites()
            return resp.data
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async getSubscriptions({ commit }) {
        try {
            const resp = await Vue.prototype.$api.user.getSubscriptions()
            return resp.data
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    }
};