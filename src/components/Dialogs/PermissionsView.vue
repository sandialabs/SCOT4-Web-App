<template>
    <v-card v-if="!isLoading" :title="`Permissions for ${textPipe.IRElementTitle(incomingProps.params.targetType)} ${incomingProps.params.targetId}`">
        <v-card-text>
            <v-autocomplete chips multiple closeable-chips small-chips :items="rolesData" item-title="name" label="Read"
                v-model="permissionsData.read" return-object closable-chips
                hint="Users with at least one of these roles will be able to view the object and its sub-objects (like entries). Sub-objects may have more restrictive permissions."
                :persistent-hint="isShowingHelp">
            </v-autocomplete>
            <v-autocomplete chips multiple closeable-chips small-chips :items="rolesData" label="Modify"
                v-model="permissionsData.modify" item-title="name" return-object closable-chips
                hint="Users with at least one of these roles will be able to modify this object's metadata, as well as create new sub-objects (like entries) in it"
                :persistent-hint="isShowingHelp">
            </v-autocomplete>
            <v-autocomplete chips multiple closeable-chips small-chips :items="rolesData" item-title="name" return-object closable-chips
                label="Delete" v-model="permissionsData.delete"
                hint="Users with at least one of these roles will be able to delete this object"
                :persistent-hint="isShowingHelp">
            </v-autocomplete>
            <v-checkbox v-if="entryIds.length > 0" label="Propagate to Entries" v-model="propagateEntriesCheckbox"
                hint="Check to copy these permission changes to this object's entries, this will overwrite any individual permissions on the entries. This is likely necessary if you are making access more permissive."
                :persistent-hint="isShowingHelp"></v-checkbox>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn @click="SavePermissions()" color="success" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faSave" />&nbsp;Save
            </v-btn>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" />&nbsp;Close
            </v-btn>
            <v-btn @click="isShowingHelp = !isShowingHelp" color="secondary" rounded="lg" elevation="1" variant="outlined">
                <span v-if="!isShowingHelp">
                    <FontAwesomeIcon :icon="faInfo" />&nbsp;Show Help
                </span>
                <span v-if="isShowingHelp">
                    <FontAwesomeIcon :icon="faTimes" />&nbsp;Hide Help
                </span>
            </v-btn>
        </v-card-actions>
    </v-card>
    <LoadingCard v-else />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGET_APIStore, usePOST_APIStore } from '../../stores'
import LoadingCard from './../Loaders/LoadingCard.vue'
import { useDialogStore } from '../../stores/dialog'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave, faInfo } from '@fortawesome/free-solid-svg-icons'
import { IRElementAPIPathsNoSlash, IRElementType } from '@/types/irelement'
import {useTextPipe} from  "@/pipes"

const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const Dialog = useDialogStore()
const textPipe = useTextPipe()

const isLoading = ref(true)
const isShowingHelp = ref(false)
const permissionsData: any = ref({})
const rolesData = ref([])
const entryIds = ref([] as number[])
const propagateEntriesCheckbox = ref(false)
const incomingProps = defineProps(['params'])

onMounted(async () => {
    entryIds.value = incomingProps.params.entryIds ? incomingProps.params.entryIds : []
    await API_GET.GET_PermissionsRoles(IRElementAPIPathsNoSlash[incomingProps.params.targetType], incomingProps.params.targetId)
        .then((v) => {
            permissionsData.value = v
            GetRoles()
        })
})

async function GetRoles() {
    await API_GET.GET_Roles()
        .then((v) => {
            rolesData.value = v.result
            isLoading.value = false
        })
}

async function SavePermissions() {
    const permissionSet = {
        read: permissionsData.value.read.length > 0 ? permissionsData.value.read.map((a: any) => a.id) : null,
        modify: permissionsData.value.modify.length > 0 ? permissionsData.value.modify.map((a: any) => a.id) : null,
        delete: permissionsData.value.delete.length > 0 ? permissionsData.value.delete.map((a: any) => a.id) : null
    }

    await API_POST.POST_SetPermission(IRElementAPIPathsNoSlash[incomingProps.params.targetType], incomingProps.params.targetId, permissionSet).then(async () => {
        if (propagateEntriesCheckbox.value) {
            for(let i = 0; i < entryIds.value.length; i++) {
                await API_POST.POST_SetPermission(IRElementAPIPathsNoSlash[IRElementType.Entry], entryIds.value[i], permissionSet)
            }
        }
        Dialog.ToggleDialog()
    })
}
</script>