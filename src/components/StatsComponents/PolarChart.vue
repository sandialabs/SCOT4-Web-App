<template>
  <div>
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  props: {
    chartData: {
      type: Object,
      required: true,
    },
    options: {
      type: Object,
      required: true,
    },
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
      if (this.chart) {
        this.chart.destroy();
      }
      const ctx = this.$refs.canvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'polarArea',
        data: this.chartData,
        options: this.options,
      });
    },
  },
  watch: {
    chartData: {
      handler(newData, oldData) {
        if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
          this.createChart();
        }
      },
      deep: true,
    },
    options: {
      handler(newOptions, oldOptions) {
        if (JSON.stringify(newOptions) !== JSON.stringify(oldOptions)) {
          this.createChart();
        }
      },
      deep: true,
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
};
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
