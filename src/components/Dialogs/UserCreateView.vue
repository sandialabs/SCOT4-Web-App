<template>
    <v-card :title="type == 'UserEdit' ? 'Edit User' : 'New User'">
        <v-card-text>
            <v-form v-model="formValid" validate-on="input">
                <v-dialog max-width="600px" v-model="warningDialog" @click:outside="warningDialog = false, roleWarningItem = null, dontWarnAgain = false">
                    <v-card title="Warning">
                        <v-card-text>
                            This role is managed by authentication method 
                            <b>{{ roleWarningItem.auth_methods[0].auth_properties.provider_name }}</b>
                            ({{ roleWarningItem.auth_methods[0].auth }}).
                            If this role was not {{ roleBeingRemoved ? 'removed from' : 'added to' }} the user 
                            in the underlying authentication scheme, it will be 
                            {{ roleBeingRemoved ? 'added to' : 'removed from' }} them next time they log in. 
                            Still {{ roleBeingRemoved ? 'remove' : 'add' }} it?
                        </v-card-text>
                        <v-card-actions>
                            <v-row>
                                <v-col>
                                    <v-btn v-if="roleBeingRemoved" @click="removeRole(roleWarningItem, true)" text="Remove Anyway"/> 
                                    <v-btn v-else @click="addRole(roleWarningItem, true)" text="Add Anyway"/>
                                </v-col>
                                <v-col>
                                    <v-btn @click="warningDialog = false, roleWarningItem = null, dontWarnAgain = false" text="Cancel"/>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-checkbox v-model="dontWarnAgain" label="Don't ask me again"/>
                            </v-row>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-container>
                    <v-row>
                        <v-col v-if="type == 'UserEdit'">
                            <v-text-field v-model="selectedUser.id" readonly label="ID"/>
                        </v-col>
                        <v-col>
                            <v-text-field v-model="selectedUser.username" :readonly="type == 'UserEdit'" :rules="[notEmptyIfNew]" label="Username"/>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-text-field v-model="selectedUser.fullname" label="Full Name"/>
                    </v-row>
                    <v-row>
                        <v-text-field v-model="selectedUser.email" label="Email"/>
                    </v-row>
                    <v-row>
                        <v-text-field v-model="password" label="New Password" type="password"/>
                    </v-row>
                    <v-row>
                        <v-text-field v-model="confirmPassword" label="Confirm Password" type="password" :rules="[passwordsMustMatch]"/>
                    </v-row>
                    <v-row>
                        <v-autocomplete chips multiple clear closable-chips :items="roles" item-text="name" item-value="id" label="Roles" v-model="selectedUserRoles">
                            <template v-slot:chip="{props, item}">
                                <v-chip v-bind="props" closable :text="item.raw.name" :color="item.raw.auth_methods.length > 0 ? 'red' : undefined" @click:close="removeRole(item.raw)"/>
                            </template>
                            <template v-slot:item="{props, item}">
                                <v-list-item v-bind="props" :title="item.raw.name" :color="item.raw.auth_methods.length > 0 ? 'red' : undefined"/>
                            </template>
                        </v-autocomplete>
                    </v-row>
                </v-container>
            </v-form>
            <v-card-actions>
                <v-spacer/>
                <v-btn @click="submit" color="green" :loading="submitLoading" :text="type == 'UserEdit' ? 'Save Changes' : 'Create'"/>
                <v-btn @click="cancel" text="Cancel"/>
                <v-btn v-if="type == 'UserEdit'" @click="resetAttempts" :loading="resetAttemptsLoading" text="Reset Password Attempts">
                    <template v-slot:loader v-if="resetAttemptsComplete">
                        <span class="custom-loader">
                            <FontAwesomeIcon :icon="faCheck"/>
                        </span>
                    </template>
                </v-btn>
            </v-card-actions>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { onMounted, ref, reactive } from 'vue';
import { useGET_APIStore, usePUT_APIStore, usePOST_APIStore, useDialogStore, useSnackBarStore } from '@/stores';

const Dialog = useDialogStore()
const getAPI = useGET_APIStore()
const putAPI = usePUT_APIStore()
const postAPI = usePOST_APIStore()
const snackBar = useSnackBarStore()
const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshSelectedView'])
const type = ref("")
const formValid = ref(true)
const selectedUser = reactive({} as any)
const password = ref("")
const confirmPassword = ref("")
const selectedUserRoles = ref([] as number[])
const dontWarnAgain = ref(false)
const roleBeingRemoved = ref(true)
const warningDialog = ref(false)
const roleWarningItem = ref()
const submitLoading = ref(false)
const resetAttemptsLoading = ref(false)
const resetAttemptsComplete = ref(false)
const roles = ref([] as any[])

onMounted(async () => {
    if (incomingProps.params) {
        Object.assign(selectedUser, incomingProps.params.user)
        type.value = "UserEdit"
    }
    else {
        Object.assign(selectedUser, {})
        type.value = "UserNew"
    }

    const data = await getAPI.GET_Roles()
    selectedUserRoles.value = selectedUser.roles
    if (data) {
        roles.value = data.result
    }
})

function notEmptyIfNew() {
    if (type.value == 'UserNew' && !selectedUser.username) {
        return "Must not be empty"
    }
    return true
}

function passwordsMustMatch() {
    if (password.value != confirmPassword.value) {
        return "Passwords must match"
    }
    return true
}

function addRole(roleToAdd: any, noWarning: boolean = false) {
    if (roleToAdd.auth_methods.length > 0 && !noWarning && !dontWarnAgain.value) {
        roleWarningItem.value = roleToAdd
        roleBeingRemoved.value = false
        warningDialog.value = true
    }
    else {
        selectedUserRoles.value.push(roleToAdd.id)
        roleWarningItem.value = {}
        warningDialog.value = false
    }
}

function removeRole(roleToRemove: any, noWarning: boolean = false) {
    if (roleToRemove.auth_methods.length > 0 && !noWarning && dontWarnAgain) {
        roleWarningItem.value = roleToRemove
        roleBeingRemoved.value = true
        warningDialog.value = true
    }
    else {
        selectedUserRoles.value = selectedUserRoles.value.filter((id: number) => id != roleToRemove.id)
        roleWarningItem.value = {}
        warningDialog.value = false
    }
}

async function submit() {
    if (formValid.value) {
        submitLoading.value = true
        let succeeded = false
        if (type.value == "UserEdit") {
            const updateData = {
                "fullname": selectedUser.fullname,
                "email": selectedUser.email,
                "password": password.value || null
            }
            succeeded = await putAPI.UpdateUser(selectedUser.id, updateData)
        }
        else if (type.value == "UserNew") {
            succeeded = await postAPI.POST_CreateUser(selectedUser)
        }
        submitLoading.value = false
        if (succeeded) {
            if (selectedUser.roles) {
                const currentRoleIds = selectedUser.roles.map((a: any) => a.id)
                const newRoles = selectedUserRoles.value.filter((id: number) => !currentRoleIds.includes(id))
                const removedRoles = currentRoleIds.filter((id: number) => !selectedUserRoles.value.includes(id))
                //assign all roles
                await Promise.all(newRoles.map(async (role_id: number) => {
                    succeeded = succeeded && await postAPI.POST_AssignRole(selectedUser.username, role_id)
                }))
                //remove all roles
                await Promise.all(removedRoles.map(async (role_id: number) => {
                    succeeded = succeeded && await postAPI.POST_RemoveRole(selectedUser.username, role_id)
                }))
            }
            if (succeeded) {
                emit('RefreshSelectedView', true)
                Dialog.ToggleDialog()
            }
            else {
                snackBar.ToggleSnackbar("Error while assigning/removing roles, make sure roles are correct")
            }
        }

    }
}

function cancel() {
    confirmPassword.value = ""
    password.value = ""
    Dialog.ToggleDialog()
}

async function resetAttempts() {
    resetAttemptsLoading.value = true
    const success = await postAPI.POST_ResetPasswordAttempts(selectedUser.username)
    if (success) {
        resetAttemptsComplete.value = true
        await new Promise(r => setTimeout(r, 2000)) // Wait 2 seconds
        resetAttemptsLoading.value = false
        resetAttemptsComplete.value = false
    }
    resetAttemptsLoading.value = false
}
</script>