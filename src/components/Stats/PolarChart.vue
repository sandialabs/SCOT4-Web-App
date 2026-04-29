<template>
  <div class="chart-container">
    <canvas ref="canvas"></canvas>
    <div class="export-dropdown">
      <button class="export-btn" @click="toggleDropdown">Save</button>
      <div v-if="dropdownOpen" class="export-menu">
        <div class="save-option" @click="saveImage('png')">PNG</div>
        <div class="save-option" @click="saveImage('jpg')">JPG</div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'PolarChart',
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
        'rgba(255,  99, 132, 0.5)',    // January
        'rgba(54, 162, 235, 0.5)',      // February
        'rgba(255, 205, 86, 0.5)',      // March
        'rgba(75, 192, 192, 0.5)',      // April
        'rgba(153, 102, 255, 0.5)',     // May
        'rgba(255, 159, 64, 0.5)',      // June
        'rgba(46, 204, 113, 0.5)',      // July
        'rgba(241, 196, 15, 0.5)',      // August
        'rgba(230, 126, 34, 0.5)',      // September
        'rgba(52, 152, 219, 0.5)',      // October
        'rgba(155, 89, 182, 0.5)',      // November
        'rgba(26, 188, 156, 0.5)'       // December
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
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    createChart() {
      const canvas = this.$refs.canvas;
      if (!canvas) {
        console.warn('PolarChart: Canvas missing, skipping render');
        return;
      }
      
      // If an existing chart instance exists, destroy it.
      if (this._chart) {
        this._chart.stop?.();
        this._chart.destroy();
        this._chart = null;
      }
      
      // Clone incoming data so we don't mutate parent's state.
      const raw = JSON.parse(JSON.stringify(this.chartData));
      const isoLabels = raw.labels;
      const datasets = raw.datasets;
      const dsCount = datasets.length;
      
      // Group the data by month/year and sum per dataset.
      const groupMap = new Map();
      isoLabels.forEach((iso, idx) => {
        const d = new Date(iso);
        const year = d.getFullYear();
        const month0 = d.getMonth();
        const key = `${year}-${month0}`;
        const display = d.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!groupMap.has(key)) {
          groupMap.set(key, {
            date: new Date(year, month0),
            display,
            totals: Array.from({ length: dsCount }, () => 0)
          });
        }
        const entry = groupMap.get(key);
        datasets.forEach((ds, dsIdx) => {
          entry.totals[dsIdx] += Number(ds.data[idx]) || 0;
        });
      });
      
      const groups = Array.from(groupMap.values()).sort((a, b) => a.date - b.date);
      const data = {
        labels: groups.map(g => g.display),
        datasets: datasets.map((origDs, dsIdx) => ({
          label: origDs.label,
          data: groups.map(g => g.totals[dsIdx])
        }))
      };
      
      // Set colors on each dataset.
      data.datasets.forEach(ds => {
        ds.backgroundColor = data.labels.map((_, i) => this.colors[i % this.colors.length]);
        ds.borderColor = data.labels.map((_, i) =>
          this.colors[i % this.colors.length].replace(/0?\.5\)$/, '1)')
        );
        ds.hoverOffset = 10;
        ds.hoverBorderWidth = 3;
      });
      
      // Default options for a polar area chart.
      const defaultOpts = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            grid: { display: true },
            angleLines: { display: false },
            ticks: { display: true, color: '#666' },
            pointLabels: { display: false }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'right',
            fullSize: false,
            // Legend config with circular icons and added hover callbacks
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 5,
              color: '#666'
            },
            onHover: (event, legendItem, legend) => {
              const chart = legend.chart;
              const pos = { x: event.offsetX, y: event.offsetY };
              chart.setActiveElements([{ datasetIndex: 0, index: legendItem.index }]);
              chart.tooltip.setActiveElements([{ datasetIndex: 0, index: legendItem.index }], pos);
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
            font: { weight: 'bold', size: 12 },
            formatter: (_val, ctx) => ctx.chart.data.labels[ctx.dataIndex],
            anchor: 'center',
            align: 'center'
          }
        },
        interaction: {
          mode: 'nearest',
          intersect: true
        }
      };
      
      const mergedOpts = {
        ...defaultOpts,
        ...this.options,
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
        interaction: defaultOpts.interaction
      };
      
      // Plugin to fill the canvas with a white background when saving.
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
      
      const ctxCanvas = this.$refs.canvas.getContext('2d');
      this._chart = new Chart(ctxCanvas, {
        type: 'polarArea',
        data,
        options: mergedOpts,
        plugins: [whiteBackgroundPlugin]
      });
      this._chart._exportWhite = false;
    },
    saveImage(format) {
      if (!this._chart) return;
      this._chart._exportWhite = true;
      this._chart.update();
      
      setTimeout(() => {
        const canvas = this.$refs.canvas;
        const imageURL = canvas.toDataURL(`image/${format}`);
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = `chart.${format}`;
        link.click();
        this._chart._exportWhite = false;
        this._chart.update();
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
  width: 120%;
  height: 90%;
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.export-dropdown {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.7em;
  z-index: 10;
}

.export-btn {
  background-color: #b0e0e6;
  border: none;
  border-radius: 20px;
  padding: 4px 12px;
  cursor: pointer;
  transition: background 0.3s;
  color: #000;
}

.export-btn:hover {
  background-color: #b0e0e6b1;
}

.export-menu {
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
:global(.scot-theme-dark .chart-container .export-btn),
:global(.scot-theme-dark .chart-container .save-option) {
  color: black !important;
}
</style>