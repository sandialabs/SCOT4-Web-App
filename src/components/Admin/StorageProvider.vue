<template>
    <v-card flat title="Object Storage Providers" class="full-height d-flex flex-column">
        <v-card-text class="d-flex flex-column pb-0" style="min-height: 0px">
            <div class="text-h6">
                Add a Storage Provider
                <v-btn small fab color="green" @click="Dialog.ToggleDialog('storage_create')">
                    <FontAwesomeIcon :icon="faPlus" />
                </v-btn>
            </div>
            <v-data-table density="compact"
                          :headers="tableHeaders"
                          :items="storages"
                          :loading="loading"
                          @update:options="getStorages"
                          hide-default-footer
                          fixed-header
                          class="overflow-y-auto">
                <template v-slot:[`item.enabled`]={item}>
                    <v-switch density="compact" hide-details :loading="activeSwitchesLoading[item.id]" v-model="item.enabled" @click.prevent.stop.capture="activeSwitchChange(item.id, item.enabled)" />
                </template>
                <template v-slot:[`item.edit_delete`]="{item}">
                    <v-btn icon density="compact" @click.stop="Dialog.ToggleDialog('storage_create', {storage: item})">
                        <FontAwesomeIcon :icon="faPencil" />
                    </v-btn>
                    <v-btn icon density="compact" color="red" @click.stop="Dialog.ToggleDialog('confirm_delete',  {storage: item})">
                        <FontAwesomeIcon :icon="faTrash" />
                    </v-btn>
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useDialogStore, useGET_APIStore, usePUT_APIStore, useBusStore } from '@/stores'

const Dialog = useDialogStore()
const getAPI = useGET_APIStore()
const putAPI = usePUT_APIStore()
const Bus = useBusStore()
const loading = ref(false)
const storages = ref([] as any[])
const activeSwitchesLoading = reactive({})
const tableHeaders = [
    { title: "ID", key: "id" },
    { title: "Storage Provider Name", key: "config.provider_name" },
    { title: "Storage Provider Type", key: "provider" },
    { title: "Active", key: "enabled" },
    { title: "Edit/Delete", key: "edit_delete" }
]

async function getStorages() {
    loading.value = true
    const data: any = await getAPI.GET_Storages()
    if (data) {
        storages.value = data
        for (let i = 0; i < data.length; i++) {
            activeSwitchesLoading[data[i].id] = false
        }
    }
    loading.value = false
}

async function activeSwitchChange(id: number, oldValue: boolean) {
    activeSwitchesLoading[id] = true
    const data = await putAPI.UpdateStorage(id, { enabled: !oldValue })
    if (data) {
        const index = storages.value.findIndex((a: any) => a.id == id)
        if (index != -1) {
            storages.value[index] = data
        }
    }
    activeSwitchesLoading[id] = false
}

watch(
    () => Bus.GetReloadSelectedView,
    () => {
        getStorages()
    }
)
</script>
<style scoped>
    .full-height {
        height: 100%;
    }
</style>