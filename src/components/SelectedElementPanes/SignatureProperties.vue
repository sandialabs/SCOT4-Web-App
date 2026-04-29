<template>
    <v-container v-if="!signatureData && !isLoading">
        <h5 class="text-center">No Associated Signaure Data</h5>
    </v-container>
    <v-container v-else-if="signatureData && !isLoading" class="pane-container">
        <v-list>
            <v-list-item density="compact" :ripple="false">
                <v-text-field density="compact" variant="outlined" class="pt-1" label="Signature Type" v-model="signatureData.type"
                                @change="UpdateSignature('type', signatureData.type)"></v-text-field>
            </v-list-item>
            <v-list-item density="compact" :ripple="false">
                <v-text-field density="compact" variant="outlined" class="pt-1" label="Signature Description" v-model="signatureData.description"
                                @update:model-value="UpdateSignature('description', signatureData.description)"></v-text-field>
            </v-list-item>
            <v-list-item density="compact" :ripple="false" v-if="signatureData.data.external_location != null">
                <v-text-field density="compact" variant="outlined" class="pt-1" readonly label="External Location" @blur="UpdateSignature('data', null)" v-model="signatureData.data.external_location" hint="The external location where this signature is stored (blank if only stored in SCOT)">
                    <template v-slot:append>
                        <a :href="signatureData.data.external_location" target="_blank">
                            <v-icon v-if="signatureData.data.external_location">
                                mdi-open-in-new
                            </v-icon>
                        </a>
                    </template>
                </v-text-field>
            </v-list-item>
            <v-list-item density="compact" :ripple="false" v-if="signatureData.type != 'splunk' && signatureData.data?.target">
                <div class="d-flex justify-space-between">
                    <v-text-field class="mb-0 flex-shrink-0 flex-grow-0 pt-1" variant="outlined" @blur="UpdateSignature('data', null)" label="Reference Type" style="width: 49%" hint="The SCOT datatype that orignated this signature" v-model="signatureData.data.target.type" density="compact"></v-text-field>
                    <v-text-field class="flex-shrink-0 flex-grow-0 pt-1" variant="outlined" @blur="UpdateSignature('data', null)" label="Reference ID" style="width: 49%" hint="The id of the SCOT datatype that originated this signature" v-model="signatureData.data.target.id" density="compact"></v-text-field>
                </div>
            </v-list-item>
            <v-list-item density="compact" :ripple="false" v-if="signatureData.type != 'splunk' && signatureData.data" class="mt-n1">
                <v-combobox density="compact" variant="outlined" class="pt-1" v-model="signatureData.data.signature_group" @blur="UpdateSignature('data', null)" label="Signature Groups" hint="Group signatures under common names" multiple chips deletable-chips></v-combobox>
            </v-list-item>
            <v-list-item density="compact" :ripple="false" v-if="signatureData.type != 'splunk' && signatureData.data" class="mt-n1">
                <v-select density="compact" variant="outlined" class="pt-1" v-model="signatureData.data.action" @update:modelValue="UpdateSignature('data', null)" :items="actionItems" label="Action" hint="The automated action that should take place when this signature is triggered" chips multiple></v-select>
            </v-list-item>
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
import { useDebounceFn } from '@vueuse/core'
import { IRElementAPIPaths, IRElementType } from '@/types/irelement';

let incomingProps = defineProps(['data'])
let signatureData = reactive(incomingProps.data)
let isLoading = ref(true)

const API_PUT = usePUT_APIStore()
const Bus = useBusStore()
const DebouncedRequest = useDebounceFn(() => true, 700)
const actionItems: Array<string> = ["alert", "block"]


onMounted(() => {
    isLoading.value = false
})

async function UpdateSignature(updateField, updateValue) {
    if (updateValue == null) {
        updateValue = signatureData[updateField]
    }
    const debounce = await DebouncedRequest()
    if (debounce) {
        await API_PUT.UpdateElementById(IRElementAPIPaths[IRElementType.Signature], signatureData?.id, { [updateField]: updateValue })
            .then((v) => {
                v ? Bus.ToggleReloadSelectedView(false) : null
            })
    }
}

</script>

<style scoped>
    .v-list-item {
        cursor: default;
    }
</style>