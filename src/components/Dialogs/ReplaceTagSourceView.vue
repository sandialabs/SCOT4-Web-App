<template>
    <v-card @keyup.shift.enter="replaceItem">
        <v-card-text>
            <v-combobox
                :loading="loading"
                v-model="selected"
                autofocus
                auto-select-first
                :items="items"
                label="Search"
                variant="outlined"
                autocomplete="off"
                @update:search="SearchTerm"
                :error-messages="errors"
        >
            <template v-slot:selection="{ item }">
                <v-chip v-if="item === Object(item)" :text="item.value" size="small" variant="flat" closable label @click:close="RemoveItem()"/>
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
            <v-btn @click="replaceItem()" color="success" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faSave" />&nbsp;Replace
            </v-btn>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" />&nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons'
import { useGET_APIStore, usePOST_APIStore, useDialogStore } from '@/stores';
import type { Tag, Source } from '@/types/irelement';

const Dialog = useDialogStore()
const getAPI = useGET_APIStore()
const postAPI = usePOST_APIStore()
const incomingProps = defineProps(["params"])
const emit = defineEmits(["RefreshSelectedView"])
const type = ref("")
const id = ref(0)
const selected = ref<Tag | Source | string>()
const items = ref([] as Tag[] | [] as Source[])
const loading = ref(false)
const errors = ref("")

onMounted(async () => {
    type.value = incomingProps.params.type
    id.value = incomingProps.params.id
    await SearchTerm(null)
})

function RemoveItem() {
    selected.value = undefined
}

async function SearchTerm(term: string | null) {
    loading.value = true
    let data = null
    if (type.value == "tags") {
        data = await getAPI.GET_SearchTags(term, null, 25, "-link_count")
    }
    else {
        data = await getAPI.GET_IRElementSources(25, term, "-link_count")
    }
    items.value = data.result.map((item: any) => {
        return {title: `${item.name} (${item.link_count})`, value: item.name, description: item.description, id: item.id}
    })
    loading.value = false
}

async function replaceItem() {
    if ((selected.value as Tag | Source).id == id.value) {
        errors.value = `Duplicate ${type.value} please select a different one`
    }
    else if (selected.value) {
        errors.value = ""
        if (type.value == "tags") {
            postAPI.POST_ReplaceTag(id.value, (selected.value as Tag | Source).id)
        }
        else {
            postAPI.POST_ReplaceSource(id.value, (selected.value as Tag | Source).id)
        }
        emit('RefreshSelectedView', true)
        Dialog.ToggleDialog()
    }
}
</script>