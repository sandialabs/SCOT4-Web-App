<template>
    <v-card>
        <v-card-title>
            Entry Modified
        </v-card-title>
        <v-card-text>
            This entry was modified by someone else while you were editing it. Submit your edits anyway and overwrite the other edits?
        </v-card-text>
        <v-card-actions>
            <v-btn color="green-darken-1" variant="outlined" rounded="lg" elevation="1" @click="onSubmit" :loading="submitLoading">
                <FontAwesomeIcon :icon="faSave" /> &nbsp;Confirm
            </v-btn>
            <v-btn color="red-darken-1" variant="outlined" rounded="lg" elevation="1" @click="onCancel">
                <FontAwesomeIcon :icon="faTimes" /> &nbsp;Cancel
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useDialogStore, usePUT_APIStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons'
import { IRElementAPIPaths, IRElementType } from '@/types/irelement'
import { useStorage } from '../../storage/storage'

const API_PUT = usePUT_APIStore()
const Dialog = useDialogStore()
const storage = useStorage()
const emit = defineEmits(["RefreshSelectedView"])
const incomingProps = defineProps(['params'])
const submitLoading = ref(false)

async function onSubmit() {
    submitLoading.value = true
    const resp = await API_PUT.UpdateElementById('/entry', incomingProps.params.entry.id, { entry_data: { html: incomingProps.params.html } })
    if (resp) {
        submitLoading.value = false
        Object.assign(incomingProps.params.entry, resp)
        incomingProps.params.isEntryEditing = false
        incomingProps.params.saveLoading = false
        storage.removeItem('editorContent' + ':' + incomingProps.params.entry.target_type + ':' + incomingProps.params.entry.target_id + ':' + incomingProps.params.entry.id)
        Dialog.ToggleDialog()
    }
    else {
        Dialog.ToggleDialog()
        incomingProps.params.saveLoading = false
    }
}

function onCancel() {
    incomingProps.params.saveLoading = false
    Dialog.ToggleDialog()
}
</script>