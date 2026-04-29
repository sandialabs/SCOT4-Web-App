<template>
    <splitpanes horizontal class="default-theme">
        <pane :size="paneSize">
            <v-data-table-server height="100%" style="height: 100%" density="compact" :headers="tableHeaders"
                v-model:items-per-page="itemsPerPage" v-model:page="page" :sort-by="sortBy" :items="tableData"
                :items-length="totalItems" :loading="isLoading" item-value="name" :fixed-header="true" :sticky="true"
                @update:options="GetIRElementData" :items-per-page-options="itemsPerPageOptions">
                <template v-slot:loading v-if="placeholderLoad">
                    <LoadingTable />
                </template>

                <template v-slot:thead>
                    <tr class="table-filter-row">
                        <template v-for="(column, i) in tableHeaders" :key="column.value + i">
                            <td v-if="column.value != 'popularity_count'">
                                <v-autocomplete v-if="column.value == 'status' || column.value == 'task_status'"
                                    class="border-bottom status-autocomplete" @update:model-value="onFilterInput"
                                    hide-details :placeholder="column.title" density="compact" rounded="0"
                                    :items="statusChoices()" clearable v-model="searchObject[column.value]">
                                    <template v-slot:chip="{ props, item }">
                                        <v-chip variant="flat" class="status-chip status-filter" v-bind="props"
                                            :color="(item.raw as any).color" :text="(item.raw as any).value" />
                                    </template>
                                    <template v-slot:item="{ props, item }">
                                        <v-list-item v-bind="props" title="" density="compact">
                                            <v-chip variant="flat" class="status-chip" :color="(item.raw as any).color"
                                                :text="(item.raw as any).value" />
                                        </v-list-item>
                                    </template>
                                </v-autocomplete>
                                <v-combobox v-else-if="column.value == 'sources'" @update:model-value="onFilterInput"
                                    hide-details rounded="0" :placeholder="column.title" chips multiple clearable
                                    closable-chips density="compact" class="border-bottom" :items="sourcesData"
                                    @update:search="GetIRElementSources" v-model="searchObject[column.value]" />
                                <v-combobox v-else-if="column.value == 'tags'" @update:model-value="onFilterInput"
                                    hide-details rounded="0" :placeholder="column.title" density="compact" chips
                                    multiple clearable closable-chips class="border-bottom" :items="tagsData"
                                    @update:search="GetIRElementTags" v-model="searchObject[column.value]" />
                                <v-date-input
                                    v-else-if="column.value == 'created' || column.value == 'occurred_date' || column.value == 'modified'"
                                    @update:model-value="onFilterInput" hide-details rounded="0" prepend-icon=""
                                    density="compact" :placeholder="column.title" class="border-bottom"
                                    label="Select range" multiple="range" clearable
                                    v-model="searchObject[column.value]" />
                                <v-text-field v-else-if="!['task_summary', 'entity_count'].includes(column.value)"
                                    @update:model-value="onFilterInput" hide-details rounded="0"
                                    v-model="searchObject[column.value]" :placeholder="column.title" density="compact"
                                    class="border-bottom" clearable />
                            </td>
                            <td v-else-if="UserPreferences?.showPopularity && column.value == 'popularity_count'"
                                class="filler-td" />
                        </template>
                    </tr>
                </template>

                <template v-slot:item="{ index, item }">
                    <tr class="irelement-row " @click.stop.exact="GetIRElementDataSelected(item)" :id="item['id'] + 'Row'"
                        @click.ctrl.stop.exact="onElementCtrlClick(index)" @click.shift.stop.exact="onElementShiftClick(index)"
                        :key="item['id'] + 'Row-Key'" :class="{ 'selectedRow': item.selected }">
                        <td v-for="(header, i) in tableHeaders" :key="i + item['id']" class="ps-3">
                            <span v-if="header.value == 'status' && currentRouteName == 'alertgroups'">
                                {{ item[header.value] }}
                                <v-chip :color="alertGroupStatusColor(item['open_count'], item['promoted_count'])"
                                        variant="flat" class="status-chip">
                                    <v-icon left>
                                        <FontAwesomeIcon :icon="alertGroupStatusIcon(item['open_count'], item['promoted_count'])" />
                                    </v-icon>
                                    &nbsp;{{ item['open_count'] }}/{{ item['closed_count'] }}/{{
                                        item['promoted_count']
                                    }}
                                </v-chip>
                            </span>
                            <span v-else-if="header.value == 'status' && (currentRouteName == 'events' || currentRouteName == 'incidents' || currentRouteName == 'dispatches' || currentRouteName == 'intels' || currentRouteName == 'vuln_feed' || currentRouteName == 'vuln_track')">
                                <v-chip variant="flat" :color="StatusColor(item['status'])" :text="item[header.value]"
                                        class="status-chip" />
                            </span>
                            <span v-else-if="header.value == 'status'">
                            <v-chip variant="flat" :color="StatusColor(item['status'])"
                                    :text="item[header.value]" class="status-chip" />
                            </span>
                            <span v-else-if="header.value == 'created' || header.value == 'modified' || header.value == 'last_attempt' || header.value == 'last_article'">
                                <span style="white-space: nowrap" v-if="xlAndUp">
                                    {{ DatePipe.ConvertDate(item[header.value]) }}
                                </span>
                                <span style="white-space: nowrap" v-else>
                                    {{ DatePipe.ConvertDate(item[header.value]).split(' ', 1)[0] }}<br />{{
                                        DatePipe.ConvertTime(item[header.value])
                                    }}
                                </span>
                            </span>
                            <span v-else-if="header.value == 'sources'">
                                <v-chip size="small" v-for="source in item['sources']" :key="source" v-tooltip:bottom="source['description']"
                                        class="mx-1 my-1 source-tag-chip" :text="source['name']" @click.prevent.stop="open_link({name: 'sources', params: {id: source['id']}})" />
                            </span>
                            <span v-else-if="header.value == 'tags'">
                                <v-chip size="small" v-for="tag in item['tags']" :key="tag" v-tooltip:bottom="tag['description']"
                                        class="mx-1 my-1 source-tag-chip" :text="tag['name']" @click.prevent.stop="open_link({name: 'tags', params: {id: tag['id']}})" />
                            </span>
                            <span v-else-if="header.value == 'icon'">
                                <v-icon :icon="item[header.value]" />
                            </span>
                            <span v-else-if="header.value == 'task_assignee'">
                                {{ (item as any).entry_data?.assignee }}
                            </span>
                            <span v-else-if="header.value == 'task_summary'" class="text-clip">
                                {{ (item as any).entry_data?.plain_text }}
                            </span>
                            <span v-else-if="header.value == 'task_status'" class="text-clip">
                                <v-chip variant="flat" :color="StatusColor((item as any).entry_data?.status)" :text="(item as any).entry_data?.status"
                                        class="status-chip" />
                            </span>
                            <span v-else-if="header.value == 'popularity_count'">
                                <PopularityElement :voted="item['popularity_voted']" :count="item[header.value]"
                                                   :elementID="item['id']" :elementType="currentRouteName" :queueView="true" />
                            </span>
                            <span v-else-if="header.value == 'classes'">
                                <v-chip v-for="entityClass in item.classes" small :key="entityClass.name"
                                        @click.prevent.stop="open_link({name: IRElementType.EntityClass, params: {id: entityClass['id']}})"
                                        v-tooltip:bottom="entityClass['description']">
                                    <v-icon v-if="entityClass.icon" left>
                                        {{ IconPipe.Vue2TO3IconFormat(entityClass.icon) }}
                                    </v-icon>
                                    <span v-if="entityClass.display_name">
                                        {{ entityClass.display_name }}
                                    </span>
                                    <span v-else>
                                        {{ entityClass.name }}
                                    </span>
                                </v-chip>
                            </span>
                            <span v-else-if="header.value != 'status'">
                                {{ item[header.value] }}
                            </span>
                        </td>
                    </tr>
                </template>

                <template v-slot:[`footer.prepend`]>
                    <div class="footer-prepend-buttons">
                        <v-btn
                            v-if="currentRouteName && !['entities', 'entries', IRElementType.Alertgroup].includes(currentRouteName)"
                            color="primary" class="mx-1" rounded="lg" elevation="1" size="small" variant="outlined"
                            @click="CreateIRElement()" :text="`Create ${textPipe.CapitalizeString(currentRouteName.split('/').pop().replace('_item', '').replace(/_/g, ' '))}`" />
                        <v-btn color="primary" size="small" class="mx-1" @click="exportTableAsCsv()" rounded="lg"
                            elevation="1" variant="outlined" text="Export as CSV" />
                        <v-btn v-if="resetSearch" size="small" color="cyan" class="mx-1" rounded="lg" elevation="1"
                            @click="ResetSearch()" variant="outlined" text="Clear All Filters" />
                        <v-btn size="small" color="green" class="mx-1" rounded="lg" elevation="1" @click="closeSelectedItems"
                            v-if="SelectedItems().length > 1" variant="outlined" text="Close Selected" />
                        <v-btn size="small" color="orange" class="mx-1" rounded="lg" elevation="1" @click="promoteSelectedItems"
                            v-if="SelectedItems().length > 1" variant="outlined" text="Promote Selected" />
                        <v-btn v-if="currentRouteName && currentRouteName == IRElementType.Signature" color="primary" class="mx-1" rounded="lg" elevation="1" size="small" variant="outlined" text="Export as ATT&CK Navigator" @click="exportAttackNavigator"/>
                    </div>
                </template>
            </v-data-table-server>
        </pane>
        <pane v-if="Panes.GetPanesActive" style="z-index: 1000;" :size="100 - paneSize">
            <IRElementSelectedView @SelectedItemReload="selectedItemReload" />
        </pane>
    </splitpanes>
</template>

<script setup lang="ts">
import { ref, watch, reactive, onUnmounted, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingTable from '../components/Loaders/LoadingTable.vue'
import { IRElementType, IRElementAPIPaths, IRElementTypeSingular, IRElementPaths, IRElementAPIPathsNoSlash } from '../types/irelement'
import { useGET_APIStore, useAuthStore, usePanesStore, usePOST_APIStore, useBusStore, useFirehoseStore, useFlairStore, usePUT_APIStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheckCircle, faExclamationCircle, faEye } from '@fortawesome/free-solid-svg-icons'
import IRElementSelectedView from './ElementSelectedView.vue'
import PopularityElement from '../components/QueueElements/PopularityElement.vue'
import { useDebounceFn } from '@vueuse/core'
import { Splitpanes, Pane } from 'splitpanes'
import { isAxiosError, isCancel } from 'axios'
import { useDisplay } from 'vuetify';
import { useIconPipe, useDatePipe, useTableHeadersPipe, useTextPipe } from '@/pipes';
import { ModelElementPromote } from '../models'


const User = useAuthStore()
const Route = useRoute()
const Router = useRouter()
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const API_PUT = usePUT_APIStore()
const Panes = usePanesStore()
const DatePipe = useDatePipe()
const textPipe = useTextPipe()
const Bus = useBusStore()
const Flair = useFlairStore()
const Firehose = useFirehoseStore()
const { xlAndUp, name: displaySize } = useDisplay()
const { IRElementHeaders } = useTableHeadersPipe()
const IconPipe = useIconPipe()

const currentRouteName = ref()
const currentRouteID = ref(-1)
const tableData = ref([] as any[])
const searchObject: any = reactive({})
const UserPreferences: any = ref({})
const UserData: any = ref({})
const isLoading = ref(true)
const placeholderLoad = ref(true)
const itemsPerPage = ref(50)
const page = ref(1)
const sortBy = ref<any>([])
const totalItems = ref(0)
const sourcesData: any = ref([])
const tagsData: any = ref([])
const resetSearch = ref(false)
const paneSize = ref(100)
let lastElementClicked: number | null = null

const itemsPerPageOptions = [
    { value: 10, title: '10' },
    { value: 25, title: '25' },
    { value: 50, title: '50' },
    { value: 100, title: '100' }
]
const DebouncedRequest = useDebounceFn(() => true, 700)
let elementQueueAbortController: AbortController | null = null

watch(() => Route.name, async (newRouteName) => {
    if (newRouteName != currentRouteName.value) {
        currentRouteName.value = newRouteName
        ResetSearch()
    }
})

watch(() => Route.params.id, async (newRouteId, oldRouteId) => {
    currentRouteID.value = newRouteId ? parseInt(newRouteId as string) : -1

    if (currentRouteID.value != -1) {
        // Select a new row if new id
        const rowIndex = tableData.value.findIndex(row => row.id == currentRouteID.value)
        if (rowIndex != -1 && tableData.value[rowIndex]) {
            tableData.value[rowIndex].selected = true
            lastElementClicked = rowIndex
        }
        paneSize.value = 50
        Panes.ToggleOpenTwoPanes()
    }
    else {
        // Unselect old value if present
        const oldId = oldRouteId ? parseInt(oldRouteId as string) : -1
        if (oldId != -1 && tableData.value) {
            const oldRowIndex = tableData.value.findIndex(row => row.id == oldId)
            if (oldRowIndex != -1 && tableData.value[oldRowIndex]) {
                tableData.value[oldRowIndex].selected = false
            }
        }
        paneSize.value = 100
        Panes.ToggleCloseTwoPanes()
    }
})

watch(User, () => {
    UserPreferences.value = User.GetUserPreferences
})

watch(
    () => Bus.GetReloadQueueView,
    () => GetIRElementData({ page: page.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy }, false)
)

onBeforeMount(() => {
    if (User.GetUser) {
        UserData.value = User.GetUser
        UserPreferences.value = User.GetUserPreferences
    }

    currentRouteName.value = Route.name
    currentRouteID.value = Route.params.id ? parseInt(Route.params.id as string) : -1

    ResetSearch()
    GetIRElementSources()
    GetIRElementTags()

    if (currentRouteID.value != -1) {
        paneSize.value = 50
        Panes.ToggleOpenTwoPanes()
    }
    else {
        paneSize.value = 100
        Panes.ToggleCloseTwoPanes()
    }

    Firehose.$onAction(handleFirehose)
    document.addEventListener("keydown", handleKeyboardShortcuts)
})

onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyboardShortcuts)

})

const tableHeaders = computed(() => {
    if (UserPreferences.value?.showPopularity) {
        return IRElementHeaders(displaySize.value)[currentRouteName.value]
    }
    else {
        return IRElementHeaders(displaySize.value)[currentRouteName.value]?.filter((a: any) => a.value != 'popularity_count')
    }
})

async function handleFirehose({ name, store, args, after, onError }) {
    const event = args[0]
    // We only want to get update events for objects in the list
    if (name == "handleEvent") {
        if (event.what == "update" && event.element_type == IRElementTypeSingular[currentRouteName.value]) {
            // Don't reload the item if it's our selected item, let the selected item component handle that and pass it up
            if (!(event.element_type == IRElementTypeSingular[currentRouteName.value] && event.element_id == currentRouteID.value)) {
                const tableIdx = tableData.value.findIndex((v) => v.id == event.element_id)
                if (tableIdx != -1) {
                    const newItem = await API_GET.GET_IRElementData(IRElementAPIPaths[currentRouteName.value], 0, 1, '-id', { id: event.element_id })
                    if (newItem?.result && newItem.result.length > 0){
                        Object.assign(tableData.value[tableIdx], newItem.result[0])
                    }
                }
            }
        }
        // If there's a create or delete event... we just have to re-retrieve the whole list,
        // there's not a good way to tell if it will affect the list or not
        if (["create", "delete"].includes(event.what) && event.element_type == IRElementTypeSingular[currentRouteName.value]) {
            await GetIRElementData({ page: page.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value }, false)
        }
        // Reload element in list if links to it are created/deleted/updated
        if (event.element_type == IRElementTypeSingular[IRElementType.Link]) {
            let elementId = -1
            let otherType = null
            if (event.v0_type == IRElementTypeSingular[currentRouteName.value]) {
                elementId = event.v0_id
                otherType = event.v1_type
            }
            else if (event.v1_type == IRElementTypeSingular[currentRouteName.value]) {
                elementId = event.v1_id
                otherType = event.v0_type
            }
            // Only update in the queue list if the link was to a tag or a source
            if (elementId != -1 && ["tag", "source"].includes(otherType)) {
                const elementIdx = tableData.value.findIndex((v) => v.id == elementId)
                if (elementIdx != -1) {
                    const newItem = await API_GET.GET_IRElementData(IRElementAPIPaths[currentRouteName.value], 0, 1, '-id', { id: elementId })
                    if (newItem?.result && newItem.result.length > 0){
                        Object.assign(tableData.value[elementIdx], newItem.result[0])
                    }
                }
            }
        }
    }
}

async function onFilterInput() {
    const value = await DebouncedRequest()
    if (value) {
        await GetIRElementData({ page: page.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value }, true)
    }
}

// Fires whenever the selected item reloads itself, reload item in list too if it's there
function selectedItemReload(newItem: any) {
    const tableIdx = tableData.value.findIndex((v) => v.id == currentRouteID.value)
    if (tableIdx != -1) {
        Object.assign(tableData.value[tableIdx], newItem)
    }
}

function ResetSearch() {
    tableHeaders.value.forEach((header: any) => {
        searchObject[header.value] = undefined
    })
    page.value = 1
    itemsPerPage.value = 50
    sortBy.value = []
    resetSearch.value = false
    GetIRElementData({ page: page.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value }, true)
}

async function GetIRElementData({ page, itemsPerPage, sortBy }, placeholder = false) {
    if (elementQueueAbortController) {
        elementQueueAbortController.abort()
        if (placeholderLoad.value || placeholder) {
            placeholderLoad.value = true
        }
        else {
            placeholderLoad.value = false
        }
    }
    else {
        placeholderLoad.value = placeholder
        isLoading.value = true
    }
    // Show reset search button if any values are different from their defaults
    if (page != 1 || sortBy.length != 0 || itemsPerPage != 50) {
        resetSearch.value = true
    }
    else {
        // Also show button if there's anything in any filter box
        resetSearch.value = Object.values(searchObject).filter(a => a !== undefined && a !== null && a !== "").length != 0
    }
    let order = sortBy.length == 1 ? sortBy[0].order : "asc"
    order = order == "asc" ? "+" : "-"
    const skip = (page - 1) * itemsPerPage
    const limit = itemsPerPage
    const sort = sortBy.length == 1 ? `${order}${sortBy[0].key}` : "-id"
    elementQueueAbortController = new AbortController()

    let wasCancelled = false
    await API_GET.GET_IRElementData(IRElementAPIPaths[currentRouteName.value], skip, limit, sort, searchObject, elementQueueAbortController)
        .then((v) => {
            if (!isAxiosError(v)) {
                tableData.value = v.result
                totalItems.value = v.totalCount
                const rowIndex = tableData.value.findIndex(row => row.id == currentRouteID.value)
                if (rowIndex != -1 && tableData.value[rowIndex]) {
                    tableData.value[rowIndex].selected = true
                    lastElementClicked = rowIndex
                }
                else {
                    lastElementClicked = null
                }
            }
            else if (isCancel(v)) {
                wasCancelled = true
            }
        })
        .finally(() => {
            if (!wasCancelled) {
                isLoading.value = false
                elementQueueAbortController = null
            }
        })
}

async function GetIRElementSources(search: string = undefined) {
    await API_GET.GET_IRElementSources(25, search)
        .then((v) => {
            if (!isAxiosError(v)) {
                sourcesData.value = v.result.map((a: any) => a.name)
            }
        })
}

async function GetIRElementTags(search: string = undefined) {
    await API_GET.GET_SearchTags(search)
        .then((v) => {
            if (!isAxiosError(v)) {
                tagsData.value = v.result.map((a: any) => a.name)
            }
        })
}

function GetIRElementDataSelected(row: any, id: any = null) {
    let rowId: number
    id ? rowId = id : rowId = JSON.parse(JSON.stringify(row.id))
    let path = `${IRElementPaths[currentRouteName.value]}`

    // When a new element is selected, unselect ALL rows and select the clicked row
    if (tableData.value && tableData.value.length > 0) {
        tableData.value.forEach((row, idx) => {
            if (row.id == rowId) {
                row.selected = true
                lastElementClicked = idx
            }
            else {
                row.selected = false
            }
        })
    }

    if (currentRouteName.value == IRElementType.Entry) {
        path = `${path}/${row.id}/${row.target_type}/${row.target_id}`
    } else {
        path = `${path}/${rowId}`
    }

    Panes.ToggleOpenTwoPanes()

    Router.push({ path: path })
}

async function onElementCtrlClick(rowIndex: number) {
    // Only support multi-select functions on some element types
    if (currentRouteName.value == IRElementType.Dispatch || currentRouteName.value == IRElementType.Event) {
        // Toggle selected when ctrl-clicking an element
        if (tableData.value && tableData.value.length > 0) {
            tableData.value[rowIndex].selected = !tableData.value[rowIndex].selected
            lastElementClicked = rowIndex
        }
    }
}

async function onElementShiftClick(rowIndex: number) {
    // Only support multi-select functions on some element types
    if (currentRouteName.value == IRElementType.Dispatch || currentRouteName.value == IRElementType.Event) {
        if (tableData.value && tableData.value.length > 0) {
            if (lastElementClicked == null) {
                // If there's not a selected element, just select what's being clicked on
                tableData.value[rowIndex].selected = true
            }
            else {
                const selectTo = lastElementClicked
                const setSelectedTo = !tableData.value[rowIndex].selected
                // Otherwise, set all items between this item and the last-clicked item based on this item's status
                tableData.value.forEach((row, index) => {
                    if (index <= rowIndex && index >= selectTo
                        || index >= rowIndex && index <= selectTo) {
                        row.selected = setSelectedTo
                    }
                })
            }
            lastElementClicked = rowIndex
        }
    }
}


function alertGroupStatusColor(open: number, promoted: number) {
    if (promoted > 0) {
        return 'orange'
    }
    else if (open > 0) {
        return 'red'
    }
    else {
        return 'green'
    }
}

function toolsStatusColor(status: string) {
    if (status == 'enabled' || status == 'current' || status == 'tracked' || status == 'active') {
        return 'green'
    } else if (status == 'untracked' || status == 'paused') {
        return 'red'
    } else {
        return 'red'
    }
}

function alertGroupStatusIcon(open: number, promoted: number) {
    if (promoted > 0) {
        return faExclamationCircle
    }
    else if (open > 0) {
        return faEye
    }
    else {
        return faCheckCircle
    }
}

function StatusColor(status: string) {
    switch (status) {
        case "open":
        case "disabled":
        case "untracked":
        case "paused":
        case "outdated":
            return "red"
        case "closed":
        case "enabled":
        case "tracked":
        case "active":
        case "current":
            return "green"
        case "promoted":
        case "assigned":
            return "orange"
        default:
            return "white"
    }
}

function statusChoices(): any {
    if (currentRouteName.value == IRElementType.Signature) {
        return [
            { value: 'enabled', text: 'Enabled', color: 'green' },
            { value: 'disabled', text: 'Disabled', color: 'red' }
        ]
    }
    else if (currentRouteName.value == IRElementType.Entity) {
        return [
            { value: 'tracked', text: 'Tracked', color: 'green' },
            { value: 'untracked', text: 'Untracked', color: 'red' },
        ]
    }
    else if (currentRouteName.value == IRElementType.Feed) {
        return [
            { value: 'active', text: 'Active', color: 'green' },
            { value: 'paused', text: 'Paused', color: 'red' },
        ]
    }
    else if (currentRouteName.value == IRElementType.Guide) {
        return [
            { value: 'current', text: 'Current', color: 'green' },
            { value: 'outdated', text: 'Outdated', color: 'red' },
        ]
    }
    else if (currentRouteName.value == IRElementType.Entry) {
        return [
            { value: 'open', text: 'Open', color: 'red' },
            { value: 'assigned', text: 'Assigned', color: 'amber' },
            { value: 'closed', text: 'Closed', color: 'green' }
        ]
    }
    else if (currentRouteName.value == IRElementType.VulnFeed) {
        return [
            { value: 'promoted', text: 'Promoted', color: 'amber' },
            { value: 'open', text: 'Open', color: 'red' },
            { value: 'closed', text: 'Closed', color: 'green' },
        ]
    }
    else if (currentRouteName.value == IRElementType.VulnTrack) {
        return [
            { value: 'promoted', text: 'Promoted', color: 'amber' },
            { value: 'open', text: 'Open', color: 'red' },
            { value: 'closed', text: 'Closed', color: 'green' },
        ]
    }
    else {
        return [
            { value: 'promoted', text: 'Promoted', color: 'amber' },
            { value: 'open', text: 'Open', color: 'red' },
            { value: 'closed', text: 'Closed', color: 'green' }
        ]
    }
}

async function CreateIRElement() {
    placeholderLoad.value = false
    isLoading.value = true
    await API_POST.POST_CreateIRElement(IRElementAPIPaths[currentRouteName.value], { owner: UserData.username })
        .then((v: any) => {
            GetIRElementData({ page: page.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value }, false)
            GetIRElementDataSelected({}, v.id)
        })
        .finally(() => {
            isLoading.value = false
        })
}

function SelectedItems() {
    return tableData?.value.filter((row: any) => row.selected)
}

async function exportTableAsCsv() {
    const headers = Object.keys(tableData.value[0])
    let csv = headers.join(",") + "\n"
    tableData.value.forEach(row => {
        const values = headers.map((header: any) => {
            if (Array.isArray(row[header]) || typeof row[header] === 'object') {
                return `"${JSON.stringify(row[header])}"`
            }
            else if (row[header] === null) {
                return "None"
            }
            else {
                return row[header]
            }
        })
        csv += values.join(",") + "\n"
    })
    var hiddenElement = document.createElement("a");
    hiddenElement.href = 'data:attachment/csv,' + encodeURI(csv)
    hiddenElement.target = '_blank'
    hiddenElement.download = `${currentRouteName.value}.csv`
    hiddenElement.click();
}

function handleKeyboardShortcuts(e: KeyboardEvent) {
    if (e.target && (e.target as HTMLElement).tagName == 'BODY' && !(e.metaKey || e.altKey || e.ctrlKey) && !e.repeat) {
        if (e.key == 'f' && Panes.GetPanesActive) {
            //Panes.ToggleFullScreen()
            if (paneSize.value == 0) {
                paneSize.value = 50
            }
            else {
                paneSize.value = 0
            }
        }
        if (e.key == 't') {
            Flair.ToggleFlair()
        }
        if (e.key == 'j') {
            shortCutElement(true)
        }
        if (e.key == 'k') {
            shortCutElement()
        }
    }
}

function shortCutElement(next = false) {
    let currentSelectedId = computed(() => Route.params.id)
    if (tableData.value.length > 0) {
        tableData.value.forEach((row, idx) => {
            if (row.id == currentSelectedId.value) {
                if (idx == 0 && !next || idx == itemsPerPage.value && next) {

                } else {
                    next ? GetIRElementDataSelected(tableData.value[idx + 1]) : GetIRElementDataSelected(tableData.value[idx - 1])
                }

            }
        })
    }
}

function open_link(route: any) {
    window.open(Router.resolve(route).href, "_blank")
}

async function closeSelectedItems() {
    API_PUT.UpdateManyElementsByIds(IRElementAPIPaths[currentRouteName.value], SelectedItems().map(row => row.id), { status: 'closed' })
        .then((v: any[]) => {
            for (const element of v) {
                const tableElem = tableData.value.find(row => row.id == element.id)
                if (tableElem) {
                    Object.assign(tableElem, element)
                }
            }
        })
}

async function promoteSelectedItems() {
    const source = IRElementAPIPathsNoSlash[currentRouteName.value]
    const sourceIds = SelectedItems().map(row => row.id)

    const promotionTargetMap: Record<string, string> = {
        "alert": "event",
        "event": "incident",
        "dispatch": "intel",
        "vuln_feed": "vuln_track",
    }

    await API_POST.POST_PromoteElements(new ModelElementPromote(
        promotionTargetMap[source],
        undefined,
        undefined,
        undefined,
        sourceIds.map(element => {
            return { type: source, id: element }
        })
    ))
}

async function exportAttackNavigator() {
    await API_GET.GET_DownloadAttackNavigator(currentRouteName.value, searchObject)
}
</script>

<style scoped>
.scot-theme-light .selectedRow {
    background-color: skyblue !important;
}

.scot-theme-dark .selectedRow {
    background-color: steelblue !important;
}

.selectedRow:hover {
    cursor: pointer
}

.notSelectedRow:hover {
    cursor: pointer
}

.scot-theme-light tbody tr:nth-of-type(even) {
    background-color: rgba(247, 247, 247);
}

.scot-theme-dark tbody tr:nth-of-type(even) {
    background-color: rgba(0, 0, 0)
}

.status-chip {
    width: 100%;
    justify-content: center;
    height: 90%;
}

.scot-theme-light .status-chip {
    color: black !important;
}

.v-chip.source-tag-chip {
    padding: 0 4px;
    margin: 0 !important;
}

.v-chip.status-filter {
    padding: 0 4px;
    margin: 0 !important;
}

:deep(.status-autocomplete .v-field__input) {
    padding-left: 4px;
    padding-right: 4px;
}

.scot-theme-light .table-filter-row {
    position: sticky;
    top: 40px;
    z-index: 1;
    background-color: #f6f6f6;
}

.scot-theme-dark .table-filter-row {
    position: sticky;
    top: 40px;
    z-index: 1;
    background-color: #2a2a2a;
}

.v-chip.source-tag-chip {
    padding: 0 4px;
    margin: 0 !important;
}
</style>
