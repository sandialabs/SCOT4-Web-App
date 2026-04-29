<template>
    <v-card :title="remove ? 'Remove Class and/or Tag' : 'Add Class and/or Tag' ">
        <v-card-text>
            <p class="text-subtitle-1">Class</p>
            <v-combobox
                v-model="selectedClass"
                :items="classes.map(type => type.name)"
                label="Select Class"
                required
                clearable
            />
            <v-divider/>
            <p class="text-subtitle-1">Tag</p>
            <v-combobox
                v-model="selectedTag"
                :items="tags.map(type => type.name)"
                label="Select Class"
                required
                clearable
                :loading="tagLoading"
                @update:search="tagSearch"
            />
            <v-divider/>
            <v-textarea label="Add Comments" variant="outlined" v-model="comments"/>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn color="success" @click="submitClassifyForm" text="Save" :loading="saveLoading"/>
            <v-btn @click="Dialog.ToggleDialog()" text="Cancel"/>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useGET_APIStore, usePOST_APIStore, useDialogStore, useSnackBarStore, useAuthStore } from '@/stores';
import { EntryClassEnum } from '@/types/irelement';
const Dialog = useDialogStore()
const getAPI = useGET_APIStore()
const postAPI = usePOST_APIStore()
const snackbar = useSnackBarStore()
const auth = useAuthStore()

const incomingProps = defineProps(["params"])
const remove = ref(false)
const ids = ref([] as number[])
const classes = ref([] as any[])
const tags = ref([] as any[])

const saveLoading = ref(false)
const tagLoading = ref(false)
const selectedClass = ref("")
const selectedTag = ref("")
const comments = ref("")

onMounted(async () => {
    ids.value = incomingProps.params.ids
    remove.value = incomingProps.params.remove

    if (remove.value) {
        classes.value = incomingProps.params.classes.map((a: any) => ({
            id: a.id,
            name: a.display_name
        }))
        
        tags.value = incomingProps.params.tags.map((a: any) => ({
            id: a.id,
            name: a.name
        }))
    }
    else {
        const data = await getAPI.GET_EntityClasses()
        classes.value = data.result.map((a: any) => ({
            id: a.id,
            name: a.display_name
        }))
        await tagSearch(null)
    }
})

async function submitClassifyForm() {
    if (ids.value.length === 0) {
        snackbar.ToggleSnackbar("Please select at least one entity")
        return
    }
    if (!selectedClass.value && !selectedTag.value) {
        snackbar.ToggleSnackbar("Please select at least one class or tag")
        return
    }

    let classType = null
    if (selectedClass.value) {
        classType = classes.value.find(a => a.name === selectedClass.value)
        if (!classType) {
            snackbar.ToggleSnackbar("Selected class not found")
            return
        }
    }

    let tagType = null
    if (selectedTag.value) {
        tagType = tags.value.find(a => a.name == selectedTag.value)
        if (!tagType) {
            snackbar.ToggleSnackbar("Selected tag not found")
            return
        }
    }

    saveLoading.value = true
    for (let i = 0; i < ids.value.length; i++) {
        if (remove.value) {
            if (classType) {
                await postAPI.POST_RemoveEntityClass(ids.value[i], [classType.id])
            }
            if (tagType) {
                await postAPI.POST_RemoveEntityTag(ids.value[i], tagType.id)
            }
        }
        else {
            if (classType) {
                await postAPI.POST_AddEntityClass(ids.value[i], [classType.id])
            }
            if (tagType) {
                await postAPI.POST_AddEntityTag(ids.value[i], tagType.id)
            }
        }

        if (comments.value != "") {
            await postAPI.POST_AddEntry({
                entry: {
                    owner: auth.GetUser.username,
                    target_type: "entity",
                    target_id: ids.value[i],
                    entry_class: EntryClassEnum.entry,
                    entry_data: {"html": `<p>${comments.value}</p>`}
                }
            })
        }
    }
    saveLoading.value = false
    Dialog.ToggleDialog()
}

async function tagSearch(search: string) {
    tagLoading.value = true
    let id: string | null = null
    if (remove.value && tags.value.length > 0) {
        //force the search to only include ids
        id = `[${tags.value.map((a: any) => a.id).join()}]`
    }
    const data = await getAPI.GET_SearchTags(search, id, 10)
    tags.value = data.result.map((a: any) => ({
        id: a.id,
        name: a.name
    }))
    tags.value.filter(a => a.name) // filter out null or empty names
    tagLoading.value = false
}
</script>