<template>
    <v-card @keyup.enter="AddSources()">
        <v-card-text>
            <v-combobox :loading="loading" id="source-search-box" v-model="sourcesSelected" :items="sourcesOptions" hide-details autofocus auto-select-first
                label="Search for an option or make new" variant="outlined" hide-selected multiple autoComplete="off" @update:search="SearchSources" :delimiters="[' ']">
                <template v-slot:selection="{ item, index }">
                    <v-chip v-if="item === Object(item)" :text="item.value" size="small" variant="flat" closable label @click:close="RemoveSource(index)"/>
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
            <v-btn @click="AddSources()" color="success" rounded="lg" elevation="1" variant="outlined">
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
import { useGET_APIStore, usePOST_APIStore, useDialogStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons'
import { NewSource } from '@/models';
import type { Source } from '@/types/irelement';
import {IRElementTypeSingular} from '@/types/irelement';
import { useTextPipe } from '@/pipes';

const Dialog = useDialogStore()
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const textPipe = useTextPipe()

const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshQueueView', 'RefreshSelectedView'])
const loading = ref(false)
const sourcesSelected = ref([])
const sourcesOptions = ref([])
const existingIds = ref([])

onMounted(() => {
    if (incomingProps.params.existing) {
        existingIds.value = incomingProps.params.existing.map((a: Source) => a.id)
    }
    else if (incomingProps.params.selectedItem?.sources) {
        existingIds.value = incomingProps.params.selectedItem?.sources.map((a: Source) => a.id)
    }
    SearchSources()
})

async function SearchSources(v: string = null) {
    loading.value = true
    await API_GET.GET_IRElementSources(25, v, "-link_count")
        .then((v) => {
            sourcesOptions.value = v.result.map((source: any) => {
                return {title: `${source.name} (${source.link_count})`, value: source.name, description: source.description, id: source.id}
            })
        }).finally(() => {
            loading.value = false
        })
}

async function AddSources() {
    const target_type = IRElementTypeSingular[incomingProps.params.targetType]
    sourcesSelected.value.forEach(async (source: any) => {
        let sourceData: any = null
        if (typeof source == 'string') {
            sourceData = new NewSource(parseInt(incomingProps.params.targetId), target_type, source, "")
        } else {
            //filter out any ids that already exist
            if (!existingIds.value.includes(source.id)) {
                sourceData = new NewSource(parseInt(incomingProps.params.targetId), target_type, source.value, source.description)
            }
        }
        if (sourceData) {
            await API_POST.POST_AddSource(sourceData)
                .then((newSource: Source) => {
                    if (incomingProps.params.existing) {
                        incomingProps.params.existing.push(newSource)
                    }
                    else if (incomingProps.params.selectedItem?.sources) {
                        incomingProps.params.selectedItem.sources.push(newSource)
                    }
                })
        }
    });
    Dialog.ToggleDialog()
}

async function RemoveSource(index: number) {
    sourcesSelected.value.splice(index, 1)
}
</script>