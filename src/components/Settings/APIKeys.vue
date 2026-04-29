<template>
    <v-card v-if="!isLoading" elevation="0" title="API Keys">
        <v-card-text>
            <v-btn color="success" rounded="lg" elevation="1" variant="outlined" @click="CreateApiKey()">
                <FontAwesomeIcon :icon="faPlus" />&nbsp; Create API Key
            </v-btn>
            <v-data-table
                :headers="api_headers"
                :loading="loadingKeys"
                :items="userApiKeys"
                density="compact"
            >
                <template v-slot:item.key="{item}">
                    <span @click="CopyKey(item.key)">{{ item.key }}</span>
                </template>
                <template v-slot:item.active="{item}">
                    <v-switch inset color="success" @change="UpdateAPIkey(item.key, { active: item.active })" v-model="item.active" />
                </template>
                <template v-slot:item.delete="{item}">
                    <v-btn variant="outlined" rounded="lg" elevation="1" class="mb-5" @click="DeleteAPIKey(item.key)" color="red">
                        <FontAwesomeIcon :icon="faTrashCan" />
                    </v-btn>
                </template>
                <template v-slot:item.roles="{item}">
                    <v-select chips closable-chips multiple :items="userData.roles" item-title="name"
                        item-value="name" v-model="item.roles" variant="outlined" density="compact"
                        @update:modelValue="UpdateAPIkey(item.key, { roles: item.roles })"
                        v-tooltip:bottom="'The API key\'s access will be limited to ONLY these roles. Having no roles on an API key is equivalent to that key having all roles the user has.'"
                    />
                </template>
            </v-data-table>
        </v-card-text>
    </v-card>
    <LoadingCard v-else />
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import LoadingCard from '../Loaders/LoadingCard.vue';
import { useAuthStore, useGET_APIStore, usePUT_APIStore, useSnackBarStore, usePOST_APIStore, useDELETE_APIStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons'

const userData: any = ref([])
const isLoading = ref(true)
const loadingKeys = ref(false)
const userApiKeys = ref([])

const Auth = useAuthStore()
const API_GET = useGET_APIStore()
const API_PUT = usePUT_APIStore()
const API_POST = usePOST_APIStore()
const API_DELETE = useDELETE_APIStore()
const SnackBar = useSnackBarStore()

const api_headers = [
    {title: "Key", key: "key"},
    {title: "Active", key: "active"},
    {title: "Delete", key: "delete"},
    {title: "Roles", key: "roles"},
]

onMounted(() => {
    userData.value = Auth.GetUser
    GetAPIKeys()
    isLoading.value = false
})

async function GetAPIKeys() {
    loadingKeys.value = true
    userApiKeys.value = []
    await API_GET.GET_APIKeys()
        .then((v: any) => {
            userApiKeys.value = v.result
        })
    loadingKeys.value = false
}

async function UpdateAPIkey(key: string, updateData: any) {
    loadingKeys.value = true
    await API_PUT.UpdateElementById('/apikey', key, updateData)
        .then((v: any) => {
            const index = userApiKeys.value.findIndex((a: any) => a.key == v.key)
            userApiKeys.value[index] = v
        })
    loadingKeys.value = false
}

function CopyKey(key: string) {
    navigator.clipboard.writeText(key);
    SnackBar.ToggleSnackbar("Key copied to clipboard!")
}

async function CreateApiKey() {
    loadingKeys.value = true
    await API_POST.POST_NewAPIKey()
        .then(() => {
            GetAPIKeys()
        })
}

async function DeleteAPIKey(key: string) {
    if (confirm("Are you sure you want to delete API key " + key + "?")) {
        loadingKeys.value = true
        await API_DELETE.DeleteElementById('apikey', key)
            .then(() => {
                GetAPIKeys()
            })
    }
}
</script>
