<template>
    <v-container v-if="isLoading" fluid>
        <LoadingCard />
    </v-container>
    <v-container v-else fluid class="pane-container">
        <v-row class="mb-1">
            <v-col>
                <v-btn color="green" density="comfortable" prepend-icon="mdi-plus" text="Link Threat Model Item" style="color: black !important"
                    @click="Dialog.ToggleDialog('add_threat_model_item', {targetType: IRElementTypeSingular[route.name].toLowerCase(), targetId: route.params.id, existing: existingIDs})"        
                />
            </v-col>
            <v-spacer/>
            <v-col>
                <v-btn v-if="hasMitreAttack" color="primary" density="comfortable" text="Export as ATT&CK Navigator" @click="exportAttackNavigator" :loading="loading"/>
            </v-col>
        </v-row>
        <h3 class="text-center" v-if="threatModelData.length == 0">No Associated Threat Models</h3>
        <v-container v-else-if="!isThreatModelSelected" fluid class="pa-0">
            <v-data-table density="compact" :headers="threatModelTableHeaders" :items="threatModelData" :items-length="threatModelData.length" :loading="isLoading" v-model:items-per-page="itemsPerPage">
                <template v-slot:loading>
                    <LoadingTable />
                </template>
                <template v-slot:headers="{ columns }">
                    <tr>
                        <template v-for="column in columns" :key="column.key">
                            <th>
                                <span class="mr-2 cursor-pointer">{{ column["title"] }}</span>
                            </th>
                        </template>
                    </tr>
                </template>
                <template v-slot:item="{ item }">
                    <tr class="irelement-row" :id="item.id + 'Row'" @click.stop="GetThreatModelSelected(item)">
                        <td v-for="(header, index) in threatModelTableHeaders" :key="header.title + index" class="ps-3">
                            <span v-if="header.value == 'delete'">
                                <v-btn elevation="0" @click.stop="unlinkThreatModel(item.id)" icon="mdi-link-off" density="compact" rounded="sm"/>
                            </span>
                            <span v-else-if="header.value == 'modified'">
                                {{ DatePipe.ConvertDate(item[header.value]) }} 
                            </span>
                            <span v-else>
                                {{ item[header.value] }}
                            </span>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-container>
        <v-container v-else fluid class="pa-0">
            <v-btn v-if="incomingProps.data.ElementType != 'Threat Model Item'" @click.stop="isThreatModelSelected = false" elevation="0"
                class="mb-1" icon="mdi-arrow-left" v-tooltip:right="'Go back to threat model item table'" density="compact" rounded="sm"
            />
            <v-card :title="`Model Name: ${threatModelSelected.threat_model_name}`" :subtitle="`Model ID: ${threatModelSelected.threat_model_id}`">
                <template v-slot:append>
                    <div style="display: grid;">
                        <v-btn class="mb-1" append-icon="mdi-open-in-new" text="SCOT Threat Model Item"
                            :to="{name: IRElementType.ThreatModelItem, params: {id: threatModelSelected.id}}"
                            size="small" target="_blank" density="comfortable" variant="tonal"
                        />
                        <v-btn v-if="threatModelSelected.threat_model_name == ThreatModelNames.attack && threatModelSelected.data['url']" class="mb-1"
                            append-icon="mdi-open-in-new" :text="`${ThreatModelNames.attack}`" :href="threatModelSelected.data['url']" size="small"
                            target="_blank" density="comfortable" variant="tonal"
                        />
                    </div>
                </template>
                <v-list>
                    <v-list-subheader>Threat Model Item Attributes</v-list-subheader>
                    <v-divider />
                    <v-list-item v-for="(val, propName) in threatModelSelected.data" :key=propName>
                        <v-list-item-title>
                            <b>{{ propName }}</b>
                        </v-list-item-title>
                        {{ val }}
                    </v-list-item>
                </v-list>
                <v-card-actions>
                    Threat Model Item Owner: {{ threatModelSelected.owner }}
                    <v-spacer />
                    Last Modified: {{ DatePipe.ConvertDateFromString(threatModelSelected.modified) }}
                </v-card-actions>
            </v-card>
        </v-container>
    </v-container>
</template>

<script setup lang="ts">
    import { onMounted, reactive, ref, watch, computed } from 'vue';
    import LoadingCard from '../Loaders/LoadingCard.vue'
    import LoadingTable from '../Loaders/LoadingTable.vue';
    import { useGET_APIStore, usePOST_APIStore, useDialogStore, useBusStore } from '@/stores'
    import { useDatePipe } from '@/pipes';
    import { IRElementAPIPaths, IRElementType, IRElementTypeSingular, ThreatModelNames } from '../../types/irelement';
    import { useRoute } from 'vue-router';

    const incomingProps = defineProps(['data'])
    const threatModelData = reactive([])
    const threatModelItems = reactive(incomingProps.data.associated_threat_model_items)
    const threatModelSelected = ref()
    const itemsPerPage = ref(10)
    const isThreatModelSelected = ref(false)
    const isLoading = ref(true)
    const loading = ref(false)
    const existingIDs = ref([] as number[])
    const API_GET = useGET_APIStore()
    const API_POST = usePOST_APIStore()
    const route = useRoute()
    const DatePipe = useDatePipe()
    const Dialog = useDialogStore()
    const Bus = useBusStore()

    const threatModelTableHeaders = [
        { title: "ID", value: "id" },
        { title: "Model Name", value: "threat_model_name" },
        { title: "Model ID", value: "threat_model_id" },
        { title: "Owner", value: "owner" },
        { title: "Last Modified", value: "modified" },
        { title: "Actions", value: "delete" }
    ]

    onMounted(() => {
        GetThreatModelItems(threatModelItems)
        isLoading.value = false
    })

    watch(
        () => Bus.GetReloadSelectedView,
        () => GetThreatModelItems(threatModelItems)
    )

    const hasMitreAttack = computed(() => {
        const model_names = new Set(threatModelData.map((a) => a.threat_model_name))
        return model_names.has(ThreatModelNames.attack)
    })

    async function GetThreatModelItems(threatModelItems: any) {
        isLoading.value = true
        threatModelData.splice(0)
        if (threatModelItems === undefined) {
            await API_GET.GET_IRElementThreatModelItem(IRElementAPIPaths[route.name], parseInt(route.params.id as string)).then((data: any) => {
                threatModelData.push(...data)
            })
        }
        else {
            for(let i = 0; i < threatModelItems.length; i++) {
                await API_GET.GET_IRElementDataSelected(IRElementAPIPaths[IRElementType.ThreatModelItem], parseInt(threatModelItems[i].id))
                    .then((v: any) => {
                        threatModelData.push(v)
                    })
            }
        }
        if (threatModelData.length === 1) {
            threatModelSelected.value = threatModelData[0]
            isThreatModelSelected.value = true
        }
        else {
            threatModelSelected.value = {}
            isThreatModelSelected.value = false
        }

        existingIDs.value = threatModelData.map((a) => a.id)
        isLoading.value = false
    }

    function GetThreatModelSelected(item: any) {
        threatModelSelected.value = item
        isThreatModelSelected.value = true
    }

    async function unlinkThreatModel(threat_model_id: number) {
        await API_POST.POST_DeleteLinksBetweenElements(
            IRElementTypeSingular[IRElementType.ThreatModelItem].toLowerCase(),
            threat_model_id,
            IRElementTypeSingular[route.name].toLowerCase(),
            parseInt(route.params.id as string),
        )
        await GetThreatModelItems(threatModelItems)
    }

    async function exportAttackNavigator() {
        loading.value = true
        await API_GET.GET_DownloadAttackNavigator(route.name as IRElementType, {"id": parseInt(route.params.id as string)}).finally(() => {
            loading.value = false
        })
    }
</script>