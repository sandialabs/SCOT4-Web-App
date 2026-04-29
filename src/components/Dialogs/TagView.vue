<template>
    <v-card @keyup.shift.enter="AddTags()">
        <v-card-text>
            <v-combobox :loading="loading" id="tag-search-box" v-model="tagsSelected" autofocus auto-select-first :items="tagsOptions" hide-details label="Search for an option or make new" variant="outlined" hide-selected multiple autoComplete="off" @update:search="SearchTags" :delimiters="[' ']">
                <template v-slot:selection="{ item, index }">
                    <v-chip v-if="item === Object(item)" :text="item.value" size="small" variant="flat" closable label
                        @click:close="RemoveTag(index)"/>
                </template>
                <template v-slot:item="{item, props}">
                    <v-list-item v-bind="props" v-tooltip:bottom="item.raw.description"/>
                </template>
            </v-combobox>
        </v-card-text>
        <v-card-actions>
            <v-tooltip interactive location="left">
                <template v-slot:activator="{ props: activatorProps }">
                    <v-icon icon="mdi-information-outline" v-bind="activatorProps"/>
                </template>
                <p class="text-caption">
                    Hotkeys
                </p>
                <v-divider/>
                <p class="text-caption">
                    ESC: Close
                </p>
                <p class="text-caption">
                    Shift+Enter: Submit
                </p>
                <p class="text-caption">
                    Tab: Select first entry and stop selecting
                </p>
                <p class="text-caption">
                    Enter: Select first entry and continue selecting
                </p>
                <p class="text-caption">
                    Space: Create new from text
                </p>
            </v-tooltip>
            <v-spacer/>
            <v-btn @click="AddTags()" color="success" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faSave" />&nbsp;Save
            </v-btn>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" />&nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGET_APIStore, usePOST_APIStore, useDialogStore, } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons'
import { NewTag } from '@/models';
import type { Tag } from '@/types/irelement';
import { useTextPipe } from '@/pipes';
import {IRElementTypeSingular} from '@/types/irelement';

const Dialog = useDialogStore()
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const textPipe = useTextPipe()

const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshQueueView', 'RefreshSelectedView'])
const loading = ref(false)
const tagsSelected = ref([])
const tagsOptions = ref([])
const existingIds = ref([])

onMounted(() => {
    if (incomingProps.params.existing) {
        existingIds.value = incomingProps.params.existing.map((a: Tag) => a.id)
    }
    else if (incomingProps.params.selectedItem?.tags) {
        existingIds.value = incomingProps.params.selectedItem?.tags.map((a: Tag) => a.id)
    }
    SearchTags()
})

async function SearchTags(v: any = null) {
    loading.value = true
    await API_GET.GET_SearchTags(v, null, 25, "-link_count")
        .then((v) => {
            tagsOptions.value = v.result.map((tag: any) => {
                return {title: `${tag.name} (${tag.link_count})`, value: tag.name, description: tag.description, id: tag.id}
            })
        }).finally(() => {
            loading.value = false
        })
}

async function AddTags() {
    const target_type = IRElementTypeSingular[incomingProps.params.targetType]
    tagsSelected.value.forEach(async (tag: any) => {
        let tagData: any = null
        if (typeof tag == 'string') {
            tagData = new NewTag(parseInt(incomingProps.params.targetId), target_type, tag, "")
        } else {
            //filter out any ids that already exist
            if (!existingIds.value.includes(tag.id)) {
                tagData = new NewTag(parseInt(incomingProps.params.targetId), target_type, tag.value, tag.description)   
            }
        }
        if (tagData) {
            await API_POST.POST_AddTag(tagData)
                .then((newTag: Tag) => {
                    if (incomingProps.params.existing) {
                        incomingProps.params.existing.push(newTag)
                    }
                    if (incomingProps.params.selectedItem?.tags) {
                        incomingProps.params.selectedItem.tags.push(newTag)
                    }
                })
        }
    });
    Dialog.ToggleDialog()
}

function RemoveTag(index: number) {
    tagsSelected.value.splice(index, 1)
}
</script>