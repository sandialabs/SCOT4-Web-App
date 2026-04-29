<template>
    <v-container fluid v-if="!isLoading">
        <v-row>
            <vue-word-cloud style="height: 480px; width: 100%;" :fontSizeRatio="0.25" :words="words" :rotation="WordCloudRotation" :color="WordCloudColor" @click="OnWordClick($event)" />
        </v-row>
        <v-row>
            <v-col>
                <v-card-subtitle class="text-center">Top 100 {{ TextPipe.CapitalizeString(Route.name as string) }}</v-card-subtitle>
                <h5>Appearances</h5>
            </v-col>
        </v-row>
        <v-row>
            <v-combobox
                :loading="tagOrSource.loading"
                v-model="tagOrSource.selected"
                auto-select-first
                :items="tagOrSource.items"
                hide-details
                label="Search"
                variant="underlined"
                hide-selected
                multiple
                autoComplete="off"
                @update:model-value="OnSearch()"
                @update:search="SearchTerm"
            >
                <template v-slot:append>
                    <v-btn @click="SwitchButton" :text="search_method"/>
                </template>
                <template v-slot:selection="{ item, index }">
                    <v-chip v-if="item === Object(item)" :text="item.value" size="small" variant="flat" closable label @click:close="RemoveItem(index)"/>
                </template>
                <template v-slot:item="{item, props}">
                    <v-list-item v-bind="props" v-tooltip:bottom="item.raw.description"/>
                </template>
            </v-combobox>
        </v-row>
        <v-row>
            <v-col>
                <h5>Filters</h5>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-btn-group divided density="compact" variant="outlined">
                    <v-btn v-for="button in filter_buttons" :key="button.target_type" :text="`${button.target_type} (${button.count})`" @click="toggle_target_filter(button.target_type)" :active="appearance.target_filters.includes(button.target_type)" size="small"/>
                </v-btn-group>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-data-table-server
                    fixed-header
                    density="compact"
                    :items="appearance.items"
                    :items-length="appearance.total"
                    :items-per-page="appearance.items_per_page"
                    :page="appearance.page"
                    :loading="appearance.loading"
                    :sort-by="appearance.sort_by"
                    :headers="appearance.headers"
                    @click:row="setItemDetails"
                    @update:options="AppearanceFilter"
                >
                    <template v-slot:[`item.target_id`]="{ item }">
                        <v-btn variant="tonal" @click.prevent.stop="FollowLink(item)" color="primary" size="x-small" :text="item.target_type + ' ' + item.target_id"/>
                    </template>
                    <template v-slot:[`item.items`]="{ item }">
                        <v-chip size="small" v-for="i in item.items" :key="i.id" @click.prevent.stop="SelectSingleItem($event, i)" closable @click:close="RemoveTagSourceById(item, i)">{{ i.name }}</v-chip>
                        <v-btn size="small" density="compact" color="success" icon="mdi-plus" @click.prevent.stop="add_item(item.target_id, item.target_type, item.items)"/>
                    </template>
                </v-data-table-server>
            </v-col>
        </v-row>
        <v-row v-for="item in tagOrSource.details" :key="item.id">
            <v-col cols="1">
                <v-text-field density="compact" readonly disabled v-model="item.id" label="ID"/>
            </v-col>
            <v-col cols="4">
                <v-text-field density="compact" v-model="item.name" label="Name" :rules="[(v: any) => !!v || 'Required']"/>
            </v-col>
            <v-col>
                <v-text-field density="compact" v-model="item.description" label="Description"/>
            </v-col>
            <v-col cols="1">
                <v-btn color="primary" @click="updateItem(item)" text="Update"/>
            </v-col>
            <v-col cols="1">
                <v-btn color="error" @click="deleteItem(item)" text="Delete"/>
            </v-col>
            <v-col cols="1">
                <v-btn color="warning" @click="Dialog.ToggleDialog('replace_tag_or_source', {type: Route.name as string, id: item.id})" text="Replace"/>
            </v-col>
        </v-row>
    </v-container>
</template>

<style>
.highlight {
    background-color: lightblue !important;
}
</style>

<script setup lang="ts">
import { onMounted, ref, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useGET_APIStore, useDialogStore, usePOST_APIStore, usePUT_APIStore, useDELETE_APIStore, useBusStore } from '@/stores'
import { useTextPipe } from '@/pipes'
import type { Tag, Source, TagSourceAppearance, IRElementType } from '@/types/irelement';

const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const API_PUT = usePUT_APIStore()
const API_DELETE = useDELETE_APIStore()
const Bus = useBusStore()
const Route = useRoute()
const Dialog = useDialogStore()
const Router = useRouter()
const TextPipe = useTextPipe()
const words = ref([] as any[])
const wordMax = ref(Number.MIN_VALUE)
const wordMin = ref(Number.MAX_VALUE)
const wordDiff = ref()
const isLoading = ref(true)
const search_method = ref("OR")
const filter_buttons = ref([] as any[])

let tagOrSource = reactive({
    items: [] as Tag[] | Source[],
    selected: [] as Tag[] | Source[] | string[],
    details: [] as Tag[] | Source[],
    loading: false
})

let appearance = reactive({
    loading: false,
    items: [] as TagSourceAppearance[],
    items_per_page: 25,
    total: 0,
    sort_by: [],
    page: 1,
    target_filters: [],
    headers: [
        { title: 'Target', key: 'target_id' },
        { title: 'Target Type', key: 'target_type' },
        { key: 'items', sortable: false }
    ] as any[]
})

onMounted(async () => {
    InitSourcesAndTags()
})

watch(Route, () => {
    InitSourcesAndTags()
})

watch(
    () => Bus.GetReloadSelectedView,
    async () => {
        await LoadWordCloud()
        await OnSearch()
    }
)

async function add_item(targetId: number, targetType: IRElementType, existing: Tag[] | Source[]) {
    if (Route.name as string == "tags") {
        Dialog.ToggleDialog("tags", {targetId: targetId, targetType: targetType, existing: existing})
    }
    else {
        Dialog.ToggleDialog("sources", {targetId: targetId, targetType: targetType, existing: existing})
    }
}

async function toggle_target_filter(target_type: string) {
    const index = appearance.target_filters.indexOf(target_type)
    if (index != -1) {
        appearance.target_filters.splice(index, 1)
    }
    else {
        appearance.target_filters.push(target_type)
    }
    OnSearch()
}

function RemoveItem(index: number) {
    tagOrSource.selected.splice(index, 1)
}

async function OnSearch() {
    appearance.loading = true
    appearance.items = []
    tagOrSource.details = []

    if (tagOrSource.selected.length > 0) {
        const filterDict: any = {}

        let names: Array<string> = []
        let ids: Array<number> = []
        for (var i = 0; i < tagOrSource.selected.length; i++) {
            if (typeof tagOrSource.selected[i] == "string") {
                names.push(tagOrSource.selected[i] as string)
            }
            else {
                names.push((tagOrSource.selected[i] as Tag | Source).name)
                ids.push((tagOrSource.selected[i] as Tag | Source).id)
            }
        }
        //id would be preferred but we can do by name as well as a backup
        if (ids.length > 0) {
            filterDict.id = search_method.value == "OR" ? `[${ids.join()}]` : `{${ids.join()}}`
        }
        else if (names.length > 0) {
            filterDict.name = search_method.value == "OR" ? `[${names.join()}]` : `{${names.join()}}`
        }

        //adjust the filter buttons first in case a new tag/source was added or removed
        if (Route.name as string == "tags") {
            await API_GET.GET_TagTargetTypes(filterDict.name, filterDict.id).then((v) => {
                filter_buttons.value = Object.keys(v).map((target_type: string) => {
                    return {target_type: target_type, count: v[target_type]}
                })
            })
        }
        else {
            await API_GET.GET_SourceTargetTypes(filterDict.name, filterDict.id).then((v) => {
                filter_buttons.value = Object.keys(v).map((target_type: string) => {
                    return {target_type: target_type, count: v[target_type]}
                })
            })
        }

        //if any filter target_types are no longer listed in the target_filters then remove it
        let tmp_array = []
        for (let i = 0; i < appearance.target_filters.length; i++) {
            let keep = false
            for (let j = 0; j < filter_buttons.value.length; j++) {
                if (appearance.target_filters[i] == filter_buttons.value[j].target_type) {
                    keep = true
                    break
                }
            }
            if (keep) {
                tmp_array.push(appearance.target_filters[i])
            }
        }
        appearance.target_filters = tmp_array

        let order = appearance.sort_by.length == 1 ? appearance.sort_by[0].order : "asc";

        filterDict.limit = appearance.items_per_page
        filterDict.skip = (appearance.page - 1) * appearance.items_per_page
        filterDict.sort = appearance.sort_by.length == 1 ? `${order == "asc" ? "+" : "-"}${appearance.sort_by[0].key}` : "id"
        filterDict.target_types = appearance.target_filters.length > 0 ? appearance.target_filters : null

        if (Route.name as string == "tags") {
            await API_GET.GET_TagTargetTypes(filterDict.name, filterDict.id).then((v) => {
                filter_buttons.value = Object.keys(v).map((target_type: string) => {
                    return {target_type: target_type, count: v[target_type]}
                })
            })
            await API_GET.GET_IRElementTagAppearances(filterDict)
                .then((v: any) => {
                    if (v) {
                        appearance.items = v.result
                        appearance.total = v.totalCount
                    }
                })
        }
        else {
            await API_GET.GET_SourceTargetTypes(filterDict.name, filterDict.id).then((v) => {
                filter_buttons.value = Object.keys(v).map((target_type: string) => {
                    return {target_type: target_type, count: v[target_type]}
                })
            })
            await API_GET.GET_IRElementSourceAppearances(filterDict)
                .then((v: any) => {
                    if (v) {
                        appearance.items = v.result
                        appearance.total = v.totalCount
                    }
                })
        }
    }
    appearance.loading = false
}

async function OnWordClick(e: MouseEvent) {
    const target = (e.target as HTMLElement)
    if (target && target.children.length == 0) {
        await SearchTerm(target.innerText, true)
    }
}

function FollowLink(item: TagSourceAppearance) {
    Router.push(`${TextPipe.toIRElementPath(item.target_type)}/${item.target_id}`)
}

async function AppearanceFilter(filters: any) {
    appearance.page = filters.page
    appearance.items_per_page = filters.itemsPerPage
    appearance.sort_by = filters.sortBy
    OnSearch()
}

async function setItemDetails(event: MouseEvent, row: any) {
    if (event.target) {
        document.querySelectorAll(".highlight").forEach((a) => {
            a.classList.remove("highlight");
        });
        ((event.target as HTMLElement).parentNode as HTMLElement).classList.add("highlight");
        tagOrSource.details = row.item.items
    }
}

function SwitchButton() {
    search_method.value = search_method.value == "OR" ? "AND" : "OR"
    OnSearch()
}

async function SearchTerm(term: string | null, add: boolean = false) {
    tagOrSource.loading = true
    let data = null
    if (Route.name as string == "tags") {
        data = await API_GET.GET_SearchTags(term, null, 25, "-link_count")
    }
    else {
        data = await API_GET.GET_IRElementSources(25, term, "-link_count")
    }

    tagOrSource.items = data.result.map((item: any) => {
        return {title: `${item.name} (${item.link_count})`, value: item.name, description: item.description, id: item.id}
    })

    if (add) {
        const item = tagOrSource.items?.find((a: any) => a.value == term)
        if (item) {
            tagOrSource.selected.push(item as any)
        }
    }

    OnSearch()
    tagOrSource.loading = false
}

async function LoadWordCloud() {
    if (Route.name as string == "tags") {
        await API_GET.GET_SearchTags(null, null, 100, "-link_count").then((v: any) => {
            if (v) {
                words.value = v.result.map((a: Tag | Source) => {
                    if (a.link_count) {
                        if (a.link_count > wordMax.value) {
                            wordMax.value = a.link_count
                        }
                        if (a.link_count < wordMin.value) {
                            wordMin.value = a.link_count
                        }
                    }
                    return [a.name, a.link_count]
                })
            }
            wordDiff.value = Math.floor((wordMax.value - wordMin.value) / 4)
        })
    }
    else {
        await API_GET.GET_IRElementSources(100, undefined, "-link_count").then((v: any) => {
            if (v) {
                words.value = v.result.map((a: Tag | Source) => {
                    if (a.link_count) {
                        if (a.link_count > wordMax.value) {
                            wordMax.value = a.link_count
                        }
                        if (a.link_count < wordMin.value) {
                            wordMin.value = a.link_count
                        }
                    }
                    return [a.name, a.link_count]
                })
            }
            wordDiff.value = Math.floor((wordMax.value - wordMin.value) / 4)
        })
    }
}

async function InitSourcesAndTags() {
    isLoading.value = true
    tagOrSource.items = []
    tagOrSource.selected = []
    tagOrSource.details = []
    appearance.items = []
    appearance.items_per_page = 25
    appearance.total = 0
    appearance.sort_by = []
    appearance.page = 1

    if ((Route.params.id as string).length > 0) {
        if (Route.name as string == "tags") {
            await API_GET.GET_Tag(Route.params.id as string).then((v: Tag | Source) => {
                tagOrSource.selected = [v]
            })
        }
        else {
            await API_GET.GET_Source(Route.params.id as string).then((v: Tag | Source) => {
                tagOrSource.selected = [v]
            })
        }
    }

    await LoadWordCloud()
    await SearchTerm(null)
    isLoading.value = false
}

function WordCloudRotation() {
    return [0, 3 / 4][Math.floor(Math.random() * 2)]
}

function WordCloudColor([, weight]: Array<any>): any {
    if (weight == wordMax) {
        return '#063B62'
    }
    else if (weight > (wordMax.value - wordDiff.value)) {
        return '#81C1C6'
    }
    else if (weight > (wordMin.value + wordDiff.value)) {
        return '#2F7097'
    }
    else if (weight >= wordMin.value) {
        return '#2F9759'
    }
    else {
        return "black"
    }
}

function SelectSingleItem(event: MouseEvent, i: any) {
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
    tagOrSource.details = [i]; 
}

async function RemoveTagSourceById(item: any, tagOrSource: Tag | Source) {
    if (Route.name as string == "tags") {
        API_POST.POST_RemoveTag(tagOrSource.id, {target_type: item.target_type, target_id: item.target_id})
    }
    else {        
        API_POST.POST_RemoveSource(tagOrSource.id, {target_type: item.target_type, target_id: item.target_id})
    }
    //redo the search to update items
    await LoadWordCloud()
    await OnSearch()
}

async function updateItem(item: Tag | Source | null) {
    if (item !== null) {
        if (item.name === "" || item.name === null) {
            return
        }
        if (Route.name as string == "tags") {
            await API_PUT.UpdateTag(item.id, item.name, item.description)
        }
        else {
            await API_PUT.UpdateSource(item.id, item.name, item.description)
        }
        //redo the search to update items
        await LoadWordCloud()
        await OnSearch()
    }
}

async function deleteItem(item: Tag | Source | null) {
    if (item) {
        if (Route.name as string == "tags") {
            await API_DELETE.DELETE_Tag(item.id)
        }
        else {
            await API_DELETE.DELETE_Source(item.id)
        }
        //redo the search to update items
        await LoadWordCloud()
        await OnSearch()
    }
}
</script>