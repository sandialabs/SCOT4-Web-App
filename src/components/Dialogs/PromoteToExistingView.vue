<template>
    <v-card v-if="!isLoading" title="Permissions to Existing" @keyup.shift.enter="Promote(false)">
        <v-card-text>
            <v-number-input v-model="promote_id" :error-messages="error" :min="1" label="ID to Promote To" control-variant="stacked" autofocus autocomplete="off"/>
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
            </v-tooltip>
            <v-spacer/>
            <v-btn @click="Promote(false)" color="success" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faSave" />&nbsp;Save
            </v-btn>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" />&nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
    <LoadingCard v-else/>
</template>

<script setup lang="ts"> 
import { ref } from 'vue'
import { usePOST_APIStore, useDialogStore, useSnackBarStore} from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons'
import { IRElementAPIPathsNoSlash } from '@/types/irelement';
import { ModelElementPromote } from '@/models'
import LoadingCard from '../Loaders/LoadingCard.vue';

const Dialog = useDialogStore()
const API_POST = usePOST_APIStore()
const SnackBar = useSnackBarStore()

const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshSelectedView'])

const isLoading = ref(false)
const promote_id = ref(0)
const error = ref("")

async function Promote(addTagsSources: boolean) {
    if (promote_id.value === undefined) {
        error.value = "Must Select an ID"
    }

    let source = "undefined"
    let sourceIds = []
    if (incomingProps.params.ir_element) {
        source = incomingProps.params.ir_element.includes("alertgroup") ? "alert" : IRElementAPIPathsNoSlash[incomingProps.params.ir_element]
        sourceIds = Array.isArray(incomingProps.params.id) ? incomingProps.params.id : [incomingProps.params.id]
    }

    const promotionTargetMap: Record<string, string> = {
        "alert": "event",
        "event": "incident",
        "events": "incident",
        "dispatch": "intel",
        "dispatches": "intel",
        "vuln_feed": "vuln_track",
        "vulnerability/feed": "vuln_track"
    }

    await API_POST.POST_PromoteElements(new ModelElementPromote(
        promotionTargetMap[source],
        promote_id.value,
        sourceIds.map(element => {
            return { type: source, id: element }
        }),
        addTagsSources ? incomingProps.params.sources : undefined,
        addTagsSources ? incomingProps.params.tags : undefined
    )).then(() => {
        Dialog.ToggleDialog()
    }).catch((error: any) => {
        SnackBar.ShowSnackBarError(error)
    })
}
</script>