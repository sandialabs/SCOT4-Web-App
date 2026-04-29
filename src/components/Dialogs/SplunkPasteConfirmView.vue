<template>
    <v-card>
        <v-card-title class="text-h5">
            Special Paste Type Detected: {{ incomingProps.params.type }}
        </v-card-title>
        <v-card-text v-if="incomingProps.params.type=='splunk'">
            It was detected that you have copy and pasted from a Splunk user interface (most likely search results). Would you like to
            auto-format the search results, search terms and uri?
        </v-card-text>
        <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green-darken-1" text @click="onConfirm">
                Yes
            </v-btn>

            <v-btn color="green-darken-1" text @click="onCancel">
                No
            </v-btn>
        </v-card-actions>
    </v-card>
</template>
<script setup lang="ts">
import { useDialogStore } from '@/stores'

const Dialog = useDialogStore()
const incomingProps = defineProps(['params'])

async function onConfirm() {
    Dialog.ToggleDialog()
    incomingProps.params.editor.commands.insertContent(incomingProps.params.newText)
}

function onCancel() {
    Dialog.ToggleDialog()
    incomingProps.params.editor.commands.insertContent(incomingProps.params.origText)
}
</script>