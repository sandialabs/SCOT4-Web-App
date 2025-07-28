<template>
    <div>
        <div v-if="loading" class="d-flex flex-column align-center justify-center" style="text-align: center;">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
            <p>Loading Entity Appearances...</p>
        </div>
        <div class="chart-component" style="overflow-y: auto; max-height: 100%;">
            <v-system-bar class="open-task">
                <v-spacer></v-spacer>
                <span class="truncate-on-overflow ml-1">Click on the legend items to show/hide data.</span>
                <v-spacer></v-spacer>
                <v-icon v-if="fullScreenMode!=true" @click="expandToFullScreen">mdi-arrow-expand</v-icon>
                <v-icon v-else @click="expandToFullScreen">mdi-arrow-collapse</v-icon>
            </v-system-bar>
            <div>
                <div class="chart-container">
                    <canvas ref="timelineChart" class="timeline-chart"></canvas>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { Getter } from 'vuex-class';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format, parseISO } from 'date-fns';

Chart.register(...registerables);

@Component
export default class TimelineView extends Vue {
    @Getter('selectedElement', { namespace: 'IRElements' }) selectedElement: any;
    @Prop({ default: null }) entity: any;
    @Prop({ default: false }) fullScreenMode: boolean

    private chart: any = null;
    private loading: boolean = true;

    async mounted() {
    this.loading = true;
    try {
        const { appearances, descriptionMapping } = await this.retryFetchTimelineData(); 
        this.adjustParentHeight(appearances.length);
        this.renderChart(appearances, descriptionMapping); 
    } catch (error) {
        console.error("Error parsing timeline data:", error); 
    } finally {
        this.loading = false; 
    }
}

adjustParentHeight(dataPointsCount: number) {
    const parent = document.querySelector('.chart-container') as HTMLElement;
    if (parent) {
        const baseHeight = 300; 
        const additionalHeightPerItem = 10; 
        let calculatedHeight = baseHeight + (dataPointsCount * additionalHeightPerItem);

       
        if (dataPointsCount > 50) {
            calculatedHeight = Math.min(calculatedHeight, 800); 
        }

        parent.style.minHeight = `${calculatedHeight}px`; 
    }
}

async expandToFullScreen() {
    const chartContainer = this.$el.querySelector('.chart-component');
    if (chartContainer) {
        chartContainer.classList.toggle('full-screen');
    }
    this.fullScreenMode = !this.fullScreenMode
}

async retryFetchTimelineData(maxRetries: number = 5, delay: number = 1000): Promise<any> {
    let attempts = 0;

    while (attempts < maxRetries) {
        // Check if entity and appearances are available
        if (this.entity && this.entity.appearances) {
            const appearances = this.entity.appearances.map((a: any) => ({
                type: `${a.type}, ${a.status}`,
                timestamp: a.last_updated,
                id: a.id,
                description: a.subject
            }));

            const descriptionMapping = await this.getAxisData(appearances);
            return { appearances, descriptionMapping }; // Return the valid data
        }

        // Wait for delay before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
        attempts++;
    }

    throw new Error("Max retries reached: Data is still null.");
}

async parseTimelineData() {
    const appearances = this.entity.appearances.map((a: any) => ({
        type: `${a.type}, ${a.status}`,
        timestamp: a.last_updated,
        id: a.id,
        description: a.subject
    }));
    const descriptionMapping = await this.getAxisData(appearances);
    return { appearances, descriptionMapping };
}

async getAxisData(records: any[]){
    const descriptionMapping: { [key: string]: number } = {};
    records.forEach((a, index) => {
        if (!descriptionMapping[a.type]) {
            descriptionMapping[a.type] = index + 1;
        }
    });
    return descriptionMapping;
}


getColorForType(type: string): string {
    switch (type) {
        // Open statuses
        case 'alert, open':
            return '#FF5733'; // Red-Orange
        case 'event, open':
            return '#FF9F00'; // Bright Orange
        case 'intel, open':
            return '#FFC300'; // Bright Yellow
        case 'dispatch, open':
            return '#FF4C4C'; // Bright Red

        // Closed statuses
        case 'alert, closed':
            return '#28A745'; // Green
        case 'event, closed':
            return '#007BFF'; // Bright Blue
        case 'intel, closed':
            return '#6F42C1'; // Purple
        case 'dispatch, closed':
            return '#20C997'; // Teal

        // Promoted statuses
        case 'alert, promoted':
            return '#FF8C00'; // Dark Orange
        case 'event, promoted':
            return '#FF4136'; // Bright Red
        case 'intel, promoted':
            return '#6610F2'; // Indigo
        case 'dispatch, promoted':
            return '#FF6F61'; // Coral

        default:
            return '#6C757D'; // Gray
    }
}

renderChart(records: any[], descriptionMapping: { [key: string]: number }) {
    const datasets: { label: string; data: { x: number; y: number }[]; backgroundColor: string }[] = [];
    const allTimestamps: number[] = [];
    for (const [key, value] of Object.entries(descriptionMapping)) {
        const filteredRecords = records.filter(r => r.type === key); // Filter records based on the key

        // Create a dataset for each unique description
        const dataset = {
            label: key, 
            data: filteredRecords.map(r => {
                const timestamp = parseISO(r.timestamp).getTime();
                allTimestamps.push(timestamp);
                return {
                    x: timestamp,
                    y: r.id // Use ID for y
                };
            }),
            backgroundColor: this.getColorForType(key), 
        };

        datasets.push(dataset);
    }
    const data = {
        datasets: datasets
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        elements: {
            point: {
                radius: 6, 
                hitRadius: 10, 
            }
        },
        scales: {
            x: {
                type: 'time' as const,
                time: {
                    unit: 'week' as const, // Set the unit to 'week'
                    tooltipFormat: 'MMM d, yyyy', // Format for tooltips
                    displayFormats: {
                        week: 'MMM d yy', 
                    },
                },
                title: {
                    display: true,
                    text: 'Last Updated'
                },
                ticks: {
                    autoSkip: false,
                    callback: function(value: any, index: number) {
                        // Show tick labels for every second week
                        return index % 2 === 0 ? format(new Date(value), 'MMM yyyy') : '';
                    }
                }
            },
            y: {
                type: 'category' as const,
                labels: records.map(r => r.id),
                title: {
                    display: true,
                    text: 'Id'
                }
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const dataset = context.dataset;
                        const dataPoint = dataset.data[context.dataIndex];
                        const record = records.find(r => r.id === dataPoint.y); 
                        return "("+ record.id + ", " + record.type + ") " + record.description; // Display description
                    }
                }
            }
        }
    };

    const canvas = this.$refs.timelineChart as HTMLCanvasElement | undefined;

    if (canvas) {
        this.chart = new Chart(canvas, {
            type: 'scatter',
            data: data,
            options: options
        });
    } else {
        console.error("Canvas reference is not defined.");
    }
}
}
</script>

<style scoped>
.chart-container {
    font-size: 10px;
    color: #555;
    width: 100%;
    height: 350px;
    max-height: 350px;
}
.timeline-chart {
    height: 350px;
    max-height: 750px;
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
    background-color: white; 
    overflow-y: auto; 
}

</style>
