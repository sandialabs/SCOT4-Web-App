<template>
    <v-container class="pb-0" v-observe-visibility= "{callback: (isVisible,entry) => visibilityChanged(isVisible, entry, entryId)}" fluid>
        <div :class="{'tlp-red': entryTLP == 'red', 'tlp-amber': entryTLP == 'amber', 'tlp-green': entryTLP == 'green', 'tlp-amber-strict': entryTLP == 'amber_strict'}">
            <EntryCellViewSystemBar v-if="!entryEditMode" :linkedElementType=linkedElementType :linkedElementIndex=linkedElementIndex :linkedElementId=linkedElementId :entryId="entryId" :treePath=treePath @permissions-click="$emit('permissions-click', entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType))" @entry-entities-click="$emit('entry-entities-click', entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType))"></EntryCellViewSystemBar>
            <component class="entryView" v-show="!collapsed" v-if="!entryEditMode" v-bind:is="entryComponentMap[entryType]['view']" :linkedElementType=linkedElementType :linkedElementIndex=linkedElementIndex :linkedElementId=linkedElementId :entryId="entryId" :treePath=treePath ></component>
            <component class="entryEdit" v-show="!collapsed" v-else-if="entryEditMode" v-bind:is="entryComponentMap[entryType]['edit']" :entryId="entryId" :linkedElementType=linkedElementType :linkedElementIndex=linkedElementIndex :linkedElementId=linkedElementId :treePath=treePath></component>
        </div>
        <v-system-bar @click=onExpandEntries v-if="childEntries && childEntries.length > 0 && !repliesExpanded">
            <v-icon>mdi-arrow-right </v-icon>
            See ({{childEntries.length}}) replies
        </v-system-bar>
        <v-container fluid class="py-0" v-else-if="childEntries && childEntries.length > 0 && repliesExpanded">
            <v-system-bar @click=onExpandEntries  >
                <v-icon>mdi-arrow-down </v-icon>
                Showing ({{childEntries.length}}) replies
            </v-system-bar>
            <EntryCell v-for="childEntry in childEntries"
                    :linkedElementType=linkedElementType
                    :linkedElementIndex=linkedElementIndex
                    :linkedElementId=linkedElementId
                    :treePath="treePath + '|' + entryId"
                    :entryId="childEntry.id"
                    :entryType="childEntry.entry_class"
                    :key=childEntry.id
                    @permissions-click="$emit('permissions-click', childEntry)"
                    @entry-entities-click="$emit('entry-entities-click', $event)">
            </EntryCell>
        </v-container>
    </v-container>
</template>






<script lang="ts">
import { Component, Vue, Prop, Watch} from 'vue-property-decorator'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, EntryClassEnum } from '@/store/modules/IRElements/types'
import WYSIWYGCellView from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/WYSIWYGCellView.vue'
import WYSIWYGCellEdit from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/WYSIWYGCellEdit.vue'
import ActionCellEdit from '@/components/JournalComponents/EntryCellComponents/ActionCell/ActionCellEdit.vue'
import ActionCellView from '@/components/JournalComponents/EntryCellComponents/ActionCell/ActionCellView.vue'
import PromotedCellView from '@/components/JournalComponents/EntryCellComponents/PromotedCell/PromotedCellView.vue'
import SummaryCellView from '@/components/JournalComponents/EntryCellComponents/SummaryCell/SummaryCellView.vue'
import EntryCellViewSystemBar from '@/components/JournalComponents/EntryCellComponents/EntryCellViewSystemBar.vue'
import FlairComponent from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/FlairPlugin/FlairComponent.vue'

import Vuetify from 'vuetify/lib'

const namespace: string = 'IRElements';

@Component({
  name: 'EntryCell',
  components: {
    WYSIWYGCellView,
    WYSIWYGCellEdit,
    ActionCellView,
    ActionCellEdit,
    PromotedCellView,
    SummaryCellView,
    EntryCellViewSystemBar,
    },
})

export default class EntryCell extends Vue{
    
    @Prop() entryId: number;
    @Prop({default:""}) treePath: string;
    @Prop() entryType: EntryClassEnum
    @Prop({default: null}) linkedElementType:IRElementType|null
    @Prop({default: null}) linkedElementId: number|null
    @Prop({default: null}) linkedElementIndex: number|null 
    @Getter('entryEditModeById', { namespace }) entryEditModeById: CallableFunction
    @Getter('entryById', { namespace }) entryById: CallableFunction
    @Action('toggleExpandEntry', { namespace }) toggleExpandEntry: CallableFunction
    @Getter('entitiesLoaded', { namespace }) entitiesLoaded: boolean
    @Getter('selectedElementEntities', { namespace }) selectedElementEntities: Record<string, Record<string, any>>
    @Action('addFlairedEntity', { namespace }) addFlairedEntity: CallableFunction
    @Action('openFlairMenu', { namespace }) openFlairMenu: CallableFunction
    @Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
    
    
    entryComponentMap: Record<string, Record<string, string>> = {
        "entry": { "view": "WYSIWYGCellView", "edit": "WYSIWYGCellEdit" },
        "task": { "view": "WYSIWYGCellView", "edit": "WYSIWYGCellEdit" },
        "promotion": { "view": "PromotedCellView" },
        "summary": { "view": "WYSIWYGCellView", "edit": "WYSIWYGCellEdit" },
        "action": { "view": "ActionCellView", "edit": "ActionCellEdit" },
    }

    visible: boolean = false
    flairLoaded: boolean = false
    async visibilityChanged(isVisible: any, entry: any, entryId: any) {
        this.visible = isVisible
        if (this.flairLoaded == false && this.visible == true && this.entitiesLoaded == true) {
            await this.flairProcedure()
            this.flairLoaded = true

        }
    }

    get entryTLP() {
        return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).tlp
    }

    get entryEditMode() {
        return this.entryEditModeById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType)
    }

    get childEntries() {
        return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).childEntries
    }

    get repliesExpanded() {
        return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).repliesExpanded
    }

    get collapsed() {
        return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).collapsed
    }

    async mounted() {
        if (this.entryId == -1) {
            // We need to actually wait for the browser to render before we scroll (dumb, but it works)
            // See https://github.com/vuejs/vue/issues/9200
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.$el.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" });
                    const textarea = this.$el.querySelector("div[contenteditable='true']") as HTMLElement
                    textarea.focus({ preventScroll: true })  // Don't scroll on focus so that the scroll from scrollIntoView is better
                })
            })
        }
        this.$root.$on('scrollToEntry' + this.entryId.toString(), () => {
            this.$el.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" })
        })
        this.$root.$on('highlightEntry' + this.entryId.toString(), () => {
            // This selects the very first child of this component (in this case, the actual entry component)
            // Looks better, but is sorta brittle, check to see that this still works if you change component ordering
            const element = (this.$el.firstElementChild as HTMLElement)
            element.style.animation = 'highlight .8s'
            setTimeout(function () {
                element.style.animation = 'unset'
            }, 800)
        })
        this.$root.$emit('entryLoaded' + this.entryId.toString())
    }

    @Watch('entitiesLoaded')
    async onEntitiesLoaded(newVal: any) {
        await this.$nextTick()
        if (newVal == true && this.visible == true) {
            await this.flairProcedure()
            this.flairLoaded = true
        }

    }

    async flairProcedure() {
        const elements = this.$el.getElementsByClassName('entityFlair')
        for (const element of elements) {
            const value = element.getAttribute('value')
            const type = element.getAttribute('type')

            // eslint-disable-next-line
            let children: any = null
            if (element != null) {
                children = element.getAttribute('children')
                children = JSON.parse(children)
            }

            if (children != null && children.length > 0) {
                children = children.map((child: any) => this.selectedElementEntities[child.type][child.value])
            }
            else {
                children = []
            }

            const entity = this.selectedElementEntities[String(type)][String(value)]
            if (entity == undefined) {
                console.log('HERE IS UNDEFINED ENTITY')
                console.log(type)
                console.log(value)
                console.log(this.selectedElementEntities[String(type)])
            }
            const FlairComponentView = Vue.extend(FlairComponent)
            FlairComponentView.use(Vuetify)
            const component = new FlairComponentView({
                propsData: {
                    entity: entity,
                    vuetify: this.$vuetify,
                    addFlairedEntity: this.addFlairedEntity,
                    children: children,
                    openFlairMenu: this.openFlairMenu
                },
            }).$mount()
            element.appendChild(component.$el)

        }

    }

    async onExpandEntries() {
        await this.toggleExpandEntry({ entryId: this.entryId, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementIndex: this.linkedElementIndex })
    }
}
</script>

<style scoped>
    .tlp-amber {
        border: 5px solid orange;
        border-radius: 5px;
    }

    .tlp-amber-strict {
        border-radius: 5px;
        border: 4px solid orange;
        box-shadow: 0 0 2px 1px red;
        margin: 1px;
    }

    .tlp-red {
        border: 5px solid red;
        border-radius: 5px;
    }

    .tlp-green {
        border: 5px solid green;
        border-radius: 5px;
    }
</style>

<style>
    @keyframes highlight {
        from {
            box-shadow: 0 0 4px 1px red;
        }

        to {
            box-shadow: 0;
        }
    }
</style>
