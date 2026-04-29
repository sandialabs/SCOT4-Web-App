<template>
    <span v-html="MarkdownHTML()" class="markdown-div"> </span>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const incomingProps = defineProps(['data'])
const enrichmentData: any = reactive(incomingProps.data)

function MarkdownHTML() {
    const parsedMarkdown = marked.parse(enrichmentData.data.markdown)
    return DOMPurify.sanitize(parsedMarkdown)
}
</script>

<style>
    .markdown-div table {
        width: 100%;
        background-color: rgb(var(--v-theme-surface));
        border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
        color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
        font-size: 0.875rem;
        font-weight: 400;
        line-height: 1.425;
        letter-spacing: 0.0178571429em;
    }
    .markdown-div tbody tr:nth-child(even) {
        background-color: rgba(var(--v-border-color), var(--v-hover-opacity))
    }
    .markdown-div tbody tr:nth-child(even) {
        background-color: rgba(var(--v-border-color), var(--v-hover-opacity))
    }
    .markdown-div thead {
        height: 56px;
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 1.667;
        letter-spacing: 0.0333333333em;
    }
</style>
