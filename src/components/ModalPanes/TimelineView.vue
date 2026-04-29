<template>
    <div>
        <div v-if="isLoading" class="d-flex flex-column align-center justify-center" style="text-align: center;">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>Loading Entity Appearances...</p>
        </div>
        <div v-else class="chart-component" style="overflow-y: auto; max-height: 100%;" v-if="incomingProps.activeTab === 'timeline'">
            <div class="open-task v-system-bar">
                <v-spacer></v-spacer>
                <span class="truncate-on-overflow ml-1">Click on the legend items to show/hide data.</span>
                <v-spacer></v-spacer>
                <v-icon v-if="!fullScreenMode" @click="toggleFullScreen">mdi-arrow-expand</v-icon>
                <v-icon v-else @click="toggleFullScreen">mdi-arrow-collapse</v-icon>
            </div>
            <div>
                <div class="chart-container">
                    <VueChart
                        :type="'scatter'"
                        :data="chartData"
                        :options="chartOptions"
                        class="timeline-chart"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useTimelineStore } from '@/stores/timeline'; // Pinia store for timeline data
import { storeToRefs } from 'pinia';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chart as VueChart } from 'vue-chartjs';
import 'chartjs-adapter-luxon';

ChartJS.register(...registerables);

// Props
let incomingProps = defineProps<{ entity: { id: string }, activeTab: string }>(); // Add activeTab prop

// Reactive variables
const fullScreenMode = ref(false);
const isLoading = ref(true);
const chartData = ref(null);
const chartOptions = ref(null);
ChartJS.defaults.borderColor = "rgba(var(--v-theme-on-surface-light), var(--v-high-emphasis-opacity))"

// Pinia store
const timelineStore = useTimelineStore();
const { fetchEntityAppearances } = timelineStore;
const { entityAppearances, descriptionMapping } = storeToRefs(timelineStore);

// Lifecycle hook
onMounted(async () => {
    isLoading.value = true;
    try {
        await fetchEntityAppearances(incomingProps.entity.id);
        adjustParentHeight(entityAppearances.value.length);
        prepareChartData(entityAppearances.value, descriptionMapping.value);
    } catch (error) {
        console.error('Error parsing timeline data:', error);
    } finally {
        isLoading.value = false;
    }
});

// Methods

function adjustParentHeight(dataPointsCount: number) {
    const parent = document.querySelector('.chart-container') as HTMLElement;
    if (parent) {
        const baseHeight = 300;
        const additionalHeightPerItem = 10;
        let calculatedHeight = baseHeight + dataPointsCount * additionalHeightPerItem;

        if (dataPointsCount > 50) {
            calculatedHeight = Math.min(calculatedHeight, 800);
        }

        parent.style.minHeight = `${calculatedHeight}px`;
    }
}

function toggleFullScreen() {
    const chartContainer = document.querySelector('.chart-component');
    if (chartContainer) {
        chartContainer.classList.toggle('full-screen');
    }
    fullScreenMode.value = !fullScreenMode.value;
}

function prepareChartData(records: any[], descriptionMapping: {}) {
    const datasets: { label: string; data: { x: number; y: number }[]; backgroundColor: string }[] = [];
    const allTimestamps: number[] = [];

    for (const [key, value] of Object.entries(descriptionMapping)) {
        const filteredRecords = records.filter((r) => `${r.type}, ${r.status}` === key);

        const dataset = {
            label: key,
            data: filteredRecords.map((r) => {
                const timestamp = new Date(r.last_updated).getTime();
                allTimestamps.push(timestamp);
                return {
                    x: timestamp,
                    y: r.id,
                };
            }),
            backgroundColor: getColorForType(key),
        };

        datasets.push(dataset);
    }

    chartData.value = {
        datasets: datasets,
    };

    chartOptions.value = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            point: {
                radius: 6,
                hitRadius: 10,
            },
        },
        scales: {
            x: {
                type: 'time', // Time-based scale
                time: {
                    unit: 'week', // Set the unit to 'week'
                    tooltipFormat: 'MMM d, yyyy', // Format for tooltips
                    displayFormats: {
                        week: 'MMM d yy', // Format for week ticks
                    },
                },
                title: {
                    display: true,
                    text: 'Last Updated',
                },
                ticks: {
                    autoSkip: false,
                    callback: function (value: any, index: number) {
                        return index % 2 === 0 ? new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(value)) : '';
                    },
                },
            },
            y: {
                type: 'category', // Category-based scale
                labels: records.map((r) => r.id),
                title: {
                    display: true,
                    text: 'Id',
                },
            },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const dataset = context.dataset;
                        const dataPoint = dataset.data[context.dataIndex];
                        const record = records.find((r) => r.id === dataPoint.y);
                        return `(${record.id}, ${record.type}) ${record.subject}`;
                    },
                },
            },
        },
    };
}

function getColorForType(type: string): string {
    switch (type) {
        case 'alert, open':
            return '#FF5733';
        case 'event, open':
            return '#FF9F00';
        case 'intel, open':
            return '#FFC300';
        case 'dispatch, open':
            return '#FF4C4C';
        case 'alert, closed':
            return '#28A745';
        case 'event, closed':
            return '#007BFF';
        case 'intel, closed':
            return '#6F42C1';
        case 'dispatch, closed':
            return '#20C997';
        case 'alert, promoted':
            return '#FF8C00';
        case 'event, promoted':
            return '#FF4136';
        case 'intel, promoted':
            return '#6610F2';
        case 'dispatch, promoted':
            return '#FF6F61';
        default:
            return '#6C757D';
    }
}
</script>

<style scoped>
.chart-container {
    font-size: 10px;
    width: 100%;
    height: 350px;
    max-height: 350px;
}
.timeline-chart {
    height: 350px;
    max-height: 750px;
    background-color: rgb(var(--v-theme-surface));
}
.chartjs-legend {
    cursor: pointer;
}
.full-screen {
    position: fixed;
    top: 64px; 
    left: 0;
    width: 100%;
    height: calc(100% - 64px);
    z-index: 999; 
    background-color: rgb(var(--v-theme-surface));
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    overflow-y: auto; 
}
</style>
