<template>
    <v-card height="100%" class="overflow-y-auto">
        <v-card-text>
            <v-container fluid>
                <v-row align="center" justify="center" @click="onWordClick($event)">
                    <v-progress-circular
                        v-if="progress"
                        :rotate="-90"
                        :size="200"
                        :value="(progress.completedWords / progress.totalWords) * 100"
                        :width="20"
                        class="v-no-animation"
                        color="primary"
                        style="position: absolute;"
                    >{{ progress.completedWords }} of {{ progress.totalWords }}</v-progress-circular>
                    <vue-word-cloud style="height: 480px; width: 100%;" :fontSizeRatio="0.25" :words="words" :rotation="wordCloudRotation" :color="wordCloudColor" :progress.sync="progress"/>
                    <v-card-subtitle>Top 100 {{ `${this.item_title}s` }}</v-card-subtitle>
                </v-row>
                <v-row>
                    <v-combobox
                        v-model="tagOrSource.selected"
                        :items="tagOrSource.items"
                        :loading="tagOrSource.loading"
                        @update:search-input="searchItems"
                        @click:clear="loadInitialItems"
                        item-text="name"
                        item-value="id"
                        label="Search"
                        placeholder="Start typing to Search"
                        prepend-icon="mdi-magnify"
                        clearable
                        multiple
                        chips
                    >
                        <template v-slot:append-outer>
                            <v-btn @click="switch_button">{{search.method}}</v-btn>
                        </template>
                    </v-combobox>
                </v-row>
                <v-row>
                    <v-col>
                        <h3>Appearances</h3>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-data-table
                            fixed-header
                            dense
                            group-by="target_type"
                            height="250px"
                            :headers="appearance.headers"
                            :items="appearance.items"
                            :loading="appearance.loading"
                            :items-per-page="appearance.items_per_page"
                            :server-items-length="appearance.total"
                            :sort-by="appearance.sort_by"
                            :sort-desc="appearance.sort_desc"
                            :page="appearance.page"
                            @click:row="setItemDetails"
                            @update:page=onPageChange
                            @update:items-per-page=onLimitChange
                            @update:sort-by="sortColumnChanged"
                            @update:sort-desc="sortDescChanged"
                            :footer-props="{'items-per-page-text': `${this.item_title} per page`, 'items-per-page-options':[10,25,50,100], 'show-first-last-page':true, 'show-current-page':true }"
                        >
                            <template v-slot:group.header="{items, isOpen, toggle}">
                                <th colspan="2">
                                    <v-icon @click="toggle">{{  isOpen ? "mdi-minus": "mdi-plus" }}</v-icon>{{ `Target Type: ${items[0].target_type} (${items.length})` }}
                                </th>
                            </template>
                            <template v-slot:[`item.target`]="{item}">
                                <v-btn @click="followLink(item)" color="primary" x-small>{{ item.target_type + ' ' + item.target_id }}</v-btn>
                            </template>
                            <template v-slot:[`item.items`]="{item}">
                                <v-chip small v-for="i in item.items" :key="i.id" @click.prevent.stop="selectSingleItem($event, i)" close @click:close="removeTagSourceById(item, i)">{{ i.name }}</v-chip>
                                <v-btn small dense color="success" icon @click.prevent.stop="openAddNewDialog(item)">
                                    <v-icon>mdi-plus</v-icon>
                                </v-btn>
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
                <div>
                    <v-row v-for="item in tagOrSource.details" :key="item.id" dense>
                        <v-col cols="1">
                            <v-text-field readonly disabled v-model="item.id" label="ID"/>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field v-model="item.name" label="Name" :rules="required"/>
                        </v-col>
                        <v-col>
                            <v-text-field v-model="item.description" label="Description"/>
                        </v-col>
                        <v-col cols="1" class="mt-3">
                            <v-btn color="primary" @click="updateItem(item)">Update</v-btn>
                        </v-col>
                        <v-col cols="1" class="mt-3">
                            <v-btn color="error" @click="deleteItem(item)">Delete</v-btn>
                        </v-col>
                        <v-col cols="1" class="mr-2 mt-3">
                            <v-btn color="warning" @click="openReplaceDialog(item)">Replace</v-btn>
                        </v-col>
                    </v-row>
                </div>

                <v-dialog v-model="addNewDialog.open">
                    <v-card>
                        <v-card-title>{{ `Add a ${this.item_title}` }}</v-card-title>
                        <v-card-text>
                            <v-combobox
                                v-model="addNewDialog.selected"
                                :items="search.add_items"
                                :loading="search.loading"
                                @update:search-input="addSearchItems"
                                @click:clear="loadInitialItems(true)"
                                item-text="name"
                                item-value="id"
                                label="Select"
                                placeholder="Start typing to Search"
                                prepend-icon="mdi-magnify"
                                clearable
                                :error-messages="addItemErrors"
                            >
                            </v-combobox>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="success" @click="addItemSave">Add</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-dialog v-model="replaceDialog.open">
                    <v-card>
                        <v-card-title>{{ `Replace a ${this.item_title}` }}</v-card-title>
                        <v-card-text>
                            <v-combobox
                                v-model="replaceDialog.selected"
                                :items="search.add_items"
                                :loading="search.loading"
                                @update:search-input="addSearchItems"
                                @click:clear="loadInitialItems(true)"
                                item-text="name"
                                item-value="id"
                                label="Select"
                                placeholder="Start typing to Search"
                                prepend-icon="mdi-magnify"
                                clearable
                                :error-messages="addItemErrors"
                            >
                            </v-combobox>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="success" @click="replaceItemSave">Replace</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-container>
        </v-card-text>
    </v-card>
</template>

<style>
.highlight {
    background-color: lightblue !important;
}
</style>


<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import { Action } from 'vuex-class';
import {Tag, Source, IRElementType, TagSourceAppearance} from "@/store/modules/IRElements/types"

const namespace: string = 'IRElements';

@Component({components: {}})

export default class View extends Vue {
    @Action('retrieveTagsOrSources', { namespace }) retrieveTagsOrSources: CallableFunction;
    @Action('deleteTagOrSource', { namespace }) deleteTagOrSource: CallableFunction;
    @Action('replaceTagOrSource', { namespace }) replaceTagOrSource: CallableFunction;
    @Action('tagOrSourceAppearances', { namespace }) tagOrSourceAppearances: CallableFunction;
    @Action('updateTagOrSource', { namespace }) updateTagOrSource: CallableFunction;
    @Action('submitTagsOrSources', { namespace }) submitTagsOrSources: CallableFunction;
    @Action('unAssignTagOrSourceDescription', { namespace }) unAssignTagOrSourceDescription: CallableFunction;

    addItemErrors: string = ""
    item_type: string = "";
    item_title: string = "";
    appearance_id: number = 0;
    required: any = [(v: any) => !!v || 'Required']
    words: Array<any> = []
    wordMin: number = Number.MAX_VALUE
    wordMax: number = Number.MIN_VALUE
    wordDiff: number = 0
    progress: any = null

    tagOrSource = {
        items: [] as Tag[] | Source[],
        selected: [] as Tag[] | Source[] | string[],
        details: [] as Tag[] | Source[],
        loading: false
    }
    addNewDialog = {
        open: false,
        selected: null as Tag | Source | null,
        appearance: null as TagSourceAppearance | null
    }
    replaceDialog = {
        open: false,
        selected: null as Tag | Source | null,
        tagOrSource: null as Tag | Source | null,
    }
    search = {
        items: [] as Tag[] | Source[],
        add_items: [] as Tag[] | Source[],
        loading: false,
        add_loading: false,
        method: "OR"
    }
    appearance = {
        loading: false,
        items: [] as TagSourceAppearance[],
        items_per_page: 25,
        total: 0,
        sort_by: "id",
        sort_desc: false,
        page: 1,
        headers: [
            { text: 'Target Type', value: 'target_type' },
            { text: 'Target', value: 'target' },
            { value: 'items' }
        ]
    }

    async onWordClick(event: MouseEvent) {
        const target = (event.target as HTMLElement)
        if (target && target.children.length == 0) {
            //search for the name
            await this.searchItems(target.innerText)
            this.tagOrSource.selected.push((this.tagOrSource.items.find(a => a.name == target.innerText) as any))
        }
    }

    wordCloudColor([, weight]: Array<any>) {
        if (weight == this.wordMax) {
            return '#063B62'
        }
        else if (weight > (this.wordMax - this.wordDiff)) {
            return '#81C1C6'
        }
        else if (weight > (this.wordMin + this.wordDiff)) {
            return '#2F7097'
        }
        else if (weight >= this.wordMin) {
            return '#2F9759'
        }
        else {
            return "black"
        }
    }

    wordCloudRotation() {
        return [0, 3/4][Math.floor(Math.random() * 2)]
    }

    async loadWordCloud() {
        // get stuff for word cloud only the "top" 100 as there are a LOT of tags/sources
        const resp = await this.retrieveTagsOrSources({type: this.item_type, filterDict: {limit: 100, sort: "-link_count"}})
        this.words = resp.map(
            (a: Tag | Source) => {
                if (a.link_count) {
                    if (a.link_count > this.wordMax) {
                        this.wordMax = a.link_count
                    }
                    if (a.link_count < this.wordMin) {
                        this.wordMin = a.link_count
                    }
                }

                return [a.name, a.link_count]
            }
        )
        this.wordDiff = Math.floor((this.wordMax - this.wordMin)/4)
    }

    @Watch('$route', { immediate: true })
    async onUrlChange() {
        this.item_type = this.$router.currentRoute.meta?.itemType
        this.item_title = this.item_type.charAt(0).toUpperCase() + this.item_type.slice(1)
        this.tagOrSource.selected = []
        this.loadWordCloud()
        this.loadInitialItems()
    }

    @Watch('tagOrSource.selected', {immediate: true})
    async onSearch() {
        this.appearance.loading = true
        this.appearance.items = []
        this.tagOrSource.details = []
        if (this.tagOrSource.selected.length > 0) {
            const filterDict: any = {
                limit: this.appearance.items_per_page,
                skip: (this.appearance.page - 1) * this.appearance.items_per_page,
                sort: this.appearance.sort_by ? (this.appearance.sort_desc ? "-" : "") + this.appearance.sort_by : undefined
            }
            let names: Array<string> = []
            let ids: Array<number> = []
            for (var i = 0; i < this.tagOrSource.selected.length; i++) {
                if (typeof this.tagOrSource.selected[i] == "string") {
                    names.push(this.tagOrSource.selected[i] as string)
                }
                else {
                    names.push((this.tagOrSource.selected[i] as Tag | Source).name)
                    ids.push((this.tagOrSource.selected[i] as Tag | Source).id)
                }
            }
            //id would be preferred but we can do by name as well as a backup
            if (ids.length > 0) {
                filterDict.id = this.search.method == "OR" ? `[${ids.join()}]` : `{${ids.join()}}`
            }
            else if (names.length > 0) {
                filterDict.name = this.search.method == "OR" ? `[${names.join()}]` : `{${names.join()}}`
            }
            const resp = await this.tagOrSourceAppearances({type: this.item_type, filterDict: filterDict})
            this.appearance.items = resp.result
            this.appearance.total = resp.totalCount
        }
        this.appearance.loading = false
    }

    selectSingleItem(event: MouseEvent, i: any) {
        if (event.target) {
            document.querySelectorAll(".highlight").forEach((a) => {
                a.classList.remove("highlight");
            });
            //want to highlight the right thing
            if ((event.target as HTMLElement).classList.contains("v-chip__content")) {
                ((event.target as HTMLElement).parentNode as HTMLElement).classList.add("highlight");
            }
            else {
                (event.target as HTMLElement).classList.add("highlight");
            }
        }
        this.tagOrSource.details = [i]; 
    }

    async setItemDetails(item: any, row: any, event: MouseEvent) {
        if (event.target) {
            document.querySelectorAll(".highlight").forEach((a) => {
                a.classList.remove("highlight");
            });
            ((event.target as HTMLElement).parentNode as HTMLElement).classList.add("highlight");
            this.tagOrSource.details = item.items
        }
    }

    async searchItems(name: string) {
        this.tagOrSource.loading = true
        const filterDict: any = {
            limit: 25
        }
        if (name) {
            filterDict.name = name
        }
        this.tagOrSource.items = await this.retrieveTagsOrSources({type: this.item_type, filterDict: filterDict})
        this.tagOrSource.loading = false
    }

    async addSearchItems(name: string) {
        this.search.loading = true
        const filterDict: any = {
            limit: 25
        }
        if (name) {
            filterDict.name = name
        }
        this.search.add_items = await this.retrieveTagsOrSources({type: this.item_type, filterDict: filterDict})
        this.search.loading = false
    }

    async loadInitialItems(dialogCombobox: boolean = false) {
        if (dialogCombobox) {
            this.addItemErrors = ""
            this.search.add_loading = true
            this.search.add_items =  await this.retrieveTagsOrSources({type: this.item_type, filterDict: {limit: 25}})
            this.search.add_loading = false
        }
        else {
            this.tagOrSource.loading = true
            this.tagOrSource.items =  await this.retrieveTagsOrSources({type: this.item_type, filterDict: {limit: 25}})
            this.tagOrSource.loading = false
        }
    }

    async switch_button() {
        this.search.method = this.search.method == "OR" ? "AND" : "OR"
        this.onSearch()
    }

    followLink(item: TagSourceAppearance) {
        let target = ""
        if (item.target_type == IRElementType.Entity) {
            target = "entities"
        }
        else if (item.target_type == IRElementType.Dispatch){
            target = "dispatches"
        }
        else {
            target = item.target_type + "s"
        }
        this.$router.push(`/${target}/${item.target_id}`)
    }

    async updateItem(item: Tag | Source | null) {
        if (item !== null) {
            if (item.name === "" || item.name === null) {
                return
            }
            await this.updateTagOrSource({id: item.id, type: this.item_type, description: item.description, name: item.name})
            //redo the search to update items
            this.onSearch()
            this.loadWordCloud()
        }
    }

    async deleteItem(item: Tag | Source | null) {
        if (item) {
            await this.deleteTagOrSource({type: this.item_type, id: item.id})
            this.loadInitialItems()
            //redo the search to update items
            this.onSearch()
            this.loadWordCloud()
        }
    }

    async addItemSave() {
        if (this.addNewDialog.selected) {
            //if no id or is a string create a new tag or source instead of adding an existing one?
            if (this.addNewDialog.appearance) {
                if (this.addNewDialog.appearance.items.map((a: Tag | Source) => a.id).includes(this.addNewDialog.selected.id)) {
                    this.addItemErrors = `Duplicate ${this.item_title} please select a different ${this.item_title} to add`
                }
                else {
                    //get the name of the tag to add to the object, it the selected does not have an assoicated name then it will assume to be a new tag to create and add
                    const name = Object.hasOwn(this.addNewDialog.selected, "name") ? this.addNewDialog.selected.name : this.addNewDialog.selected
                    this.addItemErrors = ""
                    await this.submitTagsOrSources({newTagsOrSources: [name], type: this.item_type, targetElementId: this.addNewDialog.appearance.target_id, targetElementType: this.addNewDialog.appearance.target_type})
                    this.onSearch()
                    this.loadWordCloud()
                    this.addNewDialog.open = false
                }
            }
        }
        else {
            this.addItemErrors = `Select at least one ${this.item_title}`
        }
    }

    async replaceItemSave() {
        if (this.replaceDialog.selected) {
            //if no id or is a string create a new tag or source instead of adding an existing one?
            if (this.replaceDialog.tagOrSource) {
                if (! Object.hasOwn(this.replaceDialog.selected, "name")) {
                    this.addItemErrors = `${this.item_title} does not exist try renaming instead`
                }
                else if (this.replaceDialog.tagOrSource.id == this.replaceDialog.selected.id) {
                    this.addItemErrors = `Duplicate ${this.item_title} please select a different ${this.item_title} to add`
                }
                else {
                    this.addItemErrors = ""
                    await this.replaceTagOrSource({type: this.item_type, id: this.replaceDialog.tagOrSource.id, replaceId: this.replaceDialog.selected.id})
                    this.onSearch()
                    this.loadWordCloud()
                    this.replaceDialog.open = false
                }
            }
        }
    }

    async removeTagSourceById(item: any, tagOrSource: Tag | Source) {
        await this.unAssignTagOrSourceDescription({ id: tagOrSource.id, type: this.item_type, targetElementType: item.target_type, targetElementId: item.target_id })
        this.onSearch()
    }

    openAddNewDialog(item: TagSourceAppearance) {
        this.addItemErrors = ""
        this.addNewDialog.appearance = item
        this.addNewDialog.open = true
    }

    openReplaceDialog(item: Tag | Source) {
        this.addItemErrors = ""
        this.replaceDialog.tagOrSource = item
        this.replaceDialog.open = true
    }

    async onPageChange(page: number) {
        // Don't fire this if the change was made programmatically
        if (page != this.appearance.page) {
            this.appearance.page = page
            this.onSearch()
        }
    }

    async onLimitChange(limit: number) {
        this.appearance.items_per_page = limit
        this.onSearch()
    }

    async sortColumnChanged(column: string | undefined) {
        if (column) {
            this.appearance.sort_by = column
            this.onSearch()
        }
    }

    async sortDescChanged(desc: boolean) {
        this.appearance.sort_desc = desc
        this.onSearch()
    }
}
</script>