<template>
    <v-container class="pane-container">
        <v-data-table :headers="entityAppearancesHeaders" :items="appearancesData" :loading="isLoading"
            hide-default-footer density="compact" :fixed-header="true" :items-per-page="10">
            <template v-slot:loading>
                <LoadingTable />
            </template>
            <template v-slot:[`item.status`]="{item}">
                <span v-if="Array.isArray(item.status)">
                    <v-chip :color="alertGroupStatusColor(item.status[0], item.status[2])" class="status-chip" :tooltip:top="`${item.status[0]} Alerts Open, ${item.status[1]} Alerts Closed, ${item.status[2]} Alerts Promoted`">
                        <v-icon left>
                            <FontAwesomeIcon :icon="alertGroupStatusIcon(item.status[0], item.status[2])" />
                        </v-icon>
                        &nbsp;{{ item.status[0] }}/{{ item.status[1] }}/{{ item.status[2] }}
                    </v-chip>
                </span>
                <span v-else>
                    <v-chip :color="objectStatusColor(item.status)" class="status-chip" :text="item.status" :href="item.promoted_ids && item.promoted_ids.length > 0 && item.status == 'promoted' ? `/#/events/${item.promoted_ids[0]}` : null"/>
                </span>
            </template>
            <template v-slot:[`item.last_updated`]="{item}">
                <span v-if="$vuetify.display.xl">
                    {{ TextPipe.TransformDateString(item.last_updated)["date"] }} {{ TextPipe.TransformDateString(item.last_updated)["time"] }}
                </span>
                <span v-else>
                    {{ TextPipe.TransformDateString(item.last_updated)["date"] }}<br/>{{ TextPipe.TransformDateString(item.last_updated)["time"] }}
                </span>
            </template>
            <template v-slot:[`item.id`]="{item}">
                <router-link v-if="item.type == 'alert'" :to="`${IRElementAPIPaths[IRElementType.Alertgroup]}/${item.alertgroup_id}`">
                    {{ item.id }}
                </router-link>
                <router-link v-else :to="`${TextPipe.toIRElementPath(item.type)}/${item.id}`">
                    {{ item.id }}
                </router-link>
            </template>
        </v-data-table>
    </v-container>
</template>
<script setup lang="ts">
import { onMounted, ref, reactive } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faCheckCircle, faExclamationCircle, faEye } from "@fortawesome/free-solid-svg-icons";
import { useGET_APIStore } from "@/stores";
import { useTextPipe } from "@/pipes";
import { IRElementAPIPaths, IRElementType } from "@/types/irelement";
import LoadingTable from "../Loaders/LoadingTable.vue";

let isLoading = ref(true);
let incomingProps = defineProps(['targetId'])
let appearancesData = reactive([])
const entityAppearancesHeaders: Array<any> = [{ title: "ID", value: "id" }, { title: "Type", value: "type" }, { title: "Subject", value: "subject" }, { title: "Status", value: "status" }, { title: "Last Updated", value: "last_updated" }]

const TextPipe = useTextPipe()
const API_GET = useGET_APIStore();

onMounted(() => {
    GetEntityAppearances(incomingProps.targetId);
});

async function GetEntityAppearances(id) {
    await API_GET.GET_FlairAppearancesById(id)
        .then((v) => {
            for (const property in v) {
                if (v[property].length > 0) {
                    v[property].forEach((element: any) => {
                        appearancesData.push(element)
                    });
                }
            }
        })
        .finally(() => {
            isLoading.value = false
        })
}

function alertGroupStatusColor(open: number, promoted: number) {
    if (promoted > 0) {
        return 'orange'
    }
    else if (open > 0) {
        return 'red'
    }
    else {
        return 'green'
    }
}

function alertGroupStatusIcon(open: number, promoted: number) {
    if (promoted > 0) {
        return faExclamationCircle
    }
    else if (open > 0) {
        return faEye
    }
    else {
        return faCheckCircle
    }
}

function objectStatusColor(status: string) {
    switch (status) {
        case "open":
        case "disabled":
            return "red"
        case "closed":
        case "enabled":
            return "green"
        case "promoted":
            return "amber"
        default:
            return "white"
    }
}

</script>

<style scoped>
.status-chip {
    width: 100%;
    justify-content: center;
    height: 90%;
}
</style>
