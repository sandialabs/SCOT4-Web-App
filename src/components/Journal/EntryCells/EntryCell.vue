<template>
    <JournalToolbar v-if="!isLoading" :entry="entry" :entities="incomingProps.entities" :type="entry?.entry_class"
                    @expand="isEntryExpanded = !isEntryExpanded" @edit="onEntryEdit" @delete="emit('delete')"
                    :expanded="isEntryExpanded" :editing="isEntryEditing" :isNotModal="incomingProps.isNotModal"
                    @reply="(entry) => emit('newentry', entry)" />
    <div ref="floatingCreateEntity" :style="floatingStyles" v-if="textSelectionVirtualElement">
        <button @click="Dialog.ToggleDialog('create-entity', { entityValue: selectionState.text, entryId: entry.id })" class="bg-green entity-create-menu">
            Create Entity
        </button>
    </div>
    <v-container v-if="!isLoading && isEntryExpanded && isEntryEditing" class="pa-0 entry-cell" fluid>
        <v-toolbar density="compact" class="editor-toolbar">
            <v-btn size="small" class="bg-transparent ms-3" elevation="0" icon
                   @click="editor.chain().focus().undo().run()" v-tooltip:bottom="'Undo'">
                <FontAwesomeIcon :icon="faUndo" />
            </v-btn>
            <v-btn size="small" class="bg-transparent" elevation="0" icon
                   @click="editor.chain().focus().redo().run()" v-tooltip:bottom="'Redo'">
                <FontAwesomeIcon :icon="faRedo" />
            </v-btn>
            <v-divider vertical></v-divider>
            <v-btn size="small" class="bg-transparent" elevation="0" icon :active="editor?.isActive('bold')"
                   @click="editor.chain().focus().toggleBold().run()" v-tooltip:bottom="'Bold'"
                   :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faBold" />
            </v-btn>
            <v-btn size="small" class="bg-transparent" elevation="0" icon :active="editor?.isActive('italic')"
                   @click="editor.chain().focus().toggleItalic().run()" v-tooltip:bottom="'Italic'"
                   :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faItalic" />
            </v-btn>
            <v-btn size="small" class="bg-transparent" elevation="0" icon :active="editor?.isActive('underline')"
                   @click="editor.chain().focus().toggleUnderline().run()" v-tooltip:bottom="'Underline'"
                   :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faUnderline" />
            </v-btn>
            <v-btn size="small" class="bg-transparent" elevation="0" icon :active="editor?.isActive('strike')"
                   @click="editor.chain().focus().toggleStrike().run()" v-tooltip:bottom="'Strikethrough'"
                   :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faStrikethrough" />
            </v-btn>
            <v-btn size="small" class="bg-transparent" elevation="0" icon :active="editor?.isActive('codeBlock')"
                   @click="editor.chain().focus().toggleCodeBlock().run()" v-tooltip:bottom="'Code Block'"
                   :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faCode" />
            </v-btn>
            <v-btn size="small" class="bg-transparent" elevation="0" icon :active="editor?.isActive('subscript')"
                   @click="editor.chain().focus().toggleSubscript().run()" v-tooltip:bottom="'Subscript'"
                   :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faSubscript" />
            </v-btn>
            <v-btn size="small" class="bg-transparent" elevation="0" icon :active="editor?.isActive('superscript')"
                   @click="editor.chain().focus().toggleSuperscript().run()" v-tooltip:bottom="'Superscript'"
                   :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faSuperscript" />
            </v-btn>
            <v-btn size="small" class="bg-transparent" elevation="0" icon @click="SetLink()" v-tooltip:bottom="'Create Link'"
                   :active="editor?.isActive('link')" :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faLink" />
            </v-btn>
                <v-btn size="small" class="bg-transparent" elevation="0" icon @click="editor?.chain().focus().unsetLink().run()" v-tooltip:bottom="'Remove Link'"
                   v-if="editor?.isActive('link')" :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faUnlink" />
            </v-btn>
            <v-divider vertical></v-divider>
            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn size="small" v-bind="props" class="bg-transparent" elevation="0" icon v-tooltip:bottom="'Font'"
                            :disabled="sourceShowing" :active="!!editor?.getAttributes('textStyle').fontFamily">
                        <v-icon>mdi-format-text-variant</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item @click="editor.chain().focus().unsetFontFamily().run()">
                        <v-list-item-title>Default</v-list-item-title>
                    </v-list-item>
                    <v-divider/>
                    <v-list-item v-for="font in fonts" :key="font" :title="font" :style="`font-family: ${font}`"
                                 @click="editor.chain().focus().setFontFamily(font).run()" :active="editor.isActive('textStyle', {fontFamily: font})"/>
                </v-list>
            </v-menu>
            <v-menu :close-on-content-click="false" @update:model-value="saveColor">
                <template v-slot:activator="{ props }">
                    <v-btn size="small" v-bind="props" class="bg-transparent" elevation="0" icon v-tooltip:bottom="'Color'"
                            :disabled="sourceShowing" :active="!!editor?.getAttributes('textStyle').color">
                        <!-- This icon composition is stupid, but I'm keeping it -->
                        <v-icon>mdi-format-color-text</v-icon>
                        <v-icon size="small" style="margin-left: -16px">mdi-color-helper</v-icon>
                        <v-spacer/>
                        <v-icon icon="mdi-square" :color="fontColor"/>
                    </v-btn>
                </template>
                <v-list class="pt-0">
                    <v-list-item>
                        <v-color-picker show-swatches hide-header hide-title :swatches="swatches" v-model="fontColor" @update:model-value="colorToSave = fontColor; editor.chain().focus().setColor(fontColor).run();"/>
                    </v-list-item>
                    <v-divider/>
                    <v-list-item title="No Color" @click="fontColor=null; editor.chain().focus().unsetColor().run();" append-icon="mdi-cancel"/>
                </v-list>
            </v-menu>
            <v-menu :close-on-content-click="false" @update:model-value="saveColor">
                <template v-slot:activator="{ props }">
                    <v-btn size="small" v-bind="props" elevation="0" icon v-tooltip:bottom="'Highlight'"
                           :disabled="sourceShowing" :active="!!editor?.isActive('highlight')">
                        <v-icon icon="mdi-format-color-highlight"/>
                        <v-spacer/>
                        <v-icon :icon="highlightColor ? 'mdi-square' : 'mdi-square-outline'" :color="highlightColor"/>
                    </v-btn>
                </template>
                <v-list class="pt-0">
                    <v-list-item>
                        <v-color-picker show-swatches hide-header hide-title :swatches="swatches" v-model="highlightColor" @update:model-value="colorToSave = fontColor; editor.chain().focus().toggleHighlight({color: highlightColor}).run()"/>
                    </v-list-item>
                    <v-divider/>
                    <v-list-item title="Reset Highlight" @click="highlightColor=null; editor.chain().focus().unsetHighlight().run();" append-icon="mdi-cancel"/>
                </v-list>
            </v-menu>
            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn size="small" v-bind="props" class="bg-transparent" elevation="0" icon v-tooltip:bottom="'Text Size'"
                            :disabled="sourceShowing" :active="!!editor?.getAttributes('textStyle').fontSize">
                        <FontAwesomeIcon :icon="faTextHeight" />
                    </v-btn>
                </template>
                <v-list class="pt-0">
                    <v-list-item @click="editor.chain().focus().setFontSize('x-small').run()">
                        <v-list-item-title style="font-size: x-small">X-Small</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().setFontSize('small').run()">
                        <v-list-item-title style="font-size: small">Small</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().unsetFontSize().run()">
                        <v-list-item-title>Default</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().setFontSize('large').run()">
                        <v-list-item-title style="font-size: large">Large</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().setFontSize('x-large').run()">
                        <v-list-item-title style="font-size: x-large">X-Large</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn size="small" v-bind="props" class="bg-transparent" elevation="0" icon v-tooltip:bottom="'Heading'"
                            :disabled="sourceShowing" :active="editor?.isActive('heading')">
                        <FontAwesomeIcon :icon="faHeader" />
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item @click="editor.chain().focus().toggleHeading({ level: 4 }).run()">
                        <v-list-item-title>Paragraph</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().toggleHeading({ level: 1 }).run()">
                        <v-list-item-title><h1>Heading 1</h1></v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().toggleHeading({ level: 2 }).run()">
                        <v-list-item-title><h2>Heading 2</h2></v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().toggleHeading({ level: 3 }).run()">
                        <v-list-item-title><h3>Heading 3</h3></v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-divider vertical></v-divider>
            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn size="small" v-bind="props" class="bg-transparent" elevation="0" icon v-tooltip:bottom="'Text Align'"
                            :disabled="sourceShowing" :active="!!editor?.getAttributes('textStyle').textAlign">
                        <FontAwesomeIcon :icon="faAlignLeft" />
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item @click="editor.chain().focus().setTextAlign('left').run()">
                        <v-list-item-title><FontAwesomeIcon :icon="faAlignLeft" /> Left</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().setTextAlign('center').run()">
                        <v-list-item-title><FontAwesomeIcon :icon="faAlignCenter" /> Center</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().setTextAlign('right').run()">
                        <v-list-item-title><FontAwesomeIcon :icon="faAlignRight" /> Right</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().setTextAlign('justify').run()">
                        <v-list-item-title><FontAwesomeIcon :icon="faAlignJustify" /> Justify</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-btn size="small" class="bg-transparent" elevation="0" :active="editor?.isActive('bulletList')"
                   @click="editor.chain().focus().toggleBulletList().run()" icon v-tooltip:bottom="'Bullet List'"
                   :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faList" />
            </v-btn>
            <v-btn size="small" class="bg-transparent" elevation="0" :active="editor?.isActive('orderedList')"
                   @click="editor.chain().focus().toggleOrderedList().run()" icon v-tooltip:bottom="'Ordered List'"
                   :disabled="sourceShowing">
                <FontAwesomeIcon :icon="faListOl" />
            </v-btn>
            <v-divider vertical></v-divider>
            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn size="small" v-bind="props" class="bg-transparent" elevation="0" icon v-tooltip:bottom="'Table'"
                           :disabled="sourceShowing">
                        <FontAwesomeIcon :icon="faTable" />
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()">
                        <v-list-item-title>Insert</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().addColumnBefore().run()">
                        <v-list-item-title>Column Before</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().addColumnAfter().run()">
                        <v-list-item-title>Column After</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().addRowBefore().run()">
                        <v-list-item-title>Row Before</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="editor.chain().focus().addRowAfter().run()">
                        <v-list-item-title>Row After</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-divider vertical></v-divider>
            <v-btn size="small" class="bg-transparent" elevation="0" :active="sourceShowing"
                   @click="sourceShowing ? hideSource() : showSource()" icon v-tooltip:bottom="'Show/Hide Source'">
                <FontAwesomeIcon :icon="faFileCode" />
            </v-btn>
            <v-divider vertical></v-divider>
            <!-- <v-btn size="small" class="bg-transparent" elevation="0" @click="AddCustomSpan('donot-flair')">
        <FontAwesomeIcon :icon="faCircleStop" class="mr-1" /> Do Not Flair
    </v-btn>
    <v-divider vertical></v-divider> -->

            <v-spacer />
            <v-btn v-if="isEntryEditing" color="success" variant="outlined" class="mx-1" elevation="0" size="small"
                   @click="SaveEntry()" :loading="saveLoading" v-tooltip:bottom="'Save'">
                <FontAwesomeIcon :icon="faSave" style="margin-right: 4px;"/> Save
            </v-btn>
            <v-btn @click="StopEditEntry" v-if="isEntryEditing" variant="outlined" size="small" class="mx-1"
                   elevation="0" color="danger" v-tooltip:bottom="'Cancel Edit'">
                <FontAwesomeIcon :icon="faClose" style="margin-right: 4px;"/> Cancel
            </v-btn>
        </v-toolbar>
        <editor-content :editor="editor" class="editor-entry" />
    </v-container>
    <v-container v-if="!isLoading && isEntryExpanded && !isEntryEditing" :fluid="true" class="pa-2 entry-cell"
            v-observe-visibility="onVisibilityChange" :class="{ 'summary-cell': incomingProps.summary }">
        <v-container fluid class="editor-entry" ref="entryContent">
            <FlairWrapper v-if="Flair.GetFlairActive && entry?.entry_data?.flaired_html && incomingProps.entities && (hasBeenSeen || visible)"
                          :templateText="entry?.entry_data?.flaired_html" :entities="incomingProps.entities" />
            <div v-else v-html="entry?.entry_data.html"></div>
        </v-container>
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, watch, useTemplateRef } from 'vue';
import { useFlairStore, usePUT_APIStore, usePopularityStore, usePOST_APIStore, useDialogStore } from '@/stores';
import FlairWrapper from '@/components/Flair/FlairWrapper.vue';
import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TableKit, Table, TableCell, TableHeader } from '@tiptap/extension-table'
import { TextStyleKit} from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import FileHandler from '@tiptap/extension-file-handler'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextAlign from '@tiptap/extension-text-align'
import JournalToolbar from '../JournalToolbar.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUnlink, faSave, faClose, faBold, faItalic, faRedo, faUndo, faUnderline, faStrikethrough, faCode, faSubscript, faSuperscript, faLink, faHeader, faTable, faList, faListOl, faTextHeight, faAlignLeft, faAlignRight, faAlignCenter, faAlignJustify, faFileCode } from '@fortawesome/free-solid-svg-icons'
import { NewEntry } from '../../../models';
import { useStorage } from '../../../storage/storage';
import { useDebounceFn, useTextSelection } from '@vueuse/core'
import type { EditorView } from '@tiptap/pm/view';
import { useFloating } from '@floating-ui/vue';
import { Placeholder } from "@tiptap/extension-placeholder"
import {Extension} from "@tiptap/core"
import { Fragment, Node, Slice } from '@tiptap/pm/model';
import { DOMParser as pmParser } from '@tiptap/pm/model';
import colors from "vuetify/util/colors"

const Flair = useFlairStore()
const API_PUT = usePUT_APIStore()
const API_POST = usePOST_APIStore()
const Popularity = usePopularityStore()
const Dialog = useDialogStore()
const storage = useStorage()
const editDebounce = useDebounceFn(() => true, 1000)
const addEntityDebounce = useDebounceFn(() => true, 500)
const selectionState = useTextSelection()

const emit = defineEmits(['edit', 'delete', 'newentry'])
let incomingProps = defineProps(['source', 'entities', 'editing', 'expanded', 'summary', 'isNotModal'])
let isLoading = ref(true)
let entry = reactive(incomingProps.source)
let editor = ref()
let isEntryEditing = ref(incomingProps.editing)
let isEntryExpanded = ref(incomingProps.expanded)
let modifiedDateOnEdit: any = null
const colorToSave = ref(null)

const floatingCreateEntity = ref(null)
const textSelectionVirtualElement = ref(null)
const { floatingStyles } = useFloating(textSelectionVirtualElement, floatingCreateEntity)
const entryContent = useTemplateRef('entryContent')
const fontColor = ref(null)
const highlightColor = ref(null)
const fonts = [
    "Arial",
    "Courier New",
    "Georgia",
    "Lucida Sans Unicode",
    "Tahoma",
    "Times New Roman",
    "Trebuchet MS",
    "Veranda",
    "Inter",
    "Comic Sans MS, Comic Sans",
    "serif",
    "monospace",
    "cursive",
]
const swatches = ref<any[][]>([[]])
const visible = ref(false)
const hasBeenSeen = ref(false)
const saveLoading = ref(false)
const sourceShowing = ref(false)

const ImportedStyles = Extension.create({
    name: "importedStyles",
    priority: 1, //go first?
    addGlobalAttributes() {
        return [{
            // Extend the following extensions these names come from the source code
            // i.e. https://github.com/ueberdosis/tiptap/blob/main/packages/extension-text-align/src/text-align.ts#L55
            types: ["blockquote", "bulletList", "codeBlock", "document", "hardBreak", "heading", "horizontalRule",
                    "listItem", "orderedList", "paragraph", "bold", "code", "italic", "link", "strike", "underline",
                    "table", "tableCell", "tableRow", "tableHeader", "textAlign"],
            // this is for pasting in stuff from word/excel/etc... that has text/html with style attributes
            // by default tiptap/prosemirror will strip anything that was not defined and since there are a lot
            // of style options available we are going to just return everything instead
            attributes: {
                style: {
                    renderHTML: (attributes) => {
                        if (!attributes.style) {
                            return {}
                        }
                        return {
                            //remove any fonts as it causes issues with the non-editing view
                            style: attributes.style.replace(/font\-family(.*?);/g, ""),
                        }
                    },
                    parseHTML: (element) => element.getAttribute("style")
                }
            },
        }]
    }
})

onMounted(async () => {
    isLoading.value = false
    const hadStoredValue = await initEditor()
    if (hadStoredValue) {
        onEntryEdit()
    }
    if (entry.id == -1 && entry.parent_entry_id) {
        storage.setItem('unsubmittedEntryParent:' + entry.target_type + ':' + entry.target_id, entry.parent_entry_id)
    }
    Popularity.set_range(entry.popularity_count)

    //load any old color swatches
    await storage.getItem("editorColorSwatch").then((a: string) => {
        //if we have some set from before
        if (a) {
            swatches.value = JSON.parse(a)
        }
        //otherwise create some "dummy" entries
        else {
            swatches.value = [["#FFFFFF"],["#FFFFFF"],["#FFFFFF"],["#FFFFFF"],["#FFFFFF"]]
            //combine with default colors
            Object.keys(colors).map(key => {
                const color = colors[key]
                swatches.value.push(color.base ? [
                    color.base,
                    color.darken4,
                    color.darken3,
                    color.darken2,
                    color.darken1,
                    color.lighten1,
                    color.lighten2,
                    color.lighten3,
                    color.lighten4,
                    color.lighten5,
                ] : [
                    color.black,
                    color.white,
                    color.transparent,
                ])
            })
        }
    })
})

watch(
    () => incomingProps.expanded,
    () => {
        isEntryExpanded.value = incomingProps.expanded
    }
)

watch(
    () => Popularity.value,
    () => {
        if (entry.popularity_count <= Popularity.value[1] && entry.popularity_count >= Popularity.value[0]) {
            isEntryExpanded.value = true
        }
        else if (entry.popularity_count) {
            isEntryExpanded.value = false
        }
    }
)

watch(() => entry.entry_data.html, async () => {
    if (!isEntryEditing.value) {
        editor.value.commands.setContent(entry.entry_data.html)
    }
})

watch(selectionState.text, async () => {
    if (selectionState.text.value.length > 0 && entryContent.value?.$el.contains(selectionState.selection.value.focusNode)) {
        const success = await addEntityDebounce()
        if (success) {
            textSelectionVirtualElement.value = {
                getBoundingClientRect: () => selectionState.ranges.value[0].getBoundingClientRect(),
                getClientRects: () => selectionState.ranges.value[0].getClientRects()
            };
        }
    }
    else {
        textSelectionVirtualElement.value = null
    }
})


async function saveColor(opened: boolean) {
    if (!opened && colorToSave.value) {
        let addColor = true;
        //recently used colors are at the beginning 5 because it only shows 5 columns in the UI
        for (let i = 0; i < 5; i++) {
            //check if color exists
            if (swatches.value[i].includes(colorToSave.value)) {
                addColor = false
                break;
            }
        }
        if (addColor) {
            //insert the color at the beginning on the list i.e. [0][0]
            swatches.value[0].unshift(colorToSave.value)
            //each array should only have 2 so shift everything "down"
            //only want to keep a max of 10 
            for (let i = 0; i < 5; i++) {
                if (swatches.value[i].length > 2) {
                    //get last color to add to the next list unless its the last one
                    let c = swatches.value[i].pop()
                    if (i + 1 < 5) {
                        swatches.value[i + 1].unshift(c)
                    }
                }
            }
        }
        colorToSave.value = null
        //save swatches to storage
        storage.setItem('editorColorSwatch', JSON.stringify(swatches.value))
    }
}

function handlePaste(view: EditorView, event: ClipboardEvent, slice: Slice) {
    // do we have text/html data?
    if (!event.clipboardData.types.includes("text/html")) {
        return false
    }
    const html = event.clipboardData.getData('text/html')
    if (html == "") {
        return false
    }

    const schema = view.state.schema
    const parser = new DOMParser()
    const htmlDoc = parser.parseFromString(html, "text/html")

    //merge css styles with selectors
    for (let i = 0; i < htmlDoc.styleSheets.length; i++) {
        const sheet = htmlDoc.styleSheets[i]
        for (let j = 0; j < sheet.cssRules.length; j++) {
            const rule = sheet.cssRules[j]
            //if the rule doesn't have a selector text then do nothing
            if (rule.selectorText && rule.selectorText != "") {
                htmlDoc.querySelectorAll(rule.selectorText).forEach((e: HTMLElement) => {
                    //checking the the rule has any brackets from the css i.e. tr { color: red }
                    //if so remove them
                    const open = rule.cssText.indexOf("{")
                    const closed = rule.cssText.indexOf("}")
                    if (open != -1 && closed != -1) {
                        e.style.cssText += rule.cssText.substring(open + 1, closed)
                    }
                    else {
                        e.style.cssText += rule.cssText
                    }

                    //replace any bad html tags with valid ones
                    if (e.tagName == "FONT") {
                        //create new element
                        const clone = document.createElement("span")
                        //copy over any attributes
                        for (const attr of e.attributes) {
                            clone.setAttributeNS(null, attr.name, attr.value)
                        }
                        //copy over any child elements
                        while (e.firstChild) {
                            clone.appendChild(e.firstChild)
                        }
                        //replace old with new
                        e.replaceWith(clone)
                    }
                })
            }
        }
    }
    //find all spans with background-colors and make them marks
    htmlDoc.querySelectorAll("span").forEach((e: HTMLElement) => {
        if (e.style.background != "") {
            //create a new mark and set its background color
            const mark = document.createElement("mark")
            mark.style.background = e.style.background
            //clear the background color
            e.style.background = ""
            //copy over any child elements
            while (e.firstChild) {
                mark.appendChild(e.firstChild)
            }
            //add highlight to element
            e.appendChild(mark)
        }
    })

    //dompurify first?
    //build tiptap json content
    const content = pmParser.fromSchema(schema).parse(htmlDoc.body).toJSON()
    //convert json to prosemirror nodes and apply them in a transaction
    const nodes = Node.fromJSON(schema, content)
    const fragment = Fragment.from(nodes)
    const pastedSlice = new Slice(fragment, slice.openStart, slice.openEnd)
    const pasteTR = view.state.tr.replaceRange(
        view.state.selection.from,
        view.state.selection.to,
        pastedSlice
    )
    //update the current state with new html
    view.updateState(view.state.apply(pasteTR))

    //now get the current html and actually paste it
    editor.value.commands.insertContent(content)

    return true
}

function parseColWidth(element) {
    // Default column width parsing in the table plugin is buggy,
    // this is a modified version of the extension code until they fix it
    const colwidth = element.getAttribute('colwidth')
    const value = colwidth ? colwidth.split(',').map(width => parseInt(width, 10)) : null

    // if there is no colwidth attribute on the cell, try to get it from the colgroup
    if (!value) {
        const cols = element.closest('table')?.querySelectorAll('colgroup > col')
        const cellIndex = Array.from(element.parentElement?.children || []).indexOf(element)
        if (cellIndex != null && cellIndex > -1 && cols && cols[cellIndex]) {
            const colWidth = cols[cellIndex].style?.width
            return colWidth ? [parseInt(colWidth)] : null
        }
    }

    return value
}

async function initEditor() {
    const storageKey = 'editorContent' + ':' + entry.target_type + ':' + entry.target_id + ':' + entry.id
    const storageValue = await storage.getItem(storageKey)
    editor.value = new Editor({
        content: storageValue ? JSON.parse(storageValue) : entry.entry_data.html,
        onUpdate: async ({ editor }) => {
            if (isEntryEditing.value) {
                const isDebounced = await editDebounce()
                if (isDebounced) {
                    await storage.setItem(storageKey, JSON.stringify(editor.getJSON()))
                }
            }
        },
        extensions: [
            ImportedStyles,
            Placeholder.configure({
                placeholder: "Enter text here..."
            }),
            TextStyleKit, Superscript, Subscript, Highlight.configure({ multicolor: true }),
            StarterKit.configure({
                link: {
                    autolink: false,
                    openOnClick: false,
                    linkOnPaste: false,
                    defaultProtocol: 'https',
                    shouldAutoLink: () => false,
                    HTMLAttributes: {
                        target: null,
                    },
                }
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TableKit.configure({
                table: {  resizable: true, renderWrapper: true },
                tableCell: false,
                tableHeader: false
            }),
            TableCell.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        colwidth: {
                            default: null,
                            parseHTML: parseColWidth
                        }
                    }
                }
            }),
            TableHeader.extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        colwidth: {
                            default: null,
                            parseHTML: parseColWidth
                        }
                    }
                }
            }),
            Image.configure({
                allowBase64: true,
                resize: {
                    enabled: true,
                    minWidth: 50,
                    minHeight: 50,
                    alwaysPreserveAspectRatio: true,
                },
            }),
            FileHandler.configure({
                allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'image/apng', 'image/avif'],
                onDrop: (currentEditor, files, pos) => {
                    files.forEach(file => {
                        const fileReader = new FileReader()

                        fileReader.readAsDataURL(file)
                        fileReader.onload = () => {
                            currentEditor.chain()
                                .insertContentAt(pos, {
                                    type: 'image',
                                    attrs: {
                                        src: fileReader.result,
                                    },
                                })
                                .focus()
                                .run()
                        }
                    })
                },
                onPaste: (currentEditor, files, htmlContent) => {
                    //sometimes images are copied with html content and then duplicate images are created
                    //also some copy/pastes from excel will also create an image
                    if (htmlContent) {
                        return false
                    }

                    files.forEach(file => {
                        const fileReader = new FileReader()

                        fileReader.readAsDataURL(file)
                        fileReader.onload = () => {
                            currentEditor.chain()
                                .insertContentAt(currentEditor.state.selection.anchor, {
                                    type: 'image',
                                    attrs: {
                                        src: fileReader.result,
                                    },
                                })
                                .focus()
                                .run()
                        }
                    })
                },
            })
        ],
        editorProps: {
            handlePaste: handlePaste
        },
        onSelectionUpdate({editor}) {
            if (editor.isActive("highlight")) {
                highlightColor.value = editor.getAttributes("highlight").color;
            }
            else {
                highlightColor.value = null;
            }
            if (editor.getAttributes("textStyle").color) {
                fontColor.value = editor.getAttributes("textStyle").color;
            }
            else {
                fontColor.value = null;
            }
        }
    })
    return storageValue
}

function onVisibilityChange(isVisible: boolean, entries: any,) {
    if (incomingProps.entities && (isVisible || visible.value)) {
        hasBeenSeen.value = true
    }
    visible.value = isVisible
}

function AddCustomSpan(newClass: string) {
    const { from, to } = editor.value.state.selection;
    const newSpanText = editor.value.state.doc.textBetween(from, to, '')
    editor.value.chain().focus().insertContent(
        {
            from: from,
            to: to
        },
        {
            updateSelection: true,
            type: 'span',
            attrs: {
                class: newClass,
            },
            content: [
                {
                    type: 'text',
                    text: newSpanText,
                },
            ],
        }).run();
}

async function SaveEntry() {
    const storageKey = 'editorContent' + ':' + entry.target_type + ':' + entry.target_id + ':' + entry.id
    if (sourceShowing.value) {
        hideSource()
    }
    saveLoading.value = true
    if (entry.id == -1) {
        const newEntry = new NewEntry("entry", { html: editor.value.getHTML() }, entry.owner, entry.parent_entry_id, parseInt(entry.target_id), entry.target_type)
        const resp = await API_POST.POST_CreateIRElement("/entry", newEntry)
        if (resp) {
            isEntryEditing.value = false
            saveLoading.value = false
            await storage.removeItem(storageKey)
            await storage.removeItem('unsubmittedEntryParent:' + entry.target_type + ':' + entry.target_id)
            emit('delete', -1)
            emit('newentry', resp)
        }
    }
    else {
        if (modifiedDateOnEdit != entry.modified) {
            // Someone else modified this entry while we were editing it
            Dialog.ToggleDialog('entry-edit-confirm', { entry, isEntryEditing, saveLoading, html: editor.value.getHTML() })
        }
        else {
            API_PUT.UpdateElementById('/entry', entry.id, { entry_data: { html: editor.value.getHTML() } })
                .then((v: any) => {
                    entry = v
                    storage.removeItem(storageKey)
                    storage.removeItem('unsubmittedEntryParent:' + entry.target_type + ':' + entry.target_id)
                    isEntryEditing.value = false
                }).finally(() => {
                    saveLoading.value = false
                })
        }
    }
}

function StopEditEntry() {
    if (entry.id == -1) {
        emit('delete', -1)
    }
    storage.removeItem('editorContent' + ':' + entry.target_type + ':' + entry.target_id + ':' + entry.id)
    storage.removeItem('unsubmittedEntryParent:' + entry.target_type + ':' + entry.target_id)
    if (sourceShowing.value) {
        hideSource()
    }
    isEntryEditing.value = false
    editor.value.commands.setContent(entry.entry_data.html)
}

function onEntryEdit() {
    isEntryEditing.value = true
    saveLoading.value = false
    modifiedDateOnEdit = entry.modified
}

function SetLink() {
    const previousUrl = editor.value.getAttributes('link').href
    const url = window.prompt('URL', previousUrl)

    // cancelled
    if (url === null) {
        return
    }
    // empty
    if (url === '') {
        editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
        return
    }
    // update link
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

function showSource() {
    editor.value.commands.setContent(`<textarea>${editor.value.getHTML()}</textarea>`)
    sourceShowing.value = true
}

function hideSource() {
    editor.value.commands.setContent(editor.value.getText())
    sourceShowing.value = false
}
</script>

<style>
.scot-theme-light .summary-cell {
    background-color: #fff9c4;
}

.scot-theme-dark .summary-cell {
    background-color: #404000;
}

.entry-cell p {
    margin-top: 0;
    margin-bottom: 1rem
}

.entry-cell pre {
    text-align: left;
    white-space: pre-wrap;
    tab-size: 4;
    padding: 1em;
    direction: ltr;
    border: 1px solid #c4c4c4;
    background: hsla(0,0%,70%,.1);
}

.entry-cell code {
    font-size: inherit;
    color: inherit;
    word-break: normal;
    word-wrap: break-word;
    background: hsla(0,0%,60%,.2);
}

.entry-cell ul {
    padding-left: 24px;
}

.entry-cell ol {
    padding-left: 24px;
}

.entity-create-menu {
    border: 1px solid gray;
    border-radius: 10px;
    padding: 4px;
    margin-top: 4px;
}

.tiptap p.is-editor-empty:first-child::before {
  color: #757575;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
<style lang="scss">
.entry-cell,.tiptap {
    /* Image styles for resizing */
    img {
        display: block;
    }

    [data-resize-handle] {
        position: absolute;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(255, 255, 255, 0.8);
        border-radius: 2px;
        z-index: 10;
        /* Corner handles */
        &[data-resize-handle='top-left'],
        &[data-resize-handle='top-right'],
        &[data-resize-handle='bottom-left'],
        &[data-resize-handle='bottom-right'] {
            width: 8px;
            height: 8px;
        }

        &[data-resize-handle='top-left'] {
            top: -4px;
            left: -4px;
            cursor: nwse-resize;
        }

        &[data-resize-handle='top-right'] {
            top: -4px;
            right: -4px;
            cursor: nesw-resize;
        }

        &[data-resize-handle='bottom-left'] {
            bottom: -4px;
            left: -4px;
            cursor: nesw-resize;
        }

        &[data-resize-handle='bottom-right'] {
            bottom: -4px;
            right: -4px;
            cursor: nwse-resize;
        }
    }

    [data-resize-state='true'] [data-resize-wrapper] {
        outline: 1px solid rgba(0, 0, 0, 0.25);
        border-radius: 0.125rem;
    }
    /* Table-specific styling */
    table {
        border-collapse: collapse;
        margin: 0;
        overflow: hidden;
        table-layout: fixed;
        width: 100%;

        td,
        th {
            border: 1px solid var(--gray-3);
            box-sizing: border-box;
            min-width: 1em;
            padding: 6px 8px;
            position: relative;
            vertical-align: top;

            > * {
                margin-bottom: 0;
            }
        }

        th {
            background-color: var(--gray-1);
            font-weight: bold;
            text-align: left;
        }

        .selectedCell:after {
            background: var(--gray-2);
            content: '';
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            pointer-events: none;
            position: absolute;
            z-index: 2;
        }

        .column-resize-handle {
            background-color: var(--purple);
            bottom: -2px;
            pointer-events: none;
            position: absolute;
            right: -2px;
            top: 0;
            width: 4px;
        }
    }

    .tableWrapper {
        margin: 1.5rem 0;
        overflow-x: auto;
    }

    &.resize-cursor {
        cursor: ew-resize;
        cursor: col-resize;
    }
}
</style>