<template>
    <v-container v-if="isLoading" fluid>
        <LoadingCard />
    </v-container>
    <v-container v-else fluid class="pane-container">
        <v-btn color="green"  density="comfortable" class="mb-1" style="color: black !important"
            @click="Dialog.ToggleDialog('add_signature', {targetType: IRElementTypeSingular[route.name].toLowerCase(), targetId: route.params.id, existing: existingIDs})"
            prepend-icon="mdi-plus" text="Link Signature"
        />
        <h3 v-if="signatureData.length == 0" class="text-center">No Associated Signatures</h3>
        <v-container v-else-if="!isSignatureSelected" fluid class="pa-0">
            <v-data-table density="compact" :headers="signatureTableHeaders" :items="signatureData" :items-length="signatureData.length" :loading="isLoading" v-model:items-per-page="itemsPerPage">
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
                    <tr class="irelement-row" :id="item.id + 'Row'" @click.stop="GetSignatureSelected(item)">
                        <td v-for="(header, index) in signatureTableHeaders" :key="header.title + index" class="ps-3">
                            <span v-if="header.value == 'delete'">
                                <v-btn elevation="0" @click.stop="unlinkSignature(item.id)" icon="mdi-link-off" density="compact" rounded="sm"/>
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
            <v-btn v-if="incomingProps.data.ElementType != 'Signature'" @click.stop="isSignatureSelected = false" elevation="0"
                class="pb-1" icon="mdi-arrow-left" v-tooltip:right="'Go back to signature table'" density="compact" rounded="sm"
            />
            <v-card :title="`Signature: ${signatureSelected.name}`" :subtitle="`Signature Type: ${signatureSelected.type}`">
                <template v-slot:append>
                    <div style="display: grid;">
                        <v-btn class="mb-1" append-icon="mdi-open-in-new" text="SCOT Signature"
                            :to="{name: IRElementType.Signature, params: {id: signatureSelected.id}}"
                            size="small" target="_blank" density="comfortable" variant="tonal"
                        />
                        <v-btn class="mb-1" v-if="signatureSelected.type == 'splunk' && 'search_link' in signatureSelected.data"
                            append-icon="mdi-open-in-new" text="Splunk Signature" :href="signatureSelected.data.search_link"
                            target="_blank" size="small" density="comfortable" variant="tonal"
                        />
                        <v-btn v-if="signatureSelected.type == 'splunk' && 'back_refs' in signatureSelected.data" append-icon="mdi-open-in-new"
                            text="View In Splunk" :href="incomingProps.data.back_refs" target="_blank" size="small" density="comfortable" variant="tonal"
                        />
                    </div>
                </template>
                <v-list>
                    <v-list-subheader>Signature Attributes</v-list-subheader>
                    <v-divider />
                    <v-list-item v-for="(val, propName) in signatureSelected.data" :key=propName>
                        <v-list-item-title>
                            <b>{{ propName }}</b>
                        </v-list-item-title>
                        {{ val }}
                    </v-list-item>
                </v-list>
                <v-card-actions>
                    Signature Owner: {{ signatureSelected.owner }}
                    <v-spacer />
                    Last Modified: {{ DatePipe.ConvertDateFromString(signatureSelected.modified) }}
                </v-card-actions>
            </v-card>
        </v-container>
    </v-container>
</template>

<script setup lang="ts">
    import { onMounted, reactive, ref, watch } from 'vue';
    import LoadingCard from '../Loaders/LoadingCard.vue'
    import LoadingTable from '../Loaders/LoadingTable.vue';
    import { useGET_APIStore, usePOST_APIStore, useDialogStore, useBusStore } from '@/stores'
    import { useDatePipe } from '@/pipes';
    import { IRElementAPIPaths, IRElementType, IRElementTypeSingular } from '../../types/irelement';
    import { useRoute } from 'vue-router';

    const incomingProps = defineProps(['data'])
    const signatureData = reactive([])
    const signatureMap = ref(incomingProps.data.associated_sig_guide_map)
    const signatureSelected = ref()
    const itemsPerPage = ref(10)
    const isSignatureSelected = ref(false)
    const isLoading = ref(true)
    const API_GET = useGET_APIStore()
    const API_POST = usePOST_APIStore()
    const route = useRoute()
    const DatePipe = useDatePipe()
    const Dialog = useDialogStore()
    const Bus = useBusStore()
    const existingIDs = ref([] as number[])
    const signatureTableHeaders = [
        { title: "ID", value: "id" },
        { title: "Name", value: "name" },
        { title: "Signature Type", value: "type" },
        { title: "Owner", value: "owner" },
        { title: "Last Modified", value: "modified" },
        { title: "Actions", value: "delete" }
    ]

    onMounted(() => {
        GetSignatures(signatureMap.value)
        isLoading.value = false
    })

    watch(
        () => Bus.GetReloadSelectedView,
        () => GetSignatures(signatureMap.value)
    )

    async function GetSignatures(sigGuideMap: any) {
        isLoading.value = true
        signatureData.splice(0)
        if (sigGuideMap === undefined) {
            const newSignatureData = await API_GET.GET_IRElementSignature(IRElementAPIPaths[route.name], parseInt(route.params.id as string))
            signatureData.push(...newSignatureData)
        }
        else {
            for (const sigID of Object.keys(sigGuideMap)) {
                await API_GET.GET_IRElementDataSelected(IRElementAPIPaths[IRElementType.Signature], parseInt(sigID))
                    .then((v: any) => {
                        signatureData.push(v)
                    })
            }
        }
        if (signatureData.length === 1) {
            signatureSelected.value = signatureData[0]
            isSignatureSelected.value = true
        }
        else {
            signatureSelected.value = {}
            isSignatureSelected.value = false
        }
        existingIDs.value = signatureData.map((a) => a.id)
        if (sigGuideMap == undefined) {
            if (!incomingProps.data.linkedElements) {
                incomingProps.data.linkedElements = {}
            }
            incomingProps.data.linkedElements.Signature = signatureData
        }
        isLoading.value = false
    }

    function GetSignatureSelected(item: any) {
        signatureSelected.value = item
        isSignatureSelected.value = true
    }

    async function unlinkSignature(signatureId: number) {
        await API_POST.POST_DeleteLinksBetweenElements(
            IRElementTypeSingular[IRElementType.Signature].toLowerCase(),
            signatureId,
            IRElementTypeSingular[route.name].toLowerCase(),
            parseInt(route.params.id as string)
        )
        await GetSignatures(signatureMap.value)
    }

</script>
