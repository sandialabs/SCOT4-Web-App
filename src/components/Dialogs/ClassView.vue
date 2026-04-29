<template>
    <v-card @keyup.shift.enter="AddClass()">
        <v-card-text>
            <v-combobox id="class-search-box" v-model="selected" :items="classes" :loading="isLoading" label="Search for an option or make new" item-title="name" variant="outlined" hide-selected multiple autocomplete="off" autofocus auto-select-first>
                <template v-slot:selection="{ item, index }">
                    <v-chip v-if="item === Object(item)" size="small" variant="flat" closable label @click:close="RemoveClass(index)">
                        <v-icon v-if="item.raw.icon" :icon="IconPipe.Vue2TO3IconFormat(item.raw.icon)" />
                        <span v-if="item.raw.display_name">{{ item.raw.display_name }}</span>
                        <span v-else>{{ item.title}}</span>
                    </v-chip>
                </template>
                <template v-slot:item="{item, props}">
                    <v-list-item v-bind="props">
                        <v-icon v-if="item.raw.icon" :icon="IconPipe.Vue2TO3IconFormat(item.raw.icon)"/>
                        <span>{{ item.raw.display_name }}</span>
                    </v-list-item>
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
            <v-btn @click="AddClass()" color="success" rounded="lg" elevation="1" variant="outlined">
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
import { } from '@/stores/dialog'
import { useGET_APIStore, usePOST_APIStore, useDialogStore, usePUT_APIStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons'
import { useIconPipe } from '@/pipes';
import { IRElementType } from '@/types/irelement'

const Dialog = useDialogStore()
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const API_PUT = usePUT_APIStore()
const IconPipe = useIconPipe()
const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshSelectedView'])

const isLoading = ref(false)
const selected = ref([] as number[])
const classes = ref([] as any[])

onMounted(async () => {
    isLoading.value = true
    const data = await API_GET.GET_EntityClasses()
    classes.value = data.result
    isLoading.value = false
})

function RemoveClass(index: number) {
    selected.value.splice(index, 1)
}

async function AddClass() {
    if (incomingProps.params.targetType == IRElementType.Entity) {
        API_POST.POST_AddEntityClass(incomingProps.params.id, selected.value.map((a: any) => a.id))
            .then((newEntity: any) => {
                Object.assign(incomingProps.params.selectedItem, newEntity)
            })
            .finally(() => {
                emit('RefreshSelectedView', true)
                Dialog.ToggleDialog()
            })
    }
    else if(incomingProps.params.targetType == IRElementType.Pivot) {
        let new_classes = incomingProps.params.selectedItem.entity_classes.map((a: any) => a.name).concat(selected.value.map((a: any) => a.name))
        API_PUT.UpdatePivotEntityClasses(incomingProps.params.id, new_classes)
            .then((newPivot: any) => {
                Object.assign(incomingProps.params.selectedItem, newPivot)
            }).finally(() => {
                emit('RefreshSelectedView', true)
                Dialog.ToggleDialog()
            })
    }
}
</script>