<template>
    <v-card v-if="!isLoading" :title="`Entities for entry ${incomingProps.params.targetId}`">
        <v-card-text>
            <EntitiesPane :entities="entities"/>
        </v-card-text>
        <v-divider/>
        <v-card-actions>
            <v-spacer/>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" />&nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
    <LoadingCard v-else/>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDialogStore, useGET_APIStore, useSnackBarStore } from '@/stores';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import LoadingCard from '../Loaders/LoadingCard.vue';
import EntitiesPane from '../SelectedElementPanes/EntitiesPane.vue';

const incomingProps = defineProps(['params'])
const Dialog = useDialogStore()
const apiGET = useGET_APIStore()    
const SnackBar = useSnackBarStore()
const isLoading = ref(true)
const entities = ref([] as any[])

onMounted(async () => {
    if (incomingProps.params.targetId) {
        apiGET.GET_IRElementEntity("/entry", incomingProps.params.targetId).then((v: any) => {
            entities.value = v
        }).catch((error: any) => {
            SnackBar.ShowSnackBarError(error)
        }).finally(() => {
            isLoading.value = false
        })
    }
})
</script>

<style scoped>
    .v-dialog{
        display: flex;
        flex-direction: column;
    }

    .flex-column-noscroll {
        min-height: 100%;
        display: flex;
        flex-direction: column;
    }

    .scroll-child {
        max-height: 100%;
        overflow-y: auto;
    }
</style>