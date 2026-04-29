<template>
    <v-menu class="flex-fill mx-2">
        <template v-slot:activator="{ props }">
            <v-btn size="x-small" v-bind="props" variant="plain" density="compact" style="max-width: 68px; font-size: 10px; padding-bottom: 0px !important; padding-top: 0px !important;">
                <svg style="width: 12px; height: 12px;">
                    <circle v-if="tlpData == 'red'" r="5" cx="6" cy="6"
                        style="fill: red; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else-if="tlpData == 'white' || tlpData == 'clear'" r="5" cx="6" cy="6"
                        style="fill: white; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else r="5" cx="6" cy="6" style="fill: gray; stroke: black; stroke-width: 2px;"></circle>
                </svg>
                <svg style="width: 12px; height: 12px;">
                    <pattern id="diagonalRed" patternUnits="userSpaceOnUse" width="12" height="12">
                        <rect width="12" height="12" fill="orange" />
                        <path d="M1 1 L12 12" style="stroke: red; stroke-width:2;" />
                    </pattern>
                    <circle v-if="tlpData == 'amber'" r="5" cx="6" cy="6"
                        style="fill: orange; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else-if="tlpData == 'amber_strict'" r="5" cx="6" cy="6" fill="url(#diagonalRed)"
                        style="stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else-if="tlpData == 'white' || tlpData == 'clear'" r="5" cx="6" cy="6"
                        style="fill: white; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else r="5" cx="6" cy="6" style="fill: gray; stroke: black; stroke-width: 2px;"></circle>
                </svg>
                <svg style="width: 12px; height: 12px;">
                    <circle v-if="tlpData == 'green'" r="5" cx="6" cy="6"
                        style="fill: green; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else-if="tlpData == 'white' || tlpData == 'clear'" r="5" cx="6" cy="6"
                        style="fill: white; stroke: black; stroke-width: 2px;"></circle>
                    <circle v-else r="5" cx="6" cy="6" style="fill: gray; stroke: black; stroke-width: 2px;"></circle>
                </svg>
                &nbsp;
                <FontAwesomeIcon :icon="faChevronDown" />
                <span v-if="tlpData == 'amber_strict'" class="text-red"
                    style="position: absolute; left: 12px; top: 6px; font-size: 6px"><br />STRICT</span>
            </v-btn>
        </template>
        <v-list>
            <span class="pa-2">Traffic Light Protocol (TLP) Color</span>
            <v-list-item v-for="item in TLPOptions" :key="item" @click="tlpItemClick(item)">
                <template v-slot:prepend>
                    <svg style="width: 12px; height: 12px;" class="mr-1">
                        <pattern id="diagonalRed" patternUnits="userSpaceOnUse" width="12" height="12">
                            <rect width="12" height="12" fill="orange" />
                            <path d="M1 1 L12 12" style="stroke: red; stroke-width:2;" />
                        </pattern>
                        <circle v-if="item == 'Red'" r="5" cx="6" cy="6"
                                style="fill: red; stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else-if="item == 'Amber'" r="5" cx="6" cy="6"
                                style="fill: orange; stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else-if="item == 'Green'" r="5" cx="6" cy="6"
                                style="fill: green; stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else-if="item == 'Amber+Strict'" r="5" cx="6" cy="6" fill="url(#diagonalRed)"
                                style="stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else-if="item == 'White' || item == 'Clear'" r="5" cx="6" cy="6"
                                style="fill: white; stroke: black; stroke-width: 2px;"></circle>
                        <circle v-else r="5" cx="6" cy="6" style="fill: gray; stroke: black; stroke-width: 2px;"></circle>
                    </svg>
                </template>
                {{ item }}
            </v-list-item>
            <v-divider />
            <v-list-item href="https://www.cisa.gov/tlp" target="_blank">What is TLP?</v-list-item>
        </v-list>
    </v-menu>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { TLPCode, IRElementAPIPaths, IRElementType } from '@/types/irelement'
import { usePUT_APIStore, useBusStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'

const incomingProps = defineProps({
    data: String,
    targetType: String,
    targetId: Number,
    obj: Object,
    entryIds: {
        type: Array<number>,
        required: false,
        default: [],
    }
})
const tlpData = ref("")
const TLPOptions: Array<string> = Object.keys(TLPCode).map(val => val == 'amber_strict' ? 'Amber+Strict' : val).map((s) => s[0].toUpperCase() + s.substring(1)).filter(val => val != 'White')
const API_PUT = usePUT_APIStore()
const Bus = useBusStore()

onMounted(() => {
    tlpData.value = incomingProps.data
})

watch(() => incomingProps.data, () => {
    tlpData.value = incomingProps.data
})

function tlpItemClick(item: any) {
    let newTlp = TLPCode[item.toLowerCase().replace('+', '_') as keyof typeof TLPCode]
    tlpData.value = newTlp
    UpdateTLP()
}

async function UpdateTLP() {
    //update the entries first if any
    if (incomingProps.entryIds.length > 0) {
        await API_PUT.UpdateManyElementsByIds(IRElementAPIPaths[IRElementType.Entry], incomingProps.entryIds, { tlp: tlpData.value })
    }
    const targetType = incomingProps.targetType == "entry" ? IRElementAPIPaths[IRElementType.Entry] : IRElementAPIPaths[incomingProps.targetType]
    await API_PUT.UpdateElementById(targetType, incomingProps.targetId, { tlp: tlpData.value })
        .then((newObj) => {
            if (incomingProps.obj) {
                Object.assign(incomingProps.obj, newObj)
            }
        })
}
</script>
