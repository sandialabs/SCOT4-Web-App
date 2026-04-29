<template>
    <span class="flair-chip" :style="incomingProps.isChild ? 'border: 1px solid black;' : ''" @click.stop.prevent="OpenFlair(incomingProps.flairProps)">
        <slot>{{ incomingProps.flairProps?.value }}</slot>
        <v-tooltip bottom>
            <pre>{{incomingProps.flairProps?.entry_annotation}}</pre>
            <template v-slot:activator="{ props }">
                <v-badge color="black" inline v-if="incomingProps.flairProps?.entry_annotation != null" class="mr-n1 valign-middle badges"
                         v-bind="props">
                    <template v-slot:badge>
                        <v-icon icon="mdi-note-outline" />
                    </template>
                </v-badge>
            </template>
        </v-tooltip>
        <v-badge inline :color="incomingProps.isChild ? 'red': 'green'" :content="EntityCountString(incomingProps.flairProps?.entity_count)" class="mr-n1 valign-middle badges" />
        <v-badge inline color="blue" v-for="icon in incomingProps.flairProps?.classes" :key=icon.id class="mr-n1 valign-middle badges"
            v-tooltip:bottom="icon.display_name">
            <template v-slot:badge>
                <v-icon v-if="icon.icon" class="flair-icon" :icon="IconPipe.Vue2TO3IconFormat(icon.icon)" />
                <span v-else>{{ icon.display_name }}</span>
            </template>
        </v-badge>
    </span>
</template>

<script setup lang="ts">
import { useFlairStore, useModalStore } from '@/stores';
import { useIconPipe } from '@/pipes';
let incomingProps = defineProps(['flairProps', 'isChild'])

const Flair = useFlairStore()
const Modal = useModalStore()
const IconPipe = useIconPipe()

function OpenFlair(flairSelected: any) {
    Flair.ToggleSelectedFlair(flairSelected)
    if (!Modal.GetModalActive) {
        Modal.ToggleModal()
    }
    
}

function EntityCountString(count: number = 0) {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + "M"
    }
    else if (count >= 1000) {
        return (count / 1000).toFixed(1) + "K"
    }
    return count.toString()
}

</script>
<style scoped>
    .flair-icon :deep(svg) {
        height: 1em;
        width: 1em;
    }

    .valign-middle {
        vertical-align: middle;
        margin-bottom: 3px;
    }

    .badges {
        user-select: none;
    }
</style>
