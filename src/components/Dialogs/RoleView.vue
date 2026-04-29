<template>
    <v-card>
        <v-card-title v-if="type == 'RoleEdit'">Edit Role</v-card-title>
        <v-card-title v-if="type == 'RoleNew'">New Role</v-card-title>
        <v-card-text>
            <v-form v-model="formValid" validate-on="input">
                <v-container>
                    <v-text-field v-model="selectedRole.id" v-if="type == 'RoleEdit'" readonly label="ID"/>
                    <v-text-field v-model="selectedRole.name" :readonly="type == 'RoleEdit' && selectedRole.auth_methods?.length > 0" :rules="[notEmptyIfNew]" label="Role Name"/>
                    <v-text-field v-model="selectedRole.description" label="Description"/>
                    <v-checkbox v-model="roleIsAdmin" :disabled="!auth.GetUser.is_superuser" label="Admin Role"/>
                </v-container>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn @click="submit" color="green" :loading="submitLoading" :text="type == 'RoleEdit' ? 'Save Changes' : 'Create'"/>
            <v-btn @click="Dialog.ToggleDialog()">Cancel</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useGET_APIStore, usePUT_APIStore, usePOST_APIStore, useDialogStore, useAuthStore } from '@/stores';
import { PermissionEnum } from '@/types/irelement';

const Dialog = useDialogStore()
const getAPI = useGET_APIStore()
const putAPI = usePUT_APIStore()
const postAPI = usePOST_APIStore()
const auth = useAuthStore()

const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshSelectedView'])
const type = ref("")
const selectedRole: any = reactive({})
const roles = ref([])
const formValid = ref(true)
const submitLoading = ref(false)
const roleIsAdmin = ref(false)
const adminRoleIds = ref([])

onMounted(async () => {
    if (incomingProps.params) {
        type.value = "RoleEdit"
        Object.assign(selectedRole, incomingProps.params.role)
    }
    else {
        type.value = "RoleNew"
        Object.assign(selectedRole, {})
    }

    const data = await getAPI.GET_PermissionsRoles("admin", 0)
    if (data && data.admin) {
        adminRoleIds.value = data.admin.map((a: any) => a.id)
    }

    if (selectedRole && adminRoleIds.value.includes(selectedRole.id)) {
        roleIsAdmin.value = true
    }
    else {
        roleIsAdmin.value = false
    }
})

function notEmptyIfNew(newVal: string) {
    if (type.value == "RoleNew" && !newVal) {
        return 'Must not be empty'
    }
    return true
}

async function submit() {
    if (formValid.value) {
        if (type.value == "RoleEdit") {
            submitLoading.value = true
            const updateData = {
                'name': selectedRole.name,
                'description': selectedRole.description
            }
            const succeeded = await putAPI.UpdateRole(selectedRole.id, updateData)
            submitLoading.value = false
            if (succeeded) {
                // Need to grant admin role
                if (roleIsAdmin.value && !adminRoleIds.value.includes(selectedRole.id)) {
                    await postAPI.POST_GrantPermission(selectedRole.id, "admin", 0, PermissionEnum.admin)
                }
                // Need to revoke admin role
                else if (!roleIsAdmin.value && adminRoleIds.value.includes(selectedRole.id)) {
                    await postAPI.POST_RevokePermission(selectedRole.id, "admin", 0, PermissionEnum.admin)
                }
                emit('RefreshSelectedView', true)
                Dialog.ToggleDialog()
            }
        }
        else if (type.value == "RoleNew") {
            submitLoading.value = true
            const succeeded = await postAPI.POST_CreateRole(selectedRole)
            submitLoading.value = false
            if (succeeded) {
                if (roleIsAdmin.value) {
                    await postAPI.POST_GrantPermission(succeeded.id, "admin", 0, PermissionEnum.admin)
                }
                emit('RefreshSelectedView', true)
                Dialog.ToggleDialog()
            }
        }
    }
}
</script>
