<template>
    <div :class="{ 'd-flex flex-column': incomingProps.queueView }" style="white-space: nowrap">
        <v-btn :block="incomingProps.queueView" rounded="0" @click.stop="Vote('upvote')" title="Up Vote" density="compact" variant="text" icon="mdi-arrow-up-bold" class="align-self-center bg-transparent" :size="incomingProps.queueView ? 'small' : 'x-small'" :color="upVoteColor"/>
        <v-chip variant="text" density="compact" size="small" :color="textColor" class="font-weight-bold align-self-center" style="height: 10px">{{ count }}</v-chip>
        <v-btn :block="incomingProps.queueView" rounded="0" @click.stop="Vote('downvote')" title="Down Vote" density="compact" variant="text" icon="mdi-arrow-down-bold" class="align-self-center bg-transparent" :size="incomingProps.queueView ? 'small' : 'x-small'" :color="downVoteColor"/>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { usePOST_APIStore, usePopularityStore } from '@/stores'
import { IRElementAPIPaths } from '@/types/irelement'

const API_POST = usePOST_APIStore()
const Popularity = usePopularityStore()
const incomingProps = defineProps(['voted', 'count', 'elementID', 'elementType', 'queueView'])

const voted = ref(incomingProps.voted)
const count = ref(incomingProps.count)
const elementID = ref(incomingProps.elementID)
const elementType = ref(incomingProps.elementType)

const upVoteColor = ref("")
const downVoteColor = ref("")
const textColor = ref("")


onMounted(() => {
    SetColors()
})

function SetColors() {
    if (voted.value) {
        if (voted.value == "upvote") {
            upVoteColor.value = "deep-orange"
            downVoteColor.value = ""
        }
        else if (voted.value == "downvote") {
            upVoteColor.value = ""
            downVoteColor.value = "blue"
        }
        else {
            upVoteColor.value = ""
            downVoteColor.value = ""
        }
    }
    else {
        upVoteColor.value = ""
        downVoteColor.value = ""
    }
    if (count.value > 0) {
        textColor.value = "deep-orange"
    }
    else if (count.value < 0) {
        textColor.value = "blue"
    }
    else {
        textColor.value = ""
    }
}

async function Vote(voteType: string) {
    let path = "/entry"
    if (incomingProps.queueView) {
        path = IRElementAPIPaths[elementType.value]
    }

    await API_POST.POST_Vote(path, elementID.value, voteType).
        then((v) => {
            voted.value = v.popularity_voted
            count.value = v.popularity_count
            Popularity.set_range(v.popularity_count)
            SetColors()
        })
}
</script>