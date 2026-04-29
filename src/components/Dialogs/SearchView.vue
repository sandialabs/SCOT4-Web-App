<template>
    <v-card rounded outlined elevation="5" class="d-flex flex-column overflow-y-auto" id="searchCard" @keydown="onSearchKeyDown">
        <div class="d-flex justify-space-between">
            <div style="width: 12.5%">
                <v-card-title class="text-decoration-underline">Search Results</v-card-title>
                <v-card-subtitle> {{ searchResults?.length }} results </v-card-subtitle>
            </div>
            <div style="width: 75%" class="align-self-center pa-1">
                <v-text-field hide-details
                              clearable
                              prepend-icon="mdi-magnify"
                              variant="outlined"
                              v-model="searchTerm"
                              :loading="currentlySearching"
                              @click:prepend="GetSearchResults(searchTerm)"
                              single-line></v-text-field>
                <a v-if="!showSearchOptions" @click.stop="showSearchOptions = true" style="cursor: pointer">Show Options<v-icon small>mdi-chevron-down</v-icon></a>
                <div v-if="showSearchOptions">
                    <a @click.stop="showSearchOptions = false" style="cursor: pointer">Hide Options<v-icon small>mdi-chevron-up</v-icon></a>
                    <v-row dense max-height="100px">
                        <v-col>
                            <v-row no-gutters><v-col class="d-flex justify-center">Parent Type</v-col></v-row>
                            <v-row no-gutters class="d-flex justify-center flex-wrap overflow-hidden">
                                <v-checkbox v-for="s,k in searchTypeChoices" density="compact" hide-details class="pr-2 pt-0 mt-0 type-checkbox" v-model="searchTypes" :value="k" :key="k">
                                    <template v-slot:label>
                                        {{ s }}
                                    </template>
                                </v-checkbox>
                            </v-row>
                        </v-col>
                        <v-col>
                            <v-row dense>
                                <v-col>
                                    <v-row no-gutters><v-col class="d-flex justify-center">Date Range</v-col></v-row>
                                    <v-row no-gutters>
                                        <v-col class="d-flex justify-space-between">
                                            <v-menu :close-on-content-click="false"
                                                    transition="scale-transition"
                                                    offset-y
                                                    min-width="auto"
                                                    attach="#searchCard">
                                                <template v-slot:activator="{ props }">
                                                    <v-text-field v-model="dateFrom" density="compact" variant="outlined" hide-details class="range-box" v-bind="props"></v-text-field>
                                                </template>
                                                <v-date-picker v-model="dateFrom"
                                                               no-title
                                                               scrollable>
                                                </v-date-picker>
                                            </v-menu>
                                            <span class="align-self-center">to</span>
                                            <v-menu :close-on-content-click="false"
                                                    transition="scale-transition"
                                                    offset-y
                                                    min-width="auto"
                                                    attach="#searchCard">
                                                <template v-slot:activator="{ props }">
                                                    <v-text-field v-model="dateTo" density="compact" variant="outlined" hide-details class="range-box" v-bind="props"></v-text-field>
                                                </template>
                                                <v-date-picker v-model="dateTo"
                                                               no-title
                                                               scrollable>
                                                </v-date-picker>
                                            </v-menu>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                            <v-row dense class="mt-3">
                                <v-col>
                                    <v-row no-gutters>
                                        <v-col class="d-flex justify-center">Owner</v-col>
                                        <v-col class="d-flex justify-center text-center">Popularity Score</v-col>
                                    </v-row>
                                    <v-row no-gutters>
                                        <v-col class="pr-2 d-flex justify-space-between">
                                            <v-text-field v-model="ownerFilter" density="compact" variant="outlined" hide-details></v-text-field>
                                        </v-col>
                                        <v-col class="pl-2 d-flex justify-space-between">
                                            <v-text-field v-model="popularityFrom" density="compact" variant="outlined" hide-details class="range-box"></v-text-field>
                                            <span class="align-self-center">to</span>
                                            <v-text-field v-model="popularityTo" density="compact" variant="outlined" hide-details class="range-box"></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col cols="auto">
                            <v-row no-gutters><v-col class="d-flex justify-center">Sorting</v-col></v-row>
                            <v-row no-gutters>
                                <v-col style="width: 10em">
                                    <v-list v-model:selected="sortChoiceSelected" select-strategy="single-leaf" class="list-group">
                                        <v-list-item :value="s" density="compact" style="min-height: 24px" v-for="s in sortChoices" :key="s" class="px-2 py-0">{{searchAttributes[s]}}</v-list-item>
                                    </v-list>
                                </v-col>
                                <v-col cols="auto" class="d-flex justify-center flex-column">
                                    <v-btn icon density="comfortable" class="mb-2" @click="addSortClick"><v-icon>mdi-chevron-right</v-icon></v-btn>
                                    <v-btn icon density="comfortable" @click="removeSortClick"><v-icon>mdi-chevron-left</v-icon></v-btn>
                                </v-col>
                                <v-col style="width: 17em">
                                    <v-list v-model:selected="sortAppliedSelected" select-strategy="single-leaf" class="list-group" v-if="sortApplied.length > 0">
                                        <v-list-item :value="s" style="min-height: 24px;" density="compact" v-for="s in sortApplied" :key="s" class="px-2 py-0 sort-applied-item">
                                            {{searchAttributes[s]}}
                                            <v-spacer></v-spacer>
                                            <v-tooltip top>
                                                <template v-slot:activator="{ props }">
                                                    <span v-bind="props">
                                                        <v-switch v-model="sortAppliedDesc" color="primary" density="compact" hide-details class="mt-0" :value="s">
                                                            <template v-slot:label>
                                                                <v-icon class="ml-n1">mdi-sort-ascending</v-icon>
                                                            </template>
                                                        </v-switch>
                                                    </span>
                                                </template>
                                                <span>Sort Descending</span>
                                            </v-tooltip>
                                        </v-list-item>
                                    </v-list>
                                    <v-list multiple max="0" class="list-group" v-else>
                                        <v-list-item style="min-height: 24px" density="compact">
                                            &lt;no sort fields&gt;
                                        </v-list-item>
                                    </v-list>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </div>
            </div>
            <div style="width: 12.5%"></div><!-- Needed for flex alignment, don't remove-->
        </div>
        <v-list two-line v-if="searchResults != undefined" class="overflow-y-auto">
            <v-list-item v-for="(result, index) in searchResults" :key="result.entry_id" :href="constructSearchLink(result.target_type, result.target_id, result.entry_id)" :link=true target="_blank">
                <template v-slot:prepend>
                    <v-icon>mdi-magnify</v-icon>
                </template>
                <v-list-item-title class="text-decoration-underline">
                    {{ result.target_type.charAt(0).toUpperCase() + result.target_type.slice(1) + ' ' + result.target_id + ':'}}
                    <span v-for="segment,idx in getMarkSegments(result.parent_text)" :key="idx">
                        <mark v-if="idx%2 == 1">{{segment}}</mark>
                        <span v-else>{{segment}}</span>
                    </span>
                </v-list-item-title>
                <v-list-item-subtitle>
                    <i v-if="result.target_type == 'alertgroup'">
                        {{ "Alert " }}<b>{{ result.entry_id }}</b> - {{ transformDate(result.modified*1000) }}
                    </i>
                    <i v-else>
                        {{ "Entry " }}<b>{{ result.entry_id }}</b> - {{ transformDate(result.modified*1000) }}
                    </i>
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                    <span v-for="segment,idx in getMarkSegments(result.entry_text)" :key="idx">
                        <mark v-if="idx%2 == 1">{{segment}}</mark>
                        <span v-else>{{segment}}</span>
                    </span>
                </v-list-item-subtitle>
                <v-divider inset
                            v-if="index < searchResults.length - 1"
                            :key="index"></v-divider>
            </v-list-item>
        </v-list>
        <LoadingTable v-else-if="currentlySearching"></LoadingTable>
    </v-card>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { usePOST_APIStore } from '@/stores'
import { useDialogStore, useSearchStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faClose, faSearch } from '@fortawesome/free-solid-svg-icons'
import LoadingTable from '../Loaders/LoadingTable.vue'
import { storeToRefs } from 'pinia'
import { IRElementType } from '../../types/irelement'
import { useTextPipe } from '../../pipes'

const API_POST = usePOST_APIStore()
const Dialog = useDialogStore()
const Search = useSearchStore()
const textPipe = useTextPipe()
const { dateFrom, dateTo, popularityFrom, popularityTo, sortApplied,
        sortAppliedDesc, ownerFilter, showSearchOptions, searchTypes } = storeToRefs(Search)

let incomingSearchProps = defineProps(['search'])
let searchResults = ref()
const searchTerm = ref('')
const currentlySearching = ref(false)
const searchTypeChoices: any = {
    "alertgroup": "Alertgroup",
    "event": "Event",
    "incident": "Incident",
    "dispatch": "Dispatch",
    "intel": "Intel",
    "product": "Product",
    "signature": "Signature",
    "entity": "Entity",
    "vuln_feed": "Vuln Feed",
    "vuln_track": "Vuln Track"
}
const searchAttributes: any = {
    "entry_id": "Entry/Alert ID",
    "target_type": "Parent Type",
    "target_id": "Parent ID",
    "created": "Created Date",
    "modified": "Last Modified Date",
    "owner": "Owner",
    "popularity_count": "Popularity"
}
const sortChoices = ref(Object.keys(searchAttributes))
const sortChoiceSelected: Ref<string | null> = ref(null)
const sortAppliedSelected: Ref<string | null> = ref(null)

onMounted(() => {
    searchTerm.value = incomingSearchProps.search.value
    if (searchTypes.value.length == 0) {
        searchTypes.value = Object.keys(searchTypeChoices)
    }
    GetSearchResults(searchTerm.value)
})

onUnmounted(() => {
    searchResults.value = []
})

function onSearchInput() {
    searchTerm.value.length >= 3 ? GetSearchResults(searchTerm.value) : null
}

async function onSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && currentlySearching.value === false) {
        e.preventDefault()
        await GetSearchResults(searchTerm.value)
    }
}

function addSortClick() {
    if (sortChoiceSelected.value) {
        sortApplied.value.push(sortChoiceSelected.value)
        sortChoices.value.splice(sortChoices.value.findIndex((val) => val == sortChoiceSelected.value), 1)
        sortChoiceSelected.value = null
    }
}

function getMarkSegments(s: string) {
    if (!s) {
        return [""]
    }
    if (typeof s != 'string') {
        s = JSON.stringify(s)
    }
    const segments = []
    var prevIdx = 0
    var markIdx = s.indexOf("<mark>")
    while (markIdx != -1) {
        const closeIdx = s.indexOf("</mark>", markIdx)
        if (closeIdx != -1) {
            const unmarkedSegment = s.substring(prevIdx, markIdx)
            const markedSegment = s.substring(markIdx + 6, closeIdx)
            segments.push(unmarkedSegment, markedSegment)
            prevIdx = closeIdx + 7
            markIdx = s.indexOf("<mark>", prevIdx)
        }
        else {
            break
        }
    }
    segments.push(s.substring(prevIdx))
    return segments
}

function transformDate(dateIn: number) {
    const date: any = new Date(dateIn)
    const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
    return date.toLocaleDateString(undefined, options) + " " + date.toLocaleTimeString('en-US')
}

function removeSortClick() {
    if (sortAppliedSelected.value) {
        const origIndex = Object.keys(searchAttributes).indexOf(sortAppliedSelected.value)
        var spliceIndex = -1
        for (const choice of sortChoices.value) {
            const itemIndex = Object.keys(searchAttributes).indexOf(choice)
            if (itemIndex > origIndex) {
                spliceIndex = sortChoices.value.indexOf(choice)
                break
            }
        }
        if (spliceIndex == -1) {
            sortChoices.value.push(sortAppliedSelected.value)
        }
        else {
            sortChoices.value.splice(spliceIndex, 0, sortAppliedSelected.value)
        }
        sortApplied.value.splice(sortApplied.value.findIndex((val) => val == sortAppliedSelected.value), 1)
        sortAppliedSelected.value = null
    }
}

async function GetSearchResults(searchTerm: string) {
    currentlySearching.value = true
    const extraFilters: any = {}
    var sort: string | undefined = undefined
    if (dateFrom.value || dateTo.value) {
        const MAX_DATE = "9999-12-31T23:59:59Z" // Maximum python datetime
        const MIN_DATE = new Date(0).toISOString() // Epoch
        if (!dateFrom.value) {
            extraFilters['modified'] = '(' + MIN_DATE + ',' + dateTo.value.toISOString() + ')'
        }
        else if (!dateTo.value) {
            extraFilters['modified'] = '(' + dateFrom.value.toISOString() + ',' + MAX_DATE + ')'
        }
        else {
            extraFilters['modified'] = '(' + dateFrom.value.toISOString() + ',' + dateTo.value.toISOString() + ')'
        }
    }
    if (popularityFrom.value || popularityTo.value) {
        const MAX_POP = Math.pow(2, 31) - 1
        const MIN_POP = -Math.pow(2, 31)
        if (!popularityFrom.value) {
            extraFilters['popularity_count'] = '(' + MIN_POP + ',' + popularityTo.value + ')'
        }
        else if (!popularityTo.value) {
            extraFilters['popularity_count'] = '(' + popularityFrom.value + ',' + MAX_POP + ')'
        }
        else {
            extraFilters['popularity_count'] = '(' + popularityFrom.value + ',' + popularityTo.value + ')'
        }
    }
    if (searchTypes.value.length > 0 && searchTypes.value.length < Object.keys(searchTypeChoices).length) {
        extraFilters['target_type'] = '[' + searchTypes.value.toString() + ']'
    }
    if (ownerFilter.value && ownerFilter.value.length > 0) {
        extraFilters['owner'] = ownerFilter.value
    }
    if (sortApplied.value.length > 0) {
        sort = '['
        for (const sortItem of sortApplied.value) {
            if (sortAppliedDesc.value.includes(sortItem)) {
                sort += '-' + sortItem + ','
            }
            else {
                sort += sortItem + ','
            }
        }
        sort = sort.slice(0, -1) + ']'
    }
    searchResults.value = await API_POST.POST_Search({ text: searchTerm, sort, ...extraFilters })
    currentlySearching.value = false
}

function constructSearchLink(targetType: string, targetId: number, entryId: number): string {
    // return "https://" + window.location.host + "/" + targetTypePluralized(targetType) + "/" + targetId + "/" + entryId
    return window.location.protocol + "//" + window.location.host + "/#/" + textPipe.PluralizeString(targetType) + "/" + targetId + "/" + entryId
}

</script>
<style scoped>
    .range-box {
        max-width: 43%;
        align-self: center;
    }

    .list-group {
        height: 120px;
        overflow: auto;
    }

    .list-item {
        max-height: 24px;
    }

    .sort-applied-item :deep(.v-list-item__content) {
        display: flex;
        align-items: center;
    }
</style>