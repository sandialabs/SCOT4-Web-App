<template>
    <v-card :title="title">
        <v-card-text v-if="showText">
            <p v-if="type == 'RoleDelete' && selectedItem.auth_methods && selectedItem.auth_methods.length > 0">
                This role is managed by authentication method
                <b>{{ selectedItem.auth_methods[0].auth_properties.provider_name }}</b>
                ({{ selectedItem.auth_methods[0].auth }}).
                If it was not deleted in the underlying authentication method, it might be recreated under
                the same name without any of its previous permissions applied.
            </p>
            <p v-if="type == 'RoleDelete'">
                Are you sure you want to delete role <i>{{ selectedItem.name }}</i>?
                <b>This action cannot be undone.</b>
            </p>
            <p v-else-if="type == 'UserDelete'">
                Are you sure you want to delete user <i>{{ selectedItem.username }}</i>?
            </p>
            <p v-else-if="type == 'StorageDelete'">
                Are you sure you want to delete storage provider {{ selectedItem.id }}?
            </p>
            <p v-else-if="type == 'AuthenticationDelete'">
                Are you sure you want to delete authentication method {{ selectedItem.id }}?
            </p>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn color="red" :loading="deleteLoading" @click="confirmedDelete" text="Delete"/>
            <v-btn @click="Dialog.ToggleDialog()" text="Cancel"/>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useDialogStore, useDELETE_APIStore } from '@/stores';

const Dialog = useDialogStore()
const deleteAPI = useDELETE_APIStore()
const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshSelectedView'])
const type = ref("")
const selectedItem: any = reactive({})
const deleteLoading = ref(false)
const title = ref("")
const showText = ref(false)

onMounted(() => {
    if (incomingProps.params.user) {
        Object.assign(selectedItem, incomingProps.params.user)
        type.value = "UserDelete"
        title.value = "Delete User"
        showText.value = true
    }
    else if (incomingProps.params.role) {
        Object.assign(selectedItem, incomingProps.params.role)
        type.value = "RoleDelete"
        title.value = "Delete Role"
        showText.value = true
    }
    else if (incomingProps.params.storage) {
        Object.assign(selectedItem, incomingProps.params.storage)
        type.value = "StorageDelete"
        title.value = "Delete Storage Provider"
        showText.value = true
    }
    else if (incomingProps.params.authentication) {
        Object.assign(selectedItem, incomingProps.params.authentication)
        type.value = "AuthenticationDelete"
        title.value = "Delete Authentication Method"
        showText.value = true
    }
    else {
        showText.value = false
    }
})


async function confirmedDelete() {
    deleteLoading.value = true
    let success = false
    if (type.value == "RoleDelete") {
        success = await deleteAPI.DELETE_Role(selectedItem.id)
    }
    else if (type.value == "UserDelete") {
        success = await deleteAPI.DELETE_User(selectedItem.id)
    }
    else if (type.value == "StorageDelete") {
        success = await deleteAPI.DELETE_Storage(selectedItem.id)
    }
    else if (type.value == "AuthenticationDelete") {
        success = await deleteAPI.DELETE_Authentication(selectedItem.id)
    }

    if (success) {
        emit('RefreshSelectedView', true)
        deleteLoading.value = false
        Dialog.ToggleDialog()
    }
}

</script>