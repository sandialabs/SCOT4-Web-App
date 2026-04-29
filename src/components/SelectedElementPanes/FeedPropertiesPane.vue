<template>
    <v-container v-if="feedProperties == null && !isLoading"  class="pane-container">
        <h3 class="text-center">No Properties Defined</h3>
    </v-container>
    <v-container v-else-if="feedProperties != null && !isLoading" fluid  class="pane-container">
        <v-list>
            <v-list-item>
                <v-text-field label="Feed URI" v-model="feedProperties.uri" @update:modelValue="updateFeedField('uri')"/>
            </v-list-item>
            <v-list-item>
                <v-text-field label="Feed Type" v-model="feedProperties.type" @update:modelValue="updateFeedField('type')"/>
            </v-list-item>
            <v-subheader>Feed Attributes</v-subheader>
            <v-divider />
            <v-list-item v-for="(val, propName) in feedProperties?.data" :key=propName dense>
                <v-text-field :label="val" v-model="feedProperties.data[propName]" dense @update:modelValue="updateFeedField('data')"/>
            </v-list-item>
        </v-list>
    </v-container>
    <v-container v-else>
        <LoadingCard />
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LoadingCard from '../Loaders/LoadingCard.vue'
import { usePUT_APIStore } from '@/stores';
import { IRElementAPIPaths, IRElementType } from '@/types/irelement';
import { useDebounceFn } from '@vueuse/core';

const apiPUT = usePUT_APIStore()
const incomingProps = defineProps(['data'])
const feedProperties = ref()
const DebouncedRequest = useDebounceFn(() => true, 500)
const isLoading = ref(true)

onMounted(() => {
    feedProperties.value = incomingProps.data
    isLoading.value = false
})

async function updateFeedField(fieldToUpdate: string) {
    const debounce = await DebouncedRequest()
    if (debounce) {
        await apiPUT.UpdateElementById(
            IRElementAPIPaths[IRElementType.Feed],
            feedProperties.value.id, {
            [fieldToUpdate]: feedProperties.value[fieldToUpdate]
        })
    }
}
</script>