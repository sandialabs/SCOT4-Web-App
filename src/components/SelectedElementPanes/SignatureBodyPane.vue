<template>
    <v-container v-if="isLoading" fluid>
        <LoadingCard />
    </v-container>
    <div v-else class="scrollable-pane">
        <v-list>
            <div v-if="Array.isArray(sigSelected.data.signature_body)">
                <v-list-item v-ripple="false" v-for="(body, idx) in sigSelected.data.signature_body" :key="idx">
                    <v-textarea :spellcheck="false" :readonly="sigSelected.data.external_location != null"
                        @blur="UpdateSignatureData" auto-grow outlined @click.prevent.stop="" label="Signature Body"
                        v-model="sigSelected.data.signature_body[idx]"></v-textarea>
                </v-list-item>
            </div>
            <div v-else>
                <v-list-item v-ripple="false">
                    <v-textarea :spellcheck="false" :readonly="sigSelected.data.external_location != null"
                        @blur="UpdateSignatureData" auto-grow outlined @click.prevent.stop="" label="Signature Body"
                        v-model="sigSelected.data.signature_body"></v-textarea>
                </v-list-item>
            </div>
        </v-list>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LoadingCard from '../Loaders/LoadingCard.vue'
import { usePUT_APIStore } from '@/stores'

let incomingProps = defineProps(['data'])
let sigSelected = ref()
let isLoading = ref(true)

const API_PUT = usePUT_APIStore()

onMounted(() => {
    sigSelected.value = incomingProps.data
    isLoading.value = false
})

async function UpdateSignatureData() {
    if (sigSelected.value) {
        const updateData = {
            data: sigSelected.value.data
        }
        isLoading.value = true
        await API_PUT.UpdateElementById("/signature", sigSelected.value.id, updateData)
            .then((v: any) => {
                isLoading.value = false
            })
    }
}
</script>

<style scoped>
.scrollable-pane {
    max-height: 400px;
    overflow-y: auto;
}
</style>