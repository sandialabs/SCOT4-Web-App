<template>
    <v-container v-if="!isLoading" :fluid="true" class="p-0">
        <v-card :elevation="0" color='amber-lighten-4' class="p-3">
            <div class="cell-view" v-html="sourceData.html"></div>
        </v-card>
    </v-container>
</template>
<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useGET_APIStore, useFlairStore } from '@/stores'
import FlairWrapper from '@/components/Flair/FlairWrapper.vue';

const API_GET = useGET_APIStore()
const Flair = useFlairStore()

let incomingProps = defineProps(['source', 'entities'])
let isLoading = ref(true)
let sourceData = reactive(incomingProps.source)
let entityData = reactive(incomingProps.entities)


onMounted(() => {
    isLoading.value = false
})


</script>