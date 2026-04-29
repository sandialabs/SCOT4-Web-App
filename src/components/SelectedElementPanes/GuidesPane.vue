<template>
    <v-container v-if="guidesData.length == 0 && !isLoading" class="pane-container">
        <h3 class="text-center">No associated Guides</h3>
    </v-container>
    <v-container v-else-if="guidesData && !isLoading" :fluid="true" class="pane-container">
        <template v-for="guide in guidesData" :key="'Guide' + guide.id">
            <v-toolbar :title="`Guide #${guide.id}: ${guide.subject}`" elevation="2" density="compact">
                <v-spacer/>
                <v-btn size="small" rounded="0" variant="outlined" color="success" @click="AddGuideEntry(guide.id)">
                    <FontAwesomeIcon :icon="faPlusCircle" />&nbsp; Add Entry
                </v-btn>
            </v-toolbar>
            <template v-for="entry of guidesDataEntires" :key="'Entry' + entry.id">
                <JournalEntry v-if="entry.target_id == guide.id" type="guide" :entities="guidesEntities" :data="entry"/>
            </template>
        </template>
    </v-container>
    <v-container v-else>
        <LoadingCard />
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LoadingCard from '../Loaders/LoadingCard.vue'
import JournalEntry from '../Journal/JournalEntry.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { useGET_APIStore, usePOST_APIStore, useAuthStore } from '@/stores'
import { NewEntry } from '@/models'
import { IRElementAPIPathsNoSlash, IRElementType } from '@/types/irelement';

let incomingProps = defineProps(['data'])
const guidesMap = ref([] as number[])
const guidesData = ref([] as any[])
const guidesDataEntires = ref([] as any[])
const guidesEntities = ref([] as any[])
const isLoading = ref(true)
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const Auth = useAuthStore()

onMounted(() => {
    guidesMap.value = incomingProps.data.associated_sig_guide_map
    Object.keys(guidesMap.value).length == 0 ? isLoading.value = false : GetGuidesAndEntries(guidesMap.value)
})

async function GetGuidesAndEntries(guidesMap: any) {
    for (const guideArray of Object.values(guidesMap as any)) {
        for (const guideID of guideArray as any) {
            await API_GET.GET_IRElementGuide(guideID)
                .then((v: any) => {
                    guidesData.value.push(v)
                })
                .then(() => {
                    GetGuideEntry(guideID)
                })
        }
    }
}

async function GetGuideEntry(id: any) {
    await API_GET.GET_IRElementGuideEntries(id)
        .then((v: any) => {
            guidesDataEntires.value = guidesDataEntires.value.concat(v.result)
        }).finally(() => {
            GetEntities(id)
        })
}

async function GetEntities(id: string) {
    await API_GET.GET_IRElementGuideEntity(id)
        .then((v: any) => {
            guidesEntities.value = v
        }).finally(() => {
            isLoading.value = false
        })
}

async function AddGuideEntry(guide_id: number) {
    isLoading.value = true

    await API_POST.POST_CreateIRElement("/entry", { entry: new NewEntry("entry", { html: "" }, Auth.GetUser.username, null, guide_id, IRElementAPIPathsNoSlash[IRElementType.Guide]) })
        .then((v: any) => {
            guidesDataEntires.value.push(v)
        })
        .finally(() => {
            isLoading.value = false
        })
}
</script>
