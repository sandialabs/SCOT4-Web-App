<template>
    <v-container v-if="!isLoading" :fluid="true" class="pa-0" ref="entryRoot">
        <template v-for="(entry, index) in sortedEntries" :key="entry?.id">
            <v-container class="ma-2 mb-0 pa-0" :id="entry?.id + 'journal'" :fluid="true">
                <v-card elevation="2"
                    :class="{'tlp-red': entry?.tlp == 'red', 'tlp-amber': entry?.tlp == 'amber', 'tlp-green': entry?.tlp == 'green', 'tlp-amber-strict': entry?.tlp == 'amber_strict', 'journal-border': entry?.tlp == 'unset' || entry?.tlp == 'clear'}">
                    <template v-if="entry?.entry_class == 'summary'">
                        <EntryCell :summary="true" v-if="!isLoading" :source="entry"
                            :entities="incomingProps.entities" :editing="entry.id == -1" :isNotModal="isNotModal"
                            :expanded="isEntryExpanded" @delete="onEntryDelete(entry.id)" @newentry="onNewEntry"/>
                    </template>
                    <template v-if="entry?.entry_class == 'promotion'">
                        <PromotedCell v-if="!isLoading"
                            :promotionSources="entry?.entry_data?.promotion_sources" :source="entry"
                            :entities="incomingProps.entities" :expanded="isEntryExpanded" @newentry="onNewEntry"/>
                    </template>
                    <template v-if="entry?.entry_class == 'entry' || entry?.entry_class == 'task'">
                        <EntryCell v-if="!isLoading" :source="entry"
                            :entities="incomingProps.entities" :editing="entry.id == -1" :isNotModal="isNotModal"
                            :expanded="isEntryExpanded" @delete="onEntryDelete(entry.id)" @newentry="onNewEntry"/>

                    </template>
                </v-card>
            </v-container>
            <v-container v-if="entry?.children?.length > 0" fluid class="mx-2 my-0 px-5 pt-0" :class="replyDepthColor">
                <div class="v-system-bar align-items-start cursor-pointer" :class="replyDepthColor" style="position: unset !important;" @click="isShowingReply = !isShowingReply">
                    <v-icon :icon="isShowingReply ? 'mdi-arrow-down' : 'mdi-arrow-right'"/>
                    <span>{{ isShowingReply ? "Showing" : "See" }} ({{ entry?.children?.length }}) replies</span>
                    <v-spacer/>
                </div>
                <JournalEntryCell v-for="(child, index) in entry?.children" :data="child"
                    :entities="incomingProps.entities" :key="'child-entry' + index" @DeleteEntry="onEntryDelete"
                    @NewEntry="onNewEntry" :replyDepth="replyDepth + 1" :expanded="isShowingReply"/>
            </v-container>
        </template>
    </v-container>
    <v-container v-else :fluid="true" class="p-0">
        <LoadingMultiLine />
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, useTemplateRef, defineEmits, computed } from 'vue';
import LoadingMultiLine from '../Loaders/LoadingMultiLine.vue'
import JournalEntryCell from './JournalEntry.vue'
import PromotedCell from './EntryCells/PromotedCell.vue';
import EntryCell from './EntryCells/EntryCell.vue';
import { useRoute } from 'vue-router';
import { IRElementAPIPaths, IRElementType } from '../../types/irelement';
import { useFirehoseStore, useGET_APIStore } from '../../stores';
import { useTheme } from 'vuetify';

const route = useRoute()
const firehose = useFirehoseStore()
const API_GET = useGET_APIStore()
const theme = useTheme()
let incomingProps = defineProps({
    data: Object,
    entities: Object,
    isNotModal: Boolean,
    replyDepth: {
        default: 0,
        required: false
    },
    expanded: {
        default: true,
        required: false
    },
})
const emit = defineEmits(['DeleteEntry', 'NewEntry'])
let journalEntries = ref([])
const entryRoot = useTemplateRef('entryRoot')
let isEntryExpanded = ref(incomingProps.expanded)
let isShowingReply = ref(incomingProps.expanded)
let isLoading = ref(true)
let replyDepthColor = ref("")

onMounted(() => {
    switch (incomingProps.replyDepth) {
        case 0:
            replyDepthColor.value = "journal-depth-0"
            break
        case 1:
            replyDepthColor.value = "journal-depth-1"
            break
        case 2:
            replyDepthColor.value = "journal-depth-2"
            break
        default:
            replyDepthColor.value = "journal-depth-3"
            break
    }

    isLoading.value = false
    firehose.$onAction(handleFirehose)
    requestAnimationFrame(checkEntryScroll)
})

watch(
    () => incomingProps.expanded,
    () => {
        isEntryExpanded.value = incomingProps.expanded
        isShowingReply.value = incomingProps.expanded
    }
)

const sortedEntries = computed(() => {
    if (Array.isArray(incomingProps.data)) {
        journalEntries.value = incomingProps.data
    } else {
        journalEntries.value = [incomingProps.data]
    }

    return journalEntries.value.sort((a, b) => {
        if (a.entry_class == 'summary' && b.entry_class != 'summary') {
            return -1;
        } else if (a.entry_class != 'summary' && b.entry_class == 'summary') {
            return 1;
        } else if (a.entry_class == 'promotion' && b.entry_class != 'promotion') {
            return -1;
        } else if (a.entry_class != 'promotion' && b.entry_class == 'promotion') {
            return 1;
        } else if (a.created < b.created){
            return -1;
        } else if (b.created < a.created){
            return 1;
        } else {
            return 0;
        }
    });
})

async function handleFirehose({ name, store, args, after, onError }) {
    const event = args[0]
    // We only want to get update events for this specific entry
    if (name == "handleEvent" && event.element_type == "entry" && event.what == "update") {
        const entryIdx = sortedEntries.value.findIndex(e => e.id == event.element_id)
        if (entryIdx != -1) {
            const newEntry = await API_GET.GET_IRElementDataSelected(IRElementAPIPaths[IRElementType.Entry], event.element_id)
            const newEntities = await API_GET.GET_IRElementEntity(IRElementAPIPaths[IRElementType.Entry], event.element_id)
            const oldEntityIds = incomingProps.entities.result.map(e => e.id)
            for (const entity of newEntities.result) {
                if (!(entity.id in oldEntityIds)) {
                    incomingProps.entities.result.push(entity)
                }
            }
            Object.assign(sortedEntries.value[entryIdx], newEntry)
        }
    }
}

watch(() => route.params.entryId, checkEntryScroll)

function onEntryDelete(entryId: number) {
    emit("DeleteEntry", entryId)
}

function onNewEntry(entry: any) {
    emit("NewEntry", entry)
}

function checkEntryScroll() {
    if (route.params.entryId || route.name == IRElementType.Entry) {
        const entryId = route.name == IRElementType.Entry ? route.params.id : route.params.entryId
        const entry = entryRoot.value.$el.querySelector('[id=\'' + entryId.toString() + 'journal\']')
        if (entry) {
            entry.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" })
        }
    }
}


</script>
<style scoped>
    .tlp-amber {
        border: 3px solid orange;
        border-radius: 5px;
    }

    .tlp-amber-strict {
        border-radius: 5px;
        border: 2px solid orange;
        box-shadow: 0 0 1px 1px red !important;
        margin: 1px;
    }

    .tlp-red {
        border: 3px solid red;
        border-radius: 5px;
    }

    .tlp-green {
        border: 3px solid green;
        border-radius: 5px;
    }

    .scot-theme-dark .journal-depth-0 {
        background-color: #424242;
    }

    .scot-theme-dark .journal-depth-1 {
        background-color: #616161;
    }

    .scot-theme-dark .journal-depth-2 {
        background-color: #757575;
    }

    .scot-theme-dark .journal-depth-3 {
        background-color: #BDBDBD;
    }

    .scot-theme-light .journal-depth-0 {
        background-color: #F5F5F5;
    }

    .scot-theme-light .journal-depth-1 {
        background-color: #E0E0E0;
    }

    .scot-theme-light .journal-depth-2 {
        background-color: #BDBDBD;
    }

    .scot-theme-light .journal-depth-3 {
        background-color: #757575;
    }
</style>