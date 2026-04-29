<template>
    <v-card v-if="!isLoading">
        <v-card-text>
            <v-text-field label="Title" v-model="title"/>
        </v-card-text>
        <v-card-actions v-if="!isLoading">
            <v-spacer/>
            <v-btn @click="UpdateField()" color="success" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faSave" />&nbsp;Save
            </v-btn>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" />&nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
    <LoadingCard v-if="isLoading" />
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePUT_APIStore, useDialogStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons'
import { IRElementAPIPaths } from '@/types/irelement'
import LoadingCard from '@/components/Loaders/LoadingCard.vue'

const Dialog = useDialogStore()
const API_PUT = usePUT_APIStore()

let isLoading = ref(true)
let currentRouteName = ref()
let currentRouteId = ref()
let incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshQueueView', 'RefreshSelectedView'])
let title = ref("")

onMounted(() => {
    currentRouteName.value = incomingProps.params.targetType
    currentRouteId.value = incomingProps.params.targetId
    title.value = incomingProps.params.data[incomingProps.params.subjectFieldName]
    isLoading.value = false
})

async function UpdateField() {
    await API_PUT.UpdateElementById(IRElementAPIPaths[currentRouteName.value], currentRouteId.value,
                                    { [incomingProps.params.subjectFieldName]: title.value })
        .then((v) => {
            //v ? emit('RefreshQueueView', true) : null
            Object.assign(incomingProps.params.data, v)
            Dialog.ToggleDialog()
        })
}
</script>