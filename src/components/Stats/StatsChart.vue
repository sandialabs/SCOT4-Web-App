<template>
  <div class="stats-chart">
    <!-- Controls Bar -->
    <div class="controls">
      <span class="refresh" :class="{ 'refresh--dark': isDark }">
        Last 12 Months Refreshed on: {{ refreshTime }}
      </span>
      <div class="divider"></div>
      
      <div class="controls__buttons">
        <button class="toggle-button" :disabled="toggleLocked" @click="toggleMTTC">
          {{ showMTTC ? 'Back To Metric Charts' : 'MTTC / MTTR' }}
        </button>
        <!-- Only in General view -->
        <div v-if="!showMTTC" class="reset-dropdown">
          <button class="reset-button" @click="toggleResetMenu">
            Reset All Chart Types:
            <span class="arrow" :class="{ open: resetMenuVisible }">▾</span>
          </button>
          <ul v-if="resetMenuVisible" class="reset-menu">
            <li v-for="opt in resetOptions" :key="opt" @click="onResetOption(opt)">
              {{ resetLabels[opt] }}
            </li>
          </ul>
        </div>
      </div>
       <div class="divider"></div>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="loading-message" role="alert" aria-live="assertive">
      <div class="spinner"></div> 
      </div>
    <div v-else-if="errorMessage" class="error-message" role="alert">
      {{ errorMessage }}
    </div>

    <!-- General Metrics Section -->
    <div v-else class="charts-container">
      <!-- Inner container for General Metrics -->
      <div v-if="!showMTTC" class="general-charts-container">
        <div
          v-for="cfg in visibleConfigs"
          :key="`gen-${cfg.id}-${cfg.chartType}-${cfg.version}`"
          class="chart-wrapper"
        >
        <div class="chart-controls">
          <div class="reset-dropdown" @click.stop="toggleChartTypeDropdown(cfg)">
            <button class="reset-button chart-type-btn">
              Chart Type: {{ getChartTypeLabel(cfg.chartType) }}
              <span class="arrow" :class="{ open: cfg.chartTypeDropdownOpen }">▾</span>
            </button>
            <ul v-if="cfg.chartTypeDropdownOpen" class="reset-menu">
              <li v-for="type in availableChartTypes" 
                  :key="type" 
                  @click.stop="onChartTypeSelected(cfg, type)">
                {{ getChartTypeLabel(type) }}
              </li>
            </ul>
          </div>
        </div>
          <!-- Dynamic Chart Component -->
          <component
            :is="getChartComponent(cfg.chartType)"
            :chart-data="cfg.chartData"
            :options="getChartOptions(cfg.chartType, cfg.options)"
          />
        </div>
      </div>

      <!-- MTTC / MTTR Metrics Section -->
      <div v-if="showMTTC" class="charts-container">
        <div v-if="hasMTTCData" class="chart-wrapper">
          <div class="chart-controls">
            <div class="reset-dropdown" @click.stop="toggleMTTCSortDropdown">
              <button class="reset-button chart-type-btn">
                Sort By: {{ mttcSortType === 'month' ? 'Month' : 'Quarter' }}
                <span class="arrow" :class="{ open: mttcSortDropdownOpen }">▾</span>
              </button>
              <ul v-if="mttcSortDropdownOpen" class="reset-menu">
                <li @click.stop="mttcSortType = 'month'; sortMTTC(); mttcSortDropdownOpen = false">Month</li>
                <li @click.stop="mttcSortType = 'quarter'; sortMTTC(); mttcSortDropdownOpen = false">Quarter</li>
              </ul>
            </div>
          </div>
          <BarChart
            v-if="mttcCfg.chartData.labels.length > 0"
            :key="mttcKey"
            :chart-data="mttcCfg.chartData"
            :options="mttcCfg.options"
          />
        </div>

        <div v-if="hasMTTRData" class="chart-wrapper">
          <div class="chart-controls">
            <div class="reset-dropdown" @click.stop="toggleMTTRSortDropdown">
              <button class="reset-button chart-type-btn">
                Sort By: {{ mttrSortType === 'month' ? 'Month' : 'Quarter' }}
                <span class="arrow" :class="{ open: mttrSortDropdownOpen }">▾</span>
              </button>
              <ul v-if="mttrSortDropdownOpen" class="reset-menu">
                <li @click.stop="mttrSortType = 'month'; sortMTTR(); mttrSortDropdownOpen = false">Month</li>
                <li @click.stop="mttrSortType = 'quarter'; sortMTTR(); mttrSortDropdownOpen = false">Quarter</li>
              </ul>
            </div>
          </div>
          <BarChart
            v-if="mttrCfg.chartData.labels.length > 0"
            :key="mttrKey"
            :chart-data="mttrCfg.chartData"
            :options="mttrCfg.options"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useGET_APIStore } from '@/stores/_get_api'
import { useTheme } from 'vuetify'
import BarChart from '@/components/Stats/BarChart.vue'
import LineChart from '@/components/Stats/LineChart.vue'
import DoughnutChart from '@/components/Stats/DoughnutChart.vue'
import PolarChart from '@/components/Stats/PolarChart.vue'
import type { ChartData, ChartOptions } from 'chart.js'
import { propsFactory } from 'vuetify/lib/util/propsFactory.mjs'

type DataChartType = 'bar' | 'line' | 'doughnut' | 'polarArea'
type ChartType =
  | 'line'
  | 'bar'
  | 'donut'
  | 'polar'
  | 'line-monthly'
  | 'bar-monthly'

interface ChartConfig {
  id: number
  name: string
  chartType: ChartType
  original: Record<string, number>
  chartData: ChartData<DataChartType, number[]>
  options: ChartOptions<DataChartType>
  version: number
  chartTypeDropdownOpen: boolean;
}

const getChartComponent = (ct: ChartType) =>
  ({
    line: LineChart,
    bar: BarChart,
    donut: DoughnutChart,
    polar: PolarChart,
    'line-monthly': LineChart,
    'bar-monthly': BarChart
  } as Record<ChartType, any>)[ct]

//────────── Reactive state ────────────────────────────────────────────────────
const apiStore     = useGET_APIStore()
const loading      = ref(false)
const errorMessage = ref('')
const refreshTime  = ref('')
const showMTTC     = ref(false)
const theme        = useTheme()
const isDark       = computed(() => theme.global.name.value === 'DarkTheme')

//lock to prevent rapid‐toggle races
const toggleLocked = ref(false)

//────────── Dropdown Button Functionality ───────────────────────────────────────
const resetMenuVisible = ref(false)
const resetOptions: ChartType[] = ['line','bar','donut','polar']
const resetLabels: Record<ChartType,string> = {
  line: 'Line',
  bar:  'Bar',
  donut:'Donut',
  polar:'Polar Area',
  'line-monthly':'Line (Monthly)',
  'bar-monthly':'Bar (Monthly)'
}
// Toggle the dropdown state on a given chart configuration.
function toggleResetMenu() {
  resetMenuVisible.value = !resetMenuVisible.value
}

const globalResetType = ref<ChartType>('line')
watch(globalResetType, val => {
  localStorage.setItem('globalResetType', val)
})

function onResetOption(type: ChartType) {
  resetMenuVisible.value = false
  globalResetType.value = type
  chartConfigs.forEach(cfg => {
    cfg.chartType = type
    rebuildConfig(cfg as ChartConfig)
  })
}

const availableChartTypes = ['line', 'bar', 'donut', 'polar', 'line-monthly', 'bar-monthly']

function getChartTypeLabel(type: string): string {
  const labels = {
    line: 'Line',
    bar: 'Bar',
    donut: 'Donut',
    polar: 'Polar Area',
    'line-monthly': 'Line (Monthly)',
    'bar-monthly': 'Bar (Monthly)'
  }
  return labels[type] || type
}

// Toggle the dropdown state on a given chart configuration.
function toggleChartTypeDropdown(cfg: any) {
  cfg.chartTypeDropdownOpen = !cfg.chartTypeDropdownOpen
}

function onChartTypeSelected(cfg: any, newType: string) {
  cfg.chartType = newType
  cfg.chartTypeDropdownOpen = false
  updateChartType(cfg as ChartConfig)  
}
//────────── MTTC / MTTR sorting & persistence ────────────────────────────────
const mttcSortType = ref<'month'|'quarter'>(
  (localStorage.getItem('mttcSortType') as 'month'|'quarter') || 'month'
)
const mttrSortType = ref<'month'|'quarter'>(
  (localStorage.getItem('mttrSortType') as 'month'|'quarter') || 'month'
)

function sortMTTC() {
  localStorage.setItem('mttcSortType', mttcSortType.value)
  applyMTTCFilterAndDraw()
}
function sortMTTR() {
  localStorage.setItem('mttrSortType', mttrSortType.value)
  applyMTTRFilterAndDraw()
}

watch(mttcSortType, () => {
  if (showMTTC.value) sortMTTC()
})
watch(mttrSortType, () => {
  if (showMTTC.value) sortMTTR()
})

const mttcSortDropdownOpen = ref(false);
const mttrSortDropdownOpen = ref(false);

function toggleMTTCSortDropdown() {
  mttcSortDropdownOpen.value = !mttcSortDropdownOpen.value;
}

function toggleMTTRSortDropdown() {
  mttrSortDropdownOpen.value = !mttrSortDropdownOpen.value;
}

//────────── TOGGLE with lock ────────────────────────────────────────────
async function toggleMTTC() {
  if (toggleLocked.value) return
  toggleLocked.value = true

  showMTTC.value = !showMTTC.value
  if (showMTTC.value) {
    sortMTTC()
    sortMTTR()
  }

  await nextTick()
  setTimeout(() => {
    toggleLocked.value = false
  }, 100)
}

//────────── Keys to force remount on BarChart when data or sort changes ─────────
const mttcKey = computed(() => {
  const labs = mttcCfg.chartData.labels as string[]
  return `mttc-${mttcSortType.value}-${labs.join(',')}`
})
const mttrKey = computed(() => {
  const labs = mttrCfg.chartData.labels as string[]
  return `mttr-${mttrSortType.value}-${labs.join(',')}`
})

//────────── Raw + rendered state for the two special charts ─────────────────────────
const mttcCfg = reactive({
  rawData:   [] as any[],
  chartData: { labels: [], datasets: [ { data: [] } ] } as ChartData<DataChartType, number[]>,
  options:   {} as ChartOptions<DataChartType>
})
const mttrCfg = reactive({
  rawData:   [] as any[],
  chartData: { labels: [], datasets: [ { data: [] } ] } as ChartData<DataChartType, number[]>,
  options:   {} as ChartOptions<DataChartType>
})

// Intermediate monthly‐buckets before filtering
const mttcMonthly = reactive({ labels: [] as string[], values: [] as number[] })
const mttrMonthly = reactive({ labels: [] as string[], values: [] as number[] })

//────────── General‐metrics configs ──────────────────────────────────────────
const chartConfigs   = reactive<ChartConfig[]>([])
const visibleConfigs = computed(() =>
  chartConfigs.filter(c => {
    const ds = c.chartData.datasets[0]
    return Array.isArray(ds?.data) && ds.data.some(v => v != null && v !== 0)
  })
)

const hasMTTCData = computed(() => {
  const ds = mttcCfg.chartData.datasets[0]
  return Array.isArray(ds?.data) && ds.data.some(v => v != null && v !== 0)
})
const hasMTTRData = computed(() => {
  const ds = mttrCfg.chartData.datasets[0]
  return Array.isArray(ds?.data) && ds.data.some(v => v != null && v !== 0)
})

//────────── Lifecycle ───────────────────────────────────────────────────────
onMounted(() => {
  const stored = localStorage.getItem('globalResetType') as ChartType
  if (stored) globalResetType.value = stored
  fetchAllData()
})

async function fetchAllData() {
  loading.value = true
  errorMessage.value = ''
  try {
    // Fetch metrics data
    const metricsPromise = apiStore.GET_Metrics().then(metrics => {
      buildGeneralConfigs(metrics)
    });

    // Fetch special metrics data
    const specialPromise = apiStore.GET_SpecialMetric().then(special => {
      buildMTTCMTTRConfigs(special.result)
    });

    // Wait for both promises to resolve
    await Promise.all([metricsPromise, specialPromise]);

    refreshTime.value = new Date().toLocaleString();
  } catch (err: any) {
    errorMessage.value = err.message || 'Failed to fetch data';
  } finally {
    loading.value = false;
  }
}

//────────── General‐metrics helpers ─────────────────────────────────────────
function buildGeneralConfigs(metrics: any[]) {
  chartConfigs.splice(0)
  metrics.forEach((m, i) => {
    const storedType =
      (localStorage.getItem(`chartType-${i}`) as ChartType) || 'line'

    const cfg: ChartConfig = reactive({
      id: i,
      name: m.name,
      chartType: storedType,
      chartTypeDropdownOpen: false,
      original: { ...m.results },
      chartData: { labels: [], datasets: [] },
      options: {},
      version: 0
    })

    watch(() => cfg.chartType, () => {
      localStorage.setItem(`chartType-${cfg.id}`, cfg.chartType)
      rebuildConfig(cfg)
    })

    rebuildConfig(cfg)
    chartConfigs.push(cfg)
  })
}

function updateChartType(cfg: ChartConfig) {
  cfg.chartType = cfg.chartType // triggers the watch on cfg.chartType
}

function rebuildConfig(cfg: ChartConfig) {
  let labels: string[] = []
  let values: number[] = []

  const isMonthly =
    cfg.chartType.endsWith('-monthly') ||
    cfg.chartType === 'donut' ||
    cfg.chartType === 'polar'

  if (isMonthly) {
    // Bucket by month/year
    const map = new Map<string, { date: Date; display: string; total: number }>()
    Object.entries(cfg.original).forEach(([dateStr, val]) => {
      const d = new Date(dateStr)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!map.has(key)) {
        map.set(key, {
          date: new Date(d.getFullYear(), d.getMonth()),
          display: d.toLocaleString('default', { month: 'long', year: 'numeric' }),
          total: 0
        })
      }
      map.get(key)!.total += val
    })

    const bucket = Array.from(map.values()).sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    )
    labels = bucket.map(b => b.display)
    values = bucket.map(b => b.total)
  } else {
    // Chronological / Daily config
    const sorted = Object.entries(cfg.original).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    )
    labels = sorted.map(([day]) => day)
    values = sorted.map(([, v]) => v)
  }

  cfg.chartData = buildData(cfg.chartType, labels, values, cfg.name)
  cfg.options = getCommonOptions(
    cfg.chartType,
    cfg.name,
    labels,
    values,
    false
  )
  cfg.version++
}

//────────── MTTC/MTTR helpers ────────────────────────────────────────────────
function buildMTTCMTTRConfigs(items: any[]) {
  interface Rec { total: number; count: number }
  const agg: { mttc: Record<string,Rec>; mttr: Record<string,Rec> } = {
    mttc: {}, mttr: {}
  }

  items.forEach(i => {
    const type = i.metric_type as 'mttc' | 'mttr'
    const st   = new Date(i.start_time)
    const durH = (new Date(i.end_time).getTime() - st.getTime()) / 36e5
    const key  = `${st.getFullYear()}-${st.getMonth()+1}`
    if (!agg[type][key]) agg[type][key] = { total: 0, count: 0 }
    agg[type][key].total += durH
    agg[type][key].count++
  })

  const fold = (r: Record<string,Rec>) =>
    Object.entries(r)
      .map(([lbl, rec]) => {
        const [year, month] = lbl.split('-').map(Number)
        return {
          lbl,
          avg: rec.total / rec.count,
          date: new Date(year, month - 1)
        }
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime())

  const mArr = fold(agg.mttc)
  const tArr = fold(agg.mttr)

  mttcMonthly.labels = mArr.map(x => x.lbl)
  mttcMonthly.values = mArr.map(x => x.avg)
  mttrMonthly.labels = tArr.map(x => x.lbl)
  mttrMonthly.values = tArr.map(x => x.avg)

  mttcCfg.rawData = items.filter(i => i.metric_type === 'mttc')
  mttrCfg.rawData = items.filter(i => i.metric_type === 'mttr')

  sortMTTC()
  sortMTTR()
}

function filterLast12MonthsWithMin(
  labels: string[],
  values: number[],
  minH = 0.00833 //Threshold to hide MTTC/MTTR data that is less than x timeframe, currently < 30 seconds
) {
  const now = new Date()
  const monthsAgo = (y: number, m: number) =>
    (now.getFullYear() - y) * 12 + (now.getMonth() - (m - 1))

  return labels
    .map((lbl, i) => {
      const [y, mm] = lbl.split('-').map(Number)
      return { date: new Date(y, mm - 1), lbl, val: values[i] }
    })
    .filter(({ date, val }) => {
      const ago = monthsAgo(date.getFullYear(), date.getMonth() + 1)
      return ago >= 0 && ago < 12 && val >= minH
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

function groupQuarters(
  arr: Array<{ date: Date; lbl: string; val: number }>
) {
  if (arr.length === 0) return []
  const map = new Map<string, number>()
  arr.forEach(({ date, val }) => {
    const quarter = Math.floor(date.getMonth() / 3) + 1
    const key     = `Q${quarter} ${date.getFullYear()}`
    map.set(key, (map.get(key) || 0) + val)
  })
  return Array.from(map.entries())
    .sort(([aKey], [bKey]) => {
      const [aQ, aY] = aKey.split(' ')
      const [bQ, bY] = bKey.split(' ')
      return Number(aY) - Number(bY) || Number(aQ.slice(1)) - Number(bQ.slice(1))
    })
    .map(([lbl, val]) => ({ lbl, val }))
}

function applyMTTCFilterAndDraw() {
  if (!mttcMonthly.labels.length) return
  const filtered = filterLast12MonthsWithMin(
    mttcMonthly.labels,
    mttcMonthly.values
  )
  const finalArr = mttcSortType.value === 'month'
    ? filtered
    : groupQuarters(filtered)

  const labs = finalArr.map(x => x.lbl)
  const vals = finalArr.map(x => x.val)

  mttcCfg.chartData = buildData('bar', labs, vals, 'MTTC Average')
  mttcCfg.options   = getCommonOptions(
    'bar',
    'MTTC (Mean Time to Contain)',
    labs,
    vals,
    true
  )
}

function applyMTTRFilterAndDraw() {
  if (!mttrMonthly.labels.length) return
  const filtered = filterLast12MonthsWithMin(
    mttrMonthly.labels,
    mttrMonthly.values
  )
  const finalArr = mttrSortType.value === 'month'
    ? filtered
    : groupQuarters(filtered)

  const labs = finalArr.map(x => x.lbl)
  const vals = finalArr.map(x => x.val)

  mttrCfg.chartData = buildData('bar', labs, vals, 'MTTR Average')
  mttrCfg.options   = getCommonOptions(
    'bar',
    'MTTR (Mean Time to Remediate)',
    labs,
    vals,
    true
  )
}

function buildData(
  ct: ChartType,
  labels: string[],
  values: number[],
  lbl: string,
): ChartData<'bar' | 'line' | 'doughnut' | 'polarArea', number[]> {
  const ds: any = { 
    label: lbl, 
    data: values.map(v => (v > 0 ? v : null)) 
  };
  if (ct === 'bar' || ct === 'bar-monthly') {
    ds.type = 'bar';
    ds.backgroundColor = 'rgba(54,162,235,0.2)'; // default fallback; can be overridden in the component
    ds.borderColor = 'rgba(54,162,235,1)';
    ds.borderWidth = 1;
    ds.barPercentage = 0.7;
    ds.categoryPercentage = 0.8;
    ds.fill = false;
  } else if (ct === 'line' || ct === 'line-monthly') {
    ds.type = 'line';
    ds.fill = true;
    ds.tension = 0.3;
    ds.backgroundColor = 'rgba(54,162,235,0.2)'; // default fallback; can be overridden by the chart component if needed
    ds.borderColor = 'rgba(54,162,235,1)';
    ds.borderWidth = 1;
    ds.pointRadius = 3;
    ds.pointHoverRadius = 8;
    ds.pointHitRadius = 10;
  } else if (ct === 'donut') { 
    // For donut charts, we want the DoughnutChart component to handle colors.
    ds.type = 'doughnut';
    // We generally do not set backgroundColor here.
  } else if (ct === 'polar') {
    // For polar area charts, the PolarChart component will inject its own colors.
    ds.type = 'polarArea';
    // Do not set backgroundColor here.
  }
  return {
    labels,
    datasets: [ds as any]
  } as any
}

function getChartOptions(chartType, parentOptions) {
  const opts = parentOptions || {};
  // For donut or polar charts, merge with child's default legend settings
  if (chartType === 'donut' || chartType === 'polar') {
    return {
      ...opts,
      plugins: {
        ...opts.plugins,
        legend: {
          ...(opts.plugins ? opts.plugins.legend : {}),
          pointStyle: 'circle',  // Force circle shape for legend items
          usePointStyle: true,
          fullSize: false         // Only use the space needed for legend items
        }
      }
    };
  }
  return opts;
}
function getCommonOptions(
  ct: string,
  title: string,
  labels: string[],
  values: number[],
  isSpec: boolean
): ChartOptions<any> {
  const isDark = theme.global.name.value === 'DarkTheme'
  const fontColor = isDark ? '#FFF' : '#333'
  const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
  
  const tooltipBg = isDark
    ? 'rgba(50,50,50,0.9)'
    : 'rgba(255,255,255,0.95)'

  const logTypes = ['line', 'bar', 'line-monthly', 'bar-monthly']
  const isLog = logTypes.includes(ct)
  const isBar = ct.startsWith('bar')
  const tickFontSize = 12

  return {
    responsive: true,
    maintainAspectRatio: isSpec,
    animation: { duration: 0 },
    plugins: {
      title: {
        display: true,
        text: title,
        color: fontColor
      },
      legend: {
        display: !isSpec,
        labels: { color: fontColor },
        pointStyle: 'circle'
      },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: isDark ? '#FFF' : '#333',
        borderWidth: 1,
        titleColor: fontColor,
        bodyColor: fontColor,
        callbacks: {
          label: (ctx: any) => {
            if (!isSpec) return `Total: ${ctx.raw}`
            const totalHours = Number(ctx.raw || 0);
            const days = Math.floor(totalHours / 24);
            const hrs = Math.floor(totalHours % 24);
            const mins = Math.floor((totalHours * 60) % 60);
            const secs = Math.round((totalHours * 3600) % 60); 
            return `Mean Time: ${days}D:${hrs}H:${mins}M:${secs}S`; 
          }
        }
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false
    },
    scales: {
      x: {
        type: 'category' as const,
        display: true,
        offset: isBar,
        grid: { display: true, color: gridColor },
        border: { display: false },
        ticks: {
          align: 'center' as const,
          autoSkip: true,
          maxTicksLimit: labels.length,
          font: { size: tickFontSize },
          color: fontColor
        }
      },
      y: {
        type: (isLog ? 'logarithmic' : 'linear') as any,
        display: true,
        grid: { display: true, color: gridColor },
        border: { display: false },
        ticks: {
          autoSkip: true,
          maxTicksLimit: 8,
          padding: 8,
          font: { size: tickFontSize },
          color: fontColor,
          callback: (val: any) => {
            if (!isSpec) return `${val}`
            const h = Number(val || 0)
            const days = Math.floor(h / 24)
            const hrs = Math.floor(h % 24)
            const mins = Math.round((h % 1) * 60)
            return `${days}d:${hrs}h:${mins}m`
          }
        },
        ...((isLog || isSpec) ? {} : { beginAtZero: true })
      }
    },
    layout: {
      padding: isBar ? { left: 16, right: 16 } : 0
    }
  } as ChartOptions<any>
}

watch(
  () => theme.global.name.value,
  () => {
    // rebuild each general-chart config
    chartConfigs.forEach(cfg => {
      cfg.options = getCommonOptions(
        cfg.chartType,
        cfg.name,
        cfg.chartData.labels as string[],
        (cfg.chartData.datasets[0].data as number[]).map(v => v||0),
        false
      )
      cfg.version++   // force remount
    })
    // re-apply MTTC/MTTR filters+options
    applyMTTCFilterAndDraw()
    applyMTTRFilterAndDraw()
  }
)
</script>

<style>
/*────────── Main Container Styles ──────────────────────────────────────*/
html,
body {
  min-width: 1200px !important; /* Force at least 1200px wide */
  overflow-x: auto !important;
}

@media (max-width: 1200px) {
  .controls__buttons {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

.stats-chart {
  padding: 20px;
}

/*────────── Controls Bar Styling ─────────────────────────────────────────*/
.controls {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
  margin-bottom: 20px;
}

.refresh {
  align-self: center;
  font-size: 14px;
  color: #000; /* default light‑mode color*/
}

.refresh--dark {
  color: #fff !important; /* dark‑mode override*/
}

.controls__buttons {
  display: flex;
  justify-content: space-between;
}

/*────────── Toggle & Reset Button Styles ────────────────────────────────*/
.toggle-button,
.reset-button {
  padding: 4px 12px; /* adjusted to match export button styling */
  font-size: 12px;
  background: #b0e0e6;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
  color: #000;
  margin: 0 10px;
}

.toggle-button:hover,
.reset-button:hover {
  background: #b0e0e6b1;
}

/*────────── Message Styles (Error) ─────────────────────────────*/
.error-message {
  text-align: center;
  font-size: 16px;
  padding: 10px;
}

.error-message { 
  color: red;
}

/*────────── Grid Containers for Chart Layout ─────────────────────────────*/
.charts-container {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(800px, 1fr));
  grid-auto-rows: 400px;
}

.general-charts-container {
  width: 100%;
  height: 100%;
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(800px, 1000px));
  grid-auto-rows: 400px;
}

/*────────── Chart Wrapper ────────────────────────────────────────────────*/
.chart-wrapper {
  width: 100%;
  height: 100%;
  max-width: 800px; /*ensures the chart won't exceed 800px in width*/
  display: flex;
  flex-direction: column;
  padding: 10px;
}

/*────────── Chart Control Elements ─────────────────────────────────────────*/
.chart-controls {
  margin-bottom: 8px;
}

/*────────── Reset Dropdown Styles (Used for both Reset and Chart Type Dropdowns) ─────────────────────────*/
.reset-dropdown {
  position: relative;
  display: inline-block;
}

.reset-dropdown .reset-button {
  padding: 4px 12px;
  font-size: 12px;
  background: #b0e0e6;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.3s;
  color: #000;
}

.reset-dropdown .reset-button:hover {
  background: #b0e0e6b1;
}

.reset-dropdown .reset-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background-color: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 120px;
  z-index: 10;
}

.reset-dropdown .reset-menu li {
  padding: 4px 10px;
  cursor: pointer;
  font-size: 0.8em;
  color: #000;
}

.reset-dropdown .reset-menu li:hover {
  background-color: #ddd;
}

/*────────── Divider ──────────────────────────────────────────────────────*/
.divider {
  height: 3px;                   
  background-color: #ccc;        
  margin: 10px 0;               
}

/*────────── Export Dropdown Styles (for Save Button in Chart Components) ─────────────────────────*/
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

.export-option {
  padding: 4px 10px;
  cursor: pointer;
  font-size: 0.8em;
  color: #000;
}

.export-option:hover {
  background-color: #ddd;
}
/*────────── Loading Spinner ─────────────────────────────────────*/
.loading-message {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  width: 100%;
}

.spinner {
  margin-left: 10px;
  width: 30px; /* Size of the spinner */
  height: 30px; /* Size of the spinner */
  border: 4px solid transparent; /* Transparent border for the spinner */
  border-top-color: #b0e0e6; 
  border-radius: 50%; /*circular */
  animation: spin 1s linear infinite; /* Spin animation */
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
/*────────── Global Dark Mode Overrides ─────────────────────────────────────*/
:global(.scot-theme-dark .stats-chart .toggle-button),
:global(.scot-theme-dark .stats-chart .reset-button),
:global(.scot-theme-dark .chart-container .export-btn),
:global(.scot-theme-dark .chart-container .export-option),
:global(.scot-theme-dark .stats-chart .reset-menu li) {
  color: black !important;
}
</style>