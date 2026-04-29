<template>
    <v-card v-if="!isLoading" title="Edit File(s)">
        <v-card-text>
            <span v-for="file in files" :key="file.id">
                <v-text-field v-model="file.filename" :label="'Filename for: ' + file.id" clearable :rules="[v => !!v || 'Required']"/>
                <v-text-field v-model="file.description" :label="'Description for: ' + file.id" clearable/>
                <v-divider/>
            </span>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn @click="SubmitFiles()" color="success" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faSave" /> &nbsp;Save
            </v-btn>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" /> &nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
    <LoadingCard v-else/>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import LoadingCard from '../Loaders/LoadingCard.vue'
import { useDialogStore, usePUT_APIStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons'
import { IRElementAPIPaths, IRElementType } from '@/types/irelement'

const API_PUT = usePUT_APIStore()
const Dialog = useDialogStore()
const emit = defineEmits(["RefreshSelectedView"])
const isLoading = ref(false)
const incomingProps = defineProps(['params'])
const files = ref([])

onMounted(() => {
    console.log(incomingProps.params.files)
    files.value = incomingProps.params.files
})

async function SubmitFiles() {
    isLoading.value == true
    files.value.forEach(async (file) => {
        await API_PUT.UpdateElementById(IRElementAPIPaths[IRElementType.File], file.id, {filename: file.filename, description: file.description})
    })
    emit('RefreshSelectedView', false)
    Dialog.ToggleDialog()
}
</script>