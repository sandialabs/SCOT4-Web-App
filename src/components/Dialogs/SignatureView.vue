<template>
    <v-card @keyup.shift.enter="AddSignature()">
        <v-card-text>
            <v-autocomplete :loading="loading" v-model="signatureSelected" autofocus auto-select-first :items="signaturesOptions"
                hide-details label="Search for a signature" variant="outlined" hide-selected autoComplete="off" @update:search="SearchSignatures"
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
            <v-btn @click="AddSignature()" color="success" rounded="lg" elevation="1" variant="outlined">
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
const signatureSelected = ref<number>()
const signaturesOptions = ref([])
const existingIds = ref([])

onMounted(() => {
    existingIds.value = incomingProps.params.existing
    SearchSignatures()
})

async function SearchSignatures(v: any = null) {
    loading.value = true
    let search_filter = {}
    if (!isNaN(v) && !isNaN(parseFloat(v))) {
        search_filter = {"id": parseInt(v)}
    }
    else {
        search_filter = {"name": v}
    }

    await API_GET.GET_IRElementData(IRElementAPIPaths[IRElementType.Signature], null, 25, "id", search_filter)
        .then((v: any) => {
            signaturesOptions.value = v.result.map((signature: any) => {
                return {title: `Signature ID: ${signature.id} - ${signature.name}`, value: signature.id, description: signature.description}
            })
        })
        .finally(() => {
            loading.value = false
        })
}

async function AddSignature() {
    await API_POST.POST_CreateIRElement(IRElementAPIPaths[IRElementType.Link], {
        v0_type: IRElementTypeSingular[IRElementType.Signature].toLowerCase(),
        v0_id: signatureSelected.value,
        v1_type: IRElementTypeSingular[textPipe.toIRElementType(incomingProps.params.targetType)],
        v1_id: parseInt(incomingProps.params.targetId),
        weight: 1,
        context: "Linked guide"
    })
    emit('RefreshSelectedView', false)
    Dialog.ToggleDialog()
}
</script>