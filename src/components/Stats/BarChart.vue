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
  name: 'BarChart',
  props: {
    chartData: { type: Object, required: true },
    options: { type: Object, required: true }
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
        console.warn('BarChart: Canvas missing, skipping render');
        return;
      }
      
      // Plugin to fill the canvas with a white background only when save is triggered.
      const whiteBackgroundPlugin = {
        id: 'whiteBackground',
        beforeDraw: (chartInstance) => {
          // Only draw white background when saving
          if (!chartInstance._exportWhite) return;
          const { ctx, width, height } = chartInstance;
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      };

      const ctx = canvas.getContext('2d');
      const width = canvas.clientWidth || 400;
      const height = canvas.clientHeight || 300;
      
      // Validate incoming data
      if (
        !this.chartData ||
        !this.chartData.labels ||
        !Array.isArray(this.chartData.labels) ||
        !this.chartData.datasets ||
        !Array.isArray(this.chartData.datasets)
      ) {
        console.error('Invalid chartData:', this.chartData);
        return;
      }
      if (!this.options || typeof this.options !== 'object') {
        console.error('Invalid options:', this.options);
        return;
      }
      
      // Clone chart data so as not to mutate parent's state.
      const dataClone = JSON.parse(JSON.stringify(this.chartData));

        // Create gradient fill for each dataset.
      dataClone.datasets.forEach((dataset) => {
        // Create gradient for the bar fill.
        const gradientFill = ctx.createLinearGradient(0, 0, 0, height);
        gradientFill.addColorStop(0, 'rgba(70,130,180,0.5)');    // strong color at top
        gradientFill.addColorStop(0.8, 'rgba(70,130,180,0.2)');  // tapering
        gradientFill.addColorStop(1, 'rgba(70,130,180,0)');      // transparent at bottom
        dataset.backgroundColor = gradientFill;

        // Set the border color for the bars.
        dataset.borderColor = 'rgba(70,130,180,1)'; // solid color for the border
        dataset.borderWidth = 1; // set border width
      });
      
      // Merge parent options with our defaults.
      const mergedOptions = {
        responsive: true,
        maintainAspectRatio: false,
        ...this.options,
        animation: {
          duration: 1500,
          easing: 'easeInOutQuad'
        }
      };

      // Create the Chart instance.
      const chartInstance = new Chart(ctx, {
        type: 'bar',
        data: dataClone,
        options: mergedOptions,
        plugins: [whiteBackgroundPlugin]
      });
     
      this._chart = chartInstance;
      this._chart._exportWhite = false; // Attach a non-reactive flag.
    },
    saveImage(format) {
      if (!this._chart) return;
      // Set our non-reactive flag so that white background is drawn.
      this._chart._exportWhite = true;
      this._chart.update();
      
      // Delay to allow the chart to update with a white background.
      setTimeout(() => {
        const canvas = this.$refs.canvas;
        const imageURL = canvas.toDataURL(`image/${format}`);
        
        // Trigger a download.
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = `chart.${format}`;
        link.click();
        
        // Reset the flag and update the chart to revert to the original appearance.
        this._chart._exportWhite = false;
        this._chart.update();
        
        // Close the dropdown.
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

/*--- Global Dark Mode ---*/
:global(.scot-theme-dark .chart-container .save-btn),
:global(.scot-theme-dark .chart-container .save-option) {
  color: black !important;
}
</style>