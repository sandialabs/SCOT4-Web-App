// profile/mutations.ts
import { MutationTree } from 'vuex';
import Vue from 'vue'
import { IRElementMeta, IRElementsListState, IRElementType, Entry, Entity, Tag, Source, LinkedElement, IRElementStatus } from './types';
import { findEntryTreePath, findEntry, removeEntry, addEntry } from '@/utils/treeUtils';
import { findLinkedElementEntryTreePath, addLinkedElementEntry, findLinkedElementEntry, removeLinkedElementEntry } from '@/utils/linkedTreeUtils';
import { convertFromSnakeCase } from '@/utils/elementUtils'

const statusToCountMap: Record<string, string> = {
    "promoted": "promoted_count",
    "closed": "closed_count",
    "open": "open_count"
}

export const mutations: MutationTree<IRElementsListState> = {
    beginRetrieveElements(state, sameElementType: boolean = false) {
        state.retrievingElements = true
        if (!sameElementType) {
            state.ElementList = []
        }
        if (state.ElementListAbortController) {
            state.ElementListAbortController.abort()
        }
        state.ElementListAbortController = new AbortController()
    },

    retrieveElementsSuccess(state, payload: any) {
        const elementType: IRElementType = payload.elementType
        const elementList: Array<IRElementMeta> = payload.data.result
        state.ElementList = elementList
        state.totalElementListCount = payload.data.totalCount
        state.ElementType = elementType
        state.retrievingElements = false
        if (state.ElementList != null && state.SelectedElement != null) {
            const elementListIndex = state.ElementList.findIndex(elementMeta => elementMeta.id == state.SelectedElement?.id)
            state.SelectedElement.elementListIndex = elementListIndex
        }
        state.ElementListAbortController = null
    },

    retrieveElementsFailure(state) {
        state.retrievingElements = false
    },

    setElementPaneHeight(state, value) {
        state.elementPaneHeight = value
    },

    setSelectedElementSize(state, value) {
        state.selectedElementSize = value
    },

    setElementListPage(state, value: number) {
        state.elementListPage = value
    },

    setElementListItemsPerPage(state, value: number) {
        state.elementListItemsPerPage = value
    },

    setElementListSortBy(state, value: string) {
        state.elementListSortBy = value
    },

    setElementListSortDesc(state, value: boolean) {
        state.elementListSortDesc = value
    },

    setElementListFilterItem(state, { key, value }) {
        if (value == undefined) {
            Vue.delete(state.elementListFilter, key)
        }
        else {
            state.elementListFilter = { // Do it this way to make it reactive
                ...state.elementListFilter,
                [key]: value
            }
        }
    },

    clearElementListFilter(state) {
        state.elementListFilter = {}
        state.elementListSortBy = 'id'
        state.elementListPage = 1
        state.elementListSortDesc = true
    },

    toggleFlair(state) {
        state.flairVisible = !state.flairVisible
    },

    setFlairMenuPosition(state, { x, y }) {
        state.flairMenuX = x
        state.flairMenuY = y
    },

    setFlairMenuVisible(state, visible: boolean) {
        state.flairMenuVisible = visible
    },

    setFlairMenuEntity(state, entity: Entity) {
        state.flairMenuEntity = entity
    },

    setFileDialogVisible(state, visible: boolean) {
        state.fileDialog = visible
    },

    addFlairedEntitySuccess(state, payload:any){
        const flairIndex = state.SelectedElementEntities.findIndex((el: any) => el.id == payload.entity?.id)
        if (flairIndex != -1) {
            const check = state.SelectedElementFlairedEntities.findIndex((el: any) => el.id == state.SelectedElementEntities[flairIndex].id)
            if (check == -1) {
                state.SelectedElementEntities[flairIndex]["enrichments"] = {} as any
                state.SelectedElementEntities[flairIndex]["pivots"] = {} as any
                state.SelectedElementFlairedEntities.push(state.SelectedElementEntities[flairIndex])
            }
            else {
                // Entity is already in the flair modal, switch to it
                state.flairMenuEntity = state.SelectedElementEntities[flairIndex]
            }
        }
    },

    addFlairedEntityAppearancesSuccess(state, payload: any) {
        const itemOrdering = ["event", "intel", "alert", "dispatch", "product", "incident", "vuln_track", "vuln_feed", "signature"]
        const flairIndex = state.SelectedElementEntities.findIndex((el: any) => el.id == payload.entity?.id)
        if (flairIndex != -1) {
            const check = state.SelectedElementFlairedEntities.findIndex((el: any) => el.id == state.SelectedElementEntities[flairIndex].id)
            if (check == -1) {
                state.SelectedElementFlairedEntities.push(state.SelectedElementEntities[flairIndex])
            }
            const appearances = []
            // These items get put in first in sorted order
            for (const item of itemOrdering) {
                const itemKey = item + "_appearances"
                if (itemKey in payload.entityAppearances) {
                    appearances.push(...payload.entityAppearances[itemKey])
                    delete payload.entityAppearances[itemKey]
                }
            }
            // All other items (if they exist) are put into the list in whatever order
            for (const appearance in payload.entityAppearances) {
                appearances.push(...payload.entityAppearances[appearance])
            }
            Vue.set(state.SelectedElementEntities[flairIndex], "appearances", appearances)
        }
    },

    addFlairedEntityPivotsAndEnrichmentsSuccess(state, payload: any) {
        const flairIndex = state.SelectedElementEntities.findIndex((el: any) => el.id == payload.entity?.id)
        if (flairIndex != -1) {
            const check = state.SelectedElementFlairedEntities.findIndex((el: any) => el.id == state.SelectedElementEntities[flairIndex].id)
            if (check == -1) {
                state.SelectedElementFlairedEntities.push(state.SelectedElementEntities[flairIndex])
            }
            Vue.set(state.SelectedElementEntities[flairIndex], "pivots", payload['entityPivots'])
            Vue.set(state.SelectedElementEntities[flairIndex], "enrichments", payload['entityEnrichments'])
            if(state.SelectedElement){
                state.flairedEnrichmentsandPivotsLoaded = state.SelectedElementEntities[flairIndex].id
            }
        }
    },

    resetFlairedEnrichmentsAndPivotsEvent(state){
        state.flairedEnrichmentsandPivotsLoaded = null
    },

    entitiesLoading(state) {
        state.entitiesLoaded = false
        state.numEntitiesLoading += 1
    },

    entitiesLoaded(state, cancelled: boolean) {
        state.numEntitiesLoading -= 1
        if (state.numEntitiesLoading == 0 && !cancelled) {
            state.entitiesLoaded = true
        }
    },

    retrieveNewSelectedElement(state, { elementID, elementType }) {
        if (state.SelectedElementAbortController) {
            state.SelectedElementAbortController.abort()
        }
        state.SelectedElementAbortController = new AbortController()
        if (!(state.SelectedElement && state.SelectedElement.id == elementID && state.ElementType == elementType)) {
            state.entitiesLoaded = false
        }
        state.flairDialog = false
    },

    retrieveSelectedElementFailure(state) {
        state.entitiesLoaded = true
    },

    retrieveElementbyIDSuccess(state, payload: any) {
        const oldElement = state.SelectedElement
        const idToCheck = payload.data.id
        state.SelectedElement = payload.data
        if (state.SelectedElement) {
            if (state.SelectedElement.id == oldElement?.id && (oldElement?.selectedAlertIds || oldElement?.linkedElements)) {
                Vue.set(state.SelectedElement, "selectedAlertIds", oldElement.selectedAlertIds)
                Vue.set(state.SelectedElement, "linkedElements", oldElement.linkedElements)
            }
            state.SelectedElement.ElementType = payload.elementType
            if (state.ElementList != null && state.SelectedElement != null) {
                const elementListIndex = state.ElementList.findIndex(elementMeta => elementMeta.id == idToCheck)
                state.SelectedElement.elementListIndex = elementListIndex
            }
        }
    },


    updateSignatureStats(state, payload:any){
        if (state.SelectedElement !=null && state.SelectedElement?.ElementType == IRElementType.Signature){
            state.SelectedElement = payload.data
            const idToCheck = payload.data.id
            if (state.SelectedElement !=null){
                state.SelectedElement.ElementType = payload.elementType
            }
            
            if (state.ElementList != null && state.SelectedElement != null) {
                const elementListIndex = state.ElementList.findIndex(elementMeta => elementMeta.id == idToCheck)
                state.SelectedElement.elementListIndex = elementListIndex
            }
        }
    },

    setSelectedAlertIds(state, payload: any) {
        if (state.SelectedElement != null && state.SelectedElement.ElementType == IRElementType.Alertgroup) {
            Vue.set(state.SelectedElement, "selectedAlertIds", payload)
        }
    },

    removeFlairedEntity(state, payload:any){
        const index:number = state.SelectedElementFlairedEntities.findIndex((entity:any) => entity.id == payload.id)
        state.SelectedElementFlairedEntities.splice(index,1)
        if (state.SelectedElementFlairedEntities.length == 0) {
            state.flairDialog = false
        }
    },

    retrieveElementEntriesbyIDSuccess(state, payload: any) {
        state.SelectedElementEntries = []
        function findChildren(parentEntry: Entry, allEntries: Array<Entry>): undefined {
            //find all child entries
            parentEntry['repliesExpanded'] = true
            parentEntry['editMode'] = false
            parentEntry['collapsed'] = false

            const childrenEntries = allEntries.filter((entry: Entry) => entry.parent_entry_id == parentEntry.id)
            childrenEntries.sort(function compare(a, b) {
                if (String(a.entry_class) == "summary" && String(b.entry_class) != "summary") {
                    return -1
                }
                else if (String(a.entry_class) != "summary" && String(b.entry_class) == "summary") {
                    return 1
                }
                else if (a.created > b.created) {
                    return 1
                }
                else if (a.created < b.created) {
                    return -1
                }
                else {
                    return 0
                }
            })
            for (const childEntry of childrenEntries) {
                childEntry['repliesExpanded'] = true
                childEntry['editMode'] = false
                childEntry['collapsed'] = false
            }
            parentEntry['childEntries'] = childrenEntries
            if (childrenEntries.length == 0) {
                return
            }
            else {
                for (const childEntry of childrenEntries) {
                    findChildren(childEntry, allEntries)
                }
            }
        }
        const parentEntries = payload.data.result.filter((entry: Entry) => entry.parent_entry_id == null)
        for (const parentEntry of parentEntries) {
            findChildren(parentEntry, payload.data.result)
        }
        state.SelectedElementEntries = payload.data.result.filter((entry: Entry) => entry.parent_entry_id == null)
    },

    selectedElementHistoryLoaded(state, payload: any) {
        state.SelectedElementHistory = payload
    },

    selectedElementPermissionsLoaded(state, payload: any) {
        state.SelectedElementPermissions = payload
    },

    retrieveElementEntitiesbyIDSuccess(state, payload: any) {
        state.SelectedElementEntities = []
        state.SelectedElementEntities = payload.data.result
    },

    retrieveElementFilesbyIDSuccess(state, payload: any) {
        state.SelectedElementFiles = []
        state.SelectedElementFiles = payload.data.result
    },

    augmentElementEntities(state, payload: any) {
        for (const entity of payload.data.result) {
            if (!state.SelectedElementEntities.map((e) => e.id).includes(entity.id)) {
                state.SelectedElementEntities.push(entity)
            }
            else {
                const entityIdx = state.SelectedElementEntities.findIndex((e) => e.id == entity.id)
                Object.assign(state.SelectedElementEntities[entityIdx], entity)
            }
        }
    },

    augmentElementEntries(state, { data, linkedElementId = null, linkedElementType = null, linkedElementIndex = null }) {
        // Reconstitute the entry tree with the new entry added
        const newEntry: Entry = data
        function findAndAssignChild(targetEntry: Entry, parentEntry: Entry | null, allEntries: Array<Entry>): boolean {
            // find a specific child entry and reassign its attributes
            let childEntries = allEntries
            if (parentEntry) {
                if (!parentEntry.childEntries) {
                    parentEntry.childEntries = []
                }
                childEntries = parentEntry.childEntries
            }
            const entryIndex = childEntries.findIndex((a) => a.id == targetEntry.id)
            if (entryIndex == -1 && targetEntry.parent_entry_id == parentEntry?.id) {
                Vue.set(targetEntry, "childEntries", [])
                Vue.set(targetEntry, "editMode", false)
                Vue.set(targetEntry, "repliesExpanded", true)
                Vue.set(targetEntry, "collapsed", false)
                childEntries.push(targetEntry)
                return true
            }
            else if (entryIndex != -1) {
                Object.assign(childEntries[entryIndex], targetEntry)
                return true
            }
            else {
                let result = false
                for (const entry of childEntries) {
                    result ||= findAndAssignChild(targetEntry, entry, allEntries)
                }
                return result
            }
        }
        let result = false
        if (linkedElementId != null && linkedElementType != null && linkedElementIndex != null && state.SelectedElement?.linkedElements) {
            const linkedElementEntries = state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex].entries
            result = findAndAssignChild(newEntry, null, linkedElementEntries)
        }
        else {
            result = findAndAssignChild(newEntry, null, state.SelectedElementEntries)
        }
        if (!result) {
            throw new Error("Couldn't find place to put entry " + newEntry.id)
        }
    },

    updateElementSuccess(state, { elementId, data }) {
        if (state.ElementList) {
            const elementIndex = state.ElementList.findIndex((a) => a.id == elementId)
            if (elementIndex != -1) {
                Object.assign(state.ElementList[elementIndex], data)
            }
        }
    },

    deleteElementSuccess(state, { elementId, data }) {
        if (state.ElementList) {
            const elementIndex = state.ElementList.findIndex((a) => a.id == elementId)
            state.ElementList.splice(elementIndex, 1) // Remove item from list reactively
        }
    },

    undeleteElementSuccess(state, { elementId, data }) {
        // This does nothing right now; we don't add the undeleted object to the current collection
        return undefined
    },

    changeEntryToEditMode(state, payload: any) {
        const entryId: number = payload.entryId
        if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
            const entry = findEntry(payload.treePath, state, entryId)
            Vue.set(entry, 'editMode', true)
        }
        else {
            const entry = findLinkedElementEntry(payload.treePath, state, entryId, payload.linkedElementType, payload.linkedElementIndex)
            Vue.set(entry, 'editMode', true)
        }
    },

    toggleExpandEntry(state, payload: any) {
        const entryId: number = payload.entryId
        if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
            const entry = findEntry(payload.treePath, state, entryId)
            Vue.set(entry, 'repliesExpanded', !entry['repliesExpanded'])
        }
        else {
            const entry = findLinkedElementEntry(payload.treePath, state, entryId, payload.linkedElementType, payload.linkedElementIndex)
            Vue.set(entry, 'repliesExpanded', !entry['repliesExpanded'])

        }
    },

    toggleCollapseEntry(state, payload: any) {
        const entryId: number = payload.entryId
        if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
            const entry = findEntry(payload.treePath, state, entryId)
            Vue.set(entry, 'collapsed', !entry['collapsed'])
        }
        else {
            const entry = findLinkedElementEntry(payload.treePath, state, entryId, payload.linkedElementType, payload.linkedElementIndex)
            Vue.set(entry, 'collapsed', !entry['collapsed'])

        }
    },

    restoreCachedExistingEntryEditor(state, payload: any) {
        const entryId: number = payload.entryId
        if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
            const entry = findEntry(payload.treePath, state, entryId)
            if (entry) {
                Vue.set(entry, 'editMode', true)
                Vue.set(entry, 'entry_data', payload.entryData)
                Vue.set(entry, 'owner', payload.owner)
                Vue.set(entry, 'tlp', payload.TLPCode)
            }
        }
        else {
            const entry = findLinkedElementEntry(payload.treePath, state, entryId, payload.linkedElementType, payload.linkedElementIndex)
            if (entry) {
                Vue.set(entry, 'editMode', true)
                Vue.set(entry, 'entry_data', payload.entryData)
                Vue.set(entry, 'owner', payload.owner)
                Vue.set(entry, 'tlp', payload.TLPCode)
            }
        }

    },


    changeEntryToViewMode(state, payload: any) {
        if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
            const entryId: number = payload.entryId
            const entry = findEntry(payload.treePath, state, entryId)

            if (payload.entry_data) {
                Vue.set(entry, "entry_data", payload.entry_data)
            }
            else {
                Vue.set(entry, "entry_data", entry.entry_data)
            }

            Vue.set(entry, "editMode", false)
        }
        else {
            const entryId: number = payload.entryId
            const entry = findLinkedElementEntry(payload.treePath, state, entryId, payload.linkedElementType, payload.linkedElementIndex)
            if (payload.entry_data != null) {
                Vue.set(entry, "entry_data", payload.entry_data)
            }
            Vue.set(entry, "editMode", false)
        }
    },

    updateSelectedElementAlertStatus(state, payload: any) {
        if (state.SelectedElement?.ElementType == IRElementType.Alertgroup) {
            if (state.SelectedElement.full_alert_data != null) {
                const id: number = payload.data.id
                const indexToChange = state.SelectedElement.full_alert_data.findIndex(element => element.id == id)
                const oldStatus = state.SelectedElement.full_alert_data[indexToChange].status
                Vue.set(state.SelectedElement.full_alert_data[indexToChange], "status", payload.data.status)
                if (state.SelectedElement.full_alert_data_flaired != null) {
                    Vue.set(state.SelectedElement.full_alert_data_flaired[indexToChange], "status", payload.data.status)
                }
                const newStatus = payload.data.status
                if (oldStatus != newStatus) {
                    // decrement by one the oldStatus count and increment by one the new statusCount
                    const oldStatusCountPropName = statusToCountMap[oldStatus]
                    const oldStatusCount: number = state.SelectedElement[oldStatusCountPropName]
                    Vue.set(state.SelectedElement, oldStatusCountPropName, oldStatusCount - 1)
                    const newStatusCountPropName = statusToCountMap[newStatus]
                    const newStatusCount: number = state.SelectedElement[newStatusCountPropName]
                    Vue.set(state.SelectedElement, newStatusCountPropName, newStatusCount + 1)
                    if (state.ElementList != null && state.ElementList[state.SelectedElement.elementListIndex]) {
                        Vue.set(state.ElementList[state.SelectedElement.elementListIndex], newStatusCountPropName, newStatusCount + 1)
                        Vue.set(state.ElementList[state.SelectedElement.elementListIndex], oldStatusCountPropName, oldStatusCount - 1)
                    }

                }
            }
        }
    },

    promoteAlertsSuccessful(state, payload: any) {
        if (state.SelectedElement != null) {
            for (const alertID of payload.promotedAlerts) {
                if (state.SelectedElement.full_alert_data != null) {
                    const indexToChange = state.SelectedElement.full_alert_data.findIndex(element => element.id == alertID)
                    const oldStatus = state.SelectedElement.full_alert_data[indexToChange].status
                    Vue.set(state.SelectedElement.full_alert_data[indexToChange], "status", "promoted")
                    state.SelectedElement.full_alert_data[indexToChange].promoted_ids.push(payload.data.id)
                    Vue.set(state.SelectedElement.full_alert_data[indexToChange], "promoted_ids", state.SelectedElement.full_alert_data[indexToChange].promoted_ids)
                    if (state.SelectedElement.full_alert_data_flaired) {
                        Vue.set(state.SelectedElement.full_alert_data_flaired[indexToChange], "status", "promoted")
                        state.SelectedElement.full_alert_data_flaired[indexToChange].promoted_ids.push(payload.data.id)
                        Vue.set(state.SelectedElement.full_alert_data_flaired[indexToChange], "promoted_ids", state.SelectedElement.full_alert_data_flaired[indexToChange].promoted_ids)
                    }

                    const newStatus = "promoted"
                    if (oldStatus != newStatus) {
                        // decrement by one the oldStatus count and increment by one the new statusCount
                        const oldStatusCountPropName = statusToCountMap[oldStatus]
                        const oldStatusCount: number = state.SelectedElement[oldStatusCountPropName]
                        Vue.set(state.SelectedElement, oldStatusCountPropName, oldStatusCount - 1)
                        const newStatusCountPropName = statusToCountMap[newStatus]
                        const newStatusCount: number = state.SelectedElement[newStatusCountPropName]
                        Vue.set(state.SelectedElement, newStatusCountPropName, newStatusCount + 1)
                        if (state.ElementList != null) {
                            Vue.set(state.ElementList[state.SelectedElement.elementListIndex], newStatusCountPropName, newStatusCount + 1)
                            Vue.set(state.ElementList[state.SelectedElement.elementListIndex], oldStatusCountPropName, oldStatusCount - 1)
                        }
                    }
                }
            }
        }
    },

    promoteElementsSuccess(state, { promotedIds, promotedType, newObject }) {
        // Update selected element (if possible)
        if (state.SelectedElement != null && state.SelectedElement.ElementType == promotedType) {
            if (promotedIds.includes(state.SelectedElement.id) && state.SelectedElement.status) {
                state.SelectedElement.status = IRElementStatus.Promoted
            }
        }
        // Update element list (if possible)
        if (state.ElementType == promotedType) {
            state.ElementList?.forEach((element) => {
                if (promotedIds.includes(element.id) && element.status) {
                    element.status = IRElementStatus.Promoted
                }
            })
        }
    },

    removeEntrySuccess(state, payload: any) {
        if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
            if (!payload.treePath) {
                payload.treePath = findEntryTreePath(state, payload.entryId)
            }
            const entry = findEntry(payload.treePath, state, payload.entryId)
            if (!entry?.editMode || entry?.id == -1) {
                removeEntry(payload.treePath, state, payload.entryId)
            }
        }
        else {
            if (!payload.treePath) {
                payload.treePath = findLinkedElementEntryTreePath(state, payload.entryId, payload.linkedElementType, payload.linkedElementIndex)
            }
            const entry = findLinkedElementEntry(payload.treePath, state, payload.entryId, payload.linkedElementType, payload.linkedElementIndex)
            if (!entry?.editMode || entry?.id == -1) {
                removeLinkedElementEntry(payload.treePath, state, payload.entryId, payload.linkedElementType, payload.linkedElementIndex)
            }
        }

    },

    changeEntryToLoading(state, payload: any) {
        if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
            const entryId: number = payload.entryId
            const entry = findEntry(payload.treePath, state, entryId)
            if (entry == undefined) {
                return
            }
            entry['editMode'] = 'loading'
        }
        else {
            const entryId: number = payload.entryId
            const entry = findLinkedElementEntry(payload.treePath, state, entryId, payload.linkedElementType, payload.linkedElementIndex)
            entry['editMode'] = 'loading'
        }
    },

    addNewEntryWithEditModeOn(state, payload: any) {
        if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
            const entryData = ""
            const newEntry = {
                'owner': payload.owner,
                'id': -1,
                'modified': new Date().toISOString(),
                'created': new Date().toISOString(),
                'entry_data_ver': 0,
                'tlp': payload.TLPCode,
                'parent_entry_id': payload.parentEntryId,
                'target_type': payload.IRElementType,
                'target_id': payload.IRElementTypeId,
                'entry_class': payload.EntryClassEnum,
                'entry_data': entryData,
                'parsed': false,
                'editMode': true,
                'childEntries': []
            }
            addEntry(payload.treePath, state, -1, newEntry)
        }
        else {
            const entryData = ""
            const newEntry = {
                'owner': payload.owner,
                'id': -1,
                'modified': new Date().toISOString(),
                'created': new Date().toISOString(),
                'entry_data_ver': 0,
                'tlp': payload.TLPCode,
                'parent_entry_id': payload.parentEntryId,
                'target_type': payload.IRElementType,
                'target_id': payload.IRElementTypeId,
                'entry_class': payload.EntryClassEnum,
                'entry_data': entryData,
                'parsed': false,
                'editMode': true,
                'childEntries': []
            }
            addLinkedElementEntry(payload.treePath, state, -1, newEntry, payload.linkedElementType, payload.linkedElementIndex)
        }
    },

    updateOrCreateEntrySuccess(state, payload: any) {
        if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
            const newEntry: any = {
                'owner': payload.owner,
                'id': payload.id,
                'modified': new Date().toISOString(),
                'tlp': payload.tlp,
                'parent_entry_id': payload.parent_entry_id,
                'target_type': payload.target_type,
                'target_id': payload.target_id,
                'entry_class': payload.entry_class,
                'entry_data': payload.entry_data,
                'parsed': false,
                'editMode': false,
                'favorite': false,
                'subscribed': false
            }
            addEntry(payload.treePath, state, payload.id, newEntry)
        }
        else {
            if (state.SelectedElement && state.SelectedElement.linkedElements) {
                const newEntry: any = {
                    'owner': payload.owner,
                    'id': payload.id,
                    'modified': new Date().toISOString(),
                    'tlp': payload.tlp,
                    'parent_entry_id': payload.parent_entry_id,
                    'target_type': payload.target_type,
                    'target_id': payload.target_id,
                    'entry_class': payload.entry_class,
                    'entry_data': payload.entry_data,
                    'parsed': false,
                    'editMode': false,
                    'favorite': false,
                    'subscribed': false
                }
                addLinkedElementEntry(payload.treePath, state, payload.id, newEntry, payload.linkedElementType, payload.linkedElementIndex)
            }
        }
    },

    linkedEntriesChanged(state){
        state.linkedEntriesChanged = !state.linkedEntriesChanged
    },

    clearSelectedElement(state) {
        state.SelectedElement = null
        state.SelectedElementEntries = []
        state.SelectedElementEntities = []
        state.SelectedElementFlairedEntities = []
        state.entitiesLoaded = false
        state.numEntitiesLoading = 0
    },

    clearSelectedElementFlair(state) {
        state.entitiesLoaded = false
    },

    retrieveSourcesSuccess(state, payload: any) {
        if (state.SelectedElement) {
            const selectedElementSources = state.SelectedElement.sources?.map((x: Source) => x.name)
            Vue.set(state.SelectedElement, "autoCompleteSources", payload.result.map((x: Source) => x.name).filter((x: string) => !selectedElementSources?.includes(x)))
        }
    },

    deleteSourceSuccess(state, payload: any) {
        if (state.SelectedElement) {
            const selectedElementSources = state.SelectedElement.sources?.indexOf(payload)
            if (selectedElementSources) {
                state.SelectedElement.autoCompleteSources?.splice(selectedElementSources, 1)
                Vue.set(state.SelectedElement, "autoCompleteSources", state.SelectedElement.autoCompleteSources)
            }
        }
    },

    replaceSourceSuccess(state, {old_id, payload}) {
        if (state.SelectedElement) {
            const deletedElementSources = state.SelectedElement.sources?.findIndex(a => a.id == old_id)
            if (deletedElementSources) {
                state.SelectedElement.autoCompleteTags?.splice(deletedElementSources, 1)
                Vue.set(state.SelectedElement, "autoCompleteSources", state.SelectedElement.autoCompleteTags)
            }
            const selectedElementSources = state.SelectedElement.sources?.map((x: Tag) => x.name)
            Vue.set(state.SelectedElement, "autoCompleteSources", payload.result.map((x: Tag) => x.name).filter((x: string) => !selectedElementSources?.includes(x)))
        }
    },

    retrieveTagsSuccess(state, payload: any) {
        if (state.SelectedElement) {
            const selectedElementTags = state.SelectedElement.tags?.map((x: Tag) => x.name)
            Vue.set(state.SelectedElement, "autoCompleteTags", payload.result.map((x: Tag) => x.name).filter((x: string) => !selectedElementTags?.includes(x)))
        }
    },

    deleteTagSuccess(state, payload: Tag) {
        if (state.SelectedElement) {
            const selectedElementTags = state.SelectedElement.tags?.indexOf(payload)
            if (selectedElementTags) {
                state.SelectedElement.autoCompleteTags?.splice(selectedElementTags, 1)
                Vue.set(state.SelectedElement, "autoCompleteTags", state.SelectedElement.autoCompleteTags)
            }
        }
    },

    replaceTagSuccess(state, {old_id, payload}) {
        if (state.SelectedElement) {
            const deletedElementTags = state.SelectedElement.tags?.findIndex(a => a.id == old_id)
            if (deletedElementTags) {
                state.SelectedElement.autoCompleteTags?.splice(deletedElementTags, 1)
                Vue.set(state.SelectedElement, "autoCompleteTags", state.SelectedElement.autoCompleteTags)
            }
            const selectedElementTags = state.SelectedElement.tags?.map((x: Tag) => x.name)
            Vue.set(state.SelectedElement, "autoCompleteTags", payload.result.map((x: Tag) => x.name).filter((x: string) => !selectedElementTags?.includes(x)))
        }
    },

    retrieveEntityAppearancesSuccess(state, payload:any){
        if (state.SelectedElement){
            const appearances = []
            for (const appearance in payload.entityAppearances) {
                appearances.push(...payload.entityAppearances[appearance])
            }
            Vue.set(state.SelectedElement, "appearances", appearances)
        }
    },

    retrieveEntityPivotsSuccess(state, payload:any){
        if (state.SelectedElement){
            Vue.set(state.SelectedElement, "pivots", payload.entityPivots)
        }
    },

    retrieveEntityEnrichmentsSuccess(state, payload:any){
        if (state.SelectedElement){
            Vue.set(state.SelectedElement, "enrichments", payload.entityEnrichments)
        }
    },

    addEntityClassesSuccess(state, payload:any){
        const entityIndex = state.SelectedElementEntities.findIndex((el: any) => el.id == payload.id)
        if (entityIndex != -1) {
            Vue.set(state.SelectedElementEntities[entityIndex], "classes", payload["classes"])
        }
        else if (state.SelectedElement?.ElementType == IRElementType.Entity && payload.id == state.SelectedElement.id) {
            Vue.set(state.SelectedElement, "classes", payload["classes"])
        }
    },

    addEntityTagSuccess(state, payload:any){
        const entityIndex = state.SelectedElementEntities.findIndex((el: any) => el.id == payload.id)
        if (entityIndex != -1) {
            Vue.set(state.SelectedElementEntities[entityIndex], "tags", payload["tags"])
        }
        else if (state.SelectedElement?.ElementType == IRElementType.Entity && payload.id == state.SelectedElement.id) {
            Vue.set(state.SelectedElement, "tags", payload["tags"])
        }
    },

    removeEntityClassesSuccess(state, payload:any){
        const entityIndex = state.SelectedElementEntities.findIndex((el: any) => el.id == payload.id)
        if (entityIndex != -1) {
            Vue.set(state.SelectedElementEntities[entityIndex], "classes", payload["classes"])
        }
        else if (state.SelectedElement?.ElementType == IRElementType.Entity && payload.id == state.SelectedElement.id) {
            Vue.set(state.SelectedElement, "classes", payload["classes"])
        }
    },

    removeEntityTagSuccess(state, payload:any){
        const entityIndex = state.SelectedElementEntities.findIndex((el: any) => el.id == payload.id)
        if (entityIndex != -1) {
            Vue.set(state.SelectedElementEntities[entityIndex], "tags", payload["tags"])
        }
        else if (state.SelectedElement?.ElementType == IRElementType.Entity && payload.id == state.SelectedElement.id) {
            Vue.set(state.SelectedElement, "tags", payload["tags"])
        }
    },

    retrieveAllEntityClassesSuccess(state, payload: any) {
        if (state.SelectedElement) {
            Vue.set(state.SelectedElement, "autoCompleteEntityClasses",payload.result)
        }
    },

    updateEntityClassDescriptionSuccess(state, payload:any){
        if (state.SelectedElement && state.SelectedElement.classes){
            const indexToChange = state.SelectedElement.classes.map((e:any) => {return e.id}).indexOf(payload.id)
            if (indexToChange != -1){
                Vue.set(state.SelectedElement.classes, indexToChange, payload)
            }
        }
    },
   
    flairDialogChange(state, value: boolean) {
        if (value == false) {
            state.SelectedElementFlairedEntities = []
        }
        state.flairDialog = value
    },

    addTagOrSourceSuccess(state, payload: any) {
        if (payload.targetElementType) {
            payload.targetElementType = convertFromSnakeCase(payload.targetElementType) as IRElementType
        }
        if (state.SelectedElement != null && state.SelectedElement != undefined && state.SelectedElement.tags && state.SelectedElement.sources) {
            if (payload.type == "tag") {
                if (state.ElementList != null && payload.targetElementId == state.SelectedElement.id && payload.targetElementType == state.ElementType) {
                    const tags = state.ElementList[state.SelectedElement.elementListIndex].tags
                    if (tags && !tags.some(tag => tag.name == payload.newTagOrSource.name)) {
                        tags.push(payload.newTagOrSource)
                        state.SelectedElement.tags = tags
                        Vue.set(state.ElementList[state.SelectedElement.elementListIndex], "tags", tags)
                    }
                }
                else if (state.SelectedElement && state.SelectedElement.linkedElements && state.SelectedElement.linkedElements[payload.targetElementType as IRElementType]) {
                    const linkedElementIndex = state.SelectedElement.linkedElements[payload.targetElementType as IRElementType].findIndex(a => a.element.id == payload.targetElementId)
                    if (linkedElementIndex != -1) {
                        const tags = state.SelectedElement.linkedElements[payload.targetElementType as IRElementType][linkedElementIndex].element.tags
                        if (tags && !tags.some(tag => tag.name == payload.newTagOrSource.name)) {
                            tags.push(payload.newTagOrSource)
                            Vue.set(state.SelectedElement.linkedElements[payload.targetElementType as IRElementType][linkedElementIndex].element, "tags", tags)
                        }
                    }
                }
            }
            else {
                if (state.ElementList != null && payload.targetElementId == state.SelectedElement.id && payload.targetElementType == state.ElementType) {
                    const sources = state.ElementList[state.SelectedElement.elementListIndex].sources
                    if (sources && !sources.some(source => source.name == payload.newTagOrSource.name)) {
                        sources.push(payload.newTagOrSource)
                        state.SelectedElement.sources = sources
                        Vue.set(state.ElementList[state.SelectedElement.elementListIndex], "sources", sources)
                    }
                }
                else if (state.SelectedElement && state.SelectedElement.linkedElements && state.SelectedElement.linkedElements[payload.targetElementType as IRElementType]) {
                    const linkedElementIndex = state.SelectedElement.linkedElements[payload.targetElementType as IRElementType].findIndex(a => a.element.id == payload.targetElementId)
                    if (linkedElementIndex != -1) {
                        const sources = state.SelectedElement.linkedElements[payload.targetElementType as IRElementType][linkedElementIndex].element.sources
                        if (sources && !sources.some(source => source.name == payload.newTagOrSource.name)) {
                            sources.push(payload.newTagOrSource)
                            Vue.set(state.SelectedElement.linkedElements[payload.targetElementType as IRElementType][linkedElementIndex].element, "sources", sources)
                        }
                    }
                }
            }
        }
    },

    updateTagOrSourceSuccess(state, payload: any) {
        if (state.SelectedElement != null && state.SelectedElement != undefined && state.SelectedElement.tags && state.SelectedElement.sources) {
            if (payload.type == "tag") {
                const tagIndexToChange = state.SelectedElement.tags.findIndex(tag => tag.id === payload.id)
                Vue.set(state.SelectedElement.tags[tagIndexToChange], "description", payload.description)
                if (state.SelectedElement.tags[tagIndexToChange] !== payload.name) {
                    Vue.set(state.SelectedElement.tags[tagIndexToChange], "name", payload.name)
                }
            }
            else {
                const sourceIndexToChange = state.SelectedElement.sources.findIndex(source => source.id === payload.id)
                Vue.set(state.SelectedElement.sources[sourceIndexToChange], "description", payload.description)
                if (state.SelectedElement.sources[sourceIndexToChange] !== payload.name) {
                    Vue.set(state.SelectedElement.sources[sourceIndexToChange], "name", payload.name)
                }
            }
        }
    },

    unAssignTagOrSourceSuccess(state, payload: any) {
        if (payload.targetElementType) {
            payload.targetElementType = convertFromSnakeCase(payload.targetElementType) as IRElementType
        }
        if (state.SelectedElement != null && state.SelectedElement != undefined && state.SelectedElement.tags && state.SelectedElement.sources) {
            if (payload.type == "tag") {
                if (payload.targetElementId == state.SelectedElement.id && payload.targetElementType == state.ElementType) {
                    const tagIndexToRemove = state.SelectedElement.tags.findIndex(tag => tag.id === payload.id)
                    if (tagIndexToRemove !== -1) {
                        const copyArr = [...state.SelectedElement.tags]
                        copyArr.splice(tagIndexToRemove, 1)
                        Vue.set(state.SelectedElement, "tags", copyArr)
                        if (state.ElementList) {
                            Vue.set(state.ElementList[state.SelectedElement.elementListIndex], "tags", copyArr)
                        }
                    }
                }
                else if (state.SelectedElement && state.SelectedElement.linkedElements && state.SelectedElement.linkedElements[payload.targetElementType as IRElementType]) {
                    const linkedElementIndex = state.SelectedElement.linkedElements[payload.targetElementType as IRElementType].findIndex(a => a.element.id == payload.targetElementId)
                    if (linkedElementIndex != -1 && state.SelectedElement.linkedElements[payload.targetElementType as IRElementType][linkedElementIndex].element.tags) {
                        const tags = state.SelectedElement.linkedElements[payload.targetElementType as IRElementType][linkedElementIndex].element.tags as Tag[]
                        const tagIndexToRemove = tags.findIndex(tag => tag.id === payload.id)
                        if (tagIndexToRemove != null) {
                            const copyArr = [...tags]
                            copyArr.splice(tagIndexToRemove, 1)
                            Vue.set(state.SelectedElement.linkedElements[payload.targetElementType as IRElementType][linkedElementIndex].element, "tags", copyArr)
                        }
                    }
                }
            }
            else {
                if (payload.targetElementId == state.SelectedElement.id && payload.targetElementType == state.ElementType) {
                    const sourceIndexToRemove = state.SelectedElement.sources.findIndex(source => source.id === payload.id)
                    if (sourceIndexToRemove !== -1) {
                        const copyArr = [...state.SelectedElement.sources]
                        copyArr.splice(sourceIndexToRemove, 1)
                        Vue.set(state.SelectedElement, "sources", copyArr)
                        if (state.ElementList) {
                            Vue.set(state.ElementList[state.SelectedElement.elementListIndex], "sources", copyArr)
                        }
                    }
                }
                else if (state.SelectedElement && state.SelectedElement.linkedElements && state.SelectedElement.linkedElements[payload.targetElementType as IRElementType]) {
                    const linkedElementIndex = state.SelectedElement.linkedElements[payload.targetElementType as IRElementType].findIndex(a => a.element.id == payload.targetElementId)
                    if (linkedElementIndex != -1 && state.SelectedElement.linkedElements[payload.targetElementType as IRElementType][linkedElementIndex].element.sources) {
                        const sources = state.SelectedElement.linkedElements[payload.targetElementType as IRElementType][linkedElementIndex].element.sources as Source[]
                        const sourceIndexToRemove = sources.findIndex(source => source.id === payload.id)
                        if (sourceIndexToRemove != null) {
                            const copyArr = [...sources]
                            copyArr.splice(sourceIndexToRemove, 1)
                            Vue.set(state.SelectedElement.linkedElements[payload.targetElementType as IRElementType][linkedElementIndex].element, "sources", copyArr)
                        }
                    }
                }
            }
        }
    },

    retrieveLinkedElementsSuccess(state, payload: any) {
        if (state.SelectedElement != null && state.SelectedElement.linkedElements != null) {
            for (let i = 0; i < payload.data.length; i++) {
                const alreadyExists = state.SelectedElement.linkedElements[payload.elementType as IRElementType].find((element: LinkedElement) => element.element.id == payload.data[i].id)
                if (alreadyExists == undefined) {
                    state.SelectedElement.linkedElements[payload.elementType as IRElementType].push({ "element": payload.data[i], "entries": [] })
                }
            }
        }
        else if (state.SelectedElement && state.SelectedElement.linkedElements == null) {
            Vue.set(state.SelectedElement, "linkedElements", {
                [IRElementType.Alertgroup]: [],
                [IRElementType.Event]: [],
                [IRElementType.Intel]: [],
                [IRElementType.Product]: [],
                [IRElementType.Incident]: [],
                [IRElementType.Dispatch]: [],
                [IRElementType.Alert]: [],
                [IRElementType.Guide]: [],
                [IRElementType.Signature]: [],
                [IRElementType.ThreatModelItem]: [],
                [IRElementType.Link]: [],
                [IRElementType.Entity]: [],
                [IRElementType.Entry]: [],
                [IRElementType.File]: [],
                [IRElementType.Feed]: [],
                [IRElementType.Pivot]: [],
                [IRElementType.EntityClass]:[],
                [IRElementType.VulnFeed]: [],
                [IRElementType.VulnTrack]:[],
            })
            for (let i = 0; i < payload.data.length; i++) {
                state.SelectedElement.linkedElements![payload.elementType as IRElementType].push({ "element": payload.data[i], "entries": [] })
            }
        }
    },

    retrieveLinkedElementEntriesSuccess(state, payload: any) {
        function findChildren(parentEntry: Entry, allEntries: Array<Entry>): undefined {
            //find all child entries
            parentEntry['editMode'] = false
            parentEntry['repliesExpanded'] = true
            parentEntry['collapsed'] = false
            const childrenEntries = allEntries.filter((entry: Entry) => entry.parent_entry_id == parentEntry.id)
            for (const childEntry of childrenEntries) {
                childEntry['repliesExpanded'] = true
            }
            parentEntry['childEntries'] = childrenEntries
            if (childrenEntries.length == 0) {
                return
            }
            else {
                for (const childEntry of childrenEntries)
                    return findChildren(childEntry, allEntries)
            }
        }
        const parentEntries = payload.data.result.filter((entry: Entry) => entry.parent_entry_id == null)
        for (const parentEntry of parentEntries) {
            findChildren(parentEntry, payload.data.result)
        }

        if (state.SelectedElement && state.SelectedElement.linkedElements) {
            const filteredEntries = payload.data.result.filter((entry: Entry) => entry.parent_entry_id == null)
            Vue.set(state.SelectedElement.linkedElements[payload.elementType as IRElementType][payload.index], "entries", filteredEntries)
        }
    },

    updateLinkedElementSuccess(state, { payload, linkedElementId, linkedElementType, linkedElementIndex }) {
        if (state.SelectedElement && state.SelectedElement.linkedElements && state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex]) {
            Object.assign(state.SelectedElement.linkedElements[linkedElementType as IRElementType][linkedElementIndex].element, payload)
        }
    },

    unlinkElementsSuccess(state, payload) {
        for (const item of payload) {
            const itemType0Caps = convertFromSnakeCase(item.v0_type)
            const itemType1Caps = convertFromSnakeCase(item.v1_type)
            if (itemType0Caps == state.ElementType && item.v0_id == state.SelectedElement?.id && state.SelectedElement?.linkedElements) {
                const indexToRemove = state.SelectedElement.linkedElements[itemType1Caps as IRElementType].findIndex((element: LinkedElement) => element.element.id == item.v1_id)
                if (indexToRemove != -1) {
                    state.SelectedElement.linkedElements[itemType1Caps as IRElementType].splice(indexToRemove, 1)
                }
            }
            if (itemType1Caps == state.ElementType && item.v1_id == state.SelectedElement?.id && state.SelectedElement?.linkedElements) {
                const indexToRemove = state.SelectedElement.linkedElements[itemType0Caps as IRElementType].findIndex((element: LinkedElement) => element.element.id == item.v0_id)
                if (indexToRemove != -1) {
                    state.SelectedElement.linkedElements[itemType0Caps as IRElementType].splice(indexToRemove, 1)
                }
            }
        }
    },

    updateElementList(state, payload) {
        //need to update the selected element? or something for entries
        const element: IRElementMeta = payload.data
        if (state.ElementList && element) {
            const elementIndex = state.ElementList.findIndex(elementMeta => elementMeta.id == element.id)
            if (elementIndex != -1) {
                Object.assign(state.ElementList[elementIndex], element)
            }
        }
        state.ElementListAbortController = null
    },

    updateElementLinkedElement(state, payload) {
        //need to update the selected element? or something for entries
        const entryId: number = payload.data.id
        if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
            Object.assign(findEntry(payload.treePath, state, entryId), payload.data)
        }
        else {
            Object.assign(findLinkedElementEntry(payload.treePath, state, entryId, payload.linkedElementType, payload.linkedElementIndex), payload.data)
        }
    },

    subscribeUnsubscribeSuccess(state, payload) {
        const elementType = convertFromSnakeCase(payload.data.target_type) as IRElementType
        const elementId = payload.data.target_id
        const newData = payload.newdata
        if (state.ElementType == elementType && state.ElementList) {
            const elementIndex = state.ElementList.findIndex((a) => a.id == elementId)
            if (elementIndex != -1) {
                Object.assign(state.ElementList[elementIndex], newData)
            }
            if (state.SelectedElement && state.SelectedElement.id == elementId) {
                Object.assign(state.SelectedElement, newData)
            }
        }
        else if (elementType == IRElementType.Entry) {
            if (payload.linkedElementId == null && payload.linkedElementIndex == null && payload.linkedElementType == null) {
                const entry = findEntry(payload.treePath, state, elementId)
                if (entry) {
                    Object.assign(entry, newData)
                }
            }
            else {
                Object.assign(findLinkedElementEntry(payload.treePath, state, elementId, payload.linkedElementType, payload.linkedElementIndex), newData)
            }
        }
    }
};
