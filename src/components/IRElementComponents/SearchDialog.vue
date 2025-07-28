<template>
    <v-dialog :value="showSearchOverlay" content-class="overflow-visible" overlay-opacity=".7">
        <v-card rounded dark outlined v-click-outside="onClickOutsideOverlay" elevation="5" class="d-flex flex-column overflow-y-auto" id="searchCard" @keydown="onSearchKeyDown">
            <div class="d-flex justify-space-between">
                <div style="width: 20%">
                    <v-card-title class="text-decoration-underline">Search Results</v-card-title>
                    <v-card-subtitle> {{ searchResults?.length }} results </v-card-subtitle>
                </div>
                <div style="width: 60%" class="align-self-center">
                    <v-text-field hide-details
                                  clearable
                                  prepend-icon="mdi-magnify"
                                  v-model="searchInput"
                                  :loading="currentlySearching"
                                  single-line></v-text-field>
                    <a v-if="!showSearchOptions" @click.stop="showSearchOptions = true">Show Options<v-icon small>mdi-chevron-down</v-icon></a>
                    <div v-if="showSearchOptions">
                        <a @click.stop="showSearchOptions = false">Hide Options<v-icon small>mdi-chevron-up</v-icon></a>
                        <v-row dense max-height="100px">
                            <v-col>
                                <v-row no-gutters><v-col class="d-flex justify-center">Parent Type</v-col></v-row>
                                <v-row no-gutters class="d-flex justify-center flex-wrap overflow-hidden">
                                    <v-checkbox v-for="s,k in searchTypeChoices" dense hide-details class="pr-2 pt-0" v-model="searchTypes" :value="k" :key="k">
                                        <template v-slot:label>
                                            <span class="ml-n2">{{ s }}</span>
                                        </template>
                                    </v-checkbox>
                                </v-row>
                            </v-col>
                            <v-col>
                                <v-row dense>
                                    <v-col>
                                        <v-row no-gutters><v-col class="d-flex justify-center">Date Range</v-col></v-row>
                                        <v-row no-gutters class="mt-n2">
                                            <v-col class="d-flex justify-space-between">
                                                <v-menu :close-on-content-click="false"
                                                        transition="scale-transition"
                                                        offset-y
                                                        min-width="auto"
                                                        attach="#searchCard">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field v-model="dateFrom" dense hide-details class="range-box" v-on="on" v-bind="attrs"></v-text-field>
                                                    </template>
                                                    <v-date-picker v-model="dateFrom"
                                                                   no-title
                                                                   scrollable>
                                                    </v-date-picker>
                                                </v-menu>
                                                <span class="align-self-end">to</span>
                                                <v-menu :close-on-content-click="false"
                                                        transition="scale-transition"
                                                        offset-y
                                                        min-width="auto"
                                                        attach="#searchCard">
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <v-text-field v-model="dateTo" dense hide-details class="range-box" v-on="on" v-bind="attrs"></v-text-field>
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
                                        <v-row no-gutters class="mt-n2">
                                            <v-col class="pr-2 d-flex justify-space-between">
                                                <v-text-field v-model="ownerFilter" dense hide-details></v-text-field>
                                            </v-col>
                                            <v-col class="pl-2 d-flex justify-space-between">
                                                <v-text-field v-model="popularityFrom" dense hide-details class="range-box"></v-text-field>
                                                <span class="align-self-end">to</span>
                                                <v-text-field v-model="popularityTo" dense hide-details class="range-box"></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-col>
                            <v-col cols="auto">
                                <v-row no-gutters><v-col class="d-flex justify-center">Sorting</v-col></v-row>
                                <v-row no-gutters>
                                    <v-col style="width: 10em">
                                        <v-list-item-group v-model="sortChoiceSelected" class="list-group">
                                            <v-list-item :value="s" dense style="min-height: 24px" v-for="s in sortChoices" :key="s" class="px-2">{{searchAttributes[s]}}</v-list-item>
                                        </v-list-item-group>
                                    </v-col>
                                    <v-col cols="auto" class="d-flex justify-center flex-column">
                                        <v-btn icon @click="addSortClick"><v-icon>mdi-chevron-right</v-icon></v-btn>
                                        <v-btn icon @click="removeSortClick"><v-icon>mdi-chevron-left</v-icon></v-btn>
                                    </v-col>
                                    <v-col style="width: 14em">
                                        <v-list-item-group v-model="sortAppliedSelected" class="list-group" v-if="sortApplied.length > 0">
                                            <v-list-item :value="s" style="min-height: 24px;" dense v-for="s in sortApplied" :key="s" class="px-2">
                                                {{searchAttributes[s]}}
                                                <v-spacer></v-spacer>
                                                <v-tooltip top>
                                                    <template v-slot:activator="{ on, attrs }">
                                                        <span v-bind="attrs" v-on="on">
                                                            <v-switch v-model="sortAppliedDesc" dense hide-details class="mt-0" :value="s">
                                                                <template v-slot:label>
                                                                    <v-icon class="ml-n2">mdi-sort-descending</v-icon>
                                                                </template>
                                                            </v-switch>
                                                        </span>
                                                    </template>
                                                    <span>Sort Descending</span>
                                                </v-tooltip>
                                            </v-list-item>
                                        </v-list-item-group>
                                        <v-list-item-group multiple max="0" class="list-group" v-else>
                                            <v-list-item style="min-height: 24px" dense>
                                                &lt;no sort fields&gt;
                                            </v-list-item>
                                        </v-list-item-group>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </div>
                </div>
                <div style="width: 20%"></div><!-- Needed for flex alignment, don't remove-->
            </div>
            <v-list two-line v-if="searchResults != undefined" class="overflow-y-auto">
                <v-list-item v-for="(result, index) in searchResults" :key="result.entry_id" :href="constructSearchLink(result.target_type, result.target_id, result.entry_id)" :link=true target="_blank">
                    <v-list-item-icon>
                        <v-icon> mdi-magnify</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
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
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-card>
    </v-dialog>
</template>


<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Action, Getter } from 'vuex-class';
import { Watch } from 'vue-property-decorator'
import { IRElementType } from '@/store/modules/IRElements/types';

@Component({
    components: {
    },
})
export default class SearchDialog extends Vue {
    @Getter('darkMode', { 'namespace': 'user' }) darkMode: boolean
    @Getter('searchResults', { 'namespace': 'user' }) searchResults: any
    @Getter('searchText', { 'namespace': 'user' }) searchText: any
    @Getter('showSearchOverlay', { 'namespace': 'user' }) showSearchOverlay: boolean
    @Action('changeShowSearchOverlay', { 'namespace': 'user' }) changeShowSearchOverlay: CallableFunction
    @Action('clearSearchResults', { 'namespace': 'user' }) clearSearchResults: CallableFunction
    @Action('performTextSearch', { 'namespace': 'user' }) performTextSearch: CallableFunction

    showSearchOptions: boolean = false
    searchInput: string = ''
    currentlySearching: boolean = false
    searchTypeChoices: any = {
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
    searchAttributes: any = {
        "entry_id": "Entry/Alert ID",
        "target_type": "Parent Type",
        "target_id": "Parent ID",
        "created": "Created Date",
        "modified": "Last Modified Date",
        "owner": "Owner",
        "popularity_count": "Popularity"
    }
    dateFrom: string | null = null
    dateTo: string | null = null
    popularityFrom: string | null = null
    popularityTo: string | null = null
    sortChoices: Array<string> = Object.keys(this.searchAttributes)
    sortApplied: Array<string> = []
    sortAppliedDesc: Array<string> = []
    sortChoiceSelected: string | null = null
    sortAppliedSelected: string | null = null
    searchTypes: Array<string> = Object.keys(this.searchTypeChoices)
    ownerFilter: string = ""

    addSortClick() {
        if (this.sortChoiceSelected) {
            this.sortApplied.push(this.sortChoiceSelected)
            this.sortChoices.splice(this.sortChoices.findIndex((val) => val == this.sortChoiceSelected), 1)
        }
    }

    getMarkSegments(s: string) {
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

    transformDate(dateIn: number) {
        const date: any = new Date(dateIn)
        const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
        return date.toLocaleDateString(undefined, options) + " " + date.toLocaleTimeString('en-US')
    }

    removeSortClick() {
        if (this.sortAppliedSelected) {
            const origIndex = Object.keys(this.searchAttributes).indexOf(this.sortAppliedSelected)
            var spliceIndex = -1
            for (const choice of this.sortChoices) {
                const itemIndex = Object.keys(this.searchAttributes).indexOf(choice)
                if (itemIndex > origIndex) {
                    spliceIndex = this.sortChoices.indexOf(choice)
                    break
                }
            }
            if (spliceIndex == -1) {
                this.sortChoices.push(this.sortAppliedSelected)
            }
            else {
                this.sortChoices.splice(spliceIndex, 0, this.sortAppliedSelected)
            }
            this.sortApplied.splice(this.sortApplied.findIndex((val) => val == this.sortAppliedSelected), 1)
            if (this.sortApplied.length == 0) {
                this.sortAppliedSelected = null
            }
        }
    }

    async onSearchKeyDown(e: KeyboardEvent) {
        if (e.key === 'Enter' && this.currentlySearching === false) {
            this.currentlySearching = true
            const extraFilters: any = {}
            var sort: string | undefined = undefined
            if (this.dateFrom || this.dateTo) {
                const MAX_DATE = "9999-12-31T23:59:59Z" // Maximum python datetime
                const MIN_DATE = new Date(0).toISOString() // Epoch
                if (!this.dateFrom) {
                    extraFilters['modified'] = '(' + MIN_DATE + ',' + this.dateTo + ')'
                }
                else if (!this.dateTo) {
                    extraFilters['modified'] = '(' + this.dateFrom + ',' + MAX_DATE + ')'
                }
                else {
                    extraFilters['modified'] = '(' + this.dateFrom + ',' + this.dateTo + ')'
                }
            }
            if (this.popularityFrom || this.popularityTo) {
                const MAX_POP = Math.pow(2, 31) - 1
                const MIN_POP = -Math.pow(2, 31)
                if (!this.popularityFrom) {
                    extraFilters['popularity_count'] = '(' + MIN_POP + ',' + this.popularityTo + ')'
                }
                else if (!this.dateTo) {
                    extraFilters['popularity_count'] = '(' + this.popularityFrom + ',' + MAX_POP + ')'
                }
                else {
                    extraFilters['popularity_count'] = '(' + this.popularityFrom + ',' + this.popularityTo + ')'
                }
            }
            if (this.searchTypes.length > 0 && this.searchTypes.length < Object.keys(this.searchTypeChoices).length) {
                extraFilters['target_type'] = '[' + this.searchTypes.toString() + ']'
            }
            if (this.ownerFilter && this.ownerFilter.length > 0) {
                extraFilters['owner'] = this.ownerFilter
            }
            if (this.sortApplied.length > 0) {
                sort = '['
                for (const sortItem of this.sortApplied) {
                    if (this.sortAppliedDesc.includes(sortItem)) {
                        sort += '-' + sortItem + ','
                    }
                    else {
                        sort += sortItem + ','
                    }
                }
                sort = sort.slice(0, -1) + ']'
            }
            console.log(extraFilters)
            await this.performTextSearch({ searchText: this.searchInput, extraFilters, sort })
            this.currentlySearching = false
        }
    }

    mounted() {
        this.searchInput = this.searchText
    }

    constructSearchLink(targetType: string, targetId: number, entryId: number): string {
        return window.location.protocol + "//" + window.location.host + "/#/" + this.targetTypePluralized(targetType) + "/" + targetId + "/" + entryId
    }

    targetTypePluralized(targetType: string): string | null {
        if (targetType == IRElementType.Entity.toLowerCase()) {
            return "entities"
        }
        else if (targetType == IRElementType.Dispatch.toLowerCase()) {
            return "dispatches"
        }
        else if (targetType == IRElementType.EntityClass.toLowerCase()) {
            return "entity classes"
        }
        else if (targetType == IRElementType.Entry.toLowerCase()) {
            return "entries"
        }
        else {
            return targetType + "s"
        }
    }

    async onClickOutsideOverlay() {
        await this.clearSearchResults()
        await this.changeShowSearchOverlay({ value: false })
    }
}
</script>
<style>
    .range-box {
        max-width: 43%;
        align-self: center;
    }

    .list-group {
        height: 85px;
        overflow: auto;
    }

    .list-item {
        max-height: 24px;
    }
</style>
