<template>
<v-row justify="center" class="text-left full-height">
    <v-card flat width="50%" title="Users" class="full-height d-flex flex-column">
        <v-card-text class="d-flex flex-column pb-0" style="min-height: 0px">
            <div class="text-h6">
                Add User
                <v-btn small fab color="green" @click="Dialog.ToggleDialog('users_create')">
                    <FontAwesomeIcon :icon="faPlus"/>
                </v-btn>
            </div>
            <v-data-table-server
                density="compact"
                :headers="usersTableHeaders"
                :items="users"
                :items-length="totalUsers"
                :items-per-page="usersItemsPerPage"
                :loading="userTableLoading"
                @update:options="getUsers"
                fixed-header
                style="min-height: 0px"
            >
                <template v-slot:[`item.is_active`]={item}>
                    <v-switch density="compact" hide-details :loading="activeSwitchesLoading[item.id]" v-model="item.is_active" @click.prevent.stop.capture="activeSwitchChange(item.id, item.is_active)"/>
                </template>
                <template v-slot:[`item.edit_delete`]="{item}">
                    <v-btn icon density="comfortable" class="my-1" @click.stop="Dialog.ToggleDialog('users_create', {user: item})">
                        <FontAwesomeIcon :icon="faPencil"/>
                    </v-btn>
                    <v-btn icon density="comfortable" class="my-1" color="red" @click.stop="Dialog.ToggleDialog('confirm_delete', {user: item})">
                        <FontAwesomeIcon :icon="faTrash"/>
                    </v-btn>
                </template>
            </v-data-table-server>
        </v-card-text>
    </v-card>
    <v-card flat width="50%" title="Roles" class="full-height d-flex flex-column">
        <v-card-text class="d-flex flex-column pb-0" style="min-height: 0px">
            <div class="text-h6">
                Add Role
                <v-btn small fab color="green" @click="Dialog.ToggleDialog('role_create')">
                    <FontAwesomeIcon :icon="faPlus"/>
                </v-btn>
            </div>
            <v-data-table-server
                density="compact"
                :headers="roleTableHeaders"
                :items="roles"
                :items-length="totalRoles"
                :items-per-page="rolesItemsPerPage"
                :loading="roleTableLoading"
                @update:options="getRoles"
                fixed-header
                style="min-height: 0px"
            >
                <template v-slot:[`item.edit_delete`]="{item}">
                    <v-btn icon density="comfortable" class="my-1" @click.stop="Dialog.ToggleDialog('role_create', {role: item})">
                        <FontAwesomeIcon :icon="faPencil"/>
                    </v-btn>
                    <v-btn icon density="comfortable" class="my-1" color="red" @click.stop="Dialog.ToggleDialog('confirm_delete',  {role: item})">
                        <FontAwesomeIcon :icon="faTrash"/>
                    </v-btn>
                </template>
            </v-data-table-server>
        </v-card-text>
    </v-card>
</v-row>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlus, faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useDialogStore, useGET_APIStore, usePUT_APIStore, useBusStore } from '@/stores'
import { ref, reactive, watch } from 'vue'

const Dialog = useDialogStore()
const getAPI = useGET_APIStore()
const putAPI = usePUT_APIStore()
const Bus = useBusStore()
const userTableLoading = ref(false)
const totalUsers = ref(0)
const usersItemsPerPage = ref(25)
const activeSwitchesLoading: any = reactive({})
const users = ref([] as any[])
const userPage = ref(1)
const usersTableHeaders = [
    {title: "ID", key: "id"},
    {title: "Username", key: "username"},
    {title: "Full Name", key: "fullname"},
    {title: "Active", key: "is_active"},
    {title: "Edit/Delete", width: "150px", key: "edit_delete"}
]
const roleTableLoading = ref(false)
const totalRoles = ref(0)
const rolesItemsPerPage = ref(25)
const roles = ref([] as any[])
const rolePage = ref(1)
const roleTableHeaders = [
    {title: "ID", key: "id"},
    {title: "Name", key: "name"},
    {title: "Description", key: "description"},
    {title: "Edit/Delete", width: "150px", key: "edit_delete"}
]

async function getUsers(options: any) {
    userTableLoading.value = true
    userPage.value = options.page
    const data: any = await getAPI.GET_Users((options.page - 1) * options.itemsPerPage, options.itemsPerPage)
    if (data) {
        totalUsers.value = data.totalCount
        users.value = data.result
        for (let i = 0; i < data.result.length; i++) {
            activeSwitchesLoading[data.result[i].id] = false
        }
    }
    userTableLoading.value = false
}

async function getRoles(options: any) {
    roleTableLoading.value = true
    rolePage.value = options.page
    const data: any = await getAPI.GET_Roles((options.page - 1) * options.itemsPerPage, options.itemsPerPage)
    if (data) {
        totalRoles.value = data.totalCount
        roles.value = data.result
    }
    roleTableLoading.value = false
}

async function activeSwitchChange(id: number, oldValue: boolean) {
    const userUpdate = {is_active: !oldValue}
    activeSwitchesLoading[id] = true
    const data = await putAPI.UpdateUser(id, userUpdate)
    if (data) {
        const index = users.value.findIndex((a: any) => a.id == id)
        if (index != -1) {
            users.value[index] = data
        }
    }
    activeSwitchesLoading[id] = false
}

watch(
  () => Bus.GetReloadSelectedView,
  () => {
    getUsers({page: userPage.value, itemsPerPage: usersItemsPerPage.value})
    getRoles({page: rolePage.value, itemsPerPage: rolesItemsPerPage.value})
  }
)
</script>
<style scoped>
    .full-height {
        height: 100%;
    }
</style>