<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  props: {
    chartData: Object,
    options: Object,
  },
  data() {
    return {
      chart: null,
    };
  },
  mounted() {
    this.createChart();
  },
  methods: {
    createChart() {
      const ctx = this.$refs.canvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'bar', // Change the chart type to 'bar'
        data: this.chartData,
        options: this.options,
      });
    },
    updateChart() {
      if (this.chart) {
        this.chart.destroy();
      }
      this.createChart();
    },
  },
  watch: {
    chartData: {
      handler(newData, oldData) {
        // Only update if the data has changed
        if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
          this.updateChart();
        }
      },
      deep: true,
    },
    options: {
      handler(newOptions, oldOptions) {
        // Only update if the options have changed
        if (JSON.stringify(newOptions) !== JSON.stringify(oldOptions)) {
          this.updateChart();
        }
      },
      deep: false, // Consider changing to false if deep watching is not necessary
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
};
</script>
