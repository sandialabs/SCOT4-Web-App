import Vuetify from '@/plugins/vuetify'
import { GetterTree } from 'vuex';
import { IRElement, IRElementMeta, IRElementsListState, IRElementType, LinkedElement, ScotFile, PermissionEnum, Entry, NewEntry, Entity, Tag, Source } from './types';
import { RootState } from '@/store/types';
import { findEntry } from '@/utils/treeUtils';
import { findLinkedElementEntry } from '@/utils/linkedTreeUtils';
import { Role } from '../user/types';
import { Audit } from '../team/types';

export const getters: GetterTree<IRElementsListState, RootState> = {
    elementList(state): Array<IRElementMeta> | null {
        return state.ElementList
    },
    retrievingElements(state): boolean {
        return state.retrievingElements
    },
    totalElementListCount(state): number {
        return state.totalElementListCount
    },
    elementListPage(state): number {
        return state.elementListPage
    },
    elementListItemsPerPage(state): number {
        return state.elementListItemsPerPage
    },
    elementListSortBy(state): string | undefined {
        return state.elementListSortBy
    },
    elementListSortDesc(state): boolean {
        return state.elementListSortDesc
    },
    elementListFilterDict(state): any {
        return {
            ...state.elementListFilter,
            limit: state.elementListItemsPerPage,
            skip: (state.elementListPage - 1) * state.elementListItemsPerPage,
            sort: state.elementListSortBy ? (state.elementListSortDesc ? "-" : "") + state.elementListSortBy : undefined
        }
    },
    elementListFilterIsDefault(state): boolean {
        return Object.keys(state.elementListFilter).length == 0 &&
            state.elementListPage == 1 &&
            state.elementListSortBy == "id" &&
            state.elementListSortDesc
    },
    selectedElementFiles(state):Array<ScotFile> {
        return state.SelectedElementFiles
    },
    elementType(state): IRElementType | null {
        return state.ElementType
    },
    elementTypePluralized(state): string | null {
        if (state.ElementType == IRElementType.Entity){
            return "entities"
        }
        else if (state.ElementType == IRElementType.Dispatch){
            return "dispatches"
        }
        else if (state.ElementType == IRElementType.EntityClass){
            return "entity classes"
        }
        else if (state.ElementType == IRElementType.Entry) {
            return "entries"
        }
        else if (state.ElementType == IRElementType.VulnFeed) {
            return "vuln_feeds"
        }
        else if (state.ElementType == IRElementType.VulnTrack) {
            return "vuln_tracks"
        }
        else{
            return state.ElementType + "s"
        }
    },
    isAlertGroupElementType(state): boolean {
        if (state.ElementType == IRElementType.Alertgroup) {
            return true
        }
        else {
            return false
        }
    },
    selectedElement(state): IRElement | null {
        return state.SelectedElement
    },

    selectedElementEntityCount(state): number {
        return state.SelectedElementEntities.length
    },
    
    selectedElementEntities(state): Record<string, Record<string, Entity>> {
        const initialValue: any = {};

        return state.SelectedElementEntities.reduce((obj, item) => {
            const t = String(item['type_name'])
            const value = String(item['value']).toLowerCase()
            if (t in obj) {
                obj[t][value] = item
            }
            else {
                obj[t] = {}
                obj[t][value] = item
            }
            return obj
        }, initialValue);
    },

    selectedElementEntitiesArray(state): Array<Entity> {
        return state.SelectedElementEntities
    },

    selectedElementEntityIndex(state): CallableFunction {
        return function (entityId: number) {
            return state.SelectedElementEntities.findIndex((e) => e.id == entityId)
        }
    },

    selectedElementPermissions(state): { [key in PermissionEnum]?: Array<Role> } {
        return state.SelectedElementPermissions
    },

    selectedElementHistory(state): Array<Audit> {
        return state.SelectedElementHistory
    },

    selectedElementLinkedElements(state): { [key in IRElementType]: Array<LinkedElement> } | null{
        if (!state.SelectedElement) {
            return null
        }
        if (!state.SelectedElement?.linkedElements) {
            state.SelectedElement.linkedElements = {
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
                [IRElementType.EntityClass]: [],
                [IRElementType.VulnFeed]: [],
                [IRElementType.VulnTrack]: [],
            }
        }
        return state.SelectedElement.linkedElements
    },

    selectedElementAbortController(state): AbortController | null{
        return state.SelectedElementAbortController
    },

    entitiesLoaded(state): boolean {
        return state.entitiesLoaded
    },

    linkedEntriesChanged(state): boolean {
        return state.linkedEntriesChanged
    },
    
    flairVisible(state): boolean {
        return state.flairVisible
    },

    flairDialog(state): boolean {
        return state.flairDialog && state.SelectedElementFlairedEntities.length > 0
    },

    flairMenuVisible(state): boolean {
        return state.flairMenuVisible
    },

    flairMenuX(state): number {
        return state.flairMenuX
    },

    flairMenuY(state): number {
        return state.flairMenuY
    },

    flairMenuEntity(state): Entity | null {
        return state.flairMenuEntity
    },

    fileDialog(state): boolean {
        return state.fileDialog
    },

    elementPaneHeight(state): number | null {
        return state.elementPaneHeight
    },
    selectedElementPaneSize(state, getters, rootState, rootGetters): number {
        const inboxState = rootGetters['user/inboxView']
        if (inboxState) {
            return 100
        }
        else {
            return state.selectedElementSize
        }
    },
    queueTablePaneSize(state, getters, rootState, rootGetters): number {
        const inboxState = rootGetters['user/inboxView']
        if (inboxState) {
            return 0
        }
        else {
            return 100 - state.selectedElementSize
        }
    },
    selectedElementFlairedEntities(state): Array<any> {
        return state.SelectedElementFlairedEntities
    },
    selectedElementEntriesLength(state): number {
        return state.SelectedElementEntries.length
    },
    selectedElementEntries(state): Array<Entry | NewEntry> | null {
        state.SelectedElementEntries.sort(function compare(a, b) {
            if (String(a.entry_class) == "summary" && String(b.entry_class) != "summary") {
                return -1
            }
            else if (String(a.entry_class) != "summary" && String(b.entry_class) == "summary") {
                return 1
            }
            else if (String(a.entry_class) != "summary" && String(b.entry_class) == "promotion") {
                return 1
            }
            else if (String(a.entry_class) == "promotion" && String(b.entry_class) != "summary") {
                return -1
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
        return state.SelectedElementEntries
    },

    selectedElementAlertIds(state): Array<string> | null | undefined {
        if (state.SelectedElement != null && state.SelectedElement.ElementType === IRElementType.Alertgroup) {
            return state.SelectedElement.selectedAlertIds
        }
        else {
            return null
        }
    },

    linkedElementEntries(state): CallableFunction {
        return function (linkedElementId: number, linkedElementType: IRElementType) {
            if (state.SelectedElement && state.SelectedElement.linkedElements) {
                const entries = state.SelectedElement?.linkedElements[linkedElementType as IRElementType].find((obj) => obj.element.id == linkedElementId)?.entries
                entries?.sort(function compare(a, b) {
                    if (String(a.entry_class) == "summary" && String(b.entry_class) != "summary") {
                        return -1
                    }
                    else if (String(a.entry_class) != "summary" && String(b.entry_class) == "summary") {
                        return 1
                    }
                    else if (String(a.entry_class) != "summary" && String(b.entry_class) == "promotion") {
                        return 1
                    }
                    else if (String(a.entry_class) == "promotion" && String(b.entry_class) != "promotion") {
                        return -1
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
                return entries
            }
            return null
        }
    },

    entryById(state): CallableFunction {
        return function (id: number, treePath: string = "", linkedElementId = null, linkedElementIndex: unknown = null, linkedElementType: unknown = null) {
            if (linkedElementId == null && linkedElementIndex == null && linkedElementType == null) {
                return findEntry(treePath, state, id)
            }
            else {
                if (state.SelectedElement != null && state.SelectedElement != undefined && state.SelectedElement.linkedElements != null && linkedElementType != null && linkedElementIndex != null) {
                    return findLinkedElementEntry(treePath, state, id, linkedElementType as IRElementType, linkedElementIndex as number)
                }
            }
        }
    },

    entryEditModeById(state): CallableFunction {
        return function (id: number, treePath: string = "", linkedElementId = null, linkedElementIndex: unknown = null, linkedElementType: unknown = null) {
            let entry = null
            if (linkedElementId == null && linkedElementIndex == null && linkedElementType == null) {
                entry = findEntry(treePath, state, id)

            }
            else {
                if (state.SelectedElement != null && state.SelectedElement != undefined && state.SelectedElement.linkedElements != null && linkedElementType != null && linkedElementIndex != null) {
                    entry = findLinkedElementEntry(treePath, state, id, linkedElementType as IRElementType, linkedElementIndex as number)
                }
            }
            if (entry != undefined) {
                if (entry.editMode != undefined) {
                    return entry.editMode

                }
                else {
                    // If the entry exists but editMode is not an attribute
                    return false
                }
            }
            else {
                return false
            }
        }
    },

    tabulatorAlertGroupTableColumns(state): Array<any> | undefined {
        function statusFormatterFunction(cell: any, formatterParams: any, onRendered: any) {
            if (cell.getValue() != "open" && cell.getValue() != "closed") {
                const promotionIds = cell.getValue()
                if (promotionIds.length == 1) {
                    const href = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/" + "events" + "/" + promotionIds[0]
                    return "<a href=" + href + ">" + "Promoted" + "</a>"
                }
                else {
                    let fullString = ""
                    for (const id of promotionIds) {
                        const href = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port + "/" + "events" + "/" + id
                        fullString += '<button onclick="alert(id)"> HI</a>'
                    }
                    return fullString
                }
            }
            else {
                return cell.getValue()
            }
        }
        const returnArray: Array<any> = []
        if (state.SelectedElement != null && state.SelectedElement.full_alert_data != null && state.SelectedElement.full_column_names != null && state.ElementType == IRElementType.Alertgroup) {
            for (const column of state.SelectedElement.full_column_names) {
                if (column == "status") {
                    const addColumn = { 'title': column, 'field': column, "headerFilter": "input", "headerFilterPlaceholder": "filter", "formatter": "html" }
                    returnArray.push(addColumn)
                }
                else {
                    const addColumn = { 'title': column, 'field': column, "headerFilter": "input", "headerFilterPlaceholder": "filter", "formatter": "textarea" }
                    returnArray.push(addColumn)
                }
            }
            return returnArray
        }
        return []

    },
    tabulatorAlertGroupTableRows(state): Array<any> | undefined {
        const returnArray: Array<any> = []
        if (state.SelectedElement != null && state.SelectedElement.full_alert_data != null && state.ElementType == IRElementType.Alertgroup) {
            for (let i = 0; i < state.SelectedElement.full_alert_data.length; i++) {
                let rowObject: Record<string, any> = {}
                rowObject = Object.assign(rowObject, state.SelectedElement.full_alert_data[i]);
                returnArray.push(rowObject)
            }
            return returnArray
        }
        return undefined
    },

    flairedEnrichmentsandPivotsLoaded(state):any {
        return state.flairedEnrichmentsandPivotsLoaded
    },

    allEntryIds(state): CallableFunction {
        return function listAllEntries(){
            const allEntryList: Array<number> = []
            function recurseEntry(entry:any, allEntryList:Array<number>){
        
                allEntryList.push(entry.id)
                if (entry.childEntries)
                {
                    if ( entry.childEntries.length == 0){
                        return
                    }
                    else{
                        for (const childEntry of entry.childEntries){
                            recurseEntry(childEntry, allEntryList)
                        }
                    }
                }
            }
            
            for (const rootEntry of state.SelectedElementEntries){
                recurseEntry(rootEntry, allEntryList)
    
            }
            return allEntryList
        }
    },

    vuetifyAlertGroupTableColumns(state): Array<any> | undefined {

        const returnArray: Array<any> = []
        const columnsAlreadySeen: string[] = []  // Sometimes can have duplicate columns due to system-defined columns on every alert
        if (state.SelectedElement != null && state.SelectedElement.full_alert_data != null && state.SelectedElement.full_column_names != null && state.ElementType == IRElementType.Alertgroup) {
            for (const column of state.SelectedElement.full_column_names) {
                let columnTitle = column
                if (columnsAlreadySeen.includes(column)) {
                    columnTitle = "_" + columnTitle
                    while (columnTitle in columnsAlreadySeen) {
                        columnTitle = "_" + columnTitle
                    }
                }
                const addColumn = { 'text': columnTitle, 'value': column, 'align': 'center', 'width': '', 'class': 'text-no-wrap', 'divider': true }
                if (column == 'id') {
                    addColumn.width = '1%'
                }
                else if (column == 'status') {
                    addColumn.width = '10em'
                }
                returnArray.push(addColumn)
                columnsAlreadySeen.push(columnTitle)
            }
            return returnArray
        }
        return []
    },
    vuetifyAlertGroupTableRows(state): Array<any> | undefined {
        const returnArray: Array<any> = []
        if (state.SelectedElement != null && state.SelectedElement.full_alert_data != null && state.ElementType == IRElementType.Alertgroup) {
            for (let i = 0; i < state.SelectedElement.full_alert_data.length; i++) {
                let rowObject: Record<string, any> = {}
                rowObject = Object.assign(rowObject, state.SelectedElement.full_alert_data[i]);
                returnArray.push(rowObject)
            }
            return returnArray
        }
        return undefined
    },

    vuetifyAlertGroupTableRowsFlaired(state): Array<any> | undefined {
        const returnArray: Array<any> = []
        if (state.SelectedElement != null && state.SelectedElement.full_alert_data_flaired != null && state.ElementType == IRElementType.Alertgroup) {
            for (let i = 0; i < state.SelectedElement.full_alert_data_flaired.length; i++) {
                const rowObject : Record<string, any> = {}
                for (const alertColumn in state.SelectedElement.full_alert_data_flaired[i]){
                    const alertCellValue = state.SelectedElement.full_alert_data_flaired[i][alertColumn]
                    if ((alertCellValue == "null" || alertCellValue == null) && state.SelectedElement.full_alert_data) {
                        rowObject[alertColumn] = state.SelectedElement.full_alert_data[i][alertColumn]
                    }
                    else{
                        rowObject[alertColumn] = state.SelectedElement.full_alert_data_flaired[i][alertColumn]
                    }
                }
                returnArray.push(rowObject)
            }
            return returnArray
        }
        return undefined
    },


    vuetifyQueueTableRows(state): Array<any> | undefined {
        const returnArray: Array<any> = []
        if (state.ElementList != null) {
            for (const element of state.ElementList) {
                let rowObject: any = {}
                rowObject = Object.assign(rowObject, element)
                if (state.ElementType == IRElementType.Alertgroup) {
                    rowObject['status'] = [element.open_count, element.closed_count, element.promoted_count]
                }
                if (state.ElementType == IRElementType.Signature){
                    if (element != null && element.stats !=null && element.stats.alert_stats != null )
                    rowObject['promotedAlertCount'] = element.stats?.alert_stats.promoted_count
                    rowObject['closedAlertCount'] = element.stats?.alert_stats.closed_count
                    rowObject['openAlertCount'] = element.stats?.alert_stats.open_count
                    rowObject['totalAlertCount'] = element.stats?.alert_stats.total_count
                    rowObject['promotedAlertRate'] = element.stats?.alert_stats.promoted_rate
                    rowObject['closedAlertRate'] = element.stats?.alert_stats.closed_rate
                    rowObject['openAlertRate'] = element.stats?.alert_stats.open_rate

                }
                if (state.ElementType && ![IRElementType.Feed, IRElementType.Pivot, IRElementType.EntityClass, IRElementType.Guide].includes(state.ElementType)) {
                    rowObject['sources'] = rowObject['sources'].map((x: Source) => x.name)
                    rowObject['tags'] = rowObject['tags'].map((x: Tag) => x.name)
                }

                returnArray.push(rowObject)
            }
            return returnArray
        }
        return []
    },

    autoCompleteEntityClasses(state): Array<any> | undefined {
            if (state.SelectedElement){
                return state.SelectedElement.autoCompleteEntityClasses

            }
        
    },

    entityAppearances(state): Array<any> | undefined {
        if (state.SelectedElement && state.SelectedElement.appearances){
            return state.SelectedElement.appearances
        }
        else{
            return undefined
        }
    },

    vuetifyQueueTableColumns(state): Array<any> | undefined {
        const statusColumnWidth = '10em'
        const idColumnWidth = '9em' // This is about 6 numeric digits in the search bar and 10 in the field itself
        const popularityColumnWidth = '5em'
        let usernameColumnWidth = '10em'
        let sourceTagColumnWidth = '17em'

        if (Vuetify.framework.breakpoint.mdAndDown) {
            sourceTagColumnWidth = '8em'
            usernameColumnWidth = '9em'
        }
        else if (Vuetify.framework.breakpoint.lg) {
            sourceTagColumnWidth = '12em'
        }
        if (state.ElementType != null) {
            const IRElementReturnTypes: { [key in IRElementType]: any } | undefined = {
                [IRElementType.Alertgroup]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth, "sortable": false },
                    { 'text': "Subject", 'value': "subject", "align": "center", "width": "" },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Sources", 'value': "sources", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Tags", 'value': "tags", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Views", 'value': "view_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                ],
                [IRElementType.Event]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Subject", 'value': "subject", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Updated", 'value': "modified", "align": "center", "width": "1%" },
                    { 'text': "Sources", 'value': "sources", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Tags", 'value': "tags", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Owner", 'value': "owner", "align": "center", "width": usernameColumnWidth },
                    { 'text': "Entries", 'value': "entry_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                    { 'text': "Views", 'value': "view_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                ],
                [IRElementType.Intel]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Subject", 'value': "subject", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Updated", 'value': "modified", "align": "center", "width": "1%" },
                    { 'text': "Sources", 'value': "sources", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Tags", 'value': "tags", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Owner", 'value': "owner", "align": "center", "width": usernameColumnWidth },
                    { 'text': "Entries", 'value': "entry_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                ],
                [IRElementType.Product]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Subject", 'value': "subject", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Updated", 'value': "modified", "align": "center", "width": "1%" },
                    { 'text': "Sources", 'value': "sources", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Tags", 'value': "tags", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Owner", 'value': "owner", "align": "center", "width": usernameColumnWidth },
                    { 'text': "Entries", 'value': "entry_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                ],
                [IRElementType.Incident]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth },
                    { 'text': "Owner", 'value': "owner", "align": "center", "width": usernameColumnWidth },
                    { 'text': "Subject", 'value': "subject", "align": "center", "width": "" },
                    { 'text': "When", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Sources", 'value': "sources", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Tags", 'value': "tags", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Views", 'value': "view_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                ],
                [IRElementType.Dispatch]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Subject", 'value': "subject", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Updated", 'value': "modified", "align": "center", "width": "1%" },
                    { 'text': "Sources", 'value': "sources", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Tags", 'value': "tags", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Owner", 'value': "owner", "align": "center", "width": usernameColumnWidth },
                    { 'text': "Entries", 'value': "entry_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                ],
                [IRElementType.Alert]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth },
                    { 'text': "Status", 'value': "status", "align": "center" },
                    { 'text': "Subject", 'value': "subject", "align": "center" },
                    { 'text': "Created", 'value': "created", "align": "center" },
                    { 'text': "Sources", 'value': "sources", "align": "center" },
                    { 'text': "Tags", 'value': "tags", "align": "center" },
                ],
                [IRElementType.Guide]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Subject", 'value': "subject", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Applies To", 'value': "application", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Owner", 'value': "owner", "align": "center", "width": usernameColumnWidth },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                ],
                [IRElementType.Signature]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth },
                    { 'text': "Name", 'value': "name", "align": "center", "width": "12%" },
                    { 'text': "Type", 'value': "type", "align": "center", "width": "12em" },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth },
                    { 'text': "Group", 'value': "signature_group", "align": "center", "width": "12em" },
                    { 'text': "Description", 'value': "description", "align": "center", "width": "26%" },
                    { 'text': "Owner", 'value': "owner", "align": "center", "width": usernameColumnWidth },
                    { 'text': "Updated", 'value': "modified", "align": "center", "width": "1%" },
                    { 'text': "Sources", 'value': "sources", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Tags", 'value': "tags", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                ],
                [IRElementType.ThreatModelItem]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center" },
                    { 'text': "Status", 'value': "status", "align": "center" },
                    { 'text': "Subject", 'value': "subject", "align": "center" },
                    { 'text': "Created", 'value': "created", "align": "center" },
                    { 'text': "Sources", 'value': "sources", "align": "center" },
                    { 'text': "Tags", 'value': "tags", "align": "center" },
                ],
                [IRElementType.Link]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center" },
                    { 'text': "Status", 'value': "status", "align": "center" },
                    { 'text': "Subject", 'value': "subject", "align": "center" },
                    { 'text': "Created", 'value': "created", "align": "center" },
                    { 'text': "Sources", 'value': "sources", "align": "center" },
                    { 'text': "Tags", 'value': "tags", "align": "center" },
                ],
                [IRElementType.Entity]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth },
                    { 'text': "Entity Name", 'value': "value", "align": "center" },
                    { 'text': "Entity Type", 'value': "type_name", "align": "center", "width": "15em" },
                    { 'text': "Entity Classes", 'value': "classes", "align": "center", "width": "15em" },
                    { 'text': "Occurrences", 'value': "entity_count", "align": "center", "width": "9em", "sortable": false },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Sources", 'value': "sources", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Tags", 'value': "tags", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                ],
                // This is for tasks
                [IRElementType.Entry]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth },
                    { 'text': "Subject", 'value': "parent_subject", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Type", 'value': "target_type", "align": "center", "width": "12em" },
                    { 'text': "Target ID", 'value': "target_id", "align": "center", "width": "12em" },
                    { 'text': "Task Assignee", 'value': "task_assignee", "align": "center", "width": "12em" },
                    { 'text': "Task Status", 'value': "task_status", "align": "center", "width": statusColumnWidth },
                    { 'text': "Task Summary", 'value': "task_summary", "align": "center", "width": "40em" },
                    { 'text': "Updated", 'value': "modified", "align": "center", "width": "1%" },
                ],
                [IRElementType.File]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'title': "ID", 'field': "id", "headerFilter": "input", "formatter": "textarea" },
                    { 'title': "File Name", 'field': "filename", "headerFilter": "input", "formatter": "textarea" },
                    { 'title': "Description", 'field': "description", "headerFilter": "input", "formatter": "textarea" },
                    { 'title': "Created", 'field': "created", "headerFilter": "input", "formatter": "textarea" },
                    { 'title': "Sources", 'field': "sources", "headerFilter": "input", "formatter": "textarea" },
                    { 'title': "Tags", 'field': "tags", "headerFilter": "input", "formatter": "textarea" },
                ],
                [IRElementType.Feed]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth },
                    { 'text': "Name", 'value': "name", "align": "center", "width": "15em" },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth },
                    { 'text': "Type", 'value': "type", "align": "center", "width": "12em" },
                    { 'text': "URI", 'value': "uri", "align": "center", "width": "" },
                    { 'text': "Owner", 'value': "owner", "align": "center", "width": usernameColumnWidth },
                    { 'text': "Last Attempt", 'value': "last_attempt", "align": "center", "width": "1%" },
                    { 'text': "Last Article", 'value': "last_article", "align": "center", "width": "1%" },
                    { 'text': "Articles", 'value': "article_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                    { 'text': "Promotions", 'value': "promotions_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                ],
                [IRElementType.Pivot]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Title", 'value': "title", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Updated", 'value': "modified", "align": "center", "width": "1%" },
                ],
                [IRElementType.EntityClass]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Name", 'value': "display_name", "align": "center", "width": "15%", "class": "text-no-wrap" },
                    { 'text': "Description", 'value': "description", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Icon", 'value': "icon", "align": "center", "width": "1%", "class": "text-no-wrap" },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Updated", 'value': "modified", "align": "center", "width": "1%" },
                ],
                [IRElementType.VulnFeed]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Subject", 'value': "subject", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Updated", 'value': "modified", "align": "center", "width": "1%" },
                    { 'text': "Sources", 'value': "sources", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Tags", 'value': "tags", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Owner", 'value': "owner", "align": "center", "width": usernameColumnWidth },
                    { 'text': "Entries", 'value': "entry_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                    { 'text': "Views", 'value': "view_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                ],
                [IRElementType.VulnTrack]: [
                    { 'text': "", 'value': "popularity_count", "align": "center", "width": popularityColumnWidth, "class": "text-no-wrap" },
                    { 'text': "ID", 'value': "id", "align": "center", "width": idColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Status", 'value': "status", "align": "center", "width": statusColumnWidth, "class": "text-no-wrap" },
                    { 'text': "Subject", 'value': "subject", "align": "center", "width": "", "class": "text-no-wrap" },
                    { 'text': "Created", 'value': "created", "align": "center", "width": "1%" },
                    { 'text': "Updated", 'value': "modified", "align": "center", "width": "1%" },
                    { 'text': "Sources", 'value': "sources", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Tags", 'value': "tags", "align": "center", "width": sourceTagColumnWidth, "sortable": false },
                    { 'text': "Owner", 'value': "owner", "align": "center", "width": usernameColumnWidth },
                    { 'text': "Entries", 'value': "entry_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                    { 'text': "Views", 'value': "view_count", "align": "center", "width": "1%", "class": "text-no-wrap" },
                ]
            }
            return IRElementReturnTypes[state.ElementType]
        }
        else {
            return []
        }
    },
};