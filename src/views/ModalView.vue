<template>
    <UseDraggable id="draggableResize" class="draggableModal shadow border d-flex flex-column" :initial-value="modalPosition"
        :handle="toolbarRef" @end="savePosition" @dragend="savePosition">
        <!-- Toolbar -->
        <v-toolbar ref="toolbarRef" class="cursor-move sticky-toolbar" density="compact" color="black" height="36px">
            <v-spacer />
            <v-btn color="yellow" rounded="lg" elevation="1" class="mr-2" @click="Modal.ToggleModal()">
                <FontAwesomeIcon :icon="faMinus" />
            </v-btn>
            <v-btn color="danger" rounded="lg" elevation="1" @click="CloseModalAndClearFlair()">
                <FontAwesomeIcon :icon="faTimes" />
            </v-btn>
        </v-toolbar>

        <!-- Tabs -->
        <v-tabs v-model="tab" density="compact" mandatory="force" class="flex-shrink-0">
            <v-tab v-for="(entity, i) in selectedEntities" :key="'windows' + entity.value" :text="entity.value"
                :value="i" :class="{ 'active-tab': tab === i }" class="tabs mr-1" append-icon="$close">
                <template v-slot:append>
                    <FontAwesomeIcon :icon="faTimes" @click="RemoveSelectedEntity(i)" />
                </template>
            </v-tab>
        </v-tabs>

        <!-- Tabs Content -->
        <v-tabs-window v-model="tab" class="child-noscroll flex-grow-1">
            <v-tabs-window-item v-for="(entity, i) in selectedEntities" :key="'windows' + entity.value"
                :text="entity.value" :value="i" class="p-2 tabs entity-content-window">
                <!-- Entity Information -->
                <div class="d-flex flex-column" style="height: 100%">
                    <v-row class="d-flex entity-stats-row flex-grow-0" no-gutters>
                        <v-col cols="6" class="flex-grow-0">
                            <v-row no-gutters>
                                <router-link :to="'/entities/' + entity?.id.toString()" class="text-h6">
                                    Entity {{ entity?.id }}
                                </router-link>
                                <v-menu>
                                    <template v-slot:activator="{ props }">
                                        <v-btn size="x-small" v-bind="props" variant="plain" class="align-self-center">
                                            <FontAwesomeIcon :icon="faChevronDown" />
                                            &nbsp;
                                            <template v-for="(item, i) in trackedEntityItems" :key="'statusChosen-' + i">
                                                <v-chip v-if="item.value == entity?.status" size="small" :color="item.color"
                                                        variant="outlined" :text="item.title" />
                                            </template>
                                        </v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item v-for="(item, i) in trackedEntityItems" :key="'statusItem-' + i"
                                                     @click="UpdateStatus(item, i)">
                                            <v-chip size="small" :color="item.color" variant="outlined" :text="item.title" />
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </v-row>
                            <v-row no-gutters class="align-items-center ">
                                <span class="text-body-1">{{ entity.type_name + ": " + entity.value}}</span>
                                <v-btn size="small" density="comfortable" class="ml-1" variant="outlined" icon @click="copyTextToClipboard(entity.value)"><v-icon size="small">mdi-content-copy</v-icon></v-btn>
                            </v-row>
                        </v-col>
                        <v-col class="flex-grow-0">
                            <fieldset class="mx-2 tags-sources">
                                <legend>Entity Classes</legend>
                                <v-chip-group class="mt-n2">
                                    <v-chip v-for="c in entity?.classes" :key="c.id" closable density="compact"
                                            :text="c.name" @click:close="RemoveClass(entity.id, c.id)"
                                            v-tooltip:bottom="c.description" @click.prevent.stop="open_link({name: IRElementType.EntityClass, params: {id: c.id}})">
                                        <v-icon v-if="c.icon" :icon="IconPipe.Vue2TO3IconFormat(c.icon)" />
                                        <span v-else>{{ c.display_name }}</span>
                                    </v-chip>
                                    <v-chip base-color="green" rounded="lg" elevation="1" variant="outlined"
                                            density="compact"
                                            @click="Dialog.ToggleDialog('class', { selectedItem: entity, id: entity.id, targetType: IRElementType.Entity })"
                                            v-tooltip="'Add a new class'">
                                        <FontAwesomeIcon :icon="faPlus" />
                                    </v-chip>
                                </v-chip-group>
                            </fieldset>
                        </v-col>
                        <v-col class="flex-grow-0">
                            <fieldset class="mx-2 tags-sources">
                                <legend>Tags</legend>
                                <v-chip-group class="mt-n2">
                                    <v-chip v-for="tag in entity.tags" :key="tag.id" closable density="compact"
                                            @click:close="RemoveTag(entity.id, tag.id)" @click.prevent.stop="open_link({name: 'tags', params: {id: tag.id}})"
                                            v-tooltip:bottom="`Tag: ${tag.description}`" :text="tag.name" />
                                    <v-chip base-color="green" rounded="lg" elevation="1" variant="outlined"
                                            density="compact"
                                            @click="Dialog.ToggleDialog('tags', { selectedItem: entity, targetType: IRElementType.Entity, targetId: entity.id })"
                                            v-tooltip:bottom="'Add a new tag'">
                                        <FontAwesomeIcon :icon="faPlus" />
                                    </v-chip>
                                </v-chip-group>
                            </fieldset>
                        </v-col>
                    </v-row>
                    <!-- FlairPane and JournalPane -->
                    <v-row no-gutters style="max-height: 60%" class="mb-2 mt-1 flex-grow-0">
                        <FlairPane :entity="entity" @isEnrichmentsAvailable="ToggleEnrichmentButtons" />
                    </v-row>
                    <div class="journal-pane-container d-flex flex-column flex-grow-0">
                        <div>
                            <v-btn size="small" rounded="0" variant="outlined" color="success"
                                   v-if="IRElementQuickButtons[IRElementType.Entity]?.includes('add_entry')"
                                   @click="AddEntry()">
                                <FontAwesomeIcon :icon="faPlusCircle" />&nbsp; Add Entry
                            </v-btn>
                        </div>
                        <div class="journal-pane flex-shrink-1">
                            <JournalPane class="py-0 pl-0" :data="entity" :entities="[entity]"
                                     :targetType="IRElementType.Entity" :targetId="entity.id" :isNotModal="false"
                                     :newEntry="newEntry" />
                        </div>
                    </div>
                </div>
            </v-tabs-window-item>
        </v-tabs-window>
    </UseDraggable>
</template>

<script setup lang="ts">
import { watch, ref, onMounted, reactive, nextTick } from 'vue';
import { useModalStore, useFlairStore, useGET_APIStore, usePUT_APIStore, usePOST_APIStore, useDialogStore, useAuthStore } from '@/stores';
import { NewEntry } from '@/models'
import { useIconPipe } from '@/pipes';
import { UseDraggable } from "@vueuse/components";
import { FontAwesomeIcon, } from '@fortawesome/vue-fontawesome';
import { faTimes, faMinus, faPlus, faChevronDown, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import FlairPane from '@/components/ModalPanes/FlairPane.vue';
import { IRElementType, IRElementAPIPathsNoSlash, IRElementQuickButtons } from '@/types/irelement';
import JournalPane from '@/components/SelectedElementPanes/JournalPane.vue';
import { useDisplay } from 'vuetify';
import { useRouter } from 'vue-router';

const Router = useRouter()
const Modal = useModalStore();
const Flair = useFlairStore();
const Auth = useAuthStore()
const API_GET = useGET_APIStore();
const API_PUT = usePUT_APIStore();
const API_POST = usePOST_APIStore();
const IconPipe = useIconPipe();
const Dialog = useDialogStore();
const display = useDisplay()
const modalPosition = reactive(sessionStorage.modelPosition ? JSON.parse(sessionStorage.modelPosition) : { x: 50, y: 50 });

let tab = ref(null);
let showEnrichmentButtons = ref(false);
let selectedEntities = ref([]);
let newEntry = ref()
const startingHeight = ref('500px')
const trackedEntityItems = [
    { title: 'Tracked', value: 'tracked', color: 'green' },
    { title: 'Untracked', value: 'untracked', color: 'red' },
];

// Reference for the toolbar
const toolbarRef = ref(null);

onMounted(async () => {
    if (display.xl) {
        startingHeight.value = '700px'
    }
    HandleModal()
});

watch(() => Flair.GetFlairModalSelect, (idx) => {
    tab.value = Flair.GetFlairModalSelect
})

watch(tab, (x) => {
    if (tab.value === undefined) {
        tab.value = 0;
    }
});

watch(() => Modal.GetRefreshModalEntity, async (newValue, oldValue) => {
    if (newValue) {
        // Update the selected entity's journal data
        const entityId = selectedEntities.value[tab.value].id;
        await API_GET.GET_IRElementEntity("/entity", entityId)
            .then((v: any) => {
                Object.assign(selectedEntities.value[tab.value], [v])
            }).finally(() => {
                Modal.ToggleRefreshModalEntity(); // Ensure this doesn't cause infinite loops
            });
    }
});

function HandleModal() {
    selectedEntities.value = Flair.GetSelectedFlairedEntities;
    if (Flair.GetFlairModalSelect && Flair.GetFlairModalSelect > 0 && Flair.GetFlairModalSelect < selectedEntities.value.length) {
        tab.value = Flair.GetFlairModalSelect
    }
    else {
        tab.value = 0;
    }
}

function savePosition() {
    let el = document.getElementById("draggableResize");
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ensure the modal stays within the viewport
    const newLeft = Math.max(0, Math.min(el.offsetLeft, viewportWidth - el.offsetWidth));
    const newTop = Math.max(0, el.offsetTop); // Prevent dragging above the top of the viewport

    el.style.left = `${newLeft}px`;
    el.style.top = `${newTop}px`;

    sessionStorage.setItem("modalSizeWidth", `${el.offsetWidth}`);
    sessionStorage.setItem("modalSizeHeight", `${el.offsetHeight}`);
    sessionStorage.setItem("modelPosition", JSON.stringify({ x: newLeft, y: newTop }));
}

function ToggleEnrichmentButtons(isEnrichmentsAvailable: boolean) {
    isEnrichmentsAvailable ? (showEnrichmentButtons.value = true) : (showEnrichmentButtons.value = false);
}

function RemoveSelectedEntity(index: any) {
    Flair.RemoveFromSelectedEntities(index)
}

function CloseModalAndClearFlair() {
    Modal.ToggleModal();
    Flair.ClearSelectedFlair();
}

async function UpdateStatus(newStatus: any, n: number) {
    await API_PUT.UpdateElementById(
        '/entity',
        selectedEntities.value[tab.value].id.toString(),
        { status: newStatus.value }
    ).then((v: any) => {
        Object.assign(selectedEntities.value[tab.value], v)
    });
}

async function RemoveClass(id: number, class_id: number) {
    await API_POST.POST_RemoveEntityClass(id, [class_id]);
}

async function RemoveTag(id: number, tag_id: number) {
    await API_POST.POST_RemoveEntityTag(id, tag_id);
}

function copyEntity(value: string) {
    navigator.clipboard.writeText(value);
}

async function AddEntry() {
    const dummyEntry = new NewEntry(
        "entry",
        { html: "" },
        Auth.GetUser.username,
        null,
        parseInt(selectedEntities.value[tab.value].id),
        IRElementAPIPathsNoSlash[IRElementType.Entity]
    );
    dummyEntry.id = -1
    newEntry.value = dummyEntry

    await API_POST.POST_CreateIRElement("/entry", { entry: newEntry }).then(async () => {
        const entityId = selectedEntities.value[tab.value].id;

        // Fetch updated journal entries for the entity
        const updatedEntries = await API_GET.GET_IRElementJournalEntries(
            '/entity',
            entityId
        );

        // Update the selected entity's journal data
        const entityIndex = selectedEntities.value.findIndex(
            (entity) => entity.id === entityId
        );
        if (entityIndex !== -1) {
            selectedEntities.value[entityIndex].journalEntries = updatedEntries.result;
        }
        // Ensure the JournalPane refreshes
        nextTick(() => {
        });
    });
}
async function copyTextToClipboard(text: string) {
    navigator.clipboard.writeText(text)
}

function open_link(route: any) {
    window.open(Router.resolve(route).href, "_blank")
}
</script>

<style scoped>
.draggableModal {
    position: fixed;
    top: 50px;
    left: 50px;
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    border: 2px solid rgba(var(--v-border-color), var(--v-border-opacity));
    border-radius: 8px;
    padding: 0px;
    resize: both !important;
    overflow-y: hidden;
    /* Enable vertical scrolling */
    overflow-x: hidden;
    /* Prevent horizontal scrolling */
    min-width: 37vw;
    min-height: 200px;
    max-height: 100vh;
    /* Set a maximum height for the modal */
    width: 40vw;
    height: v-bind(startingHeight);
    /* Optional: Set a width */
    z-index: 2000 !important;   
}

.scot-theme-light .draggableModal {
    background-color: #e5e5f5 !important;
}

.scot-theme-dark .draggableModal {
    background-color: #263238 !important
}

.scot-theme-light .draggableModal a {
    color: black
}

.scot-theme-dark .draggableModal a {
    color: white
}


.entity-stats-row {
    align-items: center;
    justify-content: start;
}

.entity-content-window {
    padding: 5px;
    height: 100%;
    justify-content: center;
}

.journal-pane-container {
    max-height: 100%;
    overflow-y: hidden;
    overflow-x: hidden;
    /* Prevent horizontal scrolling */
    padding: 0;
    /* Remove padding to avoid extra space */
    align-items: start;
    /* Vertically center the button */
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));;
    /* Optional: Add a border for visual separation */
    background-color: rgb(var(--v-theme-surface));
    /* Optional: Light background for better readability */
}

.journal-pane {
    max-height: 100%;
    /* Fixed height for the container */
    overflow-y: auto !important;
    /* Enable vertical scrolling */
    overflow-x: hidden;
    /* Prevent horizontal scrolling */
    padding: 0;
    /* Optional: Add padding for better aesthetics */
    min-height: 50px;
    background-color: rgb(var(--v-theme-surface));
    /* Optional: Set a background color */
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));;
    /* Optional: Add a border */
    border-radius: 4px;
    /* Optional: Rounded corners */
    width: 100%;
}

.journal-row {
    display: flex;
    /* Use flex layout */
    flex-wrap: nowrap;
    /* Prevent wrapping */
    align-items: start;
    /* Vertically center the button */
    justify-content: flex-start;
    /* Align content to the left */
    height: auto;
    /* Automatically adjust to the content height */
    padding: 0;
    /* Remove padding */
    margin: 0;
    /* Remove margin */
    background-color: rgb(var(--v-theme-surface));
    /* Optional: Light background for better readability */
}

.sticky-toolbar {
    position: sticky;
    /* Keeps the toolbar fixed within the modal */
    top: 0;
    /* Ensures it sticks to the top of the modal */
    z-index: 10;
    /* Ensures it stays above other content */
}

.active-tab {
    font-weight: bold;
}

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

.child-noscroll > :first-child {
    height: 100%;
}
</style>