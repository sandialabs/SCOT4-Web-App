<template>
    <v-container v-if="!threatModelData && !isLoading">
        <h5 class="text-center">No Associated Threat Model Data</h5>
    </v-container>
    <v-container v-else-if="threatModelData && !isLoading" class="pane-container">
        <v-list>
            <v-list-item density="compact" :ripple="false">
                <v-select density="compact" variant="outlined" class="pt-2" v-model="threatModelData.threat_model_name" :items="threat_model_names" label="Model Name"/>
            </v-list-item>
            <v-list-item density="compact" :ripple="false">
                <v-text-field density="compact" variant="outlined" class="pt-2" v-model="threatModelData.threat_model_id" label="Model ID" />
            </v-list-item>
            <v-list-item density="compact" :ripple="false">
                <v-text-field density="compact" variant="outlined" class="pt-2" v-model="threatModelData.description" label="Description" />
            </v-list-item>
            <v-list-item density="compact" :ripple="false">
                <v-textarea style="font-family: 'Courier New', Courier, monospace;" dense auto-grow v-model="json_data" label="Data" :error-messages="json_error" :hint="data_hint(threatModelData.threat_model_name)" />
            </v-list-item>
            <v-list-item-action class="flex-column align-end">
                <v-btn icon="mdi-content-save" v-tooltip:left="'Save'" color="success" rounded="sm" size="small" @click="save" :loading="loading"/>
            </v-list-item-action>
        </v-list>
    </v-container>
    <v-container v-else>
        <LoadingCard />
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import LoadingCard from '../Loaders/LoadingCard.vue'
import { usePUT_APIStore, useBusStore } from '@/stores'
import { IRElementAPIPaths, IRElementType, ThreatModelNames } from '@/types/irelement';

const incomingProps = defineProps(['data'])
const threatModelData = reactive(incomingProps.data)
const isLoading = ref(true)
const API_PUT = usePUT_APIStore()
const Bus = useBusStore()
const threat_model_names: Array<string> = [ThreatModelNames.attack]
const loading = ref(false)
const json_data = ref("")
const json_error = ref("")

onMounted(() => {
    json_data.value = JSON.stringify(threatModelData.data, undefined, 4)
    isLoading.value = false
})

async function save() {
    loading.value = true
    try {
        threatModelData.data = JSON.parse(json_data.value)
        json_error.value = ""
    }
    catch (error) {
        json_error.value = `${error.name}: ${error.message}`
    }

    await API_PUT.UpdateElementById(IRElementAPIPaths[IRElementType.ThreatModelItem], threatModelData?.id, threatModelData)
        .then((v) => {
            v ? Bus.ToggleReloadSelectedView(false) : null
        })
        .finally(() => {
            loading.value = false
        })
}

function data_hint(threat_model_name: ThreatModelNames) {
    if (threat_model_name == ThreatModelNames.attack) {
        return "The following keys are required for MITRE ATTACK: `url`, `version`, `tactic`"
    }
}
</script>

<style scoped>
    .v-list-item {
        cursor: default;
    }
</style>