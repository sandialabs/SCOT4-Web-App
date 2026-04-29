<template>
    <v-card flat title="Authentication Methods" class="full-height d-flex flex-column">
        <v-card-text class="d-flex flex-column pb-0" style="min-height: 0px">
            <div class="text-h6">
                Add Authentication Method
                <v-btn small fab color="green" @click="Dialog.ToggleDialog('authentication_create')">
                    <FontAwesomeIcon :icon="faPlus"/>
                </v-btn>
            </div>
            <v-data-table
                density="compact"
                :headers="tableHeaders"
                :items="authentications"
                :loading="loading"
                @update:options="getAuthentications"
                hide-default-footer
                fixed-header
                class="overflow-y-auto"
            >
                <template v-slot:[`item.auth_active`]={item}>
                    <v-switch density="compact" hide-details :loading="activeSwitchesLoading[item.id]" v-model="item.auth_active" @click.prevent.stop.capture="activeSwitchChange(item.id, item.auth_active)"/>
                </template>
                <template v-slot:[`item.edit_delete`]="{item}">
                    <v-btn icon density="compact" @click.stop="Dialog.ToggleDialog('authentication_create', {authentication: item})">
                        <FontAwesomeIcon :icon="faPencil"/>
                    </v-btn>
                    <v-btn icon density="compact" color="red" @click.stop="Dialog.ToggleDialog('confirm_delete',  {authentication: item})">
                        <FontAwesomeIcon :icon="faTrash"/>
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
const authentications = ref([] as any[])
const activeSwitchesLoading = reactive({})
const tableHeaders = [
    {title: "ID", key: "id"},
    {title: "Type", key: "auth"},
    {title: "Provider Name", key: "auth_properties.provider_name"},
    {title: "Active", key: "auth_active"},
    {title: "Edit/Delete", key: "edit_delete"}
]

async function getAuthentications() {
    loading.value = true
    const data: any = await getAPI.GET_Authentications()
    if (data) {
        authentications.value = data
        for (let i = 0; i < data.length; i++) {
            activeSwitchesLoading[data[i].id] = false
        }
    }
    loading.value = false
}

async function activeSwitchChange(id: number, oldValue: boolean) {
    const userUpdate = {auth_active: !oldValue}
    activeSwitchesLoading[id] = true
    const data = await putAPI.UpdateAuthentication(id, userUpdate)
    if (data) {
        const index = authentications.value.findIndex((a: any) => a.id == id)
        if (index != -1) {
            authentications.value[index] = data
        }
    }
    activeSwitchesLoading[id] = false
}

watch(
  () => Bus.GetReloadSelectedView,
  () => {
    getAuthentications()
  }
)
</script>
<style scoped>
    .full-height {
        height: 100%;
    }
</style>