<template>
    <v-container fluid class="pane-container d-flex flex-column">
        <h5 v-if="!entities && !isLoading" class="text-center">No Associated Entities</h5>
        <div v-else-if="!isLoading" style="overflow: auto;" class="mb-1">
            <v-list v-for="[entity, i] of Object.entries(entities)" :key="'list' + i" density="compact">
                <v-list-item-title>
                    <u> Entity Type: {{ entity }} </u>
                    <v-btn @click="selectAllEntities(entity)" size="small" icon="mdi-checkbox-multiple-marked-outline"
                        v-tooltip:right="'Select all entities of this type for tagging/classifying'" variant="plain" />
                    <v-btn @click="copyEntityTypeClipboard(entity)" size="small" icon="mdi-content-copy"
                        v-tooltip:right="'Copy entity values of this type to clipboard'" variant="plain" />
                </v-list-item-title>
                <v-list-item v-for="subEntity of entities[entity]" :key="subEntity.id" density="compact" slim>
                    <div class="d-flex">
                        <v-checkbox density="compact" hide-details :value="subEntity.id" v-model="selectedEntities" />
                        <span v-if="Flair.GetFlairActive" class="d-flex">
                            <FlairText class="align-self-center" :flair-props="subEntity" :entity="true" />
                        </span>
                        <span class="mt-2" v-else>{{ subEntity.value }}</span>
                    </div>
                </v-list-item>
                <v-divider />
            </v-list>
        </div>
        <LoadingCard v-else />
        <v-btn-group color="primary" rounded="lg" elevation="1" variant="outlined" divided density="comfortable" class="flex-shrink-0">
            <v-btn :disabled="selectedEntities.length == 0" @click="openDialog(false)">
                Add Class or Tag
            </v-btn>
            <v-btn :disabled="selectedEntities.length == 0" @click="openDialog(true)">
                Remove Class or Tag
            </v-btn>
            <v-btn v-if="ipAddresses.length > 0" @click="Dialog.ToggleDialog('ipGeoMap', {ipAddresses: ipAddresses, target_id: incomingProps.targetId, target_type: incomingProps.targetType})">
                IP Geo Map
            </v-btn>
            <v-btn @click="copyAllEntitiesToClipboard">
                Copy All Entities
            </v-btn>
        </v-btn-group>
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, watch } from 'vue';
import LoadingCard from '../Loaders/LoadingCard.vue'
import { useFlairStore, useDialogStore } from '@/stores'
import FlairText from '../Flair/FlairText.vue';

const incomingProps = defineProps(["entities", "data", "targetType", "targetId"])
const emits = defineEmits(["toggleExtraToolBar", "alertSelectedIds", "refreshElement", "entryIds"])
const isLoading = ref(true)
const entities: any = reactive({})
const selectedEntities = ref([] as number[])
const ipAddresses = ref([] as any[])
const Flair = useFlairStore()
const Dialog = useDialogStore()
const selectedClasses = ref([] as any[])
const selectedTags = ref([] as any[])

onMounted(() => {
    Object.assign(entities, {})
    processEntities()
})

function processEntities() {
    if (incomingProps.entities) {
        for (let i = 0; i < incomingProps.entities.result.length; i++) {
            const element = incomingProps.entities.result[i]
            if (!entities[element.type_name]) {
                entities[element.type_name] = []
            }
            if (element.type_name == "ipaddr" || element.type_name == "ipv6") {
                ipAddresses.value.push(element)
            }
            entities[element.type_name].push(element)
        }
        isLoading.value = false
    }
}

watch(() => incomingProps.entities, processEntities)

function selectAllEntities(entity: string) {
    entities[entity].forEach((element: any) => {
        if (!selectedEntities.value.includes(element.id)) {
            selectedEntities.value.push(element.id)
        }
    });
}

function copyEntityTypeClipboard(entity: string) {
    let textString = ""
    entities[entity].forEach((element: any) => {
        textString += `${element.value}\n`
    });
    navigator.clipboard.writeText(textString)
}

function copyAllEntitiesToClipboard() {
    let textString = ""
    for (const entity in entities) {
        entities[entity].forEach((element: any) => {
            textString += `${element.value}\n`
        });
    }
    navigator.clipboard.writeText(textString)
}

function openDialog(remove: boolean = false) {
    if (remove) {
        for (const entityType in entities) {
            for (const entityName in entities[entityType]) {
                if (selectedEntities.value.includes(entities[entityType][entityName].id)) {
                    selectedClasses.value = [...selectedClasses.value, ...entities[entityType][entityName].classes]
                    selectedTags.value = [...selectedTags.value, ...entities[entityType][entityName].tags]
                }
            }
        }
    }
    Dialog.ToggleDialog('add_remove_classify', { remove: remove, ids: selectedEntities, classes: selectedClasses, tags: selectedTags })
}
</script>