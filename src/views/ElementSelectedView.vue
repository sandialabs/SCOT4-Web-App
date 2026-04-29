<template>
    <div class="bottom-sheet-wrapper" v-if="Panes.GetPanesActive && !isLoading">
        <div class="bottom-sheet-top-wrapper flex-grow-0">
            <div class="d-flex flex-column mb-2 mr-2" style="flex: 0;">
                <b class="my-2 pl-2">{{ selectedItem.id }}</b>
                <TLPPicker v-if="selectedItem.hasOwnProperty('tlp')" :data=selectedItem.tlp :targetType="currentRouteName" :targetId="parseInt(currentRouteId)" :entryIds="entryIds" :obj="selectedItem" />
            </div>
            <div class="px-2 d-flex" style="max-width: 75%;">
                <v-btn v-if="subjectFieldName" variant="outlined" v-tooltip:bottom="'Edit Subject'"
                    @click="Dialog.ToggleDialog('title', { data: selectedItem, targetType: currentRouteName, targetId: currentRouteId, subjectFieldName })"
                    rounded="lg" elevation="1" class="align-self-center" :size="lgAndDown ? 'small' : 'default'"
                >
                    <FontAwesomeIcon :icon="faEdit" />
                </v-btn>
                <h1 class="align-self-center px-2 ellipsis-text" v-if="subjectFieldName">{{ selectedItem[subjectFieldName] }}</h1>
                <h1 class="align-self-center px-2 ellipsis-text" v-else-if="selectedItem.hasOwnProperty('value')">{{ `${IRElementTypeSingular[currentRouteName]}: ${selectedItem.value}` }}</h1>
                <h1 class="align-self-center px-2 ellipsis-text" v-else>{{ `${IRElementTypeSingular[currentRouteName]} ${selectedItem.id}` }}</h1>
            </div>
            <div class="d-flex" style="flex: 1; justify-content: end">
                <h3 style="white-space: break-spaces; text-wrap: balance; min-width: 140px;">
                    {{ `${DatePipe.ConvertLongDate(selectedItem.created)} ${DatePipe.ConvertTime(selectedItem.created)}` }}
                </h3>
                <v-btn variant="outlined" @click="CloseBottomSheet" color="red" rounded="lg" elevation="1" class="ma-1 ml-2" :size="lgAndDown ? 'small' : 'default'">
                    <FontAwesomeIcon :icon="faTimes" />
                </v-btn>
            </div>
        </div>
        <div v-if="currentRouteName != 'pivots' && currentRouteName != 'entity_classes'" class="d-flex justify-content-center my-1 flex-grow-0">
            <fieldset v-if="currentRouteName != 'feeds'" class="mx-2 tags-sources">
                <legend>Sources</legend>
                <v-chip-group class="mt-n2">
                    <v-chip v-for="source in selectedItem.sources" :key="source.id" closable density="compact"
                        @click:close="RemoveSource(source.id)" v-tooltip:bottom="source.description" :text="source.name"
                        @click="open_link({name: 'sources', params: {id: source.id}})"
                    />
                    <v-chip base-color="green" rounded="lg" elevation="1" variant="outlined" density="compact"
                        @click="Dialog.ToggleDialog('sources', { selectedItem, targetType: currentRouteName, targetId: currentRouteId })"
                        v-tooltip:bottom="'Add a new source'"
                    >
                        <v-icon icon="$plus" />
                    </v-chip>
                </v-chip-group>
            </fieldset>
            <fieldset v-if="currentRouteName != 'feeds'" class="mx-2 tags-sources">
                <legend>Tags</legend>
                <v-chip-group class="mt-n2">
                    <v-chip v-for="tag in selectedItem.tags" :key="tag.id" closable density="compact"
                        @click:close="RemoveTag(tag.id)" v-tooltip:bottom="tag.description" :text="tag.name"
                        @click="open_link({name: 'tags', params: {id: tag.id}})"
                    />
                    <v-chip base-color="green" rounded="lg" elevation="1" variant="outlined" density="compact"
                        @click="Dialog.ToggleDialog('tags', { selectedItem, targetType: currentRouteName, targetId: currentRouteId })"
                        v-tooltip:bottom="'Add a new tag'"
                    >
                        <v-icon icon="$plus" />
                    </v-chip>
                </v-chip-group>
            </fieldset>
            <fieldset class="mx-2 tags-sources" v-if="currentRouteName == 'entities'">
                <legend>Entity Classes</legend>
                <v-chip-group class="mt-n2">
                    <v-chip v-for="c in selectedItem?.classes" :key="c.id" v-tooltip:bottom="c.description"
                        closable variant="outlined" density="compact" @click:close="RemoveClass(selectedItem.id, c.id)"
                    >
                        <v-icon v-if="c.icon" :icon="IconPipe.Vue2TO3IconFormat(c.icon)" />
                        <span v-else>{{ c.display_name }}</span>
                    </v-chip>
                    <v-chip base-color="blue" rounded="lg" elevation="1" variant="outlined" density="compact"
                        v-tooltip="'Add a new class'" @click="Dialog.ToggleDialog('class', { selectedItem, id: selectedItem.id })"
                    >
                        <v-icon icon="$plus" />
                    </v-chip>
                </v-chip-group>
            </fieldset>
            <div class="ml-auto d-flex">
                <v-select v-if="selectedItem.hasOwnProperty('owner')" label="Owner" class="ownerselect align-self-center" persistent-placeholder
                    hide-details :placeholder="selectedItem.owner" :model-value="selectedItem.owner" :items="ownerChoices()" density="compact"
                    @update:modelValue="SetOwnership" :readonly="selectedItem.owner == Auth.GetUser.username" no-data-text=""
                    style="margin-right: 2px; border: 1px solid black; border-radius: 5px;"
                />
                <template v-if="selectedItem.hasOwnProperty('status')">
                    <v-menu>
                        <template v-slot:activator="{ props }">
                            <v-btn v-bind="props" variant="flat" class="align-self-center" append-icon="mdi-chevron-down">
                                <template v-for="(item, i) in StatusChoices()" :key="'statusChosen-' + i">
                                    <v-chip variant="flat" v-if="item.value == selectedItem.status" small :color="item.color" :text="item.text" class="status-chip" />
                                </template>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-item v-for="(item, i) in StatusChoices()" :key="'statusItem-' + i" @click="UpdateStatus(item)">
                                <v-chip variant="flat" small :color="item.color" :text="item.text" class="status-chip" />
                            </v-list-item>
                        </v-list>
                    </v-menu>
                </template>
            </div>
        </div>

        <ToolbarElement :targetType=currentRouteName :targetId=currentRouteId :isExtraToolbarActive=isExtraToolbarActive
            :isFavorited="selectedItem?.favorite" :isSubscribed="selectedItem?.subscribed" :selectedItem="selectedItem"
            :alertSelectedIds="alertSelectedIds" :entryIds="entryIds" @RefreshElement="RefreshElement"
            @ToggleExtraToolBar="ToggleExtraToolBar" @CreateEntry="CreateEntry"
        />

        <v-tabs multiple grow height="36px" style="min-height: 36px; max-height: 36px; border-bottom: 1px solid black;"
            :bg-color="theme.current.value.dark ? 'grey-darken-4' : 'grey-lighten-2'"
            :selected-class="theme.current.value.dark ? 'bg-grey-darken-3' : 'bg-grey-lighten-1'" v-model="openTabs"
        >
            <v-tab v-for="tab in selectedIRElementTabs" :text="tab" @click="IRElementTabClicked(tab)" :value="tab">
                <template v-slot:append>
                    <v-badge v-if="tab == 'Alerts'" inline color="secondary" :content="selectedItem.full_alert_data?.length" />
                    <v-badge v-else-if="tab == 'Guides'" inline color="secondary" :content="GuidesLength()" />
                    <v-badge v-else-if="tab == 'Files'" inline color="secondary" :content="selectedItem?.file_count" />
                    <v-badge v-else-if="tab == 'Signatures'" inline color="secondary" :content="SignaturesLength()" />
                    <v-badge v-else-if="tab == 'Entities'" inline color="secondary" :content="entityData?.resultCount" />
                </template>
            </v-tab>
        </v-tabs>
        <v-progress-linear indeterminate v-if="isFlairLoading" color="primary"></v-progress-linear>
        <div class="d-flex justify-content-evenly" style="min-height: 0">
            <Splitpanes class="default-theme">
                <Pane v-for="pane in selectedIRElementPanes" :key="pane" class="scroll-pane">
                    <keep-alive>
                        <component :is="IRElementTabComponents[pane]" :data="selectedItem" :entities="entityData"
                            @ToggleExtraToolBar="ToggleExtraToolBar" :targetType="currentRouteName" :newEntry="newEntry"
                            @AlertSelectedIds="CaptureAlertSelectedIds" :targetId="currentRouteId" :isNotModal="true"
                            @RefreshElement="RefreshElement" @EntryIds="CaptureEntryIds"
                        />
                    </keep-alive>
                </Pane>
            </Splitpanes>
        </div>
    </div>
    <LoadingIRElement v-else-if="isLoading" />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme, useDisplay } from 'vuetify'
import { IRElementTabs, IRElementPanes, IRElementTabComponents, IRElementAPIPaths, IRElementAPIPathsNoSlash, IRElementType, IRElementTypeSingular, IRElementStatus, IRElementPaths } from '@/types/irelement'
import LoadingIRElement from '@/components/Loaders/LoadingIRElement.vue'
import { useGET_APIStore, usePOST_APIStore, usePUT_APIStore, useDialogStore, useAuthStore, usePanesStore, useBusStore, useFirehoseStore, usePopularityStore } from '@/stores'
import { ModelSourceRemove, ModelTagRemove } from '@/models'
import { useDatePipe, useIconPipe, useTextPipe } from '@/pipes'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons'
import { Splitpanes, Pane } from 'splitpanes'
import TLPPicker from '@/components/Pickers/TLPPicker.vue'
import ToolbarElement from '@/components/SelectedElements/ToolbarElement.vue'
import { isAxiosError } from 'axios'

const route = useRoute()
const router = useRouter()
const API_GET = useGET_APIStore()
const API_PUT = usePUT_APIStore()
const API_POST = usePOST_APIStore()
const Dialog = useDialogStore()
const Auth = useAuthStore()
const Panes = usePanesStore()
const Bus = useBusStore()
const Firehose = useFirehoseStore()
const theme = useTheme()
const DatePipe = useDatePipe()
const TextPipe = useTextPipe()
const { lgAndDown } = useDisplay()
const IconPipe = useIconPipe();
const Popularity = usePopularityStore()
const emit = defineEmits(['SelectedItemReload'])

let currentRouteName = ref()
let currentRouteId = ref()
let sourcesData: any = ref([])
let tagsData: any = ref([])
let entityData = ref(null)
let selectedItem: any = reactive({})
let alertSelectedIds = ref([] as number[])
let entryIds = ref([] as number[])
let newEntry = ref()
let isLoading = ref(true)
let isFlairLoading = ref(true)
let isExtraToolbarActive = ref(false)
let selectedIRElementPanes = ref([] as any[])
let selectedIRElementTabs = ref([] as any[])
let openTabs = ref([] as any[])
let activePanes = ref<Record<string, string[]>>({})

watch(
    () => route.params.id,
    () => HandleRoute()
)

watch(
    () => Bus.GetReloadSelectedView,
    () => GetIRElementDataSelected(currentRouteName.value, currentRouteId.value, Bus.GetReloadSelectedViewShowLoading)
)

onMounted(() => {
    HandleRoute()
    Firehose.$onAction(handleFirehose)
})

function open_link(route: any) {
    window.open(router.resolve(route).href, "_blank")
}

function HandleRoute() {
    const previousType = currentRouteName.value;

    if (route.name == IRElementType.Entry) {
        currentRouteName = computed(() => TextPipe.PluralizeString(route.params.target_type as string))
        currentRouteId = computed(() => route.params.target_id)
    } else {
        currentRouteName = computed(() => route.name)
        currentRouteId = computed(() => route.params.id)
    }

    // Clear active panes if switching to a different type
    if (previousType !== currentRouteName.value) {
        activePanes.value = {}; // Reset all tracked panes
    }

    GetIRElementSources()
    GetIRElementTags()
    Popularity.reset()

    currentRouteId.value ? GetIRElementDataSelected(currentRouteName.value, currentRouteId.value) : null
    if (currentRouteName.value != IRElementType.Alertgroup) {
        alertSelectedIds.value = []
        isExtraToolbarActive.value = false
    }
}

let firehoseInProgress = new Set()
async function handleFirehose({ name, store, args, after, onError }) {
    const event = args[0]
    // Short random delay to ease instantaneous load on the API and filter out duplicate reloads
    // Note that this delays the actual execution of the firehose action, but that's okay
    if (firehoseInProgress.has(event.what + "|" + event.element_type + "|" + event.element_id)) {
        return
    }
    firehoseInProgress.add(event.what + "|" + event.element_type + "|" + event.element_id)
    await new Promise(r => setTimeout(r, 500 + Math.random() * 1500))
    firehoseInProgress.delete(event.what + "|" + event.element_type + "|" + event.element_id)
    // We only want to get update events for this specific object
    if (name == "handleEvent" && event.what == "update" && event.element_type == IRElementTypeSingular[currentRouteName.value] && event.element_id == currentRouteId.value) {
        const newItem = await API_GET.GET_IRElementData(IRElementAPIPaths[currentRouteName.value], 0, 1, '-id', { id: currentRouteId.value })
        if (newItem?.result && newItem.result.length > 0){
            Object.assign(selectedItem, newItem.result[0])
            emit('SelectedItemReload', newItem.result[0])
        }
    }
    // Reload element if links to it are created/deleted/updated
    if (event.element_type == IRElementTypeSingular[IRElementType.Link]) {
        let elementId = -1
        let otherType = null
        if (event.v0_type == IRElementTypeSingular[currentRouteName.value]) {
            elementId = event.v0_id
            otherType = event.v1_type
        }
        else if (event.v1_type == IRElementTypeSingular[currentRouteName.value]) {
            elementId = event.v1_id
            otherType = event.v1_type
        }
        // Don't reload only for entity links
        if (elementId == currentRouteId.value && otherType != "entity") {
            const newItem = await API_GET.GET_IRElementDataSelected(IRElementAPIPaths[currentRouteName.value], currentRouteId.value)
            Object.assign(selectedItem, newItem)
            emit('SelectedItemReload', newItem)
        }
    }
}

const subjectFieldName = computed(() => {
    const candidates = ["subject", "display_name", "name", "title"]
    for (const c of candidates) {
        if (selectedItem.hasOwnProperty(c)) {
            return c
        }
    }
    return null
})

function CaptureAlertSelectedIds(alertIds: Array<number>) {
    alertSelectedIds.value = alertIds
}

function CaptureEntryIds(ids: Array<number>) {
    entryIds.value = ids
    Firehose.entryIds = ids
}

function IRElementTabClicked(tab: string) {
    const currentType = currentRouteName.value;
    if (!activePanes.value[currentType]) {
        activePanes.value[currentType] = []; // Initialize an empty array for the current type
    }
    if (selectedIRElementPanes.value.includes(tab) && selectedIRElementPanes.value.length != 1) {
        const index = selectedIRElementPanes.value.indexOf(tab)
        selectedIRElementPanes.value.splice(index, 1)

        activePanes.value[currentType] = activePanes.value[currentType].filter(pane => pane !== tab);
    }
    else if (!selectedIRElementPanes.value.includes(tab)) {
        const index = selectedIRElementTabs.value.indexOf(tab)
        selectedIRElementPanes.value.splice(index, 0, tab)

        if (!activePanes.value[currentType].includes(tab)) {
            activePanes.value[currentType].push(tab);
        }
    }
}

function ToggleExtraToolBar(isExtraToolBarActive: any) {
    isExtraToolbarActive.value = isExtraToolBarActive
}

function CreateEntry(entry: any) {
    newEntry.value = entry
}

function RefreshElement(refreshElement: any) {
    if (refreshElement === true) {
        GetIRElementDataSelected(currentRouteName.value, currentRouteId.value)
        emit('SelectedItemReload', selectedItem)
    }
    else if (refreshElement === false) {
        GetIRElementDataSelected(currentRouteName.value, currentRouteId.value, false)
        emit('SelectedItemReload', selectedItem)
    }
    else if (refreshElement) {
        Object.assign(selectedItem, refreshElement)
        emit('SelectedItemReload', refreshElement)
    }
    else {
        CloseBottomSheet()
    }
}

function CloseBottomSheet() {
    router.push({ path: IRElementPaths[route.name] })
}

async function GetIRElementSources() {
    await API_GET.GET_IRElementSources()
        .then((v) => {
            if (!isAxiosError(v)) {
                v.result.forEach((element: any) => {
                    sourcesData.value.push(element.name)
                });
            }
        })
}

async function GetIRElementTags() {
    await API_GET.GET_SearchTags()
        .then((v) => {
            if (!isAxiosError(v)) {
                v.result.forEach((element: any) => {
                    tagsData.value.push(element.name)
                });
            }
        })
}

async function GetIRElementEntity() {
    //skip getting entity for pivots and entity class
    if (currentRouteName.value == IRElementType.Pivot || currentRouteName.value == IRElementType.EntityClass) {
        isFlairLoading.value = false
    }
    else {
        isFlairLoading.value = true
        await API_GET.GET_IRElementEntity(IRElementAPIPaths[currentRouteName.value], currentRouteId.value)
            .then((v) => {
                entityData.value = v
            }).finally(() => {
                isFlairLoading.value = false
            })
    }
}

function ownerChoices() {
    if (selectedItem.owner == Auth.GetUser.username) {
        return []
    }
    else {
        return [{ value: null, title: 'Take Ownership' }]
    }
}

async function SetOwnership(owner: string | null = null) {
    if (owner == null) {
        owner = Auth.GetUser.username
    }
    await API_PUT.UpdateElementById(IRElementAPIPaths[currentRouteName.value], currentRouteId.value, { owner: owner })
        .then((newElement: any) => {
            RefreshElement(newElement)
        })
}

async function UpdateStatus(newStatus: any) {
    await API_PUT.UpdateElementById(IRElementAPIPaths[currentRouteName.value], currentRouteId.value, { status: newStatus.value })
        .then((newElement: any) => {
            RefreshElement(newElement)
        })
}

async function GetIRElementDataSelected(IRElementName: IRElementType, id: number, loading = true) {
    if (loading) {
        selectedIRElementPanes.value = []
        selectedIRElementTabs.value = []
    }
    loading ? isLoading.value = true : isLoading.value = false

    const path = IRElementAPIPaths[IRElementName]
    if (path) {
        await API_GET.GET_IRElementDataSelected(path, id)
            .then((v) => {
                Object.assign(selectedItem, v)
                selectedIRElementTabs.value = IRElementTabs[currentRouteName.value]
                // Add extra panes for the current type
                const currentType = currentRouteName.value;
                if (loading && !activePanes.value[currentType]) {
                    selectedIRElementPanes.value = JSON.parse(JSON.stringify(IRElementPanes[currentRouteName.value]))
                    openTabs.value = JSON.parse(JSON.stringify(IRElementPanes[currentRouteName.value]))
                }
                if (activePanes.value[currentType]) {
                    selectedIRElementTabs.value.forEach((pane) => {
                        if (activePanes.value[currentType].includes(pane) && !selectedIRElementPanes.value.includes(pane)) {
                            selectedIRElementPanes.value.push(pane);
                        }
                        if (activePanes.value[currentType].includes(pane) && !openTabs.value.includes(pane)) {
                            openTabs.value.push(pane)
                        }
                    });
                }
                else {
                    activePanes.value[currentType] = selectedIRElementPanes.value
                }
                Object.assign(Firehose.selectedElement, v)
                Firehose.selectedElementType = IRElementName
            })
            .finally(() => {
                isLoading.value = false
                Panes.ToggleOpenTwoPanes()
                GetIRElementEntity()
            })
    }
    else {
        isLoading.value = false
        Panes.ToggleOpenTwoPanes()
    }
}

function GuidesLength() {
    if (selectedItem && selectedItem.associated_sig_guide_map) {
        let size = 0
        for (var sig of Object.keys(selectedItem.associated_sig_guide_map)) {
            const key = Number(sig)
            size += selectedItem.associated_sig_guide_map[key].length
        }
        return size
    }
    else {
        return 0
    }
}

function SignaturesLength() {
    if (selectedItem && selectedItem.associated_sig_guide_map) {
        return Object.keys(selectedItem.associated_sig_guide_map).length
    }
    else if (selectedItem?.linkedElements) {
        return selectedItem.linkedElements.Signature.length
    }
    else {
        return 0
    }
}

async function RemoveSource(sourceId: any) {
    const removedSource = await API_POST.POST_RemoveSource(sourceId, new ModelSourceRemove(parseInt(currentRouteId.value), IRElementAPIPathsNoSlash[currentRouteName.value]))
    if (removedSource && selectedItem.sources) {
        const sourceIndexToRemove = selectedItem.sources.findIndex(source => source.id === removedSource.id)
        if (sourceIndexToRemove !== -1) {
            selectedItem.sources.splice(sourceIndexToRemove, 1)
            emit('SelectedItemReload', selectedItem)
        }
    }
}

async function RemoveTag(tagId: any) {
    const removedTag = await API_POST.POST_RemoveTag(tagId, new ModelTagRemove(parseInt(currentRouteId.value), IRElementAPIPathsNoSlash[currentRouteName.value]))
    if (removedTag && selectedItem.tags) {
        const tagIndexToRemove = selectedItem.tags.findIndex(tag => tag.id === removedTag.id)
        if (tagIndexToRemove !== -1) {
            selectedItem.tags.splice(tagIndexToRemove, 1)
            emit('SelectedItemReload', selectedItem)
        }
    }
}

async function RemoveClass(id: number, class_id: number) {
    const removedClass = await API_POST.POST_RemoveEntityClass(id, [class_id]);
    if (removedClass && selectedItem.classes) {
        const classIndexToRemove = selectedItem.tags.findIndex(c => c.id === removedClass.id)
        if (classIndexToRemove !== -1) {
            selectedItem.tags.splice(classIndexToRemove, 1)
            emit('SelectedItemReload', selectedItem)
        }
    }
}

function StatusChoices(): any {
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
    else if (selectedItem?.status == IRElementStatus.Promoted) {
        return [
            { value: 'promoted', text: 'Promoted', color: 'orange' },
            { value: 'open', text: 'Open', color: 'red' },
            { value: 'closed', text: 'Closed', color: 'green' }
        ]
    }
    else {
        return [
            { value: 'open', text: 'Open', color: 'red' },
            { value: 'closed', text: 'Closed', color: 'green' }
        ]
    }
}
</script>

<style scoped>
.tags-sources {
    border: 1px solid !important;
    border-radius: 10px !important;
    height: 100%;
    padding: 3px !important;
    font-size: 0.9rem !important;
    min-width: 150px;
    max-width: 100%;
}

.tags-sources legend {
    font-size: 0.9rem;
    margin-bottom: 0px !important;
}

.ownerselect {
    max-width: 200px;
}

.status-chip {
    min-width: 10em;
    justify-content: center;
}

.scot-theme-light .status-chip {
    color: black !important;
}

.v-btn {
    text-indent: initial;
}

.ellipsis-text {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
</style>
