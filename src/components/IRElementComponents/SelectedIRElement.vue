<template>
    <v-container :id="elementType + selectedElement.id + 'ElementPane'" fluid class="flex-column-noscroll pt-4">
        <v-row class="mb-n10 align-self-end flex-grow-0">
            <v-btn x-small icon @click="closeElement">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-row>
        <v-row class="flex-grow-0">
            <v-col class="pb-0">
                <MetaCard class="metaCard" v-if="selectedElement != null"> </MetaCard>
            </v-col>
        </v-row>

        <v-row class="scroll-child mt-0 flex-grow-0">
            <v-col class="flex-column-noscroll py-2">
                <v-tabs v-if="selectedElement !=null"
                        grow
                        dark
                        hide-slider
                        height="36px"
                        :class="{'dark-mode-contrast-tab': $vuetify.theme.dark}">
                    <v-tab v-for="item in tabs[elementType]"
                           :key="item"
                           :id="elementType + selectedElement.id + item + 'Tab'"
                           :class="{ activeTab: elementType !=null && panes[elementType].includes(item), 'd-flex justify-space-between': true }"
                           @click="tabClicked(item)"
                           @dblclick="panes[elementType] = [item]">
                        <span></span> <!-- This empty span needs to be here to center the tab title -->

                        <span>
                            <u v-if="elementType !=null && panes[elementType].includes(item)" class="mr-2">{{ item }}</u>
                            <span v-else class="mr-2">{{ item }}</span>
                            <v-badge v-if="item == 'Signatures'" :content="signatureCount()" />
                            <v-badge v-else-if="item == 'Guides'" :content="guidesCount()" />
                            <v-badge v-else-if="item == 'Entities'" :content="selectedElementEntityCount" />
                            <v-badge v-else-if="item == 'Files'" :content="selectedElement.file_count && selectedElement.file_count ? selectedElement.file_count : '0'" />
                        </span>

                        <v-btn icon v-if="elementType != null && panes[elementType].length > 1 && panes[elementType].includes(item) == true" @click="closeTab(item, $event)">
                            <v-icon>
                                mdi-close
                            </v-icon>
                        </v-btn>
                        <v-btn icon disabled v-else></v-btn>
                    </v-tab>
                </v-tabs>
                <v-progress-linear id="entitiesLoadingBar" class="pt-4 mt-2" v-if="entitiesLoaded==false && (elementType && ! noEntityTypes.includes(elementType))"
                                   indeterminate
                                   color="blue darken-2">
                    <template v-slot:default>
                        <strong> Retrieving Element Entities </strong>
                    </template>
                </v-progress-linear>
                <div hidden id="entitiesLoaded" v-else> </div>

                <splitpanes v-if="selectedElement!=null" class="default-theme scroll-child">
                    <pane id="pane" v-for="i in tabs[elementType].filter((t) => panes[elementType].includes(t))" :key="i">
                        <keep-alive>
                            <component v-bind:is="componentMap[i]" v-if="elementPaneHeight !=null"
                                       :class="{ 'scroll-child': i != 'Alerts', 'flex-column-noscroll': i == 'Alerts' }"></component>
                        </keep-alive>
                    </pane>
                </splitpanes>
            </v-col>
        </v-row>

        <v-menu :value="flairMenuVisible"
                :position-x="flairMenuX"
                :position-y="flairMenuY"
                @input="closeFlairMenu"
                absolute
                offset-y>
            <v-list>
                <v-list-item @click="onFlairDialogShow()">
                    <v-list-item-title>Add to Flair Modal</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </v-container>
</template>

<script lang="ts">
    import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
    import { Splitpanes, Pane } from 'splitpanes'
    import 'splitpanes/dist/splitpanes.css'
    import MetaCard from '@/components/IRElementComponents/MetaCard.vue'
    import InboxNavDrawer from '@/components/InboxComponents/InboxNavDrawer.vue'
    import ScotNavBar from '@/components/NavigationComponents/ScotNavBar.vue'
    import Journal from '@/components/JournalComponents/Journal.vue'
    import { Getter, Action } from 'vuex-class';
    import SignaturesPane from '@/components/PaneComponents/SignaturesPane.vue'
    import EditSignaturePane from '@/components/PaneComponents/EditSignaturePane.vue'
    import EditFeedPane from '@/components/PaneComponents/EditFeedPane.vue'
    import SignatureBodyPane from '@/components/PaneComponents/SignatureBodyPane.vue'
    import AlertTablePaneVuetify from '@/components/PaneComponents/AlertTablePaneVuetify.vue'
    import GuidesPane from '@/components/PaneComponents/GuidesPane.vue'
    import EntitiesPane from '@/components/PaneComponents/EntitiesPane.vue'
    import FilesPane from '@/components/PaneComponents/FilesPane.vue'
    import EditPivotPane from '@/components/PaneComponents/EditPivotPane.vue'
    import SignatureStatsPane from '@/components/PaneComponents/SignatureStatsPane.vue'
    import EntityAppearancesPane from '@/components/PaneComponents/EntityAppearancesPane.vue'
    import EditEntityClassPane from '@/components/PaneComponents/EditEntityClassPane.vue'
    import PromotedAlertsPane from '@/components/PaneComponents/PromotedAlertsPane.vue'
    import EditIncidentPane from '@/components/PaneComponents/EditIncidentPane.vue'
    import { IRElement, IRElementType, IRElementMeta, Entry, NewEntry, Entity } from '@/store/modules/IRElements/types'
    const namespace: string = 'IRElements';
    @Component({
        components: {
            Splitpanes,
            Pane,
            MetaCard,
            ScotNavBar,
            InboxNavDrawer,
            Journal,
            SignaturesPane,
            EditSignaturePane,
            SignatureBodyPane,
            SignatureStatsPane,
            GuidesPane,
            EntitiesPane,
            AlertTablePaneVuetify,
            EntityAppearancesPane,
            FilesPane,
            EditFeedPane,
            EditPivotPane,
            EditEntityClassPane,
            PromotedAlertsPane,
            EditIncidentPane
        },
    })

    export default class SelectedIRElement extends Vue {

        @Getter('elementType', { namespace }) elementType: IRElementType | null;
        @Getter('elementTypePluralized', { namespace }) elementTypePluralized: IRElementType | null;
        @Getter('isAlertGroupElementType', { namespace }) isAlertGroupElementType: boolean;
        @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
        @Action('retrieveElementList', { namespace }) retrieveElementList: any;
        @Getter('elementList', { namespace }) elementList: Array<IRElementMeta> | null;
        @Getter('selectedElementEntries', { namespace }) selectedElementEntries: Array<Entry | NewEntry> | null;
        @Getter('selectedElementFlairedEntities', { namespace }) selectedElementFlairedEntities: Array<any>;
        @Getter('flairDialog', { namespace }) flairDialog: boolean
        @Getter('flairMenuVisible', { namespace }) flairMenuVisible: boolean
        @Getter('flairMenuX', { namespace }) flairMenuX: number
        @Getter('flairMenuY', { namespace }) flairMenuY: number
        @Getter('flairMenuEntity', { namespace }) flairMenuEntity: Entity | null
        @Action('closeFlairMenu', { namespace }) closeFlairMenu: CallableFunction
        @Action('addFlairedEntity', { namespace }) addFlairedEntity: CallableFunction
        @Action('flairDialogSetToTrue', { namespace }) flairDialogSetToTrue: CallableFunction;
        @Getter('entitiesLoaded', { namespace }) entitiesLoaded: boolean
        @Action('setElementPaneHeight', { namespace }) setElementPaneHeight: CallableFunction;
        @Getter('selectedElementEntityCount', { namespace }) selectedElementEntityCount: CallableFunction;
        @Getter('elementPaneHeight', { namespace }) elementPaneHeight: boolean

        @Prop({ default: null }) paneHeight: number


        noEntityTypes: Array<IRElementType> = [IRElementType.Pivot, IRElementType.EntityClass]
        //Methods
        tabs: { [key in IRElementType]?: Array<string> } = {
            [IRElementType.Alertgroup]: ["Alerts", "Signatures", "Guides", "Entities"],
            [IRElementType.Event]: ["Journal", "Promoted Alerts", "Entities", "Files"],
            [IRElementType.Signature]: ["Journal", "Signature Properties", "Signature Body"],
            [IRElementType.Incident]: ["Journal", "Incident Details", "Entities", "Files"],
            [IRElementType.Intel]: ["Journal", "Entities", "Files"],
            [IRElementType.Product]: ["Journal", "Entities", "Files"],
            [IRElementType.Dispatch]: ["Journal", "Entities"],
            [IRElementType.Entity]: ["Journal", "Entity Appearances"],
            [IRElementType.Feed]: ["Feed Properties", "Journal"],
            [IRElementType.Guide]: ["Journal", "Signatures", "Entities"],
            [IRElementType.Pivot]: ["Pivot Properties"],
            [IRElementType.EntityClass]: ["Entity Class Properties"],
            [IRElementType.Entry]: ["Journal"],
            [IRElementType.VulnFeed]: ["Journal", "Entities", "Files"],
            [IRElementType.VulnTrack]: ["Journal", "Entities", "Files"],
        }
        componentMap: Record<string, string> = {
            "Alerts": "AlertTablePaneVuetify",
            "Guides": "GuidesPane",
            "Journal": "Journal",
            "Signatures": "SignaturesPane",
            "Signature Properties": "EditSignaturePane",
            "Signature Body": "SignatureBodyPane",
            "Entities": "EntitiesPane",
            "Entity Appearances": "EntityAppearancesPane",
            "Files": "FilesPane",
            "Signature Insights": "SignatureStatsPane",
            "Feed Properties": "EditFeedPane",
            "Pivot Properties": "EditPivotPane",
            "Entity Class Properties": "EditEntityClassPane",
            "Promoted Alerts": "PromotedAlertsPane",
            "Incident Details": "EditIncidentPane"
        }

        dialog = false

        panes: { [key in IRElementType]: Array<string> } = {
            [IRElementType.Alertgroup]: ["Alerts"],
            [IRElementType.Event]: ["Journal"],
            [IRElementType.Intel]: ["Journal"],
            [IRElementType.File]: ["File"],
            [IRElementType.Product]: ["Journal"],
            [IRElementType.Incident]: ["incidents", "Journal", "Incident Details"],
            [IRElementType.Dispatch]: ["Journal"],
            [IRElementType.Alert]: ["alerts"],
            [IRElementType.Guide]: ["guides", "Journal", "Signatures"],
            [IRElementType.Signature]: ["Journal", "Signature Properties"],
            [IRElementType.ThreatModelItem]: ["threat_model_items"],
            [IRElementType.Link]: ["link"],
            [IRElementType.Entity]: ["Journal"],
            [IRElementType.Entry]: ["entry", "Journal"],
            [IRElementType.Feed]: ["Feed Properties", "Journal"],
            [IRElementType.Pivot]: ["Pivot Properties"],
            [IRElementType.EntityClass]: ["Entity Class Properties"],
            [IRElementType.VulnFeed]: ["Journal"],
            [IRElementType.VulnTrack]: ["Journal"],
        }

        async mounted() {
            this.$root.$on('recalcSize', async () => {
                await this.calculatePaneSize('pane')
            })
            // If the user is navigating to an entry, scroll to it once it loads
            if (this.$route.params.entryId != undefined && this.$route.params.entryId != null) {
                this.$root.$once('entryLoaded' + this.$route.params.entryId.toString(), () => this.$root.$emit('scrollToEntry' + this.$route.params.entryId.toString()))
            }
            else if (this.$router.currentRoute.meta?.itemType == IRElementType.Entry && this.$route.params.id) {
                this.$root.$once('entryLoaded' + this.$route.params.id.toString(), () => this.$root.$emit('scrollToEntry' + this.$route.params.id.toString()))
            }
        }

        signatureCount(){
            if(this.selectedElement && this.selectedElement.associated_sig_guide_map){
                return Object.keys(this.selectedElement.associated_sig_guide_map).length
            }
            else if (this.selectedElement?.linkedElements) {
                return this.selectedElement.linkedElements.Signature.length
            }
            else{
                return 0
            }
        }

        guidesCount(){
            if(this.selectedElement && this.selectedElement.associated_sig_guide_map){
                let size = 0
                for (var sig of Object.keys(this.selectedElement.associated_sig_guide_map))
                {
                    const key = Number(sig)
                    size += this.selectedElement.associated_sig_guide_map[key].length
                }
                return size
            }
            else{
                return 0
            }
        }
        timeout(ms: number) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        async calculatePaneSize(id: string) {
            await this.timeout(1000) // Need about a second delay before we begin resizing on mounted

            let top = document.getElementById(id)?.getBoundingClientRect().top
            let bottom = window.innerHeight
            if (top) {
                const paneSize = (bottom - top) - 50
                await this.setElementPaneHeight({ paneHeight: paneSize })

            }
            else {
                console.log('pane size is undefined')
            }
        }

        @Watch('selectedElementEntries')
        async onPropertyChanged(oldSelectedElementEntries: any, newSelectedElementEntries: any) {
            if (newSelectedElementEntries.length > 0) {
                if (newSelectedElementEntries[newSelectedElementEntries.length - 1].id == -1) {
                    await this.$nextTick() // We use this to wait for the new editor entry to fully render in the DOM
                    var journalPane = this.$el.querySelector('#Journal')
                    if (journalPane != null) {
                        journalPane.scrollTop = journalPane.scrollHeight
                    }
                }
            }
        }

        // Scroll to entry if we navigated to one, also open journal if necessary
        @Watch('$route')
        async onUrlChange(newVal: any, oldVal: any) {
            if ((newVal?.params.entryId != undefined && newVal?.params.entryId != null) || (this.elementType == IRElementType.Entry && newVal?.params.id)) {
                const newEntryId = this.elementType == IRElementType.Entry ? newVal?.params.id : newVal?.params.entryId
                this.$root.$emit('scrollToEntry' + newEntryId.toString())
                // Emit event again when entry loads if it probably hasn't yet
                if (oldVal == undefined || oldVal.params.id != newVal?.params.id || (this.elementType != null && !this.panes[this.elementType].includes("Journal"))) {
                    this.$root.$once('entryLoaded' + newEntryId.toString(), () => this.$root.$emit('scrollToEntry' + newEntryId.toString()))
                }
                if (this.elementType != null && !this.panes[this.elementType].includes("Journal")) {
                    this.panes[this.elementType].push("Journal")
                }
            }
        }

        tabClicked(item: string) {
            if (this.elementType != null) {

                if (! this.panes[this.elementType].includes(item)) {
              
                    this.panes[this.elementType].push(item)
                    
                }
                
            }
        }

        closeTab(item: string, e:any){
            e.stopPropagation()
            if (this.elementType != null) {
                const index = this.panes[this.elementType].findIndex((t:any) => t==item)
                if (index != -1){
             
                    this.panes[this.elementType].splice(index,1)
                }
                
            }
        }

        async closeElement() {
            let newRouteString = this.elementType == IRElementType.Entry ? "/tasks" : "/" + this.elementTypePluralized?.toLowerCase()
            this.$router.push(newRouteString).catch((err: any) => { return })
        }

        async onFlairDialogShow() {
            await this.flairDialogSetToTrue()
            await this.addFlairedEntity({ entity: this.flairMenuEntity })
        }
    }
</script>

<style scoped>
    .flex-column-noscroll {
        height: 100%;
        display: flex;
        flex-direction: column;
    }
    
    .scroll-child {
        max-height: 100%;
        overflow-y: auto;
    }

    /* Make the tab bar a little lighter in dark mode */
    /deep/ .dark-mode-contrast-tab .v-tabs-bar {
        background-color: #505050;
    }

    .activeTab {
        background-color: #505050 !important;
    }

    .dark-mode-contrast-tab .activeTab {
        background-color: #808080 !important;
    }

    /* Override "primary" color to make selections look nicer */
    .v-application .theme--light .primary--text .v-tab {
        color: #2c3e50;
    }

    .v-application .theme--dark .primary--text .v-tab {
        color: #adbfd2;
    }
</style>
