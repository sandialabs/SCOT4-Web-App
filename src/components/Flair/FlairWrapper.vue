<template>
    <LoadingSingleLine v-if="isFlairLoading" />
    <v-container v-else class="pa-0" :fluid="true">
        <component :is="parseNode(hyperscriptNode)" />
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, h, reactive, watch, type VNode, createTextVNode } from 'vue';
import LoadingSingleLine from '../Loaders/LoadingSingleLine.vue'
import FlairText from './FlairText.vue';
let incomingProps = defineProps(['templateText', 'entities', 'entity'])

let isFlairLoading = ref(true)
let isEntities = ref(false)
let hyperscriptNode = ref()
const entityCache: any = {}

function updateHtmlString() {
    updateEntityCache()
    let htmlString
    if (incomingProps.entity) {
        htmlString = "<span data-entity-type='entity' data-entity-value='" + incomingProps.templateText + "' >" + incomingProps.templateText + "</span>"
        isEntities.value = true
    } else {
        htmlString = incomingProps.templateText
    }
    const doc = (new DOMParser()).parseFromString(htmlString, 'text/html')

    hyperscriptNode.value = doc;
 
    isFlairLoading.value = false
}

function updateEntityCache(){
    if (incomingProps.entities?.result) {
        for (const entity of incomingProps.entities.result) {
            if (!(entity.type_name in entityCache)) {
                entityCache[entity.type_name] = {}
            }
            entityCache[entity.type_name][entity.value] = entity
        }
    }
}

onMounted(updateHtmlString)
watch(() => incomingProps.templateText, updateHtmlString)
watch(() => incomingProps.entities, updateHtmlString)

function parseNode(node: Node, isFlairChild: boolean = false): VNode {
    if (node.nodeType == node.TEXT_NODE) {
        return createTextVNode(node.textContent)
    }
    else if (node.nodeType == node.ELEMENT_NODE) {
        var nodeName = (node as Element).tagName
        if (nodeName.toUpperCase() == "HTML" || nodeName.toUpperCase() == "BODY") {
            nodeName = "SPAN"
        }
        if (nodeName.toUpperCase() == "HEAD") {
            return createTextVNode("")
        }
        // Need to replace slashes and quotes in attribute names for compatibility with some old SCOT data
        const nodeAttributes: any = Array.from((node as Element).attributes).reduce((obj, val) => ({ ...obj, [val.nodeName.replace('"', '').replace('\\', '')]: val.nodeValue }), {})
        const isEntitySpan = nodeName.toUpperCase() == "SPAN" && nodeAttributes.class?.replace('\\"', '').startsWith("entity")
        const children = Array.from(node.childNodes).map((n) => parseNode(n, isEntities.value || isEntitySpan))
        // Special handling of flair
        if (isFlairChild || isEntitySpan) {
            let nodeType = nodeAttributes["data-entity-type"]
            let nodeValue = nodeAttributes["data-entity-value"]
            // Also remove slashes and quotes if necessary for compatibility with old SCOT data
            if (nodeType && nodeValue &&
                (!(nodeType in entityCache) || !entityCache[nodeType][nodeValue])) {
                nodeType = nodeType.replaceAll('\\"', '')
                nodeValue = nodeValue.replaceAll('\\"', '')
            }
            if (!(nodeType in entityCache) || !entityCache[nodeType][nodeValue]) {
                return h(nodeName, nodeAttributes, children)
            }
            else {
                const FlairData = entityCache[nodeType][nodeValue]
                return h(FlairText, { flairProps: FlairData, isChild: isFlairChild }, () => children)
            }
        }
        return h(nodeName, nodeAttributes, children)
    }
    else if (node.nodeType == node.DOCUMENT_NODE) {
        const children = Array.from(node.childNodes).map((n) => parseNode(n))
        return h("span", children)
    }
    else {
        return createTextVNode("")
    }
}
function CompileFlairData(attrs: any) {

    if (attrs) {
        let flairType = null
        let flairValue = null
        let returnedEntity = null
        Object.entries(attrs).forEach(([key, value]) => {
            if (key === 'data-entity-type') {
                flairType = value
            }
            if (key === 'data-entity-value') {
                flairValue = value
            }
        });
        if (flairType) {
            if (incomingProps.entity) {
                returnedEntity = incomingProps.entities
            } else {
                incomingProps.entities.result.forEach(obj => {
                    for (const [key, value] of Object.entries(obj)) {

                        if (key == 'value' && value == flairValue) {
                            returnedEntity = obj
                        }
                    }
                });
            }
        }
        return returnedEntity
    }
}

</script>
