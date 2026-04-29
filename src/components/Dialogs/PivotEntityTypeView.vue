<template>
    <v-card @keyup.shift.enter="submitForm">
        <v-card-text>
            <v-combobox id="type-search-box" v-model="selectedEntityTypes" :items="entityTypes" :loading="isLoading" label="Entity Types" item-title="name" variant="outlined" hide-selected multiple autocomplete="off" autofocus auto-select-first>
                <template v-slot:selection="{ item, index }">
                    <v-chip v-if="(item.raw as any).name" closable size="small" :text="(item.raw as any).name" @click:close="Remove(index)"/>
                    <v-chip v-else closable size="small" :text="(item.raw as any)" @click:close="Remove(index)"/>
                </template>
                <template v-slot:item="{item, props}">
                    <v-list-item v-bind="props" :title="(item.raw as any).name"/>
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
            </v-tooltip>
            <v-spacer/>
            <v-btn @click="submitForm()" color="success" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faSave" />&nbsp;Save
            </v-btn>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" />&nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons'
import { useGET_APIStore, usePUT_APIStore, useDialogStore } from '@/stores';

const Dialog = useDialogStore()
const getAPI = useGET_APIStore()
const putAPI = usePUT_APIStore()

const isLoading = ref(false)
const incomingProps = defineProps(["params"])
const emit = defineEmits(["RefreshSelectedView"])
const saveLoading = ref(false)
const selectedEntityTypes = ref([] as any[])
const entityTypes = ref([] as any[])

onMounted(async () => {
    isLoading.value = true
    const data = await getAPI.GET_EntityTypes()
    entityTypes.value = data.result
    isLoading.value = false
})

function Remove(index: number) {
    selectedEntityTypes.value.splice(index, 1)
}

async function submitForm() {
    saveLoading.value = true
    let new_types = incomingProps.params.selectedItem.entity_types.map((a: any) => a.name).concat(selectedEntityTypes.value.map((a: any) => a.name))
    
    putAPI.UpdatePivotEntityTypes(incomingProps.params.id, new_types).then((newPivot: any) => {
        Object.assign(incomingProps.params.selectedItem, newPivot)
        saveLoading.value = false
    }).finally(() => {
        emit('RefreshSelectedView', false)
        Dialog.ToggleDialog()
    })
}
</script>