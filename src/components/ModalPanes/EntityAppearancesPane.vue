<template>
    <v-data-table density="compact" v-model:items-per-page="itemsPerPage" style="height: 100%"
        :headers="entityAppearancesHeaders" :items="sortedEntityAppearances" :items-length="totalItems" :loading="isLoading"
        item-value="name" :fixed-header="true" :sticky="true">
        <template v-slot:loading>
            <LoadingTable />
        </template>
        <template v-slot:headers="{ columns }">
            <tr>
                <template v-for="column in columns" :key="column.key">
                    <th v-if="column.title != 'Promoted_ids'">
                        <span class="mr-2 cursor-pointer" @click="sortByColumn(column.value)">
                            {{ column.title }}
                            <span v-if="sortColumn === column.value">
                                {{ sortDirection === 'asc' ? '▲' : '▼' }}
                            </span>
                        </span>
                    </th>
                </template>
            </tr>
        </template>
        <template v-slot:item="{ item }">
            <tr class="irelement-row" :id="item.id + 'Row'">
                <td v-for="(header, i) in entityAppearancesHeaders" :key="'alertTable' + header + i">
                    <span v-if="header.value == 'last_updated'">
                        {{ DatePipe.ConvertDate(item[header.value]) }}
                    </span>
                    <span v-else-if="header.value == 'id'">
                        <router-link v-if="item['type'] == 'alert'" :to="'/alertgroups/' + item['alertgroup_id']">
                            {{ item['id'] }}
                        </router-link>
                        <router-link v-else
                            :to="'/' + TextPipe.PluralizeString(item['type']) + '/' + item['id'].toString()">
                            {{ item['id'] }}
                        </router-link>
                    </span>
                    <span v-else-if="header.value == 'status'">
                        <v-chip :color="ObjectStatusColor(item['status'])" class="status-chip" variant="outlined"
                            :href="item['promoted_ids'] && item['promoted_ids'].length > 0 && item['status'] == 'promoted' ? '/#/events/' + item['promoted_ids'][0] : null">
                            {{ item['status'] }}
                        </v-chip>
                    </span>
                    <span v-else>{{ item[header.value] }}</span>
                </td>
            </tr>
        </template>
    </v-data-table>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, computed } from 'vue'
import { useGET_APIStore } from '@/stores'
import { useDatePipe, useTextPipe } from '@/pipes'
import LoadingTable from '../Loaders/LoadingTable.vue'

const API_GET = useGET_APIStore()
const DatePipe = useDatePipe()
const TextPipe = useTextPipe()

let incomingProps = defineProps(['entity'])
let entityAppearances = reactive([])
let entityData = ref()
let isLoading = ref(true)
let entityAppearancesHeaders = ref([{ title: "ID", value: "id" }, { title: "Type", value: "type" }, { title: "Subject", value: "subject" }, { title: "Status", value: "status" }, { title: "Last Updated", value: "last_updated" }])
let itemsPerPage = ref(10)
let totalItems = ref(0)

// Sorting state
let sortColumn = ref('')
let sortDirection = ref('asc')

// Computed property for sorted items
const sortedEntityAppearances = computed(() => {
    if (!sortColumn.value) {
        return entityAppearances
    }
    return [...entityAppearances].sort((a, b) => {
        const valueA = a[sortColumn.value]
        const valueB = b[sortColumn.value]
        if (valueA < valueB) {
            return sortDirection.value === 'asc' ? -1 : 1
        }
        if (valueA > valueB) {
            return sortDirection.value === 'asc' ? 1 : -1
        }
        return 0
    })
})

onMounted(() => {
    entityData.value = incomingProps.entity
    GetFlairAppearances()
})

async function GetFlairAppearances() {
    const itemOrdering = ["event", "intel", "alert", "dispatch", "product", "incident", "vuln_track", "vuln_feed", "signature"]
    await API_GET.GET_FlairAppearancesById(entityData.value.id)
        .then((v) => {
            for (const item of itemOrdering) {
                const itemKey = item + "_appearances"
                if (v[itemKey] && v[itemKey].length > 0) {
                    v[itemKey].forEach(element => {
                        entityAppearances.push(element)
                    });
                }
            }
        })
        .finally(() => {
            isLoading.value = false
        })
}

function ObjectStatusColor(status: string) {
    switch (status) {
        case "open":
        case "disabled":
            return "red"
        case "closed":
        case "enabled":
            return "green"
        case "promoted":
            return "orange"
        default:
            return "white"
    }
}

function sortByColumn(column: string) {
    if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
        sortColumn.value = column
        sortDirection.value = 'asc'
    }
}
</script>