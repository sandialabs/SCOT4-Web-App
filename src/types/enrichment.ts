

import MarkdownPane from "@/components/Enrichments/MarkdownPane.vue"
import PlainTextPane from "@/components/Enrichments/PlainTextPane.vue"
import JsonPaneTree from "@/components/Enrichments/JsonPaneTree.vue"

export const EnrichmentTabComponents: Record<string, any> = {
    "markdown": MarkdownPane,
    "plaintext": PlainTextPane,
    "jsontree": JsonPaneTree,
}