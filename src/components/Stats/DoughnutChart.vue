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
  name: 'DoughnutChart',
  props: {
    chartData: {
      type: Object,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    colors: {
      type: Array,
      default: () => [
        'rgba(255, 99, 132, 0.5)',   // January
        'rgba(54, 162, 235, 0.5)',    // February
        'rgba(255, 205, 86, 0.5)',    // March
        'rgba(75, 192, 192, 0.5)',    // April
        'rgba(153, 102, 255, 0.5)',   // May
        'rgba(255, 159, 64, 0.5)',    // June
        'rgba(46, 204, 113, 0.5)',    // July
        'rgba(241, 196, 15, 0.5)',    // August
        'rgba(230, 126, 34, 0.5)',    // September
        'rgba(52, 152, 219, 0.5)',    // October
        'rgba(155, 89, 182, 0.5)',    // November
        'rgba(26, 188, 156, 0.5)'     // December
      ]
    }
  },
  data() {
    return {
      dropdownOpen: false
    };
  },
  mounted() {
    this.createChart();
  },
  methods: {
    /*--- Toggle Save Dropdown ---*/
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    /*--- Create Doughnut Chart ---*/
    createChart() {
      const canvas = this.$refs.canvas;
      if (!canvas) {
        console.warn('DoughnutChart: Canvas missing, skipping render');
        return;
      }
      
      // If an existing chart instance exists, destroy it.
      if (this._chart) {
        this._chart.stop?.();
        this._chart.destroy();
        this._chart = null;
      }
      
      // Plugin to fill the canvas with white background during save.
      const whiteBackgroundPlugin = {
        id: 'whiteBackground',
        beforeDraw: (chartInstance) => {
          if (!chartInstance._saveWhite) return;
          const { ctx, width, height } = chartInstance;
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }
      };

      const ctx = canvas.getContext('2d');
      // Clone the chart data to avoid mutating parent's state.
      const dataClone = JSON.parse(JSON.stringify(this.chartData));
      
      // Set colors on each dataset.
      dataClone.datasets.forEach((ds) => {
        ds.backgroundColor = dataClone.labels.map((_, i) =>
          this.colors[i % this.colors.length]
        );
        ds.borderColor = dataClone.labels.map((_, i) =>
          this.colors[i % this.colors.length].replace(/0?\.5\)$/, '1)')
        );
      });
      
      // Default options for a doughnut chart.
      const defaultOpts = {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 30, bottom: 30, left: 30, right: 30 }
        },
        scales: {
          x: {
            display: false,
            ticks: { display: false },
            grid: { display: false, drawBorder: false }
          },
          y: {
            display: false,
            ticks: { display: false },
            grid: { display: false, drawBorder: false }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'right',
            fullSize: false,
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 5,
              color: '#666'
            },
            //--- Legend Hover Callbacks ---
            onHover: (event, legendItem, legend) => {
              const chart = legend.chart;
              // For doughnut charts, we assume one dataset.
              chart.setActiveElements([{ datasetIndex: 0, index: legendItem.index }]);
              // Optionally display tooltip over the hovered legend item.
              chart.tooltip.setActiveElements([{ datasetIndex: 0, index: legendItem.index }], {
                // Using event.offsetX/Y (if available).
                x: event.offsetX,
                y: event.offsetY
              });
              chart.update();
            },
            onLeave: (event, legendItem, legend) => {
              const chart = legend.chart;
              chart.setActiveElements([]);
              chart.tooltip.setActiveElements([], {});
              chart.update();
            }
          },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold' },
            formatter: (value, ctx) => ctx.chart.data.labels[ctx.dataIndex]
          }
        },
        interaction: {
          mode: 'nearest',
          intersect: true
        },
        elements: {
          arc: {
            hitRadius: 50,
            hoverOffset: 80
          }
        }
      };
      
      // Merge parent options.
      const mergedOpts = {
        ...defaultOpts,
        ...this.options,
        layout: { ...defaultOpts.layout, ...(this.options.layout || {}) },
        plugins: {
          ...defaultOpts.plugins,
          ...(this.options.plugins || {}),
          legend: {
            ...defaultOpts.plugins.legend,
            ...((this.options.plugins && this.options.plugins.legend) || {}),
            position: 'right',
            fullSize: false,
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 15,
              color: '#666',
              ...((this.options.plugins &&
                  this.options.plugins.legend &&
                  this.options.plugins.legend.labels) || {})
            },
            onHover: defaultOpts.plugins.legend.onHover,
            onLeave: defaultOpts.plugins.legend.onLeave
          },
          datalabels: {
            ...defaultOpts.plugins.datalabels,
            ...((this.options.plugins && this.options.plugins.datalabels) || {})
          }
        },
        scales: defaultOpts.scales,
        interaction: defaultOpts.interaction,
        elements: defaultOpts.elements
      };
      
      this._chart = new Chart(ctx, {
        type: 'doughnut',
        data: dataClone,
        options: mergedOpts,
        plugins: [whiteBackgroundPlugin]
      });
      
      this._chart._saveWhite = false;
    },
    /*--- Save Functionality ---*/
    saveImage(format) {
      if (!this._chart) return;
      this._chart._saveWhite = true;
      this._chart.update();
      
      setTimeout(() => {
        const canvas = this.$refs.canvas;
        const imageURL = canvas.toDataURL(`image/${format}`);
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = `chart.${format}`;
        link.click();
        this._chart._saveWhite = false;
        this._chart.update();
        this.dropdownOpen = false;
      }, 100);
    }
  },
  watch: {
    chartData() {
      this.createChart();
    },
    options() {
      this.createChart();
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
/*--- Chart Container & Canvas ---*/
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

/*--- Save Dropdown Styles ---*/
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