
<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import FlairComponent from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/FlairPlugin/FlairComponent.vue'
import { Getter, Action } from 'vuex-class';

const namespace: string = 'IRElements';


@Component({
    components: {
      FlairComponent
    },
})

export default class FlairedTextComponent extends Vue{
    @Prop() templateText: string
    @Getter('selectedElementEntities', { namespace }) selectedElementEntities: Record<string, Record<string, any>>
    @Getter('entitiesLoaded', { namespace }) entitiesLoaded: boolean
    @Action('addFlairedEntity', { namespace }) addFlairedEntity: CallableFunction
    @Action('openFlairMenu', { namespace }) openFlairMenu: CallableFunction

    render(h: CallableFunction) {
        const doc = (new DOMParser()).parseFromString(this.templateText, 'text/html')

        return this.parseNode(doc, h)
    }

    isValid(input: string) {
        try {
            return document.createElement(input).toString() != "[object HTMLUnknownElement]";
        }
        catch (e) {
            return false
        }
    }

    parseNode(node: Node, h: CallableFunction, isFlairChild: boolean = false): any {
        if (node.nodeType == node.TEXT_NODE) {
            return node.textContent
        }
        else if (node.nodeType == node.ELEMENT_NODE) {
            var nodeName = (node as Element).tagName
            if (nodeName.toUpperCase() == "HTML" || nodeName.toUpperCase() == "BODY") {
                nodeName = "SPAN"
            }
            if (nodeName.toUpperCase() == "HEAD") {
                return ""
            }
            // Need to replace slashes and quotes in attribute names for compatibility with some old SCOT data
            const nodeAttributes: any = Array.from((node as Element).attributes).reduce((obj, val) => ({ ...obj, [val.nodeName.replace('"', '').replace('\\', '')]: val.nodeValue }), {})
            const isEntitySpan = this.entitiesLoaded && nodeName.toUpperCase() == "SPAN" && nodeAttributes.class?.replace('\\"', '').startsWith("entity")
            const children = Array.from(node.childNodes).map((n) => this.parseNode(n, h, isFlairChild || isEntitySpan))
            // Special handling of flair
            if (isEntitySpan) {
                let nodeType = nodeAttributes["data-entity-type"]
                let nodeValue = nodeAttributes["data-entity-value"]?.toLowerCase()
                // Also remove slashes and quotes if necessary for compatibility with old SCOT data
                if (nodeType && nodeValue &&
                        (!(nodeType in this.selectedElementEntities) || !this.selectedElementEntities[nodeType][nodeValue])) {
                    nodeType = nodeType.replaceAll('\\"', '')
                    nodeValue = nodeValue.replaceAll('\\"', '')
                }
                if (!(nodeType in this.selectedElementEntities) || !this.selectedElementEntities[nodeType][nodeValue]) {
                    return h(nodeName, { attrs: nodeAttributes }, children)
                }
                const entity = this.selectedElementEntities[nodeType][nodeValue]
                const flairComponentProps = {
                    entity: entity,
                    isChild: isFlairChild
                }
                return h(FlairComponent, { props: flairComponentProps }, children)
            }
            return h(nodeName, { attrs: nodeAttributes }, children)
        }
        else if (node.nodeType == node.DOCUMENT_NODE) {
            const children = Array.from(node.childNodes).map((n) => this.parseNode(n, h))
            return h("span", children)
        }
        else{
            return ""

        }
    }
}

</script>
<style scoped>

</style>