<template>
    <v-toolbar density="compact">
        <v-btn color="green" variant="outlined" rounded="lg" elevation="1" @click="Dialog.ToggleDialog('file-upload', { targetType: currentRouteName, targetId: currentRouteId })">
            <FontAwesomeIcon :icon="faPlusCircle" class="fs-7" />&nbsp;Add File
        </v-btn>
        <v-btn :disabled="selectedFiles.length == 0" color="blue" variant="outlined" rounded="lg" elevation="1" @click="Dialog.ToggleDialog('file-edit', { files: selectedFiles })">
            <FontAwesomeIcon :icon="faFileEdit" class="fs-7" />&nbsp;Edit File(s)
        </v-btn>
        <v-menu :disabled="selectedFiles.length == 0">
            <template v-slot:activator="{props}">
                <v-btn color="green" variant="outlined" rounded="lg" elevation="1" v-bind="props">
                    <FontAwesomeIcon :icon="faDownload" class="fs-7"/>&nbsp;Download File(s)&nbsp;<FontAwesomeIcon :icon="faChevronDown"/>
                </v-btn>
            </template>
            <v-list>
                <v-list-item class="pt-2" @click.stop.prevent>
                    <v-text-field density="compact" label="Encryption Password" v-model="password" hint="optional" persistent-hint/>
                </v-list-item>
                <v-list-item @click="DownloadFiles" title="Download"/>
            </v-list>
        </v-menu>
        <v-btn :disabled="selectedFiles.length == 0" color="error" variant="outlined" rounded="lg" elevation="1" @click="RemoveFiles">
            <FontAwesomeIcon :icon="faTrashCan" class="fs-7" />&nbsp;Delete File(s)
        </v-btn>
    </v-toolbar>
    <v-data-table
        density="compact"
        :headers="filesTableHeaders"
        :items="filesData"
        :items-length="incomingProps.data.file_count"
        :hide-default-footer="true"
        :loading="isLoading"
        show-select
        v-model="selectedFiles"
        select-strategy="all"
        return-object
    >
        <template v-slot:loading>
            <LoadingTable />
        </template>
    </v-data-table>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import LoadingTable from '../Loaders/LoadingCard.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTrashCan, faDownload, faPlusCircle, faFileEdit, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { useGET_APIStore, useDialogStore, useDELETE_APIStore } from '@/stores'
import { IRElementAPIPaths, IRElementAPIPathsNoSlash, IRElementType } from '@/types/irelement';

const incomingProps = defineProps(['data', 'targetType', 'targetId', "entities", "isNotModal", "newEntry"])
const emits = defineEmits(["toggleExtraToolBar", "alertSelectedIds", "refreshElement", "entryIds"])
const filesData = ref([] as any[])
const selectedFiles = ref([] as any[])
const password = ref<string>(undefined)
const isLoading = ref(true)
const filesTableHeaders: any = ref([
    { "title": "ID", "key": "id" },
    { "title": "File Name", "key": "filename" },
    { "title": "Description", "key": "description" },
    { "title": "File Size", "key": "filesize" },
    { "title": "Content Type", "key": "content_type" },
])

const currentRouteName = ref(null)
const currentRouteId = ref(null)

const API_GET = useGET_APIStore()
const API_DELETE = useDELETE_APIStore()
const Dialog = useDialogStore()

onMounted(() => {
    currentRouteName.value = incomingProps.targetType
    currentRouteId.value = incomingProps.targetId
    GetFiles(incomingProps.data.id)
})

// Reload files if file count changes
watch(() => incomingProps.data.file_count,
      () => GetFiles(incomingProps.data.id))

async function GetFiles(id: any) {
    isLoading.value = true
    await API_GET.GET_IRElementFilesData(IRElementAPIPaths[incomingProps.targetType], id)
        .then((v: any) => {
            filesData.value = v.result
            incomingProps.data.file_count = filesData.value.length
        }).finally(() => {
            isLoading.value = false
        })
}

async function DownloadFiles() {
    if (selectedFiles.value.length == 1) {
        await API_GET.GET_DownloadFile(selectedFiles.value[0].id, password.value)
    }
    else {
        await API_GET.GET_DownloadManyFiles(selectedFiles.value.map(a => a.id), password.value)
    }
}

async function RemoveFiles() {
    if (selectedFiles.value.length == 1) {
        await API_DELETE.DeleteElementById(IRElementAPIPathsNoSlash[IRElementType.File], selectedFiles.value[0].id)
    }
    else {
        await API_DELETE.DeleteManyElementsByIds(IRElementAPIPathsNoSlash[IRElementType.File], selectedFiles.value.map(a => a.id))
    }
    selectedFiles.value = []
    GetFiles(incomingProps.data.id)
}
</script>