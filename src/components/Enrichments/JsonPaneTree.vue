<template>
    <v-treeview :items="computedItems()" class="json-treeview">
        <template #prepend="{ item }">
            <span>{{ item.name }}</span>
        </template>
    </v-treeview>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

let incomingProps = defineProps(['data']);
let enrichmentData: any = reactive(incomingProps.data)

function recurseNode(node: Record<string | number, any> | string | number, treeItem: any, currentId: any) {
    if (typeof node === "string" || typeof node === "number") {
        treeItem.push({ id: currentId.id, name: node });
        currentId.id += 1;
        return;
    }

    for (let [key, value] of Object.entries(node)) {
        if (typeof value === "object" && value !== null) {
            let item = { id: currentId.id, name: `${key}: `, children: [] };
            currentId.id += 1;
            treeItem.push(item);

            recurseNode(value, item.children, currentId);
        } else {
            let item = { id: currentId.id, name: `${key}: ${value}` };
            currentId.id += 1;
            treeItem.push(item);
        }
    }
}

function computedItems() {
    let treeItems: Array<any> = []
    let parsedJSON: any = Array.isArray(enrichmentData.data) ? enrichmentData.data : [enrichmentData.data]
    let currentId = {id: 1}

    for (const node of parsedJSON) {
        let rootItem: any = []
        recurseNode(node, rootItem, currentId)
        console.log("root item returned from recurseNode:", rootItem)
        treeItems.push(rootItem)
    }
    return treeItems.flat()
}
</script>

<style scoped>
.json-treeview {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    font-size: 14px; /* Ensure text is readable */
    background-color: rgb(var(--v-theme-surface));
}

.json-treeview tbody tr:nth-child(even) {
    background-color: rgb(var(--v-theme-surface));
}
.json-treeview tbody tr:nth-child(even) {
    background-color: rgb(var(--v-theme-surface));
}
</style>
