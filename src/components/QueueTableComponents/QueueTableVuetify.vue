<template>
    <v-data-table :headers="showPopularity ? vuetifyQueueTableColumns : vuetifyQueueTableColumns?.filter(a => a.value != 'popularity_count')"
                  :items="vuetifyQueueTableRows"
                  :single-select=true
                  :fixed-header=true
                  :items-per-page="elementListItemsPerPage"
                  :id="elementTypePluralized + 'Queue'"
                  height="90%"
                  dense
                  :server-items-length=totalElementListCount
                  :sort-by="elementListSortBy"
                  :sort-desc="elementListSortDesc"
                  :page="elementListPage"
                  @update:page=onPageChange
                  @update:items-per-page=onLimitChange
                  @update:sort-by="sortColumnChanged"
                  @update:sort-desc="sortDescChanged"
                  :footer-props="{'items-per-page-text': `${elementTypePluralized.replace('_', ' ')} per page`, 'items-per-page-options':[10,25,50,100], 'show-first-last-page':true, 'show-current-page':true }">
        <template v-slot:top>
            <v-progress-linear indeterminate v-if="retrievingElements"></v-progress-linear>
        </template>
        <template v-slot:body="{ items, headers }">
            <tbody>
                <tr>
                    <td v-for="header in headers" :key="elementType + header.text" class="filter-cell">
                        <div v-if="header.value == 'popularity_count'"></div>
                        <v-autocomplete v-else-if="header.value == 'status' || header.value == 'task_status'"
                                        class="status-filter"
                                        dense hide-details chips clearable
                                        :items="statusChoices()"
                                        @click:clear="onFilterInput('', header.value)"
                                        @change="onFilterInput($event, header.value)"
                                        :placeholder="header.text"
                                        :value="filterText">
                            <template v-slot:selection="data">
                                <v-chip v-bind="data.attrs"
                                        class="status-chip" dense
                                        :input-value="data.selected"
                                        :color="data.item.color">
                                    {{ data.item.value }}
                                </v-chip>
                            </template>
                            <template v-slot:item="data">
                                <v-list-item-content>
                                    <v-chip v-bind="data.attrs"
                                            class="status-chip py-2" dense
                                            :input-value="data.selected"
                                            :color="data.item.color">
                                        {{ data.item.value }}
                                    </v-chip>
                                </v-list-item-content>
                            </template>
                        </v-autocomplete>
                        <v-combobox v-else-if="header.value == 'sources'"
                                    dense hide-details chips small-chips multiple clearable
                                    :items="sourceFilterOptions"
                                    item-text="name"
                                    item-value="name"
                                    :return-object="false"
                                    :placeholder="header.text"
                                    :loading="sourceFilterLoading"
                                    :search-input.sync="sourceFilterSearch"
                                    @click:clear="onFilterInput('', header.value)"
                                    @change="onFilterInput($event, header.value)"
                                    :value="filterText">
                        </v-combobox>
                        <v-combobox v-else-if="header.value == 'tags'"
                                    dense hide-details chips small-chips multiple clearable
                                    :items="tagFilterOptions"
                                    item-text="name"
                                    item-value="name"
                                    :return-object="false"
                                    :placeholder="header.text"
                                    :loading="tagFilterLoading"
                                    :search-input.sync="tagFilterSearch"
                                    @click:clear="onFilterInput('', header.value)"
                                    @change="onFilterInput($event, header.value)"
                                    :value="filterText">
                        </v-combobox>
                        <v-combobox v-else-if="header.value == 'classes'"
                                    dense hide-details chips small-chips multiple clearable
                                    :items="entityClassFilterOptions"
                                    item-text="name"
                                    item-value="name"
                                    :return-object="true"
                                    :placeholder="header.text"
                                    :loading="entityClassFilterLoading"
                                    :search-input.sync="entityClassFilterSearch"
                                    @click:clear="onFilterInput('', header.value)"
                                    @change="onFilterInput($event, header.value)"
                                    :value="filterText">
                            <template v-slot:selection="{item, disabled, select}">
                                <v-chip small
                                        :key="item.name"
                                        :disabled="disabled"
                                        @click="select">
                                    <v-icon v-if="item.icon" left>
                                        {{ item.icon }}
                                    </v-icon>
                                    <span v-if="item.display_name">
                                        {{ item.display_name }}
                                    </span>
                                    <span v-else>
                                        {{ item }}
                                    </span>
                                </v-chip>
                            </template>
                            <template v-slot:item="{item, on, attrs}">
                                <v-list-item v-on="on" v-bind="attrs" color="primary">
                                    <v-icon class="pr-2">
                                        {{item.icon}}
                                    </v-icon>
                                    {{item.display_name}}
                                </v-list-item>
                            </template>
                        </v-combobox>
                        <v-menu v-else-if="header.value == 'created' || header.value == 'occurred_date'"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-combobox v-model="createdDateRange"
                                            multiple
                                            chips
                                            small-chips
                                            dense
                                            hide-details
                                            readonly
                                            clearable
                                            :placeholder="header.text"
                                            v-bind="attrs"
                                            @click:clear="onFilterInput('', header.value)"
                                            v-on="on"></v-combobox>
                            </template>
                            <v-date-picker v-model="createdDateRange"
                                           range
                                           no-title
                                           @input="onDateInput($event, header.value)"
                                           scrollable>
                            </v-date-picker>
                        </v-menu>
                        <v-menu v-else-if="header.value == 'modified'"
                                :close-on-content-click="false"
                                transition="scale-transition"
                                offset-y
                                min-width="auto">
                            <template v-slot:activator="{ on, attrs }">
                                <v-combobox v-model="modifiedDateRange"
                                            multiple
                                            chips
                                            small-chips
                                            dense
                                            hide-details
                                            readonly
                                            clearable
                                            persistent-placeholder
                                            :placeholder="header.text"
                                            v-bind="attrs"
                                            @click:clear="onFilterInput('', header.value)"
                                            v-on="on"></v-combobox>
                            </template>
                            <v-date-picker v-model="modifiedDateRange"
                                           range
                                           no-title
                                           @input="onDateInput($event, header.value)"
                                           scrollable>
                            </v-date-picker>
                        </v-menu>
                        <v-text-field v-else-if="!['task_summary', 'entity_count'].includes(header.value)" dense @click:clear="onFilterInput('', header.value)" @change="onFilterInput($event, header.value)" clearable :placeholder=header.text hide-details :value="filterText">

                        </v-text-field>
                    </td>
                </tr>
                <tr v-for="(item, rowIndex) in items" :key="item.id"
                    @click.exact="onElementSelected(item)"
                    @click.ctrl.exact="onElementCtrlClick(rowIndex)"
                    @click.shift.exact="onElementShiftClick(rowIndex)"
                    :id="elementType + rowIndex + 'Row'"
                    :class="{'selectedRow': item.selected, 'notSelectedRow': !item.selected}">
                    <td v-for="header in headers" :key="header.text" :class="tableCellClass(header)">
                        <span v-if="header.value == 'status' && Array.isArray(item.status)">
                            <v-tooltip top>
                                <template v-slot:activator="{ on, attrs }">
                                    <v-chip v-on="on" v-bind="attrs" :color="alertGroupStatusColor(item.status)" class="status-chip" :id="elementType + rowIndex + 'AlertgroupStatus'">
                                        <v-icon left>
                                            {{alertGroupStatusIcon(item.status)}}
                                        </v-icon>
                                        {{item.status[0]}}/{{item.status[1]}}/{{item.status[2]}}

                                    </v-chip>
                                </template>
                                <span> {{item.status[0]}} Alerts Open, {{item.status[1]}} Alerts Closed, {{item.status[2]}} Alerts Promoted </span>
                            </v-tooltip>
                        </span>
                        <span v-else-if="header.value == 'status'">
                            <v-chip :color="objectStatusColor(item.status)" class="status-chip">
                                {{item.status}}
                            </v-chip>
                        </span>
                        <span v-else-if="header.value == 'task_status'">
                            <v-chip :color="objectStatusColor(item.entry_data.status ? item.entry_data.status : 'open')" class="status-chip">
                                {{item.entry_data?.status ? item.entry_data.status : "open"}}
                            </v-chip>
                        </span>
                        <span v-else-if="header.value == 'created' || header.value == 'modified' || header.value == 'last_attempt' || header.value == 'last_article' ||header.value.endsWith('_date')">
                            <span v-if="$vuetify.breakpoint.xl">
                                {{ transformDateString(item[header.value])['date'] }} {{ transformDateString(item[header.value])['time'] }}
                            </span>
                            <span v-else>
                                {{ transformDateString(item[header.value])['date'] }}<br />{{ transformDateString(item[header.value])['time'] }}
                            </span>
                        </span>

                        <span v-else-if="header.value == 'icon'">
                            <v-icon>
                                {{item[header.value]}}
                            </v-icon>
                        </span>
                        <span v-else-if="header.value == 'sources'">
                            <v-chip small v-for="source in item.sources" :key="source">
                                {{ source }}
                            </v-chip>
                        </span>
                        <span v-else-if="header.value == 'tags'">
                            <v-chip small v-for="tag in item.tags" :key="tag">
                                {{ tag }}
                            </v-chip>
                        </span>
                        <span v-else-if="header.value == 'signature_group'">
                            {{ item.data?.signature_group?.join(",") }}
                        </span>
                        <span v-else-if="header.value == 'task_assignee'">
                            {{ item.entry_data?.assignee }}
                        </span>
                        <span v-else-if="header.value == 'task_summary'" class="clip-text">
                            {{ item.entry_data?.plain_text }}
                        </span>
                        <span :id="elementType + rowIndex + 'ID'" v-else-if="header.value == 'id'">
                            {{ item[header.value] }}
                        </span>
                        <span :id="elementType + rowIndex + 'Popularity'" v-else-if="header.value == 'popularity_count'">
                            <PopularityElement :voted="item['popularity_voted']" :count="item[header.value]" :elementID="item['id']" :elementType="elementType" />
                        </span>
                        <span :id="elementType + rowIndex + 'Class'" v-else-if="header.value == 'classes'">
                            <v-chip v-for="entityClass in item.classes" small :key="entityClass.name">
                                <v-icon v-if="entityClass.icon" left>
                                    {{ entityClass.icon }}
                                </v-icon>
                                <span v-if="entityClass.display_name">
                                    {{ entityClass.display_name }}
                                </span>
                                <span v-else>
                                    {{ entityClass.name }}
                                </span>
                            </v-chip>
                        </span>
                        <span v-else>
                            {{ item[header.value] }}
                        </span>
                    </td>
                </tr>
            </tbody>

        </template>
        <template v-slot:[`footer.prepend`]>
            <span>
                <v-btn class="mr-5" id="CreateElementButton" v-if="!isAlertGroupElementType && !['Entity', 'Entry'].includes(elementType)" small
                       @click="createNewElement()">
                    {{ 'Create ' + elementType }}
                </v-btn>
                <v-btn class="mr-5" id="exportTableAsCsv" small
                       @click="exportTableAsCsv()">
                    Export as CSV
                </v-btn>
                <v-btn small color="cyan" class="mr-5"
                       v-if="!elementListFilterIsDefault"
                       @click="resetElementFilter">
                    Clear All Filters
                </v-btn>
                <span v-if="selectedItems().length > 1">
                    <v-btn @click="closeSelectedItems" small class="green">
                        Close Selected
                    </v-btn>
                    <v-btn @click="promoteSelectedItems" small class="amber">
                        Promote Selected
                    </v-btn>
                </span>
            </span>
        </template>

    </v-data-table>

</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { Getter, Action, Mutation } from 'vuex-class';
import { IRElementType, IRElement, IRElementStatus } from '@/store/modules/IRElements/types'
import { User } from '@/store/modules/user/types';
import PopularityElement from '../IRElementComponents/PopularityElement.vue';

const namespace: string = 'IRElements';

@Component({
    components: {
        PopularityElement
    },
})

export default class VuetifyQueueTable extends Vue {
    @Prop({ default: null }) tableHeight: number

    @Mutation('setElementListPage', { namespace }) setElementListPage: CallableFunction
    @Mutation('setElementListItemsPerPage', { namespace }) setElementListItemsPerPage: CallableFunction
    @Mutation('setElementListSortBy', { namespace }) setElementListSortBy: CallableFunction
    @Mutation('setElementListSortDesc', { namespace }) setElementListSortDesc: CallableFunction
    @Mutation('setElementListFilterItem', { namespace }) setElementListFilterItem: CallableFunction
    @Mutation('errorOccurred') errorOccurred: CallableFunction
    @Mutation('clearElementListFilter', { namespace }) clearElementListFilter: CallableFunction;

    @Getter('vuetifyQueueTableRows', { namespace }) vuetifyQueueTableRows: Array<any> | null;
    @Getter('vuetifyQueueTableColumns', { namespace }) vuetifyQueueTableColumns: Array<any> | null;
    @Getter('elementType', { namespace }) elementType: IRElementType;
    @Getter('elementTypePluralized', { namespace }) elementTypePluralized: string | null;
    @Getter('totalElementListCount', { namespace }) totalElementListCount: number | null;
    @Getter('currentUser', { namespace: 'user' }) currentUser: User;
    @Getter('isAlertGroupElementType', { namespace }) isAlertGroupElementType: boolean;
    @Getter('retrievingElements', { namespace }) retrievingElements: boolean
    @Getter('elementListPage', { namespace }) elementListPage: number
    @Getter('elementListItemsPerPage', { namespace }) elementListItemsPerPage: number
    @Getter('elementListSortBy', { namespace }) elementListSortBy: string
    @Getter('elementListSortDesc', { namespace }) elementListSortDesc: boolean
    @Getter('elementListFilterDict', { namespace }) elementListFilterDict: any
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
    @Getter('selectedElementPaneSize', { namespace }) selectedElementPaneSize: number;
    @Getter('elementListFilterIsDefault', { namespace }) elementListFilterIsDefault: boolean;
    @Getter('showPopularity', { 'namespace': 'user' }) showPopularity: boolean;

    @Action('retrieveSelectedElementbyID', { namespace }) retrieveSelectedElementbyID: any;
    @Action('retrieveElementListWithFilter', { namespace }) retrieveElementListWithFilter: CallableFunction;
    @Action('createElement', { namespace }) createElement: CallableFunction;
    @Action('setSelectedElementSize', { namespace }) setSelectedElementSize: CallableFunction;
    @Action('updateElementInList', { namespace }) updateElementInList: CallableFunction;
    @Action('promoteElements', { namespace }) promoteElements: CallableFunction;
    @Action('retrieveSources', { namespace }) retrieveSources: CallableFunction;
    @Action('retrieveTags', { namespace }) retrieveTags: CallableFunction;
    @Action('retrieveAllEntityClasses', { namespace }) retrieveAllEntityClasses: CallableFunction;

    manualClick: boolean = false
    tabulator: any = null
    selected = []
    sortInProgress: boolean = false
    lastElementClicked: number | null = null
    sourceFilterSearch: string = ""
    sourceFilterLoading: boolean = false
    sourceFilterOptions: Array<any> = []
    tagFilterSearch: string = ""
    tagFilterLoading: boolean = false
    tagFilterOptions: Array<any> = []
    entityClassFilterSearch: string = ""
    entityClassFilterLoading: boolean = false
    entityClassFilterOptions: Array<any> = []
    createdDateRange: Array<string> = []
    modifiedDateRange: Array<string> = []
    filterText: string | null = null // Only used to clear filter text
    computedHeaders: any[] | null | undefined = []

    async mounted() {
        this.tagFilterOptions = await this.retrieveTags({ limit: 25 })
        this.sourceFilterOptions = await this.retrieveSources({ limit: 25 })
        this.entityClassFilterOptions = await this.retrieveAllEntityClasses()
        document.addEventListener('keydown', this.handleKeyboardShortcuts)
    }

    async beforeDestroy() {
        document.removeEventListener("keydown", this.handleKeyboardShortcuts)
    }

    async resetElementFilter() {
        this.clearElementListFilter()

        this.filterText = null
        await this.$nextTick()
        this.filterText = "" // Twice to trigger reactivity
        this.createdDateRange = []
        this.modifiedDateRange = []

        this.scheduleSort()
    }

    totalFilterDict() {
        return this.$router.currentRoute.meta?.extraFilters ? { ...this.elementListFilterDict, ...this.$router.currentRoute.meta?.extraFilters } : this.elementListFilterDict
    }

    async handleKeyboardShortcuts(e: KeyboardEvent) {
        // Check for event target so this doesn't fire if someone's typing in a text box or something
        if (e.target && (e.target as HTMLElement).tagName == 'BODY' && !(e.metaKey || e.altKey || e.ctrlKey)) {
            if (e.key == 'j') {
                this.selectNextElement()
            }
            if (e.key == 'k') {
                this.selectPreviousElement()
            }
        }
    }

    transformDateString(dateString: string) {
        const date: any = new Date(dateString)
        const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
        return { date: date.toLocaleDateString(undefined, options), time: date.toLocaleTimeString('en-US') }
    }

    tableCellClass(header: any) {
        if (header.value == 'id' || header.value == 'created' ||
            header.value == 'modified' || header.value == 'last_attempt' ||
            header.value == 'last_article' || header.value.endsWith('_date')) {
            return 'no-line-breaks'
        }
        return ''
    }

    statusChoices() {
        if (this.elementType == IRElementType.Signature) {
            return [
                { value: 'enabled', text: 'Enabled', color: 'green' },
                { value: 'disabled', text: 'Disabled', color: 'red' }
            ]
        }
        else if (this.elementType == IRElementType.Entity) {
            return [
                { value: 'tracked', text: 'Tracked', color: 'green' },
                { value: 'untracked', text: 'Untracked', color: 'red' },
            ]
        }
        else if (this.elementType == IRElementType.Feed) {
            return [
                { value: 'active', text: 'Active', color: 'green' },
                { value: 'paused', text: 'Paused', color: 'red' },
            ]
        }
        else if (this.elementType == IRElementType.Guide) {
            return [
                { value: 'current', text: 'Current', color: 'green' },
                { value: 'outdated', text: 'Outdated', color: 'red' },
            ]
        }
        else if (this.elementType == IRElementType.Entry) {
            return [
                { value: 'open', text: 'Open', color: 'red' },
                { value: 'assigned', text: 'Assigned', color: 'amber' },
                { value: 'closed', text: 'Closed', color: 'green' }
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

    objectStatusColor(status: string) {
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
                return "amber"
            default:
                return "white"
        }
    }

    alertGroupStatusColor(statusArray: Array<number>) {
        if (statusArray[2] > 0) {
            return 'amber'
        }
        else if (statusArray[0] > 0) {
            return 'red'
        }
        else {
            return 'green'
        }
    }

    alertGroupStatusIcon(statusArray: Array<number>) {
        if (statusArray[2] > 0) {
            return 'mdi-exclamation'
        }
        else if (statusArray[0] > 0) {
            return 'mdi-eye'
        }
        else {
            return 'mdi-checkbox-marked'
        }
    }

    isNumber(value: string) {
        return isNaN(+value) == false
    }

    noRule(value: string) {
        return true
    }

    async onLimitChange(limit: number) {
        this.setElementListItemsPerPage(limit)
        await this.retrieveElementListWithFilter({ elementType: this.elementType, filterDict: this.totalFilterDict() })
    }

    timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async onFilterInput(input: any, filterName: any) {
        // Chop the trailing 's' off of tags and sources
        if (filterName == "tags" || filterName == "sources") {
            filterName = filterName.substring(0, filterName.length - 1)
        }
        if (input != "" && input != null) {
            this.setElementListPage(1)
            if (input instanceof Array) {
                // Entity classes need to get returned as objects instead of strings
                if (filterName == "classes") {
                    input = input.map((ec) => ec.name)
                }
                //if we are doing date filters make sure they are ranges
                if (filterName == "created" || filterName == "modified") {
                    this.setElementListFilterItem({ key: filterName, value: `(${input.toString()})` })
                }
                //otherwise do or searches
                else {
                    this.setElementListFilterItem({ key: filterName, value: `[${input.toString()}]` })
                }
            }
            else {
                this.setElementListFilterItem({ key: filterName, value: input })
            }
            await this.retrieveElementListWithFilter({ elementType: this.elementType, filterDict: this.totalFilterDict() })

        }
        else if (filterName in this.elementListFilterDict) {
            this.setElementListPage(1)
            this.setElementListFilterItem({ key: filterName, value: undefined })
            await this.retrieveElementListWithFilter({ elementType: this.elementType, filterDict: this.totalFilterDict() })
        }
        else {
            //pass
        }
    }

    async onPageChange(page: number) {
        // Don't fire this if the change was made programmatically
        if (page != this.elementListPage) {
            this.setElementListPage(page)
            await this.retrieveElementListWithFilter({ elementType: this.elementType, filterDict: this.totalFilterDict() })
        }
    }

    @Watch('$route', { immediate: true, deep: true })
    async onUrlChange(newVal: any, oldVal: any) {
        // We selected a new row
        if (newVal.params.id != undefined && this.vuetifyQueueTableRows) {
            let rowIndex = this.vuetifyQueueTableRows.findIndex(row => row.id == this.$route.params.id)
            if (oldVal && newVal.params.id && !oldVal.params.id) {
                this.setSelectedElementSize(60)
            }
            if (this.vuetifyQueueTableRows[rowIndex] != undefined) {
                Vue.set(this.vuetifyQueueTableRows[rowIndex], "selected", true)
                this.lastElementClicked = rowIndex
            }
        }
        // We unselected an old row
        if (oldVal && this.vuetifyQueueTableRows) {
            let oldRowIndex = this.vuetifyQueueTableRows.findIndex(row => row.id == oldVal.params.id)
            if (this.vuetifyQueueTableRows[oldRowIndex] != undefined) {
                Vue.set(this.vuetifyQueueTableRows[oldRowIndex], "selected", false)
            }
        }
    }

    @Watch('vuetifyQueueTableRows', { immediate: true, deep: true })
    async onDataTableChange(newVal: any, oldVal: any) {
        if (this.vuetifyQueueTableRows && this.vuetifyQueueTableRows.length > 0) {
            let rowIndex = this.vuetifyQueueTableRows.findIndex(row => row.id == this.$route.params.id)
            if (this.vuetifyQueueTableRows[rowIndex] != undefined) {
                Vue.set(this.vuetifyQueueTableRows[rowIndex], "selected", true)
                this.lastElementClicked = rowIndex
                await this.$nextTick()
                //this.$vuetify.goTo('.selectedRow')
            }

        }
    }

    selectNextElement() {
        if (this.selectedItems()?.length == 1 && this.vuetifyQueueTableRows && this.vuetifyQueueTableRows.length > 0) {
            let firstSelectedIndex: number | null = null;
            let newSelectedId = -1;
            this.vuetifyQueueTableRows.forEach((row, idx) => {
                if (row.selected && firstSelectedIndex == null) {
                    firstSelectedIndex = idx
                }
                if (idx - 1 == firstSelectedIndex) {
                    Vue.set(row, "selected", true)
                    newSelectedId = row.id
                }
                else {
                    Vue.set(row, "selected", false)
                }
            })
            if (newSelectedId != -1) {
                let newRouteString = "/" + this.elementTypePluralized?.toLowerCase() + "/" + newSelectedId /** need to pluralize the element type to match the route */
                this.$router.push(newRouteString).catch((err: any) => { return })
            }
        }
    }

    selectPreviousElement() {
        if (this.selectedItems()?.length == 1 && this.vuetifyQueueTableRows && this.vuetifyQueueTableRows.length > 0) {
            let newSelectedId = -1;
            this.vuetifyQueueTableRows.forEach((row, idx, arr) => {
                if (arr[idx+1] && arr[idx+1].selected || row.selected && idx == 0) {
                    Vue.set(row, "selected", true)
                    newSelectedId = row.id
                }
                else {
                    Vue.set(row, "selected", false)
                }
            })
            if (newSelectedId != -1) {
                let newRouteString = "/" + this.elementTypePluralized?.toLowerCase() + "/" + newSelectedId /** need to pluralize the element type to match the route */
                this.$router.push(newRouteString).catch((err: any) => { return })
            }
        }
    }

    onElementSelected(item: IRElement) {
        // When a new element is selected, unselect ALL rows and select the clicked row
        if (this.vuetifyQueueTableRows && this.vuetifyQueueTableRows.length > 0) {
            this.vuetifyQueueTableRows.forEach((row) => {
                if (row.id == item.id) {
                    Vue.set(row, "selected", true)
                }
                else {
                    Vue.set(row, "selected", false)
                }
            })
        }
        let newRouteString = "/" + this.elementTypePluralized?.toLowerCase().replaceAll(" ", "_") + "/" + item.id /** need to pluralize the element type to match the route */
        // This is for tasks
        if (this.elementType == IRElementType.Entry) {
            newRouteString = "/tasks/" + item.id + "/" + item.target_type + "/" + item.target_id
        }
        this.$router.push(newRouteString).catch((err: any) => { return })
    }

    async onElementCtrlClick(rowIndex: number) {
        // Only support multi-select functions on some element types
        if (this.elementType == IRElementType.Dispatch || this.elementType == IRElementType.Event) {
            // Toggle selected when ctrl-clicking an element
            if (this.vuetifyQueueTableRows && this.vuetifyQueueTableRows.length > 0) {
                Vue.set(this.vuetifyQueueTableRows[rowIndex], "selected", !this.vuetifyQueueTableRows[rowIndex].selected)
                this.lastElementClicked = rowIndex
            }
        }
    }

    async onElementShiftClick(rowIndex: number) {
        // Only support multi-select functions on some element types
        if (this.elementType == IRElementType.Dispatch || this.elementType == IRElementType.Event) {
            if (this.vuetifyQueueTableRows && this.vuetifyQueueTableRows.length > 0) {
                if (this.lastElementClicked == null) {
                    // If there's not a selected element, just select what's being clicked on
                    Vue.set(this.vuetifyQueueTableRows[rowIndex], "selected", true)
                }
                else {
                    const selectTo = this.lastElementClicked
                    const setSelectedTo = !this.vuetifyQueueTableRows[rowIndex].selected
                    // Otherwise, set all items between this item and the last-clicked item based on this item's status
                    this.vuetifyQueueTableRows.forEach((row, index) => {
                        if (index <= rowIndex && index >= selectTo
                            || index >= rowIndex && index <= selectTo) {
                            Vue.set(row, "selected", setSelectedTo)
                        }
                    })
                }
                this.lastElementClicked = rowIndex
            }
        }
    }

    selectedItems() {
        return this.vuetifyQueueTableRows?.filter((row) => row.selected)
    }

    async closeSelectedItems() {
        this.selectedItems()?.forEach(async(item) => {
            const updateData = { status: IRElementStatus.Closed.toString() }
            await this.updateElementInList({
                elementId: item.id,
                elementType: this.elementType,
                updateData: updateData
            })
        })
    }

    async promoteSelectedItems() {
        await this.promoteElements({
            elementIds: this.selectedItems()?.map((row) => row.id),
            elementType: this.elementType
        })
    }

    async exportTableAsCsv() {
        if (this.vuetifyQueueTableRows && this.vuetifyQueueTableRows.length > 0 && this.vuetifyQueueTableColumns && this.vuetifyQueueTableColumns.length > 0) {
            let csv = this.vuetifyQueueTableColumns.map(a => a.text).join(",") + "\n"
            for (let row of this.vuetifyQueueTableRows) {
                for (let column of this.vuetifyQueueTableColumns) {
                    if (Array.isArray(row[column.value])) {
                        csv += `"${row[column.value].join(',')}",`
                    }
                    else {
                        csv += `${row[column.value]},`
                    }
                }
                csv = csv.slice(0, -1)
                csv += "\n"
            }
            var hiddenElement = document.createElement("a");
            hiddenElement.href = 'data:attachment/csv,' + encodeURI(csv)
            hiddenElement.target = '_blank'
            hiddenElement.download = `${this.elementTypePluralized}.csv`
            hiddenElement.click();
        }
    }

    // TODO: move button around, maybe add dialog for create events?
    async createNewElement(createData: any = {}) {
        if (!("owner" in createData)) {
            createData.owner = this.currentUser.username
        }
        const newElement = await this.createElement({ elementType: this.elementType, createData })
        if (newElement) {
            await this.retrieveElementListWithFilter({ elementType: this.elementType, filterDict: this.totalFilterDict() })
            this.onElementSelected(newElement)
        }
    }

    async sortColumnChanged(column: string | undefined) {
        if (!this.retrievingElements) {
            this.setElementListSortBy(column)
            this.scheduleSort()
        }
    }

    async sortDescChanged(desc: boolean) {
        if (!this.retrievingElements) {
            this.setElementListSortDesc(desc)
            this.scheduleSort()
        }
    }

    // This is done asynchronously so that multiple sort events going off at once don't make multiple requests
    async scheduleSort() {
        if (!this.sortInProgress) {
            this.sortInProgress = true
            this.$nextTick(() => {
                this.sortInProgress = false
                this.retrieveElementListWithFilter({ elementType: this.elementType, filterDict: this.totalFilterDict() })
            })
        }
    }

    @Watch('sourceFilterSearch')
    async getSourceOptions(newVal: string) {
        this.sourceFilterLoading = true
        this.sourceFilterOptions = await this.retrieveSources({ limit: 25, name: newVal })
        this.sourceFilterLoading = false
    }

    @Watch('tagFilterSearch')
    async getTagOptions(newVal: string) {
        this.tagFilterLoading = true
        this.tagFilterOptions = await this.retrieveTags({ limit: 25, name: newVal })
        this.tagFilterLoading = false
    }

    onDateInput(input: Array<string>, field: string) {
        if (input.length == 0) {
            this.onFilterInput('', field)
        }
        else { // I hate javascript's date parsing
            let start_date = null;
            let end_date = null;
            if (input.length == 1) {
                const dateParts = input[0].split('-')
                start_date = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2])
                end_date = new Date(+dateParts[0], +dateParts[1] - 1, +dateParts[2], 23, 59, 59)
            }
            else {
                const startParts = input[0].split('-')
                const endParts = input[1].split('-')
                if (input[0] > input[1]) { // Normalize so start < end
                    start_date = new Date(+endParts[0], +endParts[1] - 1, +endParts[2])
                    end_date = new Date(+startParts[0], +startParts[1] - 1, +startParts[2], 23, 59, 59)
                }
                else {
                    start_date = new Date(+startParts[0], +startParts[1] - 1, +startParts[2])
                    end_date = new Date(+endParts[0], +endParts[1] - 1, +endParts[2], 23, 59, 59)
                }
            }
            const end = end_date.toISOString()
            const start = start_date.toISOString()
            this.onFilterInput([start, end], field)
        }
    }
}
</script>

<style scoped lang="scss">
    .selectedRow {
        background-color: skyblue !important;
    }

    .clip-text {
        text-overflow: ellipsis ellipsis;
        overflow: hidden;
        white-space: nowrap;
        max-width: 40em;
        display: block;
    }

    .theme--dark .selectedRow {
        background-color: steelblue !important;
    }

    .selectedRow:hover {
        cursor: pointer
    }

    .notSelectedRow:hover {
        cursor: pointer
    }

    .v-data-table {
        max-height: 100%;
        display: flex;
        flex-direction: column;
    }

    .v-data-table td {
        overflow-wrap: break-word;
        word-break: break-word;
    }

    .v-data-table .no-line-breaks {
        word-break: normal;
        overflow-wrap: normal;
        white-space: nowrap;
    }

    .status-chip {
        width: 100%;
        justify-content: center;
        height: 90%;
    }

    .theme--light .filter-cell {
        position: sticky;
        top: 32px;
        z-index: 2;
        background-color: rgb(247, 247, 247);
    }

    .theme--dark .filter-cell {
        position: sticky;
        top: 32px;
        z-index: 2;
        background-color: rgb(0, 0, 0);
    }

    ::v-deep .theme--dark.v-input input::placeholder {
        color: rgba(255, 255, 255, 0.7);
    }

    .theme--light tbody tr:nth-of-type(odd) {
        background-color: rgba(247, 247, 247);
    }

    .theme--dark tbody tr:nth-of-type(odd) {
        background-color: rgba(0, 0, 0)
    }

    ::v-deep .status-filter input {
        min-width: 0px !important;
    }

    ::v-deep .v-chip {
        padding: 0 4px;
        margin: 0 !important;
    }

    .v-data-footer {
        min-height: 50px;
        align-self: end;
        width: 100%
    }

    // Make autocomplete in filter boxes the right height
    ::v-deep .v-select__selections {
        min-height: 26px !important;
    }

    ::v-deep .v-autocomplete:not(.v-input--is-focused).v-select--chips input {
        max-height: 32px;
    }
</style>
