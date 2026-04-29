<template>
    <v-card v-if="!isLoading" title="File Upload">
        <v-card-text>
            <v-file-upload density="compact" title="Drag and Drop or Click Here" v-model="filesToSubmit"
                :multiple="true"></v-file-upload>
            <span v-for="(file, index) in filesToSubmit" :key="'file' + index">
                <v-text-field v-model="fileDescriptions[index]" :label="'Description for: ' + file.name"
                    clearable></v-text-field>
            </span>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn @click="SubmitFiles()" color="success" rounded="lg" elevation="1" variant="outlined"
                v-if="filesToSubmit.length > 0">
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
import { useDialogStore, usePOST_APIStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave, faTimes, } from '@fortawesome/free-solid-svg-icons'
import { IRElementAPIPathsNoSlash } from '@/types/irelement'

const API_POST = usePOST_APIStore()
const Dialog = useDialogStore()
const emit = defineEmits(["RefreshSelectedView"])
let isLoading = ref(false)
let incomingProps = defineProps(['params'])
let currentRouteName = ref()
let currentRouteId = ref()
let filesToSubmit = ref([])
let fileDescriptions = ref([])

onMounted(() => {
    currentRouteName.value = incomingProps.params.targetType
    currentRouteId.value = incomingProps.params.targetId
})


async function SubmitFiles() {
    isLoading.value == true
    filesToSubmit.value.forEach((file, i) => {
        let description = null
        if (fileDescriptions.value[i]) {
            description = fileDescriptions.value[i]
        }
        const formData = new FormData()
        formData.append('file', file)
        API_POST.POST_File(formData, currentRouteId.value, IRElementAPIPathsNoSlash[currentRouteName.value], description)
    });

    emit('RefreshSelectedView', false)
    Dialog.ToggleDialog()
}
</script>