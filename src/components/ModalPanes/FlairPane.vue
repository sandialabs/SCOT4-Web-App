<template>
    <div class="tabs d-flex flex-column" v-if="!isLoading" style="height: 100%; width: 100%">
        <!-- Row of Pivot Buttons -->
        <v-row no-gutters class="d-flex align-center mb-1 flex-grow-0">
            <v-tooltip bottom v-for="(pivot, index) in pivotData.result" :key="'pivot' + index">
                <template #activator="{ props }">
                    <v-btn
                        class="mr-2 mb-1"
                        v-bind="props"
                        @click="navigateToPivot(pivot.pivot_value)"
                        color="blue"
                        text
                        size="small"
                    >
                        {{ pivot.title }}
                    </v-btn>
                </template>
                <span>{{ pivot.description }}</span>
            </v-tooltip>
        </v-row>
        <!-- Enrichment Tabs -->
        <v-tabs v-model="tab" class="enrichment-tabs flex-shrink-0" density="compact">
            <v-tab
                value="appearances"
                :class="{ 'active-tab': tab === 'appearances' }"
            >
                Recent Appearances
            </v-tab>
            <v-tab 
                value="timeline"
                :class="{ 'active-tab': tab === 'timeline' }"
            >
                Timeline
            </v-tab>

            <v-tab
                v-for="(enrichmentName, i) in Object.keys(enrichmentData)"
                :key="'tab' + i + 2"
                :value="enrichmentName" 
                :class="{ 'active-tab': tab === enrichmentName }"
            >
                {{ enrichmentName }}
            </v-tab>
            <v-spacer></v-spacer>
            <v-btn size="small" rounded="0" variant="outlined" class="mr-5 mt-1" :elevation="1" @click="replayEnrichment">
                <FontAwesomeIcon :icon="faRedo" />&nbsp;Replay Enrichments
            </v-btn>
        </v-tabs>
        <v-tabs-window v-model="tab" class="child-noscroll">
            <!-- Recent Appearances Content -->
            <v-tabs-window-item value="appearances" style="height: 100%">
                <EntityAppearancesPane :entity="entityData"></EntityAppearancesPane>
            </v-tabs-window-item>
            <!-- Timeline Content -->
            <v-tabs-window-item value="timeline" class="flex-column-noscroll">
                <TimelineView :entity="entityData" :activeTab="tab" class="flex-column-noscroll"></TimelineView>
            </v-tabs-window-item>
            <!-- Enrichment Content -->
            <v-tabs-window-item
                v-for="(enrichmentName, i) in Object.keys(enrichmentData)"
                :key="'window' + i + 2"
                :value="enrichmentName"
                class="short-content"
            >
                <h6 class="p-2" v-if="currentEnrichmentData[enrichmentName]?.description">
                    {{ `Description: ${currentEnrichmentData[enrichmentName].description}` }}
                </h6>
                <v-divider></v-divider>
                <component :is="EnrichmentTabComponents[currentEnrichmentData[enrichmentName]?.enrichment_class]" :data="currentEnrichmentData[enrichmentName]"></component>
                <!-- Row for displaying the modified timestamp and navigation arrows -->
                <v-row no-gutters class="mt-3 mb-3 d-flex align-center pl-3 pr-3">
                    <!-- Buttons on the left -->
                    <div class="d-flex">
                        <!-- Left Arrow -->
                        <v-tooltip bottom v-if="currentIndex[enrichmentName] < enrichmentData[enrichmentName].length - 1">
                            <template #activator="{ props }">
                                <v-btn icon class="mr-2" v-bind="props" @click="cycleData(enrichmentName, 'previous')">
                                    <FontAwesomeIcon :icon="faArrowLeft" />
                                </v-btn>
                            </template>
                            <span>Click to see an earlier version of this enrichment</span>
                        </v-tooltip>

                        <!-- Right Arrow -->
                        <v-tooltip bottom v-if="currentIndex[enrichmentName] > 0">
                            <template #activator="{ props }">
                                <v-btn icon class="ml-2" v-bind="props" @click="cycleData(enrichmentName, 'next')">
                                    <FontAwesomeIcon :icon="faArrowRight" />
                                </v-btn>
                            </template>
                            <span>Click to see a later version of this enrichment</span>
                        </v-tooltip>
                    </div>
                    <!-- Spacer to push the "Modified" label and date to the right -->
                    <v-spacer></v-spacer>
                    <!-- Modified label and date on the right -->
                    <div class="d-flex align-center">
                        <h6 class="mr-2">Modified:</h6>
                        <p class="timestamp">{{ currentEnrichmentData[enrichmentName]?.modified }}</p>
                    </div>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
    <LoadingCard v-else />
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, computed } from 'vue';
import EntityAppearancesPane from './EntityAppearancesPane.vue';
import { useGET_APIStore, usePOST_APIStore, useFirehoseStore } from '@/stores';
import { EnrichmentTabComponents } from '@/types/enrichment';
import TimelineView from './TimelineView.vue';
import LoadingCard from '../Loaders/LoadingCard.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faRedo, faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';

const API_GET = useGET_APIStore();
const API_POST = usePOST_APIStore();
const firehose = useFirehoseStore();

let tab = ref("appearances");
let incomingProps = defineProps(['entity']);
const emit = defineEmits(['isEnrichmentsAvailable']);

let entityData = ref();
let pivotData = reactive({
    resultCount: 0,
    totalCount: 0,
    result: [],
});
let enrichmentData = reactive([]);
let currentEnrichmentData = reactive({});
let currentIndex = {};
let isLoading = ref(true);

// New reactive variables for response and error message
let enrichmentReplayResponse = ref(null);
let errorMessage = ref(null);

onMounted(() => {
    tab.value = "appearances";
    entityData.value = incomingProps?.entity;
    GetPivots();
    GetEnrichments();
    firehose.$onAction(handleFirehose);
});

function GetPivots() {
    API_GET.GET_PivotById(entityData.value.id)
        .then((v: any) => {
            if(v) {
                Object.assign(pivotData, v);
            }
        });
}

async function GetEnrichments() {
    await API_GET.GET_EnrichmentById(entityData.value.id)
        .then((v: any) => {
            if (v) {
                Object.assign(enrichmentData, v);
                emit('isEnrichmentsAvailable', true);
            } else {
                emit('isEnrichmentsAvailable', false);
            }
        }).finally(() => {
            InitializeCurrentIndex()
            SetCurrentEnrichmentData();
            isLoading.value = false;
        });
}

function InitializeCurrentIndex() {
    Object.keys(enrichmentData).forEach((enrichmentName) => {
        currentIndex[enrichmentName] = 0; // Initialize index for each enrichment
    });       
}

function SetCurrentEnrichmentData() {
    const currentData = {};
    Object.keys(enrichmentData).forEach((enrichmentName) => {
        if (enrichmentData[enrichmentName]?.length > 0) {
            const index = currentIndex[enrichmentName] || 0; // Default to index 0
            currentData[enrichmentName] = enrichmentData[enrichmentName][index];
        }
    });
    Object.assign(currentEnrichmentData, currentData);
}

// Replay Enrichment Functionality
function replayEnrichment() {
    API_POST.POST_EnrichEntityByID(entityData.value.id)
        .then((v: any) => {
            if (v) {
                enrichmentReplayResponse.value = v; // Store the response
                errorMessage.value = null; // Clear any previous error message
            } else {
                errorMessage.value = "No response received from the server."; // Set error message
                enrichmentReplayResponse.value = null; // Clear previous response
            }
        });
}

// Cycle through data sets for an enrichment
function cycleData(enrichmentName, direction) {
    const maxIndex = enrichmentData[enrichmentName]?.length - 1 || 0;
    if (direction === 'previous' && currentIndex[enrichmentName] < maxIndex) {
        currentIndex[enrichmentName]++;
    } else if (direction === 'next' && currentIndex[enrichmentName] > 0) {
        currentIndex[enrichmentName]--;
    }
    SetCurrentEnrichmentData()
}

function navigateToPivot(url) {
    window.open(url, '_blank');
}

async function handleFirehose({ name, store, args, after, onError }) {
    const event = args[0];
    if (name === "handleEvent" && event.element_type === "enrichment") {
        if (event.what === "create") {
            const newEnrichmentData = await API_GET.GET_EnrichmentById(entityData.value.id);
            Object.assign(enrichmentData, newEnrichmentData);
            InitializeCurrentIndex()
            SetCurrentEnrichmentData();
        }
    }
}
</script>

<style scoped>
.short-content {
    max-height: 300px;
    overflow-y: auto; /* Enable vertical scrolling for overflow content */
    padding: 16px;
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); /* Optional: Add a border for visual separation */
    background-color: rgb(var(--v-theme-surface)); /* Optional: Light background for better readability */
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
}

.enrichment-tabs {
    align-items: center;
    border-radius: 4px; /* Optional: Rounded corners for aesthetics */
    padding: 8px; /* Optional: Adds padding inside the tabs */
}

.scot-theme-light .enrichment-tabs {
    background-color: rgb(236, 236, 175) !important; /* Yellow background */
}

.scot-theme-dark .enrichment-tabs {
    background-color: rgb(104, 104, 57) !important; /* Yellow background */
}

.active-tab {
    font-weight: bold; /* Optional: Makes the active tab text bold */
    text-decoration: underline; /* Optional: Adds underline for hyperlink style */
}

.scot-theme-light .active-tab {
    color: #0000EE !important; /* Hyperlink-blue color */
}

.scot-theme-dark .active-tab {
    color: #181877 !important; /* Hyperlink-blue color */
}

.pivot-button {
    background-color: #1976d2; /* Blue background */
    color: white; /* White text */
    border-radius: 4px; /* Optional: Rounded corners */
    font-weight: bold; /* Optional: Bold text */
}

.response-message {
    margin-top: 20px;
    color: green;
}

.error-message {
    margin-top: 20px;
    color: red;
}

.mt-3 {
    margin-top: 1rem;
}

.mt-6 {
    margin-top: 2rem;
}

.mb-3 {
    margin-bottom: 1rem;
}

.align-center {
    align-items: center; /* Ensures label, timestamp, and arrows are vertically aligned */
}

.mr-2 {
    margin-right: 0.5rem; /* Adds spacing between elements */
}

.ml-2 {
    margin-left: 0.5rem; /* Adds spacing between elements */
}

.pr-3 {
    padding-right: 1rem; /* Adds padding to the right to prevent cutting off */
}

.pl-3 {
    padding-left: 1rem; /* Adds padding to the left to prevent cutting off */
}

.pd-5 {
    padding: 5px;
}

.timestamp {
    line-height: 1.5; /* Ensures the timestamp aligns well with the label */
}

v-btn {
    color: #000; /* Ensures buttons are visible */
    font-size: 1.2rem; /* Adjusts button size */
}

v-btn > svg {
    width: 1.2rem; /* Adjusts icon size */
    height: 1.2rem; /* Adjusts icon size */
}

.child-noscroll > :first-child {
    height: 100%;
}
</style>
