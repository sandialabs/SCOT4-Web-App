<template>
    <v-container v-if="pivotData == null && !isLoading" class="pane-container">
        <h3 class="text-center">No Properties Defined</h3>
    </v-container>
    <v-container v-else-if="pivotData != null && !isLoading" class="pane-container" fluid>
        <v-list class="bg-transparent" density="compact" :slim="true">
            <v-list-item>
                <v-text-field label="Pivot Description" v-model="pivotData.description" @update:model-value="updatePivotField('description')"/>
            </v-list-item>
            <v-list-item>
                <v-text-field label="Pivot Template" v-model="pivotData.template" @update:model-value="updatePivotField('template')"/>
            </v-list-item>
        </v-list>
        <v-list-item title="Attached to Entity Types:">
            <v-chip v-for="entity_type in pivotData.entity_types" :key="entity_type.id" :text="entity_type.name" size="small" closable @click:close="removePivotEntityType(entity_type.name)"/>
            <v-chip color="green" @click="Dialog.ToggleDialog('pivot-entity-type', {id: pivotData.id, selectedItem: pivotData})">
                <FontAwesomeIcon :icon="faPlus" />
            </v-chip>
        </v-list-item>
        <v-list-item title="Attached to Entity Classes:">
            <v-chip v-for="icon in pivotData.entity_classes" :key="icon.id" size="small" v-tooltip="icon.description" closable @click:close="removePivotEntityClass(icon.name)">
                <v-icon v-if="icon.icon">{{ IconPipe.Vue2TO3IconFormat(icon.icon) }}</v-icon>
                <span v-else>{{ icon.display_name }}</span>
            </v-chip>
            <v-chip color="green" @click="Dialog.ToggleDialog('class', {id: pivotData.id, selectedItem: pivotData, targetType: IRElementType.Pivot})">
                <FontAwesomeIcon :icon="faPlus" />
            </v-chip>
        </v-list-item>
    </v-container>
    <v-container v-else>
        <LoadingCard />
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import LoadingCard from '../Loaders/LoadingCard.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { useGET_APIStore, usePUT_APIStore } from '../../stores'
import { useDialogStore, useBusStore } from '@/stores';
import { IRElementAPIPaths, IRElementType } from '@/types/irelement';
import { useIconPipe } from '../../pipes';

const incomingProps = defineProps(['data'])
const pivotData = ref()
const isLoading = ref(true)
const Dialog = useDialogStore()
const apiPUT = usePUT_APIStore()
const apiGET = useGET_APIStore()
const Bus = useBusStore()
const IconPipe = useIconPipe()

onMounted(() => {
    pivotData.value = incomingProps.data
    isLoading.value = false
})

async function updatePivotField(fieldToUpdate: string) {
    await apiPUT.UpdateElementById(
        IRElementAPIPaths[IRElementType.Pivot],
        pivotData.value.id, {
            [fieldToUpdate]: pivotData.value[fieldToUpdate]
        }
    )
}

async function removePivotEntityType(entityTypeName: string) {
    const entity_types = pivotData.value.entity_types.map((a: any) => a.name)
    const index = entity_types.indexOf(entityTypeName)
    if (index !== -1) {
        entity_types.splice(index, 1)
        pivotData.value.entity_types.splice(index, 1)
    }
    await apiPUT.UpdatePivotEntityTypes(pivotData.value.id, entity_types)
}

async function removePivotEntityClass(entityClassName: string) {
    const entity_classes = pivotData.value.entity_classes.map((a: any) => a.name)
    const index = entity_classes.indexOf(entityClassName)
    if (index !== -1) {
        entity_classes.splice(index, 1)
        pivotData.value.entity_classes.splice(index, 1)
    }
    await apiPUT.UpdatePivotEntityClasses(pivotData.value.id, entity_classes)
}
</script>