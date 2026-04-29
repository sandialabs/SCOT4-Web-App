<template>
  <div class="chart-container">
    <canvas ref="canvas"></canvas>
    <div class="save-dropdown">
      <button class="save-btn" @click="toggleDropdown">Save</button>
      <div v-if="dropdownOpen" class="save-menu">
        <div class="save-option" @click="saveImage('jpg')">JPG</div>
        <div class="save-option" @click="saveImage('png')">PNG</div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'LineChart',
  props: {
    chartData: { 
      type: Object, 
      required: true 
    },
    options: { 
      type: Object, 
      required: true 
    }
  },
  data() {
    return {
      dropdownOpen: false
    };
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    renderChart() {
      const canvas = this.$refs.canvas;
      if (!canvas) {
        console.warn('LineChart: Canvas missing, skipping render');
        return;
      }

      const ctx = canvas.getContext('2d');
      const width = canvas.clientWidth || 400;
      const height = canvas.clientHeight || 300;

      // Clone data so we don't mutate the parent state.
      const dataClone = JSON.parse(JSON.stringify(this.chartData));

      // Create gradient stroke and fill for each dataset.
      dataClone.datasets.forEach((dataset) => {
        // Horizontal gradient for the line stroke.
        const gradientStroke = ctx.createLinearGradient(0, 0, width, 0);
        gradientStroke.addColorStop(0, 'rgba(70,130,180,1)'); // lighter on left
        gradientStroke.addColorStop(1, 'rgba(70,130,180,2)');   // darker on right
        dataset.borderColor = gradientStroke;

        // Vertical gradient for the fill.
        const fillStop = height > 0 ? Math.min(100 / height, 1) : 0.8;
        const gradientFill = ctx.createLinearGradient(0, 0, 0, height);
        gradientFill.addColorStop(0, 'rgba(70,130,180,0.5)');    // strong color at top
        gradientFill.addColorStop(fillStop, 'rgba(70,130,180,0.2)'); // tapering
        gradientFill.addColorStop(1, 'rgba(70,130,180,0)');        // transparent at bottom
        dataset.backgroundColor = gradientFill;
      });

      // Plugin to fill the canvas with a white background during save.
      const whiteBackgroundPlugin = {
        id: 'whiteBackground',
        beforeDraw: (chartInstance) => {
          if (!chartInstance._exportWhite) return;
          const { ctx, width, height } = chartInstance;
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      };

      const mergedOptions = {
        ...this.options,
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1500,
          easing: 'easeInOutQuad'
        }
      };

      // Create the chart instance.
      const chartInstance = new Chart(ctx, {
        type: 'line',
        data: dataClone,
        options: mergedOptions,
        plugins: [whiteBackgroundPlugin]
      });

      this._chart = chartInstance;
      this._chart._exportWhite = false;
    },
    saveImage(format) {
      if (!this._chart) return;
      this._chart._exportWhite = true;
      this._chart.update();

      // Delay to allow the chart to update.
      setTimeout(() => {
        const canvas = this.$refs.canvas;
        const imageURL = canvas.toDataURL(`image/${format}`);
        // Trigger download with a temporary anchor.
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = `chart.${format}`;
        link.click();
        this._chart._exportWhite = false;
        this._chart.update();
        this.dropdownOpen = false;
      }, 100);
    }
  },
  beforeUnmount() {
    if (this._chart) {
      if (typeof this._chart.stop === 'function') {
        this._chart.stop();
      }
      this._chart.destroy();
      this._chart = null;
    }
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 120%;
  height: 90%;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.save-dropdown {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.7em;
  z-index: 10;
}

.save-btn {
  background-color: #b0e0e6;
  border: none;
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background 0.3s;
  color: #000;
}

.save-btn:hover {
  background-color: #b0e0e6b1;
}

.save-menu {
  margin-top: 4px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.save-option {
  padding: 4px 10px;
  cursor: pointer;
  font-size: 0.8em;
  color: #000;
}

.save-option:hover {
  background-color: #ddd;
}

/* Global dark-mode */
:global(.scot-theme-dark .chart-container .save-btn),
:global(.scot-theme-dark .chart-container .save-option) {
  color: black !important;
}
</style>