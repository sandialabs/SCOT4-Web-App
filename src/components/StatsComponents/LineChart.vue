<template>
  <div>
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
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
      canvasWidth: 0,
      canvasHeight: 0,
    };
  },
  mounted() {
    this.updateCanvasSize();
    this.createChart();
    window.addEventListener('resize', this.updateCanvasSize);
  },
  methods: {
    createChart() {
      const ctx = this.$refs.canvas.getContext('2d');
      this.chart = new Chart(ctx, {
        type: 'line',
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
    updateCanvasSize() {
      const parentWidth = this.$el.clientWidth;
      this.canvasWidth = parentWidth;
      this.canvasHeight = Math.round(parentWidth * 0.5); // Maintain a 2:1 aspect ratio
    },
  },
  watch: {
    chartData: {
      handler(newData, oldData) {
        if (JSON.stringify(newData) !== JSON.stringify(oldData)) {
          this.updateChart();
        }
      },
      deep: true,
    },
    options: {
      handler(newOptions, oldOptions) {
        if (JSON.stringify(newOptions) !== JSON.stringify(oldOptions)) {
          this.updateChart();
        }
      },
      deep: false,
    },
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    window.removeEventListener('resize', this.updateCanvasSize);
  },
};
</script>
