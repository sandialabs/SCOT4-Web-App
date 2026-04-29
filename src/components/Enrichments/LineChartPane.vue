<template>
    <LineChartGenerator
        :chart-options="chartOptions"
        :chart-data="chart_data"
        :chart-id="id"
        dataset-id-key="label"
    />
</template>

<script setup ="ts">
import { ref } from 'vue';
import {Line as LineChartGenerator} from "vue-chartjs"
import { Chart, Title, Tooltip, Legend, LineElement, LinearScale, CategoryScale, PointElement } from 'chart.js';

const incomingProps = defineProps(['data'])

Chart.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    LinearScale,
    CategoryScale,
    PointElement
)

const chartOptions = {responsive: true, maintainAspectRation: false}
const id = ref(incomingProps.data.id)
const chart_data = ref(incomingProps.data.chart_data)
</script>