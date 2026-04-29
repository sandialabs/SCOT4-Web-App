<template>
    <v-container v-if="entityClassData == null && !isLoading" class="pane-container">
        <h3 class="text-center">No Properties Defined</h3>
    </v-container>
    <v-container v-else-if="entityClassData != null && !isLoading" fluid class="pane-container">
        <v-list>
            <v-list-item>
                <v-text-field label="Entity Class System Name" v-model="entityClassData.name" @update:modelValue="updateEntityClassField('name')"/>
            </v-list-item>
            <v-list-item>
                <v-text-field label="Entity Class Description" v-model="entityClassData.description" @update:modelValue="updateEntityClassField('description')"/>
            </v-list-item>
        </v-list>
    </v-container>
    <v-container v-else>
        <LoadingCard />
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { usePUT_APIStore } from '@/stores';
import LoadingCard from '../Loaders/LoadingCard.vue'
import { IRElementAPIPaths, IRElementType } from '@/types/irelement';
import { useDebounceFn } from '@vueuse/core';

const apiPUT = usePUT_APIStore()
const incomingProps = defineProps(['data'])
const entityClassData = ref()
const DebouncedRequest = useDebounceFn(() => true, 500)
const isLoading = ref(true)

onMounted(() => {
    entityClassData.value = incomingProps.data
    isLoading.value = false
})

async function updateEntityClassField(fieldToUpdate: string) {
    const debounce = await DebouncedRequest()
    if (debounce) {
        await apiPUT.UpdateElementById(
            IRElementAPIPaths[IRElementType.EntityClass],
            entityClassData.value.id, {
            [fieldToUpdate]: entityClassData.value[fieldToUpdate]
        })
    }
}
</script>