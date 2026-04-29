<template>
    <v-container v-if="promotedData.length == 0 && !isLoading" class="pane-container">
        <h5 class="text-center">No associated Promoted Alerts</h5>
    </v-container>
    <v-container v-else-if="promotedData.length > 0 && !isLoading" :fluid="true" class="pane-container">
        <template v-for="promoted in promotedData" :key="promoted.id">
            <v-card :elevation="0">
                <v-card-title>
                    <u>{{ promoted.promotedTitle }}</u>
                </v-card-title>
                <v-card-subtitle>
                    Promoted from
                    <router-link :to="'/' + TextPipe.PluralizeString(promoted.target_type) + '/' + promoted.id">
                        {{ promoted.target_type }} {{ promoted.id }}
                    </router-link>
                </v-card-subtitle>
                <v-chip color="red" size="small" variant="flat" class="ml-4" style="color: black !important" v-if="promoted.unflaired">Unflaired Alertgroup</v-chip>
                <v-card-text v-if="promoted.target_type == 'alertgroup'">
                    <v-data-table density="compact" :loading="isLoading" :hide-default-footer="true"
                                  :items="getAlertData(promoted)">
                        <template v-slot:item="{ item }">
                            <tr>
                                <template v-for="value, key in item">
                                    <td v-if="key != 'status' && key != 'promoted_ids'" class="alert-cell" style="padding-left: 16px !important">
                                        <router-link v-if="key == 'id'" :to="`/alertgroups/${promoted.id}`">
                                            {{ value }}
                                        </router-link>
                                        <template v-else>
                                            <v-container class="alert-container"
                                                         v-if="ObjectOrArrayPipe.IsObjectOrArray(value)">
                                                <span v-for="(nestedItem, index) in ObjectOrArrayPipe.IsObjectOrArray(value)"
                                                      :key=index>
                                                    <span v-if="plain_alert_columns.includes(key)">
                                                        {{ nestedItem }}
                                                    </span>
                                                    <FlairWrapper v-else-if="Flair.GetFlairActive && incomingProps.entities"
                                                                  :template-text="nestedItem"
                                                                  :entities="incomingProps.entities" />
                                                    <span v-else>
                                                        {{ value }}
                                                    </span>
                                                </span>
                                            </v-container>
                                            <FlairWrapper v-else-if="Flair.GetFlairActive && incomingProps.entities"
                                                          :template-text="value" :entities="incomingProps.entities"
                                                          class="alert-container" />
                                            <span v-else>
                                                {{ value }}
                                            </span>
                                        </template>
                                    </td>
                                </template>
                            </tr>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </template>
    </v-container>
    <v-container v-else>
        <LoadingCard />
    </v-container>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LoadingCard from '@/components/Loaders/LoadingCard.vue';
import { useGET_APIStore, useFlairStore } from '@/stores'
import { useTextPipe, useObjectOrArrayPipe } from '@/pipes';
import FlairWrapper from '@/components/Flair/FlairWrapper.vue';
import { EntryClassEnum, IRElementAPIPaths, IRElementType, IRElementTypeSingular } from '@/types/irelement';
import { plain_alert_columns } from '@/constants';
import { isAxiosError } from 'axios';

const API_GET = useGET_APIStore()
const Flair = useFlairStore()
const TextPipe = useTextPipe()
const ObjectOrArrayPipe = useObjectOrArrayPipe()
let incomingProps = defineProps(['data', 'entities'])
const isLoading = ref(true)
const promotedData = ref([] as any[])

function getAlertData(promoted) {
    if (!Flair.GetFlairActive || !incomingProps.entities) {
        return promoted.data
    }

    function allAreBlank(alert: any) {
        const { id, ...data } = alert
        delete data["element type"]
        return Object.values(data).every(v => ["", "NULL", null].includes(v))
    }
    if (promoted.data_flaired.every(allAreBlank)) {
        promoted.unflaired = true
        return promoted.data
    }
    else {
        promoted.unflaired = false
        return promoted.data_flaired
    }
}

onMounted(async () => {
    if (incomingProps.data.promoted_from_sources) {
        const retrievedAlertgroups: any = {}
        const alertAlertgroupMap: Record<number, number> = {}
        for (let i = 0; i < incomingProps.data.promoted_from_sources.length; i++) {
            if (incomingProps.data.promoted_from_sources[i].p0_type == "alert") {
                const alertId = incomingProps.data.promoted_from_sources[i].p0_id
                if (alertId in alertAlertgroupMap) {
                    // alert already retrieved as part of alertgroup
                    const alertgroup = retrievedAlertgroups[alertAlertgroupMap[alertId]]
                    const promotedPosition = promotedData.value.findIndex((ag: any) => ag.id == alertgroup.id)
                    const alertPosition = alertgroup.full_alert_data.findIndex((a: any) => a.id == alertId)
                    const alertData = Object.assign({ id: alertId, "element type": incomingProps.data.promoted_from_sources[i].p0_type }, alertgroup.full_alert_data[alertPosition])
                    const alertDataFlaired = Object.assign({ id: alertId, "element type": incomingProps.data.promoted_from_sources[i].p0_type }, alertgroup.full_alert_data_flaired[alertPosition])
                    promotedData.value[promotedPosition].data.push(alertData)
                    promotedData.value[promotedPosition].data_flaired.push(alertDataFlaired)
                }
                else {
                    // alert not in previously-retrieved alertgroup
                    const alert = await API_GET.GET_IRElementPromotedAlerts(incomingProps.data.promoted_from_sources[i].p0_id)
                    if (alert && !isAxiosError(alert)) {
                        const alertgroup = await API_GET.GET_IRElementDataSelected(IRElementAPIPaths[IRElementType.Alertgroup], alert.alertgroup_id)
                        const alertPosition = alertgroup.full_alert_data.findIndex((a: any) => a.id == alertId)
                        promotedData.value.push({
                            target_type: IRElementTypeSingular[IRElementType.Alertgroup],
                            id: alertgroup.id,
                            promotedTitle: alertgroup.subject,
                            data_flaired: [Object.assign({ id: alert.id, "element type": incomingProps.data.promoted_from_sources[i].p0_type }, alert.data_flaired)],
                            data: [Object.assign({ id: alert.id, "element type": incomingProps.data.promoted_from_sources[i].p0_type }, alert.data)],
                        })
                        retrievedAlertgroups[alertgroup.id] = alertgroup
                        for (const alertData of alertgroup.full_alert_data) {
                            alertAlertgroupMap[alertData.id] = alertgroup.id
                        }
                    }
                }
            }
        }
        isLoading.value = false
    }
})
</script>