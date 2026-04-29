<template>
    <v-card :title="type == 'StorageEdit' ? 'Edit Storage Provider' : 'New Storage Provider'">
        <v-card-text>
            <v-form v-model="formValid" validate-on="input">
                <v-container>
                    <v-row>
                        <v-col v-if="type == 'StorageEdit'">
                            <v-text-field v-model="selectedStorageProvider.id" readonly label="ID"/>
                        </v-col>
                        <v-col>
                            <v-select v-model="selectedStorageProvider.provider" :items="storageTypes" :readonly="type == 'StorageEdit'" label="Type" @update:model-value="defaultValues"/>
                        </v-col>
                    </v-row>
                    <span v-if="selectedStorageProvider.config">
                        <span v-for="property in Object.keys(selectedStorageProvider.config)" :key="property">
                            <v-checkbox
                                v-if="typeof selectedStorageProvider.config[property] === 'boolean'"
                                v-model="selectedStorageProvider.config[property]"
                                :label="storageProviderPrettyNames[selectedStorageProvider.provider][property] || property"
                                :hint="storageProviderConfigHelp[selectedStorageProvider.provider][property]"
                            />
                            <v-text-field
                                v-else
                                v-model="selectedStorageProvider.config[property]"
                                :label="storageProviderPrettyNames[selectedStorageProvider.provider][property] || property"
                                :hint="storageProviderConfigHelp[selectedStorageProvider.provider][property]"
                            />
                        </span>
                    </span>
                </v-container>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn @click="submit" color="green" :loading="submitLoading" :text="type == 'StorageEdit' ? 'Save Changes' : 'Create'"/>
            <v-btn @click="Dialog.ToggleDialog()" text="Cancel"/>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useGET_APIStore, usePUT_APIStore, useDialogStore, usePOST_APIStore } from '@/stores';
import { StorageProviderType  } from '@/types/irelement';

const Dialog = useDialogStore()
const getAPI = useGET_APIStore()
const putAPI = usePUT_APIStore()
const postAPI = usePOST_APIStore()
const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshSelectedView'])
const type = ref("")
const formValid = ref(true)
const selectedStorageProvider = reactive({} as any)
const submitLoading = ref(false)
const storageTypes = ref([])
const storageProviderConfigHelp = reactive({})
const storageProviderPrettyNames = reactive({})

onMounted(async () => {
    const data = await getAPI.GET_StorageHelp()
    if (data) {
        Object.assign(storageProviderConfigHelp, data.config_help)
        Object.assign(storageProviderPrettyNames, data.config_name_pretty)
    }

    const keys = Object.keys(StorageProviderType)
    const values = Object.values(StorageProviderType)
    for (let i = 0; i < keys.length; i++) {
        storageTypes.value.push({
            title: keys[i],
            value: values[i],
        })
    }

    if (incomingProps.params) {
        Object.assign(selectedStorageProvider, incomingProps.params.storage)
        defaultValues()
        Object.assign(selectedStorageProvider.config, incomingProps.params.storage.config)
        type.value = "StorageEdit"
    }
    else {
        Object.assign(selectedStorageProvider, {provider: "", config: {}})
        type.value = "StorageNew"
    }
})

async function submit() {
    if (formValid.value) {
        submitLoading.value = true
        let succeeded: any = false
        if (type.value == "StorageEdit") {
            succeeded = await putAPI.UpdateStorage(selectedStorageProvider.id, {config: selectedStorageProvider.config})  
        }
        else {
            succeeded = await postAPI.POST_CreateStorage(selectedStorageProvider)
        }
        submitLoading.value = false
        if (succeeded) {
            emit('RefreshSelectedView', true)
            Dialog.ToggleDialog()
        }
    }
}

function defaultValues() {
    selectedStorageProvider.config = {}
    const keys = Object.keys(storageProviderConfigHelp[selectedStorageProvider.provider])
    for (let i = 0; i < keys.length; i++) {
        selectedStorageProvider.config[keys[i]] = ""
    } 
}
</script>