<template>
    <v-card title="Create New Entity">
        <v-card-text>
                <div style="color: red" v-if="warning">
                    Please select entity type
                </div>
                <v-text-field v-model="entityText">
                </v-text-field>
                <v-combobox v-model="selectedEntityType"
                            :items="autoCompleteEntityTypes"
                            label="Entity Type"
                            variant="outlined"
                            density="compact"></v-combobox>
                <v-checkbox v-model="createEntityRegex"
                            label="Create entity regex for future flairing"></v-checkbox>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn color="success" @click="createNewEntity" text="Save" :loading="createEntityLoading"/>
            <v-btn @click="Dialog.ToggleDialog()" text="Cancel"/>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useGET_APIStore, usePOST_APIStore, useDialogStore } from '@/stores';
import type { Tag, Source } from '@/types/irelement';
import { IRElementAPIPaths, IRElementType } from '@/types/irelement';


const Dialog = useDialogStore()
const getAPI = useGET_APIStore()
const postAPI = usePOST_APIStore()
const incomingProps = defineProps(['params'])
const entityText = ref('')
const createEntityLoading = ref(false)
const createEntityRegex = ref(true)
const warning = ref(false)
const selectedEntityType = ref(null)
const autoCompleteEntityTypes = ref([])

onMounted(async () => {
    entityText.value = incomingProps.params.entityValue
    if (autoCompleteEntityTypes.value.length == 0) {
        const resp = await getAPI.GET_EntityTypes()
        if (resp) {
            autoCompleteEntityTypes.value = resp.result.map((item: any) => item.name)
        }
    }
})

async function createNewEntity() {
    if (selectedEntityType.value == null) {
        warning.value = true
    }
    else {
        createEntityLoading.value = true
        const newEntity = {
            entity: {
                value: entityText.value,
                type_name: selectedEntityType.value
            },
            create_flair_regex: createEntityRegex.value
        }
        const resp = postAPI.POST_CreateIRElement(IRElementAPIPaths[IRElementType.Entity], newEntity)
        if (resp) {
            await reflairEntry()
            Dialog.ToggleDialog()
        }
        createEntityLoading.value = false
    }
}

async function reflairEntry() {
    return await getAPI.GET_ReflairElementById(IRElementAPIPaths[IRElementType.Entry], incomingProps.params.entryId)
}
</script>