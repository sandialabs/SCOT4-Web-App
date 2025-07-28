import { ActionTree } from 'vuex';
import { EntryClassEnum, IRElement, IRElementsListState, IRElementType, PermissionEnum } from './types';
import { RootState } from '@/store/types';
import Vue from 'vue';
import { getParentEntryId } from '@/utils/treeUtils';
import { Role } from '../user/types';
import { Audit } from '../team/types';
import axios from 'axios';
import { default_incident_summary } from '@/constants'


export const actions: ActionTree<IRElementsListState, RootState> = {
    async retrieveElementList({ commit }, elementType: IRElementType): Promise<any> {
        try {
            commit('beginRetrieveElements')
            const resp = await Vue.prototype.$api.elements.retrieveElements(elementType)
            commit('retrieveElementsSuccess', { "data": resp.data, "elementType": elementType })
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            commit('retrieveElementsFailure')
        }
    },

    async retrieveElementListWithFilter({ commit, state }, { elementType, filterDict, abortController }): Promise<any> {
        try {
            commit('beginRetrieveElements', state.ElementType == elementType)
            if (abortController) {
                state.ElementListAbortController = abortController
            }
            const resp = await Vue.prototype.$api.elements.retrieveElementsWithFilter(elementType, filterDict, state.ElementListAbortController)
            commit('retrieveElementsSuccess', { "data": resp.data, "elementType": elementType })
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            commit('retrieveElementsFailure')
        }

    },

    async updateElementInList({ commit }, { elementId, elementType, updateData }) {
        try {
            const resp = await Vue.prototype.$api.elements.updateElementById(elementId, elementType, updateData)
            commit('updateElementSuccess', { "elementId": elementId, "data": resp.data })
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async deleteElement({ commit }, { elementId, elementType }) {
        try {
            const resp = await Vue.prototype.$api.elements.deleteElementById(elementId, elementType)
            commit('deleteElementSuccess', { "elementId": elementId, "data": resp.data })
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },


    async deleteFile({ commit }, { fileId, targetId, targetType }) {
        try {
            await Vue.prototype.$api.elements.deleteFileById(fileId, targetId, targetType)
        }   
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async updateFile({ commit }, { fileId, filename = null, description = null }) {
        try {
            const resp = await Vue.prototype.$api.elements.updateFileById(fileId, filename, description)
            if (resp) {
                return true
            }
            return false
        }   
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async undeleteElement({ commit }, { elementId, elementType, keep_id = true }) {
        try {
            const resp = await Vue.prototype.$api.elements.undeleteElementById(elementId, elementType, keep_id)
            commit('undeleteElementSuccess', { "elementId": elementId, "data": resp.data })
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    // Note that this does NOT add the element to the current element list,
    // you will have to refresh the list elsewhere
    async createElement({ commit }, { elementType, createData }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.createElement(elementType, createData)
            if (resp && resp.data && elementType == IRElementType.Incident) {
                // When creating an incident, make a default summary entry
                const entryCreateOrUpdateAttributes: any = {
                    target_type: IRElementType.Incident,
                    target_id: resp.data.id,
                    entry_class: EntryClassEnum.summary,
                    entry_data: { "html": default_incident_summary }
                }
                await Vue.prototype.$api.elements.updateOrCreateEntry(-1, entryCreateOrUpdateAttributes)
            }
            return resp.data
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveLinkedSignatures({ commit }, { associatedSigGuideMap }): Promise<any> {
        try {
            const payload: any = {}
            const signaturesRetrieved = []
            for (const sigID of Object.keys(associatedSigGuideMap)) {
                const resp = await Vue.prototype.$api.elements.retrieveElementbyID(sigID, IRElementType.Signature)
                signaturesRetrieved.push(resp.data)
            }
            payload['data'] = signaturesRetrieved
            payload['elementType'] = IRElementType.Signature
            commit('retrieveLinkedElementsSuccess', payload)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveLinkedSignaturesById({ commit, state }, { elementType, elementId }) {
        try {
            const payload: any = {}
            const signaturesRetrieved = await Vue.prototype.$api.elements.retrieveElementSignaturesByID(elementId, elementType, state.SelectedElementAbortController)
            payload['data'] = signaturesRetrieved.data
            payload['elementType'] = IRElementType.Signature
            commit('retrieveLinkedElementsSuccess', payload)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveLinkedGuides({ commit }, { associatedSigGuideMap }): Promise<any> {
        try {
            const payload: any = {}
            const guidesRetrieved: Array<any> = []
            for (const guideArray of Object.values(associatedSigGuideMap as Record<number, Array<number>>)) {
                for (const guideID of guideArray) {
                    const resp = await Vue.prototype.$api.elements.retrieveElementbyID(guideID, IRElementType.Guide)
                    guidesRetrieved.push(resp.data)
                }
            }
            payload['data'] = guidesRetrieved
            payload['elementType'] = IRElementType.Guide
            commit('retrieveLinkedElementsSuccess', payload)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveLinkedElementEntries({ commit }, { linkedElementId, linkedElementIndex, linkedElementType }): Promise<any> {
        try {
            const payload: any = {}
            const resp = await Vue.prototype.$api.elements.retrieveElementEntriesbyID(linkedElementId, linkedElementType)
            const respEntity = await Vue.prototype.$api.elements.retrieveElementEntitiesbyID(linkedElementId, linkedElementType)
            payload["elementType"] = linkedElementType
            payload["index"] = linkedElementIndex
            payload["data"] = resp.data
            commit('augmentElementEntities', { "data": respEntity.data })
            commit('retrieveLinkedElementsSuccess', { "data": respEntity.data.result, "elementType": IRElementType.Entity })
            commit('retrieveLinkedElementEntriesSuccess', payload)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async updateLinkedElement({ commit }, { updateData, linkedElementId, linkedElementIndex, linkedElementType }) {
        try {
            const resp = await Vue.prototype.$api.elements.updateElementById(linkedElementId, linkedElementType, updateData)
            commit("updateLinkedElementSuccess", { payload: resp.data, linkedElementIndex, linkedElementId, linkedElementType })
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveElementEntriesbyID({ commit }, { elementID, elementType }): Promise<any> {
        try {
            const entryResp = await Vue.prototype.$api.elements.retrieveElementEntriesbyID(elementID, elementType)
            commit('retrieveElementEntriesbyIDSuccess', { "data": entryResp.data, "elementType": elementType })
            // Check to see if we have any unsubmitted (still being edited) entries for this element
            const unsubmittedEditedEntry = await Vue.prototype.$storage.getItem('unsubmittedEditorEntry:' + elementType + ':' + elementID)
            if (unsubmittedEditedEntry != null) {
                if (unsubmittedEditedEntry == -1) {
                    // since this is unsubmitted, we know the entryId will be -1
                    const editorEntryContent = await Vue.prototype.$storage.getItem('editorContent' + ':' + elementType + ':' + elementID + ':' + '-1')
                    commit('addNewEntryWithEditModeOn', editorEntryContent)
                }
                else {
                    // There is an unsubmitted already existing entry
                    const entryData = entryResp.data.result.find((entry: any) => entry.id === unsubmittedEditedEntry).entry_data
                    const editorEntryContent = await Vue.prototype.$storage.getItem('editorContent' + ':' + elementType + ':' + elementID + ':' + String(unsubmittedEditedEntry))
                    editorEntryContent['entryId'] = unsubmittedEditedEntry
                    editorEntryContent['server_entry_data'] = entryData
                    await Vue.prototype.$storage.setItem('editorContent' + ':' + elementType + ':' + elementID + ':' + String(unsubmittedEditedEntry), editorEntryContent)
                    commit('restoreCachedExistingEntryEditor', editorEntryContent)
                }
            }
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async reRetrieveElementInList({ commit, state }, { elementID, elementType }) {
        try {
            if (state.ElementType?.toLowerCase() != elementType.toLowerCase()) {
                return false
            }
            let resp = null
            // Do full retrieval (including updating view count) if item is currently selected
            if (elementID == state.SelectedElement?.id) {
                resp = await Vue.prototype.$api.elements.retrieveElementbyID(elementID, elementType, state.SelectedElementAbortController)
            }
            // Otherwise only do list retrieval
            else {
                resp = await Vue.prototype.$api.elements.retrieveElementsWithFilter(elementType, { "id": elementID, "limit": 1 })
                if (!resp.data?.result || resp.data.result?.length == 0) {
                    return false
                }
                resp.data = resp.data.result[0]
            }
            if (elementID == state.SelectedElement?.id) {
                commit('retrieveElementbyIDSuccess', { "data": resp.data, "elementType": elementType })
            }
            commit('updateElementSuccess', { "elementId": elementID, "data": resp.data })
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async retrieveSelectedElementbyID({ commit, state }, { elementID, elementType }): Promise<any> {
        try {
            commit('retrieveNewSelectedElement', { elementID, elementType })
            const resp = await Vue.prototype.$api.elements.retrieveElementbyID(elementID, elementType, state.SelectedElementAbortController)
            commit('retrieveElementbyIDSuccess', { "data": resp.data, "elementType": elementType })
            if (elementType == IRElementType.Entity && !state.SelectedElementAbortController?.signal.aborted)
            {
                const respEntity = await Vue.prototype.$api.elements.retrieveEntityAppearancesbyID(elementID, { limit: 25 }, state.SelectedElementAbortController)
                commit('retrieveEntityAppearancesSuccess', {entityAppearances: respEntity.data})
                const respEntityPivot = await Vue.prototype.$api.elements.retrieveEntityPivotsbyID(elementID, state.SelectedElementAbortController)
                commit('retrieveEntityPivotsSuccess', {entityAppearances: respEntityPivot.data.result})
                const respEntityEnrichment = await Vue.prototype.$api.elements.retrieveEntityEnrichmentsbyID(elementID, state.SelectedElementAbortController)
                commit('retrieveEntityEnrichmentsSuccess', {entityAppearances: respEntityEnrichment.data.result})
            }

            if (elementType != IRElementType.Alertgroup && elementType != IRElementType.Alert && elementType != IRElementType.Pivot && elementType != IRElementType.EntityClass && !state.SelectedElementAbortController?.signal.aborted) {
                // This an entry-based IR Element get the entries as well here. 
                try {
                    const entryResp = await Vue.prototype.$api.elements.retrieveElementEntriesbyID(elementID, elementType, state.SelectedElementAbortController)
                    commit('retrieveElementEntriesbyIDSuccess', { "data": entryResp.data, "elementType": elementType })
                    // Check to see if we have any unsubmitted (still being edited) entries for this element
                    const unsubmittedEditedEntry = await Vue.prototype.$storage.getItem('unsubmittedEditorEntry:' + elementType + ':' + elementID)

                    if (unsubmittedEditedEntry != null) {
                        if (unsubmittedEditedEntry == -1) {
                            // since this is unsubmitted, we know the entryId will be -1
                            const editorEntryContent = await Vue.prototype.$storage.getItem('editorContent' + ':' + elementType + ':' + elementID + ':' + '-1')
                            commit('addNewEntryWithEditModeOn', editorEntryContent)
                        }
                        else {
                            // There is an unsubmitted already existing entry
                            const entry = entryResp.data.result.find((entry: any) => entry.id === unsubmittedEditedEntry)
                            if (entry && 'entry_data' in entry) {

                                const entryData = entry.entry_data
                                const editorEntryContent = await Vue.prototype.$storage.getItem('editorContent' +
                                    ':' + elementType + ':' + elementID + ':' + String(unsubmittedEditedEntry))
                                editorEntryContent['entryId'] = unsubmittedEditedEntry
                                editorEntryContent['server_entry_data'] = entryData
                                await Vue.prototype.$storage.setItem('editorContent' +
                                    ':' + elementType + ':' + elementID + ':' + String(unsubmittedEditedEntry), editorEntryContent)
                                await Vue.prototype.$storage.getItem('editorContent' +
                                    ':' + elementType + ':' + elementID + ':' + String(unsubmittedEditedEntry))
                                commit('restoreCachedExistingEntryEditor', editorEntryContent)
                            }
                        }
                    }
                }
                catch (e: any) {
                    if (!e.__CANCEL__) {
                        commit('errorOccurred', e, { root: true })
                    }
                    return false
                }
            }
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
                commit('retrieveSelectedElementFailure')
            }
            return false
        }
        return true
    },

    async retrieveElementPermissions({ commit, state }, { elementID, elementType }): Promise<{ [key in PermissionEnum]?: Array<Role> }> {
        try {
            const resp = await Vue.prototype.$api.elements.retrieveElementPermissions(elementID, elementType, state.SelectedElementAbortController)
            if (state.SelectedElement?.id == elementID && state.SelectedElement?.ElementType == elementType) {
                commit('selectedElementPermissionsLoaded', resp.data)
            }
            return resp.data
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            return {}
        }
    },

    async reflairSelectedElementbyID({ commit, state }, { elementID, elementType }): Promise<any> {
        try {
            await Vue.prototype.$api.elements.reflairSelectedElementById(elementID, elementType, state.SelectedElementAbortController)
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            return {}
        }
    },

    async retrieveElementHistory({ commit, state }, { elementID, elementType }): Promise<Array<Audit>> {
        try {
            const resp = await Vue.prototype.$api.elements.retrieveElementHistory(elementID, elementType, state.SelectedElementAbortController)
            if (state.SelectedElement?.id == elementID && state.SelectedElement?.ElementType == elementType) {
                commit('selectedElementHistoryLoaded', resp.data)
            }
            return resp.data
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            return []
        }
    },

    async setElementPermissions({ commit }, { elementID, elementType, permissions }): Promise<boolean> {
        try {
            const newPermissions: any = {}
            // Translate newPermissions to only use role ids and not full roles (if given)
            for (const permissionType in permissions) {
                newPermissions[permissionType] = permissions[permissionType].map((r: Role) => r.id)
            }
            await Vue.prototype.$api.elements.setElementPermissions(elementID, elementType, newPermissions)
            return true
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return false
        }
    },

    async addFlairedEntity({ commit }, { entity }): Promise<any> {
        commit('addFlairedEntitySuccess', { entity: entity})
        const respEntity = await Vue.prototype.$api.elements.retrieveEntityAppearancesbyID(entity.id, { limit: 25 })
        commit('addFlairedEntityAppearancesSuccess', { entity: entity, entityAppearances: respEntity.data })
        const respEntityPivot = await Vue.prototype.$api.elements.retrieveEntityPivotsbyID(entity.id)
        const respEntityEnrichment = await Vue.prototype.$api.elements.retrieveEntityEnrichmentsbyID(entity.id)
        commit('addFlairedEntityPivotsAndEnrichmentsSuccess', {entity:entity, entityPivots: respEntityPivot.data.result, entityEnrichments: respEntityEnrichment.data })
    },

    async resetFlairedEnrichmentsAndPivotsValue( { commit }): Promise<any>{
        commit('resetFlairedEnrichmentsAndPivotsEvent')
    },

    async enrichEntityByID({ commit }, { entityID }): Promise<any>{
        const respEntity = await Vue.prototype.$api.elements.requestEntityReEnrichmentbyID(entityID)
        return(respEntity.data)
    },

    async retrieveEntityAppearancesbyID({ commit }, { entity }): Promise<any>{
        const respEntity = await Vue.prototype.$api.elements.retrieveEntityAppearancesbyID(entity.id, { limit: 25 })
        commit('retrieveEntityAppearancesSuccess', {entity: entity, entityAppearances: respEntity.data})
    },

    async editEntryModeOn({ commit }, { entryId, treePath, linkedElementType, linkedElementIndex }): Promise<any> {
        commit('changeEntryToEditMode', { "entryId": entryId, "treePath": treePath, "linkedElementType": linkedElementType, "linkedElementIndex": linkedElementIndex })
    },

    async retrieveSelectedElementEntitiesbyID({ commit, state }, { elementID, elementType }): Promise<any> {
        // Let's get the entities for the element as well
        try {
            commit('entitiesLoading')
            const respEntity = await Vue.prototype.$api.elements.retrieveElementEntitiesbyID(elementID, elementType, state.SelectedElementAbortController)
            commit('retrieveElementEntitiesbyIDSuccess', { "data": respEntity.data, "elementType": elementType })
            commit('retrieveLinkedElementsSuccess', { "data": respEntity.data.result, "elementType": IRElementType.Entity })
            commit('entitiesLoaded')
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            commit('entitiesLoaded', true)
        }
    },

    async retrieveSelectedElementFilesbyID({ commit, state }, { elementID, elementType }): Promise<any> {
        // Let's get the entities for the element as well
        if (state.SelectedElement?.ElementType == elementType && state.SelectedElement?.id == elementID) {
            const respEntity = await Vue.prototype.$api.elements.retrieveElementFilesbyID(elementID, elementType)
            commit('retrieveElementFilesbyIDSuccess', { "data": respEntity.data, "elementType": elementType })
        }
    },

    async augmentSelectedElementEntries({ commit, state }, { entryID }): Promise<any> {
        // Grab an entry and add it to the list of this element's entries (or update an existing entry)
        try {
            const respEntry = await Vue.prototype.$api.elements.retrieveElementbyID(entryID, IRElementType.Entry, state.SelectedElementAbortController)
            commit('augmentElementEntries', { "data": respEntry.data })
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
        }
    },

    async augmentLinkedElementEntries({ commit }, { entryID, linkedElementId,linkedElementType, linkedElementIndex }): Promise<any> {
        // Grab an entry and add it to the list of this element's entries (or update an existing entry)
        try {
            const respEntry = await Vue.prototype.$api.elements.retrieveElementbyID(entryID, IRElementType.Entry)
            commit('augmentElementEntries', { "data": respEntry.data, linkedElementId, linkedElementType, linkedElementIndex })
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
        }
    },

    async augmentSelectedElementEntities({ commit, state }, { elementID, elementType, showLoading = true }): Promise<any> {
        // Get entities for a given element and add them to the selected item's entities
        // Used to add entities out of promoted entries
        try {
            if (showLoading) {
                commit('entitiesLoading')
            }
            const respEntity = await Vue.prototype.$api.elements.retrieveElementEntitiesbyID(elementID, elementType, state.SelectedElementAbortController)
            commit('augmentElementEntities', { "data": respEntity.data })
            commit('retrieveLinkedElementsSuccess', { "data": respEntity.data.result, "elementType": IRElementType.Entity })
            if (showLoading) {
                commit('entitiesLoaded')
            }
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            if (showLoading) {
                commit('entitiesLoaded', true)
            }
        }
    },

    async augmentSelectedElementEntitiesById({ commit, state }, { entityIds, showLoading = true }): Promise<any> {
        // Get the given entities and add them to the select element's entity list
        try {
            if (showLoading) {
                commit('entitiesLoading')
            }
            const respEntity = await Vue.prototype.$api.elements.retrieveElementsWithFilter(IRElementType.Entity, { 'id': entityIds }, state.SelectedElementAbortController)
            commit('augmentElementEntities', { "data": respEntity.data })
            commit('retrieveLinkedElementsSuccess', { "data": respEntity.data.result, "elementType": IRElementType.Entity })
            if (showLoading) {
                commit('entitiesLoaded')
            }
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            if (showLoading) {
                commit('entitiesLoaded', true)
            }
        }
    },

    async createNewEntityFromText({ commit }, {entityText, entityType, createEntityRegex }) {
        try {
            const extraBody = {'create_flair_regex': createEntityRegex}
            const entityBody = {'value': entityText, 'type_name': entityType}
            await Vue.prototype.$api.elements.createElement(IRElementType.Entity,  entityBody, extraBody )
            commit('entitiesLoaded', true)
        }
        catch (e: any) {
            commit('entitiesLoaded', true)
        }
    },

    async toggleExpandEntry({ commit }, { entryId, treePath, linkedElementType, linkedElementIndex }): Promise<any> {
        commit('toggleExpandEntry', { "entryId": entryId, "treePath": treePath, "linkedElementType": linkedElementType, "linkedElementIndex": linkedElementIndex })
    },

    async toggleCollapseEntry({ commit }, { entryId, treePath, linkedElementType, linkedElementIndex }): Promise<any> {
        commit('toggleCollapseEntry', { "entryId": entryId, "treePath": treePath, "linkedElementType": linkedElementType, "linkedElementIndex": linkedElementIndex })
    },

    async editEntryModeOff({ commit }, { entryId, elementId, elementType, linkedElementId, linkedElementType, linkedElementIndex, treePath }): Promise<any> {
        if (linkedElementId == null && linkedElementIndex == null && linkedElementType == null) {
            if (entryId < 0) {
                commit('removeEntrySuccess', { "entryId": entryId, "treePath": treePath })
                await Vue.prototype.$storage.removeItem('editorContent' + ':' + elementType + ':' + elementId + ':' + entryId)
                await Vue.prototype.$storage.removeItem('unsubmittedEditorEntry:' + elementType + ':' + elementId)
            }
            else {
                const editorEntryContent = await Vue.prototype.$storage.getItem('editorContent' + ':' + elementType + ':' + elementId + ':' + entryId)
                await Vue.prototype.$storage.removeItem('editorContent' + ':' + elementType + ':' + elementId + ':' + entryId)
                await Vue.prototype.$storage.removeItem('unsubmittedEditorEntry:' + elementType + ':' + elementId)
                if (editorEntryContent != null && editorEntryContent['server_entry_data'] != null) {
                    //We need to revert the entry_data back to this value here
                    commit('changeEntryToViewMode', { "entryId": entryId, "treePath": treePath, "entry_data": editorEntryContent["server_entry_data"] })
                }
                else {
                    commit('changeEntryToViewMode', { "entryId": entryId, "treePath": treePath, "entry_data": null })
                }
            }
        }
        else {
            if (entryId < 0) {
                commit('removeEntrySuccess', { "entryId": entryId, "linkedElementType": linkedElementType, "linkedElementIndex": linkedElementIndex, "linkedElementId": linkedElementId })
                await Vue.prototype.$storage.removeItem('editorContent' + ':' + linkedElementType + ':' + linkedElementId + ':' + entryId)
                await Vue.prototype.$storage.removeItem('unsubmittedEditorEntry:' + linkedElementType + ':' + linkedElementId)
            }
            else {
                const editorEntryContent = await Vue.prototype.$storage.getItem('editorContent' + ':' + linkedElementType + ':' + linkedElementId + ':' + entryId)
                await Vue.prototype.$storage.removeItem('editorContent' + ':' + linkedElementType + ':' + linkedElementId + ':' + entryId)
                await Vue.prototype.$storage.removeItem('unsubmittedEditorEntry:' + linkedElementType + ':' + linkedElementId)
                if (editorEntryContent != null && editorEntryContent['server_entry_data'] != null) {
                    //We need to revert the entry_data back to this value here
                    commit('changeEntryToViewMode', {
                        "entryId": entryId, "entry_data": editorEntryContent["server_entry_data"],
                        "linkedElementType": linkedElementType, "linkedElementIndex": linkedElementIndex, "linkedElementId": linkedElementId
                    })
                }
                else {
                    commit('changeEntryToViewMode', {
                        "entryId": entryId, "entry_data": null,
                        "linkedElementType": linkedElementType, "linkedElementIndex": linkedElementIndex, "linkedElementId": linkedElementId
                    })
                }
            }
        }
    },
    async addNewEntryWithEditModeOn({ commit }, { newEntryPayload, linkedElementId, linkedElementType, linkedElementIndex, treePath, parentEntryId }): Promise<any> {
        newEntryPayload["linkedElementId"] = linkedElementId
        newEntryPayload["linkedElementType"] = linkedElementType
        newEntryPayload["linkedElementIndex"] = linkedElementIndex
        newEntryPayload["treePath"] = treePath
        newEntryPayload["parentEntryId"] = parentEntryId
        commit('addNewEntryWithEditModeOn', newEntryPayload)

    },


    async modifySelectedAlertIds({ commit }, { alertIds }): Promise<any> {
        // Only changes the list of "selected alert ids" i.e. what alert rows the analyst selected.
        // not anything about the alerts themselves
        commit('setSelectedAlertIds', alertIds)
    },

    async modifySelectedAlertStatus({ commit }, { selectedAlertIds, newStatus }): Promise<any> {
        try {
            for (const alertID of selectedAlertIds) {
                const resp = await Vue.prototype.$api.elements.changeElementStatus(alertID, IRElementType.Alert, newStatus)
                commit('updateSelectedElementAlertStatus', { "data": resp.data })
            }
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }

    },

    async promoteSelectedAlerts({ commit }, { selectedAlertIds, newSources, newTags }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.promoteElements(selectedAlertIds, IRElementType.Alert, newTags, newSources)
            commit('promoteAlertsSuccessful', { "promotedAlerts": selectedAlertIds, "data": resp.data })
            return resp.data
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async promoteSelectedToExisting({ commit }, { selectedIds, elementType, existingEventId, newTags, newSources }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.promoteElementsToExisting(selectedIds, elementType, existingEventId, newTags, newSources)
            if (elementType == IRElementType.Alert) {
                commit('promoteAlertsSuccessful', { "promotedAlerts": selectedIds, "data": resp.data })
            }
            else {
                commit('promoteElementsSuccess', { "promotedIds": selectedIds, "promotedType": elementType, "newObject": resp.data })
            }
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async promoteElements({ commit }, { elementType, elementIds, newTags, newSources }): Promise<IRElement | null> {
        try {
            const resp = await Vue.prototype.$api.elements.promoteElements(elementIds, elementType, newTags, newSources)
            // This always promotes an event to a new incident, so create default incident summary
            if (resp && elementType == IRElementType.Event) {
                const entryCreateOrUpdateAttributes: any = {
                    target_type: IRElementType.Incident,
                    target_id: resp.data.id,
                    entry_class: EntryClassEnum.summary,
                    entry_data: { "html": default_incident_summary }
                }
                await Vue.prototype.$api.elements.updateOrCreateEntry(-1, entryCreateOrUpdateAttributes)
            }
            commit('promoteElementsSuccess', { "promotedIds": elementIds, "promotedType": elementType, "newObject": resp.data })
            return resp.data
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return null
        }
    },

    async cacheEditorContent({ commit }, { editorContent, entryId, elementId, elementType, entryType, owner, tlp, linkedElementId, linkedElementType, linkedElementIndex, treePath }): Promise<any> {
        if (linkedElementId == null && linkedElementIndex == null && linkedElementType == null) {
            try {
                const editorCacheObj: any = { entryData: { html: editorContent }, server_entry_data: null, IRElementType: elementType, IRElementTypeId: elementId, EntryClassEnum: entryType, owner: owner, TLPCode: tlp, treePath: treePath }
                const existingCache = await Vue.prototype.$storage.getItem('editorContent' + ':' + elementType + ':' + elementId + ':' + entryId)
                if (existingCache && existingCache['server_entry_data']) {
                    editorCacheObj['server_entry_data'] = existingCache['server_entry_data']
                }
                await Vue.prototype.$storage.setItem('editorContent' + ':' + elementType + ':' + elementId + ':' + entryId, editorCacheObj)
                await Vue.prototype.$storage.setItem('unsubmittedEditorEntry:' + elementType + ':' + elementId, entryId)
            }
            catch (e: any) {
                commit('errorOccurred', e, { root: true })
            }
        }
        else {
            try {
                const editorCacheObj = { entryData: { html: editorContent }, IRElementType: linkedElementType, IRElementTypeId: linkedElementId, EntryClassEnum: entryType, owner: owner, TLPCode: tlp }
                Vue.prototype.$storage.setItem('editorContent' + ':' + linkedElementType + ':' + linkedElementId + ':' + entryId, editorCacheObj)
                Vue.prototype.$storage.setItem('unsubmittedEditorEntry:' + linkedElementType + ':' + linkedElementId, entryId)
            }
            catch (e: any) {
                commit('errorOccurred', e, { root: true })
            }
        }
    },

    async retrieveCachedEditorContent({ commit }, { entryId, elementId, elementType, linkedElementId, linkedElementType, linkedElementIndex }): Promise<any> {
        if (linkedElementId == null && linkedElementIndex == null && linkedElementType == null) {
            try {
                const editorContent = await Vue.prototype.$storage.getItem('editorContent' + ':' + elementType + ':' + elementId + ':' + entryId)
                return editorContent
            }
            catch (e: any) {
                commit('errorOccurred', e, { root: true })
            }
        }
        else {
            try {
                const editorContent = await Vue.prototype.$storage.getItem('editorContent' + ':' + linkedElementType + ':' + linkedElementId + ':' + entryId)
                return editorContent
            }
            catch (e: any) {
                commit('errorOccurred', e, { root: true })
            }
        }
    },

    async updateOrCreateEntryContent({ commit, rootState }, { entryId, entryType, elementId, elementType, entryOwner, entryContent, linkedElementId, linkedElementType, linkedElementIndex, treePath }): Promise<boolean> {
        if (linkedElementId == null && linkedElementIndex == null && linkedElementType == null) {
            try {
                if (entryId == -1) {
                    const newEntryType = entryType ? EntryClassEnum[entryType as keyof typeof EntryClassEnum] : EntryClassEnum.entry
                    // This is a create
                    const entryCreateOrUpdateAttributes = {
                        owner: entryOwner,
                        target_type: elementType,
                        target_id: elementId,
                        entry_class: newEntryType,
                        entry_data: entryContent,
                        parent_entry_id: getParentEntryId(treePath)
                    }
                    commit('changeEntryToLoading', { "entryId": entryId, "treePath": treePath })
                    const resp = await Vue.prototype.$api.elements.updateOrCreateEntry(entryId, entryCreateOrUpdateAttributes)
                    resp.data['treePath'] = treePath
                    commit('updateOrCreateEntrySuccess', resp.data)
                    commit('removeEntrySuccess', { "entryId": entryId, "treePath": treePath })
                    await Vue.prototype.$storage.removeItem('editorContent' + ':' + elementType + ':' + elementId + ':' + entryId)
                    await Vue.prototype.$storage.removeItem('unsubmittedEditorEntry:' + elementType + ':' + elementId)
                }
                else {
                    // Don't change entry type if not given, also don't change entry owner from this function
                    const modifyEntryType = entryType ? EntryClassEnum[entryType as keyof typeof EntryClassEnum] : undefined
                    const entryCreateOrUpdateAttributes = {
                        entry_class: modifyEntryType,
                        entry_data: entryContent
                    }
                    const resp = await Vue.prototype.$api.elements.updateOrCreateEntry(entryId, entryCreateOrUpdateAttributes)
                    await Vue.prototype.$storage.removeItem('editorContent' + ':' + elementType + ':' + elementId + ':' + entryId)
                    await Vue.prototype.$storage.removeItem('unsubmittedEditorEntry:' + elementType + ':' + elementId)
                    resp.data['treePath'] = treePath
                    commit('updateOrCreateEntrySuccess', resp.data)
                }
                return true
            }
            catch (e: any) {
                commit('errorOccurred', e, { root: true })
                commit('changeEntryToEditMode', { "entryId": entryId, "treePath": treePath })
                if (axios.isAxiosError(e) && e.response?.status == 404) {
                    rootState.errorText += ", it may have been deleted while you were editing it"
                }
                return false
            }
        }
        else {
            try {
                if (entryId == -1) {
                    const newEntryType = entryType ? EntryClassEnum[entryType as keyof typeof EntryClassEnum] : EntryClassEnum.entry
                    // This is a create
                    const entryCreateOrUpdateAttributes = {
                        owner: entryOwner,
                        target_type: linkedElementType,
                        target_id: linkedElementId,
                        entry_class: newEntryType,
                        entry_data: entryContent,
                        parent_entry_id: getParentEntryId(treePath)
                    }
                    const resp = await Vue.prototype.$api.elements.updateOrCreateEntry(entryId, entryCreateOrUpdateAttributes)
                    resp.data['linkedElementType'] = linkedElementType
                    resp.data['linkedElementId'] = linkedElementId
                    resp.data['linkedElementIndex'] = linkedElementIndex
                    resp.data['treePath'] = treePath
                    commit('updateOrCreateEntrySuccess', resp.data)
                    commit('removeEntrySuccess', { "entryId": entryId, "linkedElementType": linkedElementType, "linkedElementIndex": linkedElementIndex, "linkedElementId": linkedElementId, "treePath": treePath })
                    await Vue.prototype.$storage.removeItem('editorContent' + ':' + linkedElementType + ':' + linkedElementId + ':' + entryId)
                    await Vue.prototype.$storage.removeItem('unsubmittedEditorEntry:' + linkedElementType + ':' + linkedElementId)
                }
                else {
                    // Don't change entry type if not given, also don't change entry owner from this function
                    const modifyEntryType = entryType ? EntryClassEnum[entryType as keyof typeof EntryClassEnum] : undefined
                    const entryCreateOrUpdateAttributes = {
                        entry_class: modifyEntryType,
                        entry_data: entryContent
                    }
                    const resp = await Vue.prototype.$api.elements.updateOrCreateEntry(entryId, entryCreateOrUpdateAttributes)
                    await Vue.prototype.$storage.removeItem('editorContent' + ':' + linkedElementType + ':' + linkedElementId + ':' + entryId)
                    await Vue.prototype.$storage.removeItem('unsubmittedEditorEntry:' + linkedElementType + ':' + linkedElementId)
                    resp.data['linkedElementType'] = linkedElementType
                    resp.data['linkedElementId'] = linkedElementId
                    resp.data['linkedElementIndex'] = linkedElementIndex
                    resp.data['treePath'] = treePath
                    commit('updateOrCreateEntrySuccess', resp.data)
                }
                return true
            }
            catch (e: any) {
                commit('errorOccurred', e, { root: true })
                if (axios.isAxiosError(e) && e.response?.status == 404) {
                    rootState.errorText += ", it may have been deleted while you were editing it"
                }
                return false
            }
        }
    },

    async updateEntryAttributes({ commit }, { entryId, updateData, linkedElementId, linkedElementType, linkedElementIndex, treePath }) {
        try {
            const resp = await await Vue.prototype.$api.elements.updateOrCreateEntry(entryId, updateData)
            if (linkedElementId != null || linkedElementIndex != null || linkedElementType != null) {
                resp.data['linkedElementType'] = linkedElementType
                resp.data['linkedElementId'] = linkedElementId
                resp.data['linkedElementIndex'] = linkedElementIndex
            }
            resp.data['treePath'] = treePath
            commit('updateOrCreateEntrySuccess', resp.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async setElementPaneHeight({ commit }, { paneHeight }): Promise<any> {
        commit('setElementPaneHeight', paneHeight)
    },
    async setSelectedElementSize({ commit }, newSize): Promise<any> {
        commit('setSelectedElementSize', newSize)
    },
    async clearSelectedElementFlair({ commit }): Promise<any> {
        commit('clearSelectedElementFlair')
    },
    async clearSelectedElement({ commit }): Promise<any> {
        commit('clearSelectedElement')
        commit('setSelectedElementSize', 0)
    },

    async flairDialogSetToTrue({ commit }): Promise<any> {
        commit('flairDialogChange', true)
    },

    async flairDialogSetToFalse({ commit }): Promise<any> {
        commit('flairDialogChange', false)
    },

    async removeFlairedEntity( { commit }, {entity}): Promise<any> {
        commit('removeFlairedEntity', entity)
    },

    async submitFile({ commit }, {formData, targetType, targetId, description = null}): Promise<any>{
        try{
            const resp = await Vue.prototype.$api.elements.submitFile(formData, targetType, targetId, description)
            if (resp) {
                return true
            }
            return false
        }  
        catch(e:any){
            commit('errorOccurred', e, { root: true })
                return false
            }
        },

    async openFlairMenu({ commit }, { menuX, menuY, menuEntity }): Promise<any> {
        commit('setFlairMenuPosition', { x: menuX, y: menuY })
        commit('setFlairMenuVisible', true)
        commit('setFlairMenuEntity', menuEntity)
    },

    async closeFlairMenu({ commit }) {
        commit('setFlairMenuVisible', false)
        commit('setFlairMenuEntity', null)
    },

    async retrieveTags({ commit }, filterDict): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.retrieveTags(filterDict)
            commit('retrieveTagsSuccess', resp.data)
            return resp.data.result
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async deleteTag({ commit }, id): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.deleteTag(id)
            commit('deleteTagSuccess', resp.data)
            return resp.data.result
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async replaceTagOrSource({ commit }, {type, id, replaceId}): Promise<any> {
        try {
            if (type == "tag") {
                const resp = await Vue.prototype.$api.elements.replaceTag(id, replaceId)
                commit('replaceTagSuccess', id, resp.data)
                return resp.data.result
            }
            else if (type == "source") {
                const resp = await Vue.prototype.$api.elements.replaceSource(id, replaceId)
                commit('replaceSourceSuccess', id, resp.data)
                return resp.data.result
            }
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async tagOrSourceAppearances({ commit }, {type, filterDict}): Promise<any> {
        try {
            if (type == "tag") {
                const resp = await Vue.prototype.$api.elements.tagAppearances(filterDict)
                return resp.data
            }
            else if (type == "source") {
                const resp = await Vue.prototype.$api.elements.sourceAppearances(filterDict)
                return resp.data
            }
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveTagsOrSources({commit}, {type, filterDict}): Promise<any> {
        try {
            if (type == "tag") {
                const resp = await Vue.prototype.$api.elements.retrieveTags(filterDict)
                commit('retrieveTagsSuccess', resp.data)
                return resp.data.result
            }
            else if (type == "source") {
                const resp = await Vue.prototype.$api.elements.retrieveSources(filterDict)
                commit('retrieveSourcesSuccess', resp.data)
                return resp.data.result
            }
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveAllEntityClasses({ commit }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.retrieveAllEntityClasses()
            commit('retrieveAllEntityClassesSuccess', resp.data)
            return resp.data.result
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
            return null
        }
    },

    async updateEntityClassDescription({ commit }, {entityClassId, entityId, newDescription}): Promise<any> {
        try{
            const resp = await Vue.prototype.$api.elements.updateEntityClassDescriptionById(entityClassId, {description:newDescription})
            commit('updateEntityClassDescriptionSuccess', resp.data)
        }
        catch(e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async retrieveSources({ commit }, filterDict): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.retrieveSources(filterDict)
            commit('retrieveSourcesSuccess', resp.data)
            return resp.data.result
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async deleteSource({ commit }, id): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.deleteSource(id)
            commit('deleteSourceSuccess', resp.data)
            return resp.data.result
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async deleteTagOrSource({ commit }, {type, id}): Promise<any> {
        try {
            if (type == "tag") {
                const resp = await Vue.prototype.$api.elements.deleteTag(id)
                commit('deleteTagSuccess', resp.data)
                return resp.data.result
            }
            else if (type == "source") {
                const resp = await Vue.prototype.$api.elements.deleteSource(id)
                commit('deleteSourceSuccess', resp.data)
                return resp.data.result
            }
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async replaceSource({ commit }, {id, replaceId}): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.replaceSource(id, replaceId)
            commit('replaceSourceSuccess', id, resp.data)
            return resp.data.result
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async submitTagsOrSources({ commit }, { newTagsOrSources, type, targetElementId, targetElementType }): Promise<any> {
        try {
            for (const tagOrSource of newTagsOrSources) {
                let resp = null
                if (type == "tag") {
                    const addTagBody: any = {
                        target_type: targetElementType,
                        tag_name: tagOrSource,
                        tag_description: "",
                        target_id: targetElementId,
                    }
                    resp = await Vue.prototype.$api.elements.addTag(addTagBody)
                }
                else {
                    const addSourceBody: any = {
                        target_type: targetElementType,
                        source_name: tagOrSource,
                        source_description: "",
                        target_id: targetElementId,
                    }
                    resp = await Vue.prototype.$api.elements.addSource(addSourceBody)

                }
                commit('addTagOrSourceSuccess', { newTagOrSource: resp.data, type: type, targetElementId, targetElementType })
            }
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async submitEntityClasses({ commit }, { newEntityClasses, targetEntityId}): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.addEntityClass(targetEntityId, newEntityClasses)
            commit('addEntityClassesSuccess', resp.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async submitEntityTag({ commit }, { newEntityTag, targetEntityId}): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.addEntityTag(targetEntityId, newEntityTag)
            commit('addEntityClassesSuccess', resp.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async attachEntityClassesToPivot({ commit }, { pivotId, entityClasses}): Promise<any> {
        try {
            let resp = null
            resp = await Vue.prototype.$api.elements.submitPivotEntityClasses(pivotId, entityClasses)
            commit('retrieveElementbyIDSuccess', { "data": resp.data, "elementType": IRElementType.Pivot })
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async attachEntityTypesToPivot({ commit }, { pivotId, entityTypes}): Promise<any> {
        try {
            let resp = null
            resp = await Vue.prototype.$api.elements.submitPivotEntityTypes(pivotId, entityTypes)
            commit('retrieveElementbyIDSuccess', { "data": resp.data, "elementType": IRElementType.Pivot })
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async removeEntityClasses({ commit }, { entityClassId, targetEntityId}): Promise<any> {
        try {
            let entityClassIds = []
            if (typeof entityClassId == 'number') {
                entityClassIds.push(entityClassId)
            }
            else {
                entityClassIds = entityClassId
            }
            const resp = await Vue.prototype.$api.elements.removeEntityClass(targetEntityId, entityClassIds)
            commit('removeEntityClassesSuccess', resp.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async removeEntityTag({ commit }, { entityTagId, targetEntityId}): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.removeEntityTag(targetEntityId, entityTagId)
            commit('removeEntityTagSuccess', resp.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async unAssignTagOrSourceDescription({ commit }, { id, type, targetElementType, targetElementId }): Promise<any> {
        try {
            let resp = null
            const removeBody: any = {
                target_type: targetElementType,
                target_id: targetElementId,
            }

            if (type == "tag") {
                resp = await Vue.prototype.$api.elements.removeTag(id, removeBody)
                resp.data['type'] = "tag"
            }
            else {
                resp = await Vue.prototype.$api.elements.removeSource(id, removeBody)
                resp.data['type'] = "source"
            }
            commit('unAssignTagOrSourceSuccess', { ...resp.data, targetElementType, targetElementId })
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async updateTagOrSource({ commit }, { id, type, description, name=null }): Promise<any> {
        try {
            let resp = null
            let data = {}
            if (name !== null) {
                data = { description: description, name: name }
            }
            else {
                data = { description: description }
            }
            if (type == "tag") {
                resp = await Vue.prototype.$api.elements.updateTag(id, data)
            }
            else {
                resp = await Vue.prototype.$api.elements.updateSource(id, data)

            }
            commit('updateTagOrSourceSuccess', resp.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async removeEntryByID({ commit }, { entryId, treePath, linkedElementId, linkedElementType, linkedElementIndex }): Promise<any> {
        try {
            if (linkedElementId == null && linkedElementIndex == null && linkedElementType == null) {
                await Vue.prototype.$api.elements.deleteEntryByID(entryId)
                commit('removeEntrySuccess', { "entryId": entryId, "treePath": treePath, "linkedElementType": linkedElementType, "linkedElementIndex": linkedElementIndex, "linkedElementId": linkedElementId })
            }
            else {
                await Vue.prototype.$api.elements.deleteEntryByID(entryId)
                commit('removeEntrySuccess', { "entryId": entryId, "linkedElementType": linkedElementType, "linkedElementIndex": linkedElementIndex, "linkedElementId": linkedElementId, "treePath": treePath })
            }
        }
        catch(e: any) {
            if (axios.isAxiosError(e) && e.response?.status == 404) {
                commit('removeEntrySuccess', { "entryId": entryId, "treePath": treePath, "linkedElementType": linkedElementType, "linkedElementIndex": linkedElementIndex, "linkedElementId": linkedElementId })
            }
            commit('errorOccurred', e, { root: true })
        }
    },

    async deleteLinksBetweenElements({ commit }, { elementType0, elementId0, elementType1, elementId1, bidirectional }) {
        try {
            const resp = await Vue.prototype.$api.elements.deleteLinksBetweenElements(elementType0, elementId0, elementType1, elementId1, bidirectional)
            commit('unlinkElementsSuccess', resp.data)
        }
        catch (e: any) {
            commit('errorOccurred', e, { root: true })
        }
    },

    async upvoteElement({ commit, state }, { elementID, elementType, treePath = null, linkedElementType = null, linkedElementIndex = null }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.upvoteElement(elementID, elementType, state.SelectedElementAbortController)
            if (elementType == IRElementType.Entry) {
                commit('updateElementLinkedElement', { "data": resp.data, treePath, linkedElementType, linkedElementIndex })
            }
            else {
                commit('updateElementList', { "data": resp.data })
            }
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            return null
        }
    },

    async downvoteElement({ commit, state }, { elementID, elementType, treePath = null, linkedElementType = null, linkedElementIndex = null }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.downvoteElement(elementID, elementType, state.SelectedElementAbortController)
            if (elementType == IRElementType.Entry) {
                commit('updateElementLinkedElement', { "data": resp.data, treePath, linkedElementType, linkedElementIndex })
            }
            else {
                commit('updateElementList', { "data": resp.data })
            }
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            return null
        }
    },

    async favoriteElement({ commit, state }, { elementID, elementType, treePath = null, linkedElementType = null, linkedElementIndex = null }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.favoriteElement(elementID, elementType, state.SelectedElementAbortController)
            if (elementType == IRElementType.Entry) {
                commit('updateElementLinkedElement', { "data": resp.data, treePath, linkedElementType, linkedElementIndex })
            }
            else {
                commit('retrieveElementbyIDSuccess', { "data": resp.data, "elementType": elementType })
            }
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            return null
        }
    },

    async subscribeElement({ commit, state }, { elementID, elementType, treePath = null, linkedElementType = null, linkedElementIndex = null }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.subscribeElement(elementID, elementType, state.SelectedElementAbortController)
            commit('subscribeUnsubscribeSuccess', { data: resp.data, newdata: { "subscribed": true }, treePath, linkedElementType, linkedElementIndex })
              return true
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            return null
        }
    },

    async unsubscribeElement({ commit, state }, { elementID, elementType, treePath = null, linkedElementType = null, linkedElementIndex = null }): Promise<any> {
        try {
            const resp = await Vue.prototype.$api.elements.unsubscribeElement(elementID, elementType, state.SelectedElementAbortController)
            commit('subscribeUnsubscribeSuccess', { data: resp.data, newdata: { "subscribed": false }, treePath, linkedElementType, linkedElementIndex })
            return true
        }
        catch (e: any) {
            if (!e.__CANCEL__) {
                commit('errorOccurred', e, { root: true })
            }
            return null
        }
    }
};