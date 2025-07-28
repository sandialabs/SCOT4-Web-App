<template>
  <div :class="{ 'dark-mode' : darkMode }">
  <div>
    <!-- Displays the last refresh time of the charts -->
    <div class="refresh-time-data-display">
      Chart data refreshed on: {{ refreshTime }}
    
    <!-- Radio buttons for selecting the time range -->
    <div class="refresh-time-data-display">
      <span class="chart-type-label">Display Data For:  </span>
      <label>
          <input type="radio" name="timeRange" value="12" v-model="selectedTimeRange" @change="updateChartData" aria-label="Last 12 Months" />
          Last 12 Months
      </label>
      <label>
          <input type="radio" name="timeRange" value="24" v-model="selectedTimeRange" @change="updateChartData" aria-label="Last 24 Months" />
          Last 24 Months
      </label>
      <label>
          <input type="radio" name="timeRange" value="all" v-model="selectedTimeRange" @change="updateChartData" aria-label="All Data" />
          All Data
      </label>
      </div>
    </div>

    <!-- Reset controls section -->
    <div v-if="!showMttcMttr" class="reset-controls-container">
      <div class="reset-controls">
        <span class="reset-label">Reset All Charts to:</span>
        <div class="button-group">
          <button class="reset-button" @click="resetCharts('line')" aria-label="Reset all charts to Line chart">Line</button>
          <button class="reset-button" @click="resetCharts('bar')" aria-label="Reset all charts to Bar chart">Bar</button>
          <button class="reset-button" @click="resetCharts('donut')" aria-label="Reset all charts to Donut chart">Donut</button>
          <button class="reset-button" @click="resetCharts('polar')" aria-label="Reset all charts to Polar Area chart">Polar Area</button>
          <button class="reset-button" @click="resetCharts('line-monthly')" aria-label="Reset all charts to Monthly Line chart">Line (Monthly)</button>
          <button class="reset-button" @click="resetCharts('bar-monthly')" aria-label="Reset all charts to Monthly Bar chart">Bar (Monthly)</button>
        </div>
      </div>
    </div>

    <!-- Container for controls -->
    <div class="controls-container">
      <!-- Button for MTTC/MTTR toggle -->
      <button class="reset-button" @click="toggleMTTCMTTR" aria-label="Toggle MTTC/MTTR view">
          {{ showMttcMttr ? 'Back To Metric Charts' : 'MTTC/MTTR' }}
      </button>
    </div>

    <!-- Conditional rendering for MTTC/MTTR page -->
    <div v-if="showMttcMttr" class="charts-container">  
      <!-- MTTC Chart -->
      <div class="chart-wrapper">
        <div class="chart-controls">
          <div class="sort-controls">
            <label :for="'mttc-sort'" class="chart-type-label">Sort By: </label>
              <select id="mttc-sort" v-model="mttcSortType" @change="updateMTTCSortType" aria-label="Select sorting option for MTTC chart">
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
            </select>
          </div>  
        </div>
        <Bar-chart ref="mttcChart" :chart-data="mttcChartData" :options="getChartOptions('bar', 'MTTC (Mean Time to Contain)', '', mttcChartData.labels.length, mttcChartData.labels, true)" />
      </div>
    
      <!-- MTTR Chart -->
      <div class="chart-wrapper">
        <div class="chart-controls">
          <div class="sort-controls">
            <label :for="'mttr-sort'" class="chart-type-label">Sort By: </label>
            <select id="mttr-sort" v-model="mttrSortType" @change="updateMTTRSortType" aria-label="Select sorting option for MTTR chart">
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
            </select>
          </div>
        </div>
        <Bar-chart ref="mttrChart" :chart-data="mttrChartData" :options="getChartOptions('bar', 'MTTR (Mean Time to Remediate)', '', mttrChartData.labels.length, mttrChartData.labels, true)" />
      </div>
    </div>

    <!-- Loading message displayed while data is being fetched -->
    <div v-if="loading || isCalculatingAverages" class="loading-message">
      Loading chart data, please wait{{ loadingDots }}.
    </div>

    <!-- Error message displayed if data fetching fails -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- Container for displaying charts, only shown when not in MTTC/MTTR mode -->
    <div v-if="!showMttcMttr" class="charts-container">
      <div v-for="data in displayedChartData" :key="data.index" class="chart-wrapper">
        <div class="chart-controls">
          <label :for="'chart-type-' + data.index" class="chart-type-label">Chart Type: </label>
          <select :id="'chart-type-' + data.index" v-model="chartData[data.index].chartType" @change="updateChartType(data.index)" aria-label="Select chart type">
            <option value="line">Line</option>
            <option value="bar">Bar</option>
            <option value="donut">Donut</option>
            <option value="polar">Polar Area</option>
            <option value="line-monthly">Line (Monthly)</option>
            <option value="bar-monthly">Bar (Monthly)</option>
            <option value="line-year">Line (Year)</option>
            <option value="bar-year">Bar (Year)</option>
          </select>
        </div>

        <!-- Date range filter -->
        <div class="date-range-controls">
          <label :for="'start-date-' + data.index" class="date-range-label">Start Date: </label>
          <input type="date" :id="'start-date-' + data.index" v-model="chartData[data.index].startDate" @change="updateDateRange(data.index)" aria-label="Select start date for chart" />
          <label :for="'end-date-' + data.index" class="date-range-label">End Date: </label>
          <input type="date" :id="'end-date-' + data.index" v-model="chartData[data.index].endDate" @change="updateDateRange(data.index)" aria-label="Select end date for chart" />
          <button class="reset-button" @click="resetDateRange(data.index)" aria-label="Reset date range for chart">Reset Date Range</button>
        </div>

        <!-- Render different types of charts based on the selected chart type -->
        <component :is="getChartComponent(chartData[data.index].chartType)" :chart-data="data.chartData" :options="data.options" :ref="'chart-' + data.index" />
      </div>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator';
import { Action, Getter } from 'vuex-class';
import LineChart from '@/components/StatsComponents/LineChart.vue';
import BarChart from '@/components/StatsComponents/BarChart.vue';
import PolarChart from '@/components/StatsComponents/PolarChart.vue';
import DoughnutChart from '@/components/StatsComponents/DoughnutChart.vue';
import { ChartData, TooltipItem, ScatterDataPoint, BubbleDataPoint } from 'chart.js';

type ChartRef = Vue & {
  chart?: {
    ctx: CanvasRenderingContext2D; 
    getDatasetMeta: (index: number) => any; 
    data: {
      labels: string[]; 
      datasets: Array<{
        data: number[]; 
      }>;
    };
    update: () => void; 
  };
};

interface MonthlyData {
    [key: string]: {
        total: number;
        count: number;
    };
}

const monthlyData: { mttc: MonthlyData; mttr: MonthlyData } = { mttc: {}, mttr: {} };

interface ChartInfo {
  index: number;
  chartType: string;
  chartData: ChartData<'line' | 'bar' | 'doughnut' | 'polarArea'>;
  options: any;
  startDate: string;
  endDate: string;
  originalData: { labels: string[], values: number[] }; 
}
interface MetricResult {
    name: string;
    results: { [key: string]: number }; // Assuming results are keyed by date strings and values are numbers
}
interface FilteredResult {
    name: string;
    results: { [key: string]: number }; 
}
interface StatsPaneData {
  loading:boolean;
  isCalculatingAverages: boolean;
  errorMessage: string;
}

@Component({
  components: {
    LineChart, BarChart, PolarChart, DoughnutChart,
   },
})
export default class StatsPane extends Vue {
//Chart Data Management
  chartData: Array<ChartInfo> = [];
  displayedChartData: Array<ChartInfo> = [];
  mttcChartData: any = {};
  mttrChartData: any = {};
  selectedTimeRange: string = '12'; // Default sort by

//Chart Options
  mttcChartOptions: any = {};
  mttrChartOptions: any = {};

//Loading/Error States
  refreshTime: string = '';
  loading: boolean = false;
  loadingDots: string = '';
  errorMessage: string = '';
  dateRangeError: string = '';
  isCalculatingAverages: boolean = false;

// Toggle property for MTTC/MTTR State
  showMttcMttr: boolean = false; // Control the visibility of "MTTC/MTTR"

// MTTC/MTTR Chart Controls
  mttcStartDate: string = '';
  mttcEndDate: string = '';
  mttcSortType: string = 'month'; // Default sort by
  mttrStartDate: string = '';
  mttrEndDate: string = '';
  mttrSortType: string = 'month'; // Default sort by
  
  @Getter('darkMode', { 'namespace': 'user' }) darkMode: boolean
  @Getter('metricResults', { namespace: 'team' }) metricResults!: Array<any>;
  @Action('retrieveMetricResults', { namespace: 'team' }) retrieveMetricResults!: CallableFunction;
  @Getter('specialMetric', { namespace: 'team' }) specialMetric!: Array<any>;
  @Action('retrieveSpecialMetric', { namespace: 'team' }) retrieveSpecialMetric!: CallableFunction;

// Lifestyle Hooks
  mounted() {
      window.addEventListener('resize', this.debouncedHandleResize);
      this.fetchSpecialMetric();
      this.fetchMetricResults();
  }
  @Watch('darkMode')
      onDarkModeChange() {
        this.$vuetify.theme.dark = this.darkMode;
        // Refresh the page when dark mode changes
        window.location.reload();
  }
  
  beforeDestroy() {
    // Clean up the event listener when the component is destroyed
    window.removeEventListener('resize', this.debouncedHandleResize);
  }

  handleResize() {
      this.updateCharts(); 
  }

//Data Fetching Functions
  async fetchMetricResults() {
    this.loading = true;
    this.errorMessage = '';
    const loadingInterval = setInterval(() => {
        this.loadingDots = this.loadingDots.length < 3 ? this.loadingDots + '.' : '';
    }, 300);
    try {
        await this.retrieveMetricResults();
        localStorage.setItem('metricResults', JSON.stringify(this.metricResults));
        localStorage.setItem('metricResultsTimestamp', Date.now().toString());
        this.initializeChartData(); // Call to initialize chart data
        this.updateRefreshTime();
    } catch (error) {
        this.errorMessage = 'Failed to load data. Please try again later.';
    } finally {
        clearInterval(loadingInterval);
        this.loading = false;
    }
  }

  async fetchSpecialMetric() {
    this.loading = true;
    this.isCalculatingAverages = true;
    this.errorMessage = '';
    const loadingInterval = setInterval(() => {
      this.loadingDots = this.loadingDots.length < 3 ? this.loadingDots + '.' : '';
    }, 300);
    try {
      await this.retrieveSpecialMetric();
      localStorage.setItem('specialMetric', JSON.stringify(this.specialMetric));
      localStorage.setItem('specialMetricTimestamp', Date.now().toString()); 
      this.calculateAverages(); // Calculate averages for MTTC and MTTR
      this.updateCharts();
    } catch (error) {
      this.errorMessage = 'Failed to load data. Please try again later.';
    } finally {
      clearInterval(loadingInterval);
      this.loading = false;
      this.isCalculatingAverages = false;
    }
  }

//Data Processing Functions
  calculateAverages() {
      const monthlyData: {
          mttc: { [key: string]: { total: number; count: number } };
          mttr: { [key: string]: { total: number; count: number } };
      } = { mttc: {}, mttr: {} }; // Explicitly define the structure

      const now = new Date();
      const startDateLimit = this.getStartDateLimit(now);

      this.specialMetric.forEach(metric => {
          const startTime = new Date(metric.start_time);
          const endTime = new Date(metric.end_time);

          // Check if start_time or end_time is null or invalid
          if (!metric.start_time || !metric.end_time || startTime.getTime() === 0 || endTime.getTime() === 0) {
              return; // Skip this metric if the timestamp is invalid
          }

          if (startTime < startDateLimit) return; // Skip if outside the selected range

          const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
          const monthKey = `${startTime.getFullYear()}-${startTime.getMonth() + 1}`;
          const type: 'mttc' | 'mttr' = metric.metric_type; // Define type as a union

          // Check if the type is valid before indexing
          if (!monthlyData[type][monthKey]) {
              monthlyData[type][monthKey] = { total: 0, count: 0 };
          }
          monthlyData[type][monthKey].total += duration;
          monthlyData[type][monthKey].count += 1;
      });

      this.mttcChartData = this.prepareChartData(monthlyData.mttc, 'MTTC (Mean Time to Contain)'); 
      this.mttrChartData = this.prepareChartData(monthlyData.mttr, 'MTTR (Mean Time to Remediate)');
  }

  getStartDateLimit(now: Date): Date {
      let startDateLimit: Date;
      if (this.selectedTimeRange === '12') {
          startDateLimit = new Date(now.setMonth(now.getMonth() - 12));
      } else if (this.selectedTimeRange === '24') {
          startDateLimit = new Date(now.setMonth(now.getMonth() - 24));
      } else {
          startDateLimit = new Date(0); // No limit for 'all'
      }
      return startDateLimit;
  }

  prepareChartData(monthlyData: { [key: string]: { total: number; count: number } }, title: string) {
      const labels = Object.keys(monthlyData);
      const values = labels.map(month => {
          const { total, count } = monthlyData[month];
          return count > 0 ? total / count : 0; // Calculate average
      });

      // Determine colors based on the title
      const isMTTR = title.includes('MTTR'); // Check if the metric_type contains 'MTTR'
      const backgroundColor = isMTTR ? 'rgba(255, 99, 132, 0.2)' : 'rgba(54, 162, 235, 0.2)'; // Red for MTTR, Blue for MTTC
      const borderColor = isMTTR ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)'; // Solid red for MTTR, Solid blue for MTTC

      return {
          labels,
          datasets: [{
              label: title,
              data: values,
              backgroundColor, // Set background color
              borderColor, // Set border color
              borderWidth: 2, // Set border width for both charts
          }],
          originalData: { labels, values },
      };
  }

initializeChartData() {
    const filteredResults: FilteredResult[] = this.filterMetricResultsByTimeRange(this.metricResults);

    this.chartData = filteredResults.map((dataset: FilteredResult, index: number) => {
        const labels = Object.keys(dataset.results);
        const values = Object.values(dataset.results) as number[]; // Cast to number[]
        const savedChartType = localStorage.getItem(`chartType-${index}`) || 'line';

        // Create chart data based on the saved chart type
        const chartData = this.createChartData(savedChartType, labels, values, dataset.name);

        return {
            index: index,
            chartType: savedChartType,
            chartData: chartData,
            options: this.getChartOptions(savedChartType, dataset.name, '', values.length, labels, false),
            startDate: '',
            endDate: '',
            originalData: { labels, values },
        };
    });

    this.displayedChartData = this.chartData.filter(chartData => 
        chartData.chartData.datasets[0].data.some((value: number | ScatterDataPoint | BubbleDataPoint | null) => value !== null)
    );
}

// Helper function to create chart data
createChartData(chartType: string, labels: string[], values: number[], datasetName: string) {
    const commonDatasetProperties = {
        label: datasetName,
        backgroundColor: 'rgba(255, 99, 132, 0.2)', // Example fill color
        borderColor: 'rgba(255, 99, 132, 1)', // Example border color
        borderWidth: 2,
        fill: true,
        data: values, 
        pointRadius: 4, // Adjust the size of the points
        pointStyle: 'circle', // Shape of the points (default is 'circle')
        lineTension: 0.3, // Set line tension for rounded lines for line charts (0-1)
    };

    let chartData;
    if (chartType === 'donut' || chartType === 'polar') {
        chartData = this.groupDataByMonth(labels, values);
    } else if (chartType === 'line-monthly') {
        chartData = this.groupDataByMonth(labels, values, true);
        chartData.datasets = [commonDatasetProperties]; 
    } else if (chartType === 'bar-monthly') {
        chartData = this.groupDataByMonth(labels, values, false, true);
    } else if (chartType === 'line-year') {
        chartData = this.groupDataByYear(labels, values);
        chartData.datasets = [commonDatasetProperties]; 
    } else if (chartType === 'bar-year') {
        chartData = this.groupDataByYear(labels, values);
    } else {
        chartData = {
            labels: labels,
            datasets: [commonDatasetProperties], 
        };
    }
    return chartData;
}

updateChartType(index: number) {
    const chart = this.chartData[index];
    if (chart) {
        const { labels, values } = chart.originalData;

        try {
            // Create chart data based on the current chart type
            this.chartData[index].chartData = this.createChartData(chart.chartType, labels, values, this.metricResults[index].name);

            const isMTTCOrMTTR = false; 
            this.chartData[index].options = this.getChartOptions(
                chart.chartType,
                chart.options.plugins?.title?.text || '',
                chart.options.plugins?.tooltip?.callbacks?.title || '',
                values.length,
                labels,
                isMTTCOrMTTR 
            );

            localStorage.setItem(`chartType-${index}`, chart.chartType);
            this.$forceUpdate();
        } catch (error) {
            console.error('Error updating chart type:', error);
        }
    }
}

  updateChartSortType(chartData: any, sortType: string) {
      const originalBackgroundColor = chartData.datasets[0].backgroundColor;
      const originalBorderColor = chartData.datasets[0].borderColor;

      if (sortType === 'quarter') {
          const groupedData = this.groupDataByQuarter(chartData.originalData.labels, chartData.originalData.values, originalBackgroundColor, originalBorderColor);
          chartData.labels = groupedData.labels;
          chartData.datasets = groupedData.datasets;
      } else {
          // Reset to default view (original data)
          chartData.labels = chartData.originalData.labels;
          chartData.datasets = [{
              data: chartData.originalData.values,
              backgroundColor: originalBackgroundColor,
              borderColor: originalBorderColor,
              borderWidth: 2,
          }];
      } 
      this.$forceUpdate(); // Force the component to re-render
  }

  updateChartData() {
    if (this.showMttcMttr) {
        this.updateMTTCMTTRChart(); // Update MTTC/MTTR charts
    } else {
        this.initializeChartData(); // Update main charts
    }
  }

  updateMTTCMTTRChart = this.debounce(() => {
      // Fetch the special metric data
      this.fetchSpecialMetric().then(() => {
      // After fetching the data, update the chart sorting
      this.updateMTTCSortType();
      this.updateMTTRSortType();
      });
  }, 200);

  updateMTTCSortType() {
      this.updateChartSortType(this.mttcChartData, this.mttcSortType);
  }

  updateMTTRSortType() {
      this.updateChartSortType(this.mttrChartData, this.mttrSortType);
  }

  updateMTTCChartData = this.debounce(() => {
    this.mttcChartData = { ...this.mttcChartData }; 
  }, 100);

  updateMTTRChartData = this.debounce(() => {
    this.mttrChartData = { ...this.mttrChartData }; 
  }, 100);

  //Chart Management Functions
  resetCharts(chartType: string) {
    try {
      this.chartData.forEach((chart, index) => {
        chart.chartType = chartType; 
        localStorage.setItem(`chartType-${index}`, chartType); 
      });
      this.initializeChartData(); 
      this.showMttcMttr = false; // Hide the MTTC/MTTR view if it's active
      this.$forceUpdate(); // Force to re-render the component
    } catch (error) {
      console.error('Error resetting charts:', error);
    }
  }

  getChartComponent(chartType: string) {
      const chartComponents: { [key: string]: any } = {
        'line': LineChart,
        'bar': BarChart,
        'donut': DoughnutChart,
        'polar': PolarChart,
        'line-monthly': LineChart,
        'bar-monthly': BarChart,
        'line-year': LineChart,
        'bar-year': BarChart,
      };
      return chartComponents[chartType] || LineChart; // Default to LineChart if chartType is not found
  }

  //Date Range Management Functions
  updateDateRange(index: number) {
    const chart = this.chartData[index];
    if (chart) {
      const { labels, values } = chart.originalData;

      if (chart.chartType === 'line' || chart.chartType === 'bar') {
        const filteredData = this.filterDataByDateRange(labels, values, chart.startDate, chart.endDate);

        chart.chartData = {
          labels: filteredData.labels,
          datasets: [{
            label: this.metricResults[index].name,
            data: filteredData.values,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          }],
        };

        const isMTTCOrMTTR = chart.chartType === 'line' || chart.chartType === 'bar' ? false : true;

        this.chartData[index].options = this.getChartOptions(
          chart.chartType,
          chart.options.plugins?.title?.text || '',
          chart.options.plugins?.tooltip?.callbacks?.title || '',
          filteredData.values.length,
          filteredData.labels,
          isMTTCOrMTTR 
        );
        this.$forceUpdate();
      }
    }
  }

  resetDateRange(index: number) {
      const chart = this.chartData[index];
      if (chart) {
        chart.startDate = '';
        chart.endDate = '';
        this.updateChartType(index);
      }
  }
  //Data Filtering Functions
  filterMetricResultsByTimeRange(results: MetricResult[]): FilteredResult[] {
      const now = new Date();
      const twelveMonthsAgo = new Date(now);
      twelveMonthsAgo.setMonth(now.getMonth() - 12);
      const twentyFourMonthsAgo = new Date(now);
      twentyFourMonthsAgo.setMonth(now.getMonth() - 24);

      const filteredResults: FilteredResult[] = results.map((result: MetricResult) => {
          const filteredData: { [key: string]: number } = {};
          const labels = Object.keys(result.results);
          const values = Object.values(result.results) as number[];

          labels.forEach((label, index) => {
              const date = new Date(label);
              let shouldInclude = false;

              // Check the selected time range
              if (this.selectedTimeRange === '12') {
                  shouldInclude = date >= twelveMonthsAgo;
              } else if (this.selectedTimeRange === '24') {
                  shouldInclude = date >= twentyFourMonthsAgo;
              } else {
                  shouldInclude = true; // All data
              }

              // If the date should be included, add it to the filtered data
              if (shouldInclude) {
                  filteredData[label] = values[index];
              }
          });

          return {
              name: result.name,
              results: filteredData,
          };
      });

      // Filter out any results that have no data
      return filteredResults.filter(result => Object.keys(result.results).length > 0);
  }

  filterDataByDateRange(labels: string[], values: number[], startDate: string, endDate: string) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const filteredLabels: string[] = [];
      const filteredValues: number[] = [];

      labels.forEach((label, index) => {
        const date = new Date(label);
        if ((!start || date >= start) && (!end || date <= end)) {
          filteredLabels.push(label);
          filteredValues.push(values[index]);
        }
      });

      return { labels: filteredLabels, values: filteredValues };
    }

  groupDataByMonth(labels: string[], values: number[], isLineChart: boolean = false, isBarChart: boolean = false): ChartData<'line' | 'bar' | 'doughnut' | 'polarArea'> {
    const months: string[] = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthMap = new Map<string, number>();

    labels.forEach((label, index) => {
      const date = new Date(label);
      const yearMonth = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (!monthMap.has(yearMonth)) {
        monthMap.set(yearMonth, 0);
      }
      monthMap.set(yearMonth, monthMap.get(yearMonth)! + values[index]);
    });

    const sortedMonthMap = new Map([...monthMap.entries()].sort((a, b) => {
      const [yearA, monthA] = a[0].split('-').map(Number);
      const [yearB, monthB] = b[0].split('-').map(Number);
      return yearA === yearB ? monthA - monthB : yearA - yearB;
    }));

    const monthlyData: { labels: string[]; values: number[]; } = { labels: [], values: [] };

    sortedMonthMap.forEach((value, key) => {
      const [year, month] = key.split('-').map(Number);
      monthlyData.labels.push(`${months[month - 1]} ${year}`);
      monthlyData.values.push(value);
    });

    return {
      labels: monthlyData.labels,
      datasets: [{
        data: monthlyData.values,
        backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'],
        borderWidth: 2,
      }],
    };
  }

  groupDataByYear(labels: string[], values: number[]): ChartData<'line' | 'bar' | 'doughnut' | 'polarArea'> {
      const yearMap = new Map<string, number>();

      labels.forEach((label, index) => {
        const date = new Date(label);
        const year = date.getFullYear();
        if (!yearMap.has(year.toString())) {
          yearMap.set(year.toString(), 0);
        }
        yearMap.set(year.toString(), yearMap.get(year.toString())! + values[index]);
      });

      const sortedYearMap = new Map([...yearMap.entries()].sort((a, b) => parseInt(a[0]) - parseInt(b[0])));
      const yearlyData: { labels: string[]; values: number[]; } = { labels: [], values: [] };

      sortedYearMap.forEach((value, key) => {
        yearlyData.labels.push(key);
        yearlyData.values.push(value);
      });

      return {
        labels: yearlyData.labels,
        datasets: [{
          data: yearlyData.values,
          backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
          borderColor: ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'],
          borderWidth: 2,
        }],
      };
  }
    
  groupDataByQuarter(labels: string[], values: number[], backgroundColor: string, borderColor: string): ChartData<'bar'> {
      const quarterMap = new Map<string, number>();
      labels.forEach((label, index) => {
        const date = new Date(label);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const quarterKey = `Q${quarter} ${date.getFullYear()}`;
        if (!quarterMap.has(quarterKey)) {
          quarterMap.set(quarterKey, 0);
        }
        quarterMap.set(quarterKey, quarterMap.get(quarterKey)! + values[index]);
      });

      return {
        labels: Array.from(quarterMap.keys()),
        datasets: [
          {
            data: Array.from(quarterMap.values()),
            backgroundColor: backgroundColor, 
            borderColor: borderColor, 
            borderWidth: 2,
          },
        ],
      };
  }

  //Chart Options/Formatting Functions
  updateMetricResults() {
      this.initializeChartData(); // Re-initialize chart data based on the new time range
  }

  getChartOptions (
      chartType: string,
      title: string,
      tooltip: string, 
      datasetLength: number,
      labels: string[],
      isMTTCOrMTTR: boolean, 
      yAxisStepSize?: number 
  ) {
      // Set a fixed aspect ratio if necessary
      const aspectRatio = 2;
      const commonOptions = {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: aspectRatio,
          layout: {
              padding: { left: 20, right: 20, top: 10, bottom: 20 },
          },
          plugins: {
              tooltip: {
                  callbacks: {
                      title: (tooltipItems: TooltipItem<'line'>[]): string => {
                          if (tooltipItems && tooltipItems.length > 0) {
                              const index = tooltipItems[0].dataIndex;
                              return labels[index] ?? '';
                          }
                          return '';
                      },
                      label: (tooltipItem: TooltipItem<'line'>): string => {
                          const rawValue = (tooltipItem.raw as number) ?? 0; // Assert raw as number
                          return isMTTCOrMTTR
                              ? `Mean Time: ${this.formatDuration(rawValue)}` // MTTC/MTTR formatting
                              : `Total: ${rawValue}`; // Default value display for Main charts from metricResults
                      }
                  }
              },
              title: {
                  display: true,
                  text: title || '',
                  font: { size: 16, weight: 'bold' },
                  padding: { top: 2, bottom: 6 },
                  color: this.$vuetify.theme.dark ? 'white' : 'black',
              },
            
          // afterDraw function to draw labels on the bars
          afterDraw: (chart: any) => {
            const mttcChartRef = this.$refs.mttcChart as ChartRef;
            const mttrChartRef = this.$refs.mttrChart as ChartRef;
            const isMTTCOrMTTRChart = chart === mttcChartRef?.chart || chart === mttrChartRef?.chart;
            if (isMTTCOrMTTRChart) {
              const ctx = chart.ctx;
              ctx.font = '12px Arial';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = this.$vuetify.theme.dark ? 'white' : 'black'; // Use white for dark mode, black for light mode
              chart.data.datasets.forEach((dataset: { data: number[] }, i: number) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar: any, index: number) => {
                  const value = dataset.data[index];
                  const formattedValue = this.formatDuration(value as number);
                  // Calculate the position inside the bar for MTTC/MTTR
                  const barTop = bar.y;
                  const barBottom = bar.y + bar.height; 
                  const labelY = (barTop + barBottom) / 2; 
                  ctx.fillText(formattedValue, bar.x, labelY); // Display label inside the bar
                });
              });
            }
          },
        },
        scales: {
          x: {
            ticks: {
              color: this.$vuetify.theme.dark ? 'white' : 'black', // Set tick color based on dark mode
              autoSkip: true,
              minRotation: 45,
              maxRotation: 45,
              maxTicksLimit: 40,
            },
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              color: this.$vuetify.theme.dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', // Adjust grid line color based on theme
            },
          },
          y: {
            ticks: {
              stepSize: yAxisStepSize || undefined, // Use the provided step size or default behavior
              callback: (value: number) => {
                return isMTTCOrMTTR
                  ? this.formatDuration(value) // Format duration for MTTC/MTTR charts
                  : value; // Default value for other charts
              },
              color: this.$vuetify.theme.dark ? 'white' : 'black', // Set tick color based on dark mode
              beginAtZero: true,
            },
            grid: {
              display: true,
              drawBorder: true,
              drawOnChartArea: true,
              drawTicks: true,
              color: this.$vuetify.theme.dark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)', // Adjust grid line color based on theme
            },
          },
        },
        animation: {
          duration: 50, 
          onComplete: () => {
            const chartRefs = [this.$refs.mttcChart as ChartRef, this.$refs.mttrChart as ChartRef];

            chartRefs.forEach((chartRef) => {
              const chart = chartRef?.chart; 
              if (!chart) return;
              const ctx = chart.ctx;
              ctx.font = '18px Arial'; //Font size setting for MTTC/MTTR bar chart labels
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = this.$vuetify.theme.dark ? 'white' : 'black'; // Use white for dark mode, black for light mode
              chart.data.datasets.forEach((dataset: { data: number[] }, i: number) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((bar: any, index: number) => {
                  const value = dataset.data[index];
                  const formattedValue = this.formatDuration(value as number);
                  const barTop = bar.y; 
                  const barBottom = bar.y + bar.height; 
                  const labelY = (barTop + barBottom) / 2; 
                  ctx.fillText(formattedValue, bar.x, labelY); // Display label inside the bar
                });
              });
            });
          },
        },
      };
      
      // Additional options for polar and donut charts
      if (chartType === 'polar' || chartType === 'donut') {
          return {
              ...commonOptions,
              plugins: {
                  ...commonOptions.plugins,
                  legend: {
                      display: true,
                      position: 'top',
                      color: this.$vuetify.theme.dark ? 'white' : 'black', // Use white for dark mode, black for light mode
                  },
              },
              scales: chartType === 'polar' ? {
                  r: {
                      grid: {
                          color: 'rgba(0, 0, 0, 0.1)', // Light grid color for better visibility
                      },
                      angleLines: {
                          color: 'rgba(0, 0, 0, 0.1)', // Light angle lines color for better visibility
                      },
                      ticks: {
                          beginAtZero: true,
                      }
                  }
              } : undefined
          };
      }
      // Options for line and bar charts
      if (chartType === 'line-monthly' || chartType === 'line-year' || chartType === 'bar-monthly' || chartType === 'bar-year' || chartType === 'line' || chartType === 'bar') {
          return {
              ...commonOptions,
              plugins: {
                  ...commonOptions.plugins,
                  legend: {
                      display: false,
                  },
              }
          };
      }
    return commonOptions;
  }

  drawChartLabels(chart: any, isMTTCOrMTTR: boolean, fontSize: number, fontFamily: string, blackColor: string) {
  if (!chart) return;
  const ctx = chart.ctx;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  chart.data.datasets.forEach((dataset: { data: number[] }, i: number) => {
    const meta = chart.getDatasetMeta(i);
    meta.data.forEach((bar: any, index: number) => {
      const value = dataset.data[index];
      const formattedValue = this.formatDuration(value as number);
      const barTop = bar.y;
      const barBottom = bar.y + bar.height;
      const labelY = (barTop + barBottom) / 2;
      ctx.fillStyle = blackColor; // Use constant for color
      ctx.fillText(formattedValue, bar.x, labelY); // Display label inside the bar for MTTC/MTTR Charts
    });
  });
  }

  formatDuration(hours: number): string {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      const minutes = Math.floor((hours % 1) * 60); 
      return `${days}d ${remainingHours}h ${minutes}m`;
  }

  //Utility Functions
  debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
      let timeout: number | undefined;
      return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = window.setTimeout(() => {
          func.apply(this, args);
        }, wait);
      };
  }
  debouncedHandleResize = this.debounce(() => this.handleResize(), 200);

  updateRefreshTime() {
      const now = new Date();
      this.refreshTime = now.toLocaleString();
  }
    
  toggleMTTCMTTR() {
      this.showMttcMttr = !this.showMttcMttr;
      if (this.showMttcMttr) {
        this.fetchSpecialMetric();
      }
      this.updateCharts();
  }
  
  // Method to update the charts' dimensions on window resize
  updateCharts() {
      this.updateMTTCChartData(); //Update MTTC Chart Data
      this.updateMTTRChartData(); //Update MTTR Chart Data
      //Resize charts after updating of data
      this.chartData.forEach((data, index) => {
        const chartComponent = this.$refs[`chart-${index}`] as Vue & { chart?: { resize: () => void } };
        if (chartComponent && chartComponent.chart) {
          chartComponent.chart.resize();
         }
      });
    }
  }
</script>

<style scoped>
/* Global Styles */
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; /* Prevent scrolling */
}

:root {
    --light-background: #f0f0f0; /* Light mode background */
    --light-text: #333; /* Light mode text color */
    --dark-background: rgb(40, 40, 40);
    --dark-text: rgb(250, 250, 250);
}

/* Common Styles */
.refresh-time-data-display, 
.reset-controls-container, 
.loading-message, 
.error-message {
  text-align: center;
  font-size: 14px;
  padding: 5px;
  border-radius: 100px; /* Rounded corners */
  border-bottom: 2px solid #ccc; 
}

.reset-controls-container {
  border-radius: 5px;
  margin: 10px 0;
}

.reset-controls {
  color: black; /* Default text color for light mode */
}

.reset-label, 
.chart-type-label, 
.date-range-label {
  font-size: 14px;
  padding: 2px 0px;
  font-weight: none;
}

.reset-button {
  padding: 2px 20px;
  font-size: 12px;
  background-color: #B0E0E6;
  color: black;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  margin: 0 5px;
  transition: background-color 0.3s;
}

.reset-button:hover {
  background-color: #b0e0e6b1;
}

/* Loading and Error Messages */
.loading-message, 
.error-message {
  font-size: 16px;
}

.error-message {
  color: red;
}

/* Chart Container Styles */
.parent-container {
  display: flex;
  flex-direction: column; /* or row, depending on desired layout */
  height: 100vh; /* Full viewport height */
}

.charts-container {
  display: flex; /* Use flexbox layout */
  flex-wrap: wrap; /* Allow items to wrap to the next line */
  gap: 20px; /* Space between charts */
  padding: 10px;
  min-height: calc(100vh - 20px); /* Ensure enough height */
  height: auto;
  box-sizing: border-box;
}

/* Responsive Design for Smaller Screens */
@media (max-width: 800px) {
  .charts-container {
    flex-direction: column; /* Stack charts on smaller screens */
  }
}

/* Chart Wrapper Styles */
.chart-wrapper {
  width: 800px; /* Take full width of the grid cell */
  height: 450px; /* Set a fixed height for the charts */
  overflow: hidden; /* Prevent overflow of content */
  position: relative; /* Ensure positioning context for absolute children */
}

/* Select Container Styles */
.select-container {
  position: relative;
  display: inline-block;
}

/* Chart Controls Styles */
.chart-controls select, 
.date-range-controls input[type="date"] {
  padding: 5px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 5px;
  cursor: pointer;
  background-color: #ffffff; /* Background color for light mode */
  color: #333; /* Text color for light mode */
}

.chart-controls select:hover {
  border-color: #007BFF; /* Change border color on hover */
}

/* Controls Container Styles */
.controls-container {
  display: flex;
  justify-content: space-between; /* Space between items */
  align-items: center; /* Center items vertically */
  margin: 20px 0; /* Margin for spacing */
}

/* Time Range Controls Styles */
.time-range-controls {
  display: flex; /* Use flexbox for layout */
  flex-wrap: wrap; /* Allow items to wrap to the next line */
  align-items: center; /* Center items vertically */
  gap: 5px; /* Space between radio buttons */
  padding: 10px; /* Add some padding */
  max-width: 100%; /* Ensure it doesn't exceed the container width */
  box-sizing: border-box; /* Include padding in width calculations */
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .time-range-controls {
    flex-direction: column; /* Stack items vertically on smaller screens */
    align-items: flex-start; /* Align items to the start */
  }
}

/* Dark mode styles */
.dark-mode {
    background-color: #333;
    color: #fff;
}

.theme--dark {
    background-color: #1e1e1e; /* Darker background for the entire component */
}

.theme--dark .refresh-time-data-display,
.theme--dark .reset-controls,
.theme--dark .chart-wrapper,
.theme--dark .reset-controls-container,
.theme--dark .loading-message,
.theme--dark .error-message,
.theme--dark .chart-controls select,
.theme--dark .date-range-controls input[type="date"] {
    color: var(--dark-text);
    background-color: var(--dark-background);
}
/* Light mode styles */
.refresh-time-data-display,
.reset-controls-container,
.loading-message,
.error-message {
    background-color: var(--light-background);
    color: var(--light-text);
}
</style>