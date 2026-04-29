<template>
    <v-container class="pane-container pa-0" fluid>
        <v-chip tile color="red" class="justify-center" style="width: 100%" size="large" v-if="unflaired">Unflaired Alertgroup</v-chip>
        <v-data-table :headers="tableHeaders" style="height: 100%" :items-per-page="-1" item-key="id"
            :items="alertData"
            :loading="isLoading" hide-default-footer density="compact" fixed-header v-model:model-value="selectedAlerts"
            :items-length="Flair.GetFlairActive && incomingProps.entities ? incomingProps.data.full_alert_data_flaired.length : incomingProps.data.full_alert_data.length"
            @click:row="GetAlertTableDataSelected" @mousedown="preventTextSelection" :row-props="selectedRow" ref="dataTable">
            <template v-slot:loading>
                <LoadingTable />
            </template>
            <template v-slot:[`item.id`]="{ value }">
                <span>{{ value }}</span>
            </template>
            <template v-slot:[`item.status`]="{ value, item }">
                <v-chip v-if="value == 'promoted'" class="status-chip" variant="flat" color="amber"
                        :href="item.promoted_ids && item.promoted_ids.length > 0 ? '/#/events/' + item.promoted_ids[0] : ''"
                        v-tooltip:top="`Alert promoted to event ID(s): ${item.promoted_ids}`">{{ value }}</v-chip>
                <v-chip v-else class="status-chip" variant="flat" :color="value == 'closed' ? 'green' : 'red'">
                    {{value}}
                </v-chip>
            </template>
            <template v-for="column in otherColumns" :key="column" v-slot:[`item.${column}`]="{ value }">
                <v-container v-if="ObjectOrArrayPipe.IsObjectOrArray(value)" class="alert-container pa-0">
                    <span v-for="(nestedItem, index) in ObjectOrArrayPipe.IsObjectOrArray(value)" :key=index>
                        <span v-html="nestedItem"></span>
                    </span>
                </v-container>
                <FlairWrapper :template-text="value" class="alert-container"
                    v-else-if="Flair.GetFlairActive && incomingProps.entities" :entities="incomingProps.entities" />
                <span v-else v-html="value"></span>
            </template>
        </v-data-table>
    </v-container>
</template>

<style lang="css" scoped>
.scot-theme-dark .v-table :deep(.selectedRow) {
    background-color: steelblue !important;
    transition: 0.0s;
}

.scot-theme-light .v-table :deep(.selectedRow) {
    background-color: lightblue;
    transition: 0.0s;
}

.scot-theme-dark .v-table :deep(.selectedRow:hover) {
    cursor: pointer;
    background-color: steelblue !important;
}

.scot-theme-light .v-table :deep(.selectedRow:hover) {
    cursor: pointer;
    background-color: lightblue !important;
}

:deep(table .notSelectedRow:hover) {
    cursor: pointer;
    transition: 0.0s;
}

.scot-theme-light .v-table :deep(tr td:nth-of-type(odd)) {
    background-color: rgba(0, 0, 0, .08);
}

.scot-theme-light .v-table :deep(tr th:nth-of-type(odd)) {
    background-color: #ebebeb !important;
}

.scot-theme-dark .v-table :deep(tr td:nth-of-type(odd)) {
    background-color: rgba(0, 0, 0, .80);
}

.scot-theme-dark .v-table :deep(tr th:nth-of-type(odd)) {
    background-color: #030303 !important;
}

.status-chip {
    color: black !important;
}

/* These just style alert data cells, the headers keep the default config below */
:deep(.v-table td:has(.alert-container)) {
    width: 150px;
    max-width: 200px;
    max-height: 200px;
    min-height: 22px;
    overflow-wrap: break-word;
    word-break: break-all;
    text-align: left !important;
    white-space: normal !important;
    padding: 0px 8px !important;
}
</style>

<script setup lang="ts">
import { onMounted, ref, onUnmounted, reactive, onUpdated, useTemplateRef, nextTick, computed } from 'vue';
import LoadingTable from '../Loaders/LoadingTable.vue'
import { useFlairStore, usePUT_APIStore } from '@/stores';
import FlairWrapper from '../Flair/FlairWrapper.vue';
import { useObjectOrArrayPipe } from '@/pipes';

let incomingProps = defineProps({ 'data': Object, 'entities': Object })
const emit = defineEmits(['ToggleExtraToolBar', 'AlertSelectedIds', 'RefreshElement'])
const API_PUT = usePUT_APIStore()
const Flair = useFlairStore()
const ObjectOrArrayPipe = useObjectOrArrayPipe()

let isLoading = ref(true)
let tableHeaders: any = reactive([])
const selectedAlerts = ref([])
const otherColumns = ref([] as string[])
const dataTable = useTemplateRef('dataTable')
const unflaired = ref(false)
let resizeDivs: Array<HTMLDivElement> = []
let tableMouseMoveFunction: any = null
let tableMouseUpFunction: any = null

const alertData = computed(() => {
    if (!Flair.GetFlairActive || !incomingProps.entities) {
        return incomingProps.data.full_alert_data
    }

    function allAreBlank(alert: any) {
        const { id, status, promoted_ids, ...data } = alert
        return Object.values(data).every(v => ["", "NULL", null].includes(v))
    }
    if (incomingProps.data.full_alert_data_flaired.every(allAreBlank)) {
        unflaired.value = true
        return incomingProps.data.full_alert_data
    }
    else {
        unflaired.value = false
        return incomingProps.data.full_alert_data_flaired
    }
})

onMounted(async () => {
    document.addEventListener("keydown", handleKeyboardShortcuts)
    const seenColumns: string[] = []
    if (incomingProps.data.full_alert_data != null && incomingProps.data.full_column_names != null) {
        incomingProps.data.full_column_names.forEach((column: string) => {
            let title = column
            if (seenColumns.includes(column)) {
                title = `_${title}`
                while (title in seenColumns) {
                    title = `_${title}`
                }
            }
            const addColumn = {
                "title": title,
                "key": column,
                "align": "center",
                "width": "",
                "nowrap": true
            }
            if (column == "id") {
                addColumn.width = "1%"
            }
            else if (column == "status") {
                addColumn.width = "8em"
            }
            else {
                otherColumns.value.push(column)
            }
            tableHeaders.push(addColumn)
        })
    }
    isLoading.value = false
    await nextTick()
    addColumnResizers()
})

onUnmounted(() => {
    document.removeEventListener("keydown", handleKeyboardShortcuts)
})

function preventTextSelection(e: MouseEvent) {
    if (e.ctrlKey || e.shiftKey) {
        document.getSelection()?.removeAllRanges()
    }
}

function selectedRow(row: any) {

    if (selectedAlerts.value.includes(row.item?.id)) {
        return { class: "selectedRow keyboardRows irelement-row" }
    }
    else {
        return { class: "notSelectedRow keyboardRows irelement-row" }
    }
}

function GetAlertTableDataSelected(event: MouseEvent, row: any) {
    if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
        selectedAlerts.value.splice(0)
    }
    row.toggleSelect({ value: row.item.id }, row.index, event)
    emit('ToggleExtraToolBar', selectedAlerts.value.length > 0)
    emit('AlertSelectedIds', selectedAlerts.value)
}

function handleKeyboardShortcuts(event: KeyboardEvent) {
    // Check for event target so this doesn't fire if someone's typing in a text box or something
    if (event.target && (event.target as HTMLElement).tagName == 'BODY' && !(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)) {
        if (event.code == "ArrowUp" || event.code == "ArrowDown") {
            let index = 0
            if (event.code == "ArrowUp") {
                index = selectedAlerts.value.length == 0 ? 0 : selectedAlerts.value.at(-1).index - 1
            }
            else if (event.code == "ArrowDown") {
                index = selectedAlerts.value.length == 0 ? 0 : selectedAlerts.value.at(-1).index + 1
            }
            const element = document.querySelectorAll("tr.keyboardRows")[index] as HTMLElement;
            if (element) {
                element.click()
                element.scrollIntoView({ block: "nearest" })
                event.preventDefault()
            }
        }
        else if (event.key == "c") {
            const ids = selectedAlerts.value.length == 0 ? incomingProps.data.full_alert_data.map((a: any) => a.id) : selectedAlerts.value
            API_PUT.UpdateManyElementsByIds("/alert", ids, { status: "closed" }).then((v: any) => {
                for (const alert of v) {
                    const item = incomingProps.data.full_alert_data.find(a => a.id == alert.id)
                    if (item) {
                        item.status = alert.status
                    }
                    const itemFlaired = incomingProps.data.full_alert_data_flaired.find(a => a.id == alert.id)
                    if (itemFlaired) {
                        itemFlaired.status = alert.status
                    }
                }
                incomingProps.data.open_count = incomingProps.data.full_alert_data.filter(a => a.status == "open").length
                incomingProps.data.closed_count = incomingProps.data.full_alert_data.filter(a => a.status == "closed").length
                incomingProps.data.promoted_count = incomingProps.data.full_alert_data.filter(a => a.status == "promoted").length
                emit('RefreshElement', incomingProps.data)
            })
        }
        else if (event.key == "o") {
            const ids = selectedAlerts.value.length == 0 ? incomingProps.data.full_alert_data.map((a: any) => a.id) : selectedAlerts.value
            API_PUT.UpdateManyElementsByIds("/alert", ids, { status: "open" }).then((v: any) => {
                for (const alert of v) {
                    const item = incomingProps.data.full_alert_data.find(a => a.id == alert.id)
                    if (item) {
                        item.status = alert.status
                    }
                    const itemFlaired = incomingProps.data.full_alert_data_flaired.find(a => a.id == alert.id)
                    if (itemFlaired) {
                        itemFlaired.status = alert.status
                    }
                }
                incomingProps.data.open_count = incomingProps.data.full_alert_data.filter(a => a.status == "open").length
                incomingProps.data.closed_count = incomingProps.data.full_alert_data.filter(a => a.status == "closed").length
                incomingProps.data.promoted_count = incomingProps.data.full_alert_data.filter(a => a.status == "promoted").length
                emit('RefreshElement', incomingProps.data)
            })
        }
    }
}

function addColumnResizers() {
    // Modified from here: https://stackoverflow.com/questions/65313966/vuetify-v-data-table-drag-and-resizable-columns-together
    const tables = dataTable.value.$el.getElementsByTagName('table');
    if (tables.length > 0) {
        // Get the table and its first row
        const table = tables[0]
        const row = table.getElementsByTagName('tr')[0],
            cols: any = row ? row.children : undefined,
            row2 = table.getElementsByTagName('tr')[1],
            cols2: any = row2 ? row2.children : undefined;
        if (!cols) return;
        if (!cols2) {
            cols2 = cols
        }
        var resizerHeight = '32'; // No longer table height because of problems with sticky headers
        // Create the draggable divs between each column
        resizeDivs = [];
        var pageX: any, curCol: any, nxtCol: any, curColWidth: any, nxtColWidth: any;
        for (var i = 0; i < cols.length; i++) {
            const div = createDiv(resizerHeight);
            cols[i].appendChild(div);
            const idx = i
            // Add event listener when someone clicks and drags on the resize div
            div.addEventListener('mousedown', function (e: any) {
                // Note that we actually change the width of the cell in the first row instead of the header
                // because the header width can get re-rendered unpredictably
                curCol = cols2[idx];
                nxtCol = curCol.nextElementSibling;
                pageX = e.pageX;
                var padding = paddingDiff(curCol);
                curColWidth = curCol.offsetWidth - padding;
                if (nxtCol)
                    nxtColWidth = nxtCol.offsetWidth - padding;
            });
            resizeDivs.push(div)
        }
        // Add event listeners on the whole document for mouseup
        document.addEventListener('mousemove', tableMouseMove);
        document.addEventListener('mouseup', tableMouseUp);

        //Save stuff for deregistering later
        tableMouseMoveFunction = tableMouseMove
        tableMouseUpFunction = tableMouseUp
    }

    // Extra utility functions
    function createDiv(height: any) {
        var div = document.createElement('div');
        div.style.top = '0';
        div.style.right = '0';
        div.style.width = '5px';
        div.style.position = 'absolute';
        div.style.cursor = 'col-resize';
        div.style.userSelect = 'none';
        div.style.height = height + 'px';
        return div;
    }

    function paddingDiff(col: any) {
        if (getStyleVal(col, 'box-sizing') == 'border-box') {
            return 0;
        }
        var padLeft = getStyleVal(col, 'padding-left');
        var padRight = getStyleVal(col, 'padding-right');
        return (parseInt(padLeft) + parseInt(padRight));

    }

    function getStyleVal(elm: any, css: any) {
        return (window.getComputedStyle(elm, null).getPropertyValue(css))
    }

    function tableMouseUp(e: any) {
        // If we were dragging a column, stop the next click event from firing
        if (curCol) {
            document.addEventListener('click', function (e: any) {
                e.stopPropagation()
            }, { once: true, capture: true })
        }
        curCol = undefined;
        nxtCol = undefined;
        pageX = undefined;
        nxtColWidth = undefined;
        curColWidth = undefined;
    }

    function tableMouseMove(e: any) {
        if (curCol) {
            var diffX = e.pageX - pageX;
            //if (nxtCol) // This is disabled for now - making a column bigger does not make an adjacent column smaller
            //    nxtCol.style['min-width'] = (nxtColWidth - (diffX)) + 'px';
            curCol.style['min-width'] = (curColWidth + diffX) + 'px';
        }
    }
}

function removeColumnResizers() {
    // Remove extraneous resize divs and event listeners
    if (tableMouseMoveFunction) {
        if (tableMouseUpFunction) {
            document.removeEventListener('mouseup', tableMouseUpFunction)
        }
        if (tableMouseMoveFunction) {
            document.removeEventListener('mousemove', tableMouseMoveFunction)
        }
        for (const div of resizeDivs) {
            div.remove()
        }
        resizeDivs = []
        tableMouseMoveFunction = null
        tableMouseUpFunction = null
    }
}
</script>