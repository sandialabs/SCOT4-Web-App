<template>
    <v-container v-if="journalData.length == 0 && !isLoading">
        <h5 class="text-center">No entries were found. Click the "Add Entry" button to add one</h5>
    </v-container>
    <v-container v-else-if="!isLoading" :fluid="true" class="pane-container">
        <JournalEntryCell :data="sortedJournalData" :entities="incomingProps.entities" :isNotModal="isNotModal"
            @DeleteEntry="DeleteEntry" @NewEntry="processNewEntry" ref="journalRoot"/>
    </v-container>
    <v-container v-else>
        <LoadingCard />
    </v-container>
</template>
<script setup lang="ts">
import { watch, onMounted, ref, reactive, computed, useTemplateRef } from 'vue';
import LoadingCard from '../Loaders/LoadingCard.vue'
import { useGET_APIStore, useFirehoseStore, useAuthStore } from '@/stores'
import JournalEntryCell from '../Journal/JournalEntry.vue'
import { IRElementAPIPaths, IRElementType, IRElementTypeSingular } from '@/types/irelement';
import { useStorage } from '../../storage/storage';
import { NewEntry } from '../../models';

let currentRouteName = ref("")
let currentRouteId = ref()
let incomingProps = defineProps(['data', 'entities', 'targetType', 'targetId', 'isNotModal', 'newEntry'])
const emit = defineEmits(["EntryIds"])
const journalRoot = useTemplateRef('journalRoot')
let journalData = reactive([] as any[])
let isLoading = ref(true)
const API_GET = useGET_APIStore()
const firehose = useFirehoseStore()
const storage = useStorage()
const Auth = useAuthStore()
let IsModal = ref(true)
let currentEntities = incomingProps.entities
let currentJournalData = []

const sortedJournalData = computed(() => {
    return nestJournalEntries(journalData);
});

onMounted(async () => {
    if (incomingProps.isNotModal) {
        IsModal.value = false
    }
    currentRouteName.value = incomingProps.targetType
    currentRouteId.value = incomingProps.targetId
    await GetJournalEntries(incomingProps.data.id)
    // Reload new entry content if it was previously cached
    const newEntryCache = await storage.getItem('editorContent' + ':' + IRElementTypeSingular[incomingProps.targetType] + ':' + incomingProps.targetId + ':-1')
    if (newEntryCache) {
        const parentID = parseInt(await storage.getItem('unsubmittedEntryParent:' + IRElementTypeSingular[incomingProps.targetType] + ':' + incomingProps.targetId)) || null
        const dummyEntry = new NewEntry("entry", { html: '' }, Auth.GetUser.username, parentID, parseInt(incomingProps.targetId), IRElementTypeSingular[incomingProps.targetType])
        dummyEntry.id = -1
        processNewEntry(dummyEntry)
    }
    firehose.$onAction(handleFirehose)
})

watch(() => incomingProps.newEntry, () => processNewEntry(incomingProps.newEntry))

function processNewEntry(entry: any){
    if (entry.id != -1 || !journalData.map(e => e.id).includes(-1)) {
        journalData.push(entry)
    }
    else {
        const highlightEntry = journalRoot.value?.$el.querySelector('[id=\'-1journal\']')
        if (highlightEntry) {
            highlightEntry.style.animation = 'highlight .8s'
            setTimeout(function () {
                highlightEntry.style.animation = 'unset'
            }, 800)
        }
    }
    if (entry.id == -1) {
        // Delay scroll until entry is actually created
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const scrollEntry = journalRoot.value?.$el.querySelector('[id=\'-1journal\']')
                if (scrollEntry) {
                    scrollEntry.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" })
                    const textarea = scrollEntry.querySelector("div[contenteditable='true']") as HTMLElement
                    textarea?.focus({ preventScroll: true })
                }
            })
        })
    }
}

function DeleteEntry(entryId: number){
    const entryIdx = journalData.findIndex((e) => e.id == entryId)
    if (entryIdx != -1) {
        if (journalData[entryIdx].children) {
            const oldEntryIds = journalData.map(e => e.id)
            for (const child of journalData[entryIdx].children) {
                if (!oldEntryIds.includes(child.id)) {
                    journalData.push(child)
                }
            }
        }
        journalData.splice(entryIdx, 1)
    }
}

async function GetJournalEntries(id: any) {
    await API_GET.GET_IRElementJournalEntries(IRElementAPIPaths[incomingProps.targetType], id)
        .then((v: any) => {
            journalData.length = 0; // Clear the array while preserving reactivity
            journalData.push(...v.result); // Push new entries into the array
            emit("EntryIds", journalData.map((a: any) => a.id))
        }).finally(() => {
            isLoading.value = false
        })
}



function nestJournalEntries(entries: any[]): any[] {
    const entryMap = new Map<number, any>();
    const roots: any[] = [];
    for (const entry of entries) {
        entry.children = [];
        entryMap.set(entry.id, entry);
    }
    for (const entry of entries) {
        if (entry.parent_entry_id !== null) {
            const parent = entryMap.get(entry.parent_entry_id);
            if (parent) {
                parent.children!.push(entry);
            }
        } else {
            roots.push(entry);
        }
    }
    return roots;
}


async function handleFirehose({ name, store, args, after, onError }) {
    const event = args[0]
    // We only want to get events for entries that are in this journal
    if (name == "handleEvent" && event.element_type == "entry" && event.target_type == IRElementTypeSingular[incomingProps.targetType] && event.target_id == incomingProps.targetId) {
        if (event.what == "create" && !journalData.map(e => e.id).includes(event.element_id)) {
            const newEntry = await API_GET.GET_IRElementDataSelected(IRElementAPIPaths[IRElementType.Entry], event.element_id)
            const newEntities = await API_GET.GET_IRElementEntity(IRElementAPIPaths[IRElementType.Entry], event.element_id)
            const oldEntityIds = incomingProps.entities.result?.map(e => e.id)
            if (oldEntityIds != undefined) {
                for (const entity of newEntities.result) {
                    if (!(entity.id in oldEntityIds)) {
                        incomingProps.entities.result.push(entity)
                    }
                }
            }
            journalData.push(newEntry)
        }
        else if (event.what == "delete") {
            const entryIdx = journalData.findIndex((e) => e.id == event.element_id)
            if (entryIdx != -1) {
                journalData.splice(entryIdx, 1)
            }
        }
    }
}

</script>
<style>
    @keyframes highlight {
        from {
            box-shadow: 0 0 4px 1px red;
        }

        to {
            box-shadow: 0;
        }
    }
</style>