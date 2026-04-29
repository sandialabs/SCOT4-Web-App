<template>

    <div class="journal-modal">
        <div class="container-fluid py-1 d-flex justify-end  mb-3 ">
            <v-btn color="danger" rounded="lg" elevation="1" variant="outlined" @click="CloseDialogAndRefresh()">
                <FontAwesomeIcon :icon="faTimes" />
            </v-btn>
        </div>
        <JournalEntryCell type="entry" :data="journal" :entities="entityData" :isReply="false" />
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useDialogStore, useBusStore } from '@/stores';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import JournalEntryCell from '@/components/Journal/JournalEntry.vue'

const Dialog = useDialogStore()
const Bus = useBusStore()

let incomingProps = defineProps(['params'])
let journal = reactive(incomingProps.params.entryData)
let entityData = reactive(incomingProps.params.entities)

function CloseDialogAndRefresh() {
    Bus.ToggleReloadSelectedView()
    Dialog.ToggleDialog()
}

</script>