<template>
    <v-card @keyup.shift.enter="AddThreatModelItem()">
        <v-card-text>
            <v-autocomplete :loading="loading" v-model="threatModelItemSelected" autofocus auto-select-first :items="threatModelItemsOptions"
                hide-details label="Search for a threat model item" variant="outlined" hide-selected autoComplete="off" @update:search="SearchThreatModelItems"
            >
                <template v-slot:item="{item, props}">
                    <v-list-item v-bind="props" v-tooltip:bottom="item.raw.description"/>
                </template>
            </v-autocomplete>
        </v-card-text>
        <v-card-actions>
            <v-tooltip interactive location="left">
                <template v-slot:activator="{ props: activatorProps }">
                    <v-icon icon="mdi-information-outline" v-bind="activatorProps"/>
                </template>
                <p class="text-caption">
                    Hotkeys
                </p>
                <v-divider/>
                <p class="text-caption">
                    ESC: Close
                </p>
                <p class="text-caption">
                    Shift+Enter: Submit
                </p>
                <p class="text-caption">
                    Tab: Select first entry and stop selecting
                </p>
            </v-tooltip>
            <v-spacer/>
            <v-btn @click="AddThreatModelItem()" color="success" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faSave" />&nbsp;Save
            </v-btn>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" />&nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGET_APIStore, usePOST_APIStore, useDialogStore, } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons'
import { useTextPipe } from '@/pipes';
import {IRElementAPIPaths, IRElementType, IRElementTypeSingular} from '@/types/irelement';

const Dialog = useDialogStore()
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const textPipe = useTextPipe()
const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshSelectedView'])
const loading = ref(false)
const threatModelItemSelected = ref<number>()
const threatModelItemsOptions = ref([])
const existingIds = ref([])

onMounted(() => {
    existingIds.value = incomingProps.params.existing
    SearchThreatModelItems()
})

async function SearchThreatModelItems(v: any = null) {
    loading.value = true
    await API_GET.GET_IRElementData(IRElementAPIPaths[IRElementType.ThreatModelItem], null, 25, "id", {"threat_model_id": v})
        .then((v: any) => {
            threatModelItemsOptions.value = v.result.map((threatModelItem: any) => {
                return {title: `${threatModelItem.threat_model_name}: ${threatModelItem.threat_model_id}`, value: threatModelItem.id, description: threatModelItem.description}
            })
        })
        .finally(() => {
            loading.value = false
        })
}

async function AddThreatModelItem() {
    await API_POST.POST_CreateIRElement(IRElementAPIPaths[IRElementType.Link], {
        v0_type: IRElementTypeSingular[textPipe.toIRElementType(incomingProps.params.targetType)],
        v0_id: parseInt(incomingProps.params.targetId),
        v1_type: IRElementTypeSingular[IRElementType.ThreatModelItem].toLowerCase(),
        v1_id: threatModelItemSelected.value,
        weight: 1,
        context: "Linked threat model item"
    })
    emit('RefreshSelectedView', false)
    Dialog.ToggleDialog()
}
</script>