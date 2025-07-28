<template>
    <splitpanes @resized="onResize" class="default-theme" horizontal>
        <pane :size="queueTablePaneSize">
            <modal @closed="onFlairModalClosed()" :minHeight="350" :minWidth="500" width="40%" :height="$vuetify.breakpoint.xlOnly ? '700px':'500px'" class="flairModal" classes="flairModalDialog" resizable adaptive draggable=".windowHeader" :shiftX=.5 :shiftY=1 name="flairModal">
                <v-card flat class="flex-column-noscroll">
                    <v-row dense class="windowHeader black align-center flex-grow-0">
                        <v-col>
                            <v-icon color="white">mdi-arrow-all</v-icon>
                        </v-col>
                        <v-spacer></v-spacer>
                        <v-col class="align-self-end text-right">
                            <v-btn dense @click="flairDialogSetToFalse()" icon>
                                <v-icon small color="red">mdi-close</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                    <v-tabs v-model="tab" :background-color="$vuetify.theme.dark ? 'blue-grey darken-4' : 'purple lighten-5'" height="40px" class="flex-grow-0">
                        <v-tab v-for="entity in selectedElementFlairedEntities" class="text-subtitle-2" :key=entity.id>
                            <span class="flairTabText">{{entity.value}}</span>
                            <v-btn icon @click.prevent="removeFlairedEntityTab(entity)" class="ml-2"><v-icon x-small>mdi-close</v-icon></v-btn>
                        </v-tab>
                    </v-tabs>
                    <v-tabs-items v-model="tab" :class="$vuetify.theme.dark ? 'px-2 child-noscroll flex-grow-1 blue-grey darken-4' : 'px-2 child-noscroll flex-grow-1 purple lighten-5'">
                        <v-tab-item for v-for="entity in selectedElementFlairedEntities" :key=entity.id class="flex-column-noscroll">
                            <v-card class="pa-2" :color="$vuetify.theme.dark ? 'blue-grey darken-4' : 'purple lighten-5'" flat>
                                <v-row dense>
                                    <v-col cols="auto">
                                        <router-link :to="'/entities/' + entity.id.toString()" class="text-h5">Entity {{ entity.id }}</router-link>
                                    </v-col>
                                    <v-col cols="auto">
                                        <v-select class="ma-0"
                                                  style="max-width: 10em"
                                                  v-model="entity.status"
                                                  :background-color="(entity.status == 'tracked' ? 'green' : 'red') + ($vuetify.theme.dark ? ' darken-3' : ' lighten-3')"
                                                  :items="trackedEntityItems"
                                                  @change="updateEntityTrackedStatus(entity.id, $event)"
                                                  dense
                                                  rounded
                                                  hide-details>
                                            <template v-slot:item="{ item, on, attrs }">
                                                <v-list-item :class="(item == 'tracked' ? 'green' : 'red') + ($vuetify.theme.dark ? ' darken-3' : ' lighten-3')" dense v-bind="attrs" v-on="on">
                                                    {{ item }}
                                                </v-list-item>
                                            </template>
                                        </v-select>
                                    </v-col>
                                </v-row>
                                <v-row class="ma-0">
                                    <span class="text-h6">{{ entity.type_name + ": " + entity.value}}</span>
                                    <v-btn small icon @click="copyTextToClipboard(entity.value)"><v-icon small>mdi-content-copy</v-icon></v-btn>
                                </v-row>
                                <v-row class="ma-0">
                                    <fieldset class="tag-source-group pa-1 mr-1">
                                        <legend class="mx-3 pa-0 mb-n2">Entity Classes</legend>
                                        <v-tooltip bottom v-for="icon in entity.classes" :key=icon.id>
                                            <template v-slot:activator="{ on }">
                                                <v-chip small class="pr-3">
                                                    <v-icon dense v-if="icon.icon" v-html="icon.icon" v-on="on">
                                                    </v-icon>
                                                    <span v-else v-on="on">{{icon.display_name}}</span>
                                                    <v-icon dense v-if="!removingEntityClass.find(a => a == icon.id)" @click="onEntityClassRemove(entity.id, icon.id)">
                                                        mdi-close
                                                    </v-icon>
                                                    <v-progress-circular small indeterminate v-else>
                                                    </v-progress-circular>
                                                </v-chip>
                                            </template>
                                            <span>{{ icon.description}}</span>
                                        </v-tooltip>
                                        <EntityClassComboBox :entityId="entity.id"></EntityClassComboBox>
                                    </fieldset>
                                    <fieldset class="tag-source-group pa-1">
                                        <legend class="mx-3 pa-0 mb-n2">Tags</legend>
                                        <v-tooltip v-for="tag in entity.tags" :key="tag.id" color="black" bottom>
                                            <template #activator="{ on }">
                                                <v-chip v-on="on" small close @click:close="removeTagById(tag.id, 'entity', entity.id)">
                                                    {{ tag.name }}
                                                </v-chip>
                                            </template>
                                            <span> Tag: {{ tag.description }}</span>
                                        </v-tooltip>
                                        <AddTagSourceDialog type="tag" :target="entity" v-model="entityTagsDialog"></AddTagSourceDialog>
                                        <v-tooltip color="black" bottom>
                                            <template #activator="{ on }">
                                                <v-chip small color="green" @click.stop="entityTagsDialog = true" v-on="on"><v-icon>mdi-plus</v-icon></v-chip>
                                            </template>
                                            <span> Add a new tag</span>
                                        </v-tooltip>
                                    </fieldset>
                                </v-row>
                            </v-card>
                            <FlairPane :key="entity.id" :entity="entity" style="max-height: 60%;" :class="$vuetify.theme.dark ? 'blue-grey darken-4 mb-2' : 'purple lighten-5 mb-2'"></FlairPane>
                            <v-card :class="{ lightModeBackground: !$vuetify.theme.dark, darkModeBackground: $vuetify.theme.dark, 'scroll-child': true }">
                                <v-btn dense small @click="addNewEntityEntry(entity.id)">Add Entry</v-btn>
                                <Journal :linkedElementType="'Entity'" :linkedElementId="entity.id" :linkedElementIndex="selectedElementEntityIndex(entity.id)" dense></Journal>
                            </v-card>
                        </v-tab-item>
                    </v-tabs-items>
                </v-card>
            </modal>
            <InboxNavDrawer v-if="inboxView" />
            <QueueTableVuetify v-else :tableHeight="queueTablePaneSize" />
        </pane>
        <pane :size="selectedElementPaneSize" v-if="selectedElement!=null">
            <SelectedIRElement :paneHeight=selectedElementPaneSize />
        </pane>
    </splitpanes>
</template>

<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import { Splitpanes, Pane } from 'splitpanes'
import 'splitpanes/dist/splitpanes.css'
import MetaCard from '@/components/IRElementComponents/MetaCard.vue'
import QueueTableVuetify from '@/components/QueueTableComponents/QueueTableVuetify.vue'
import FlairPane from '@/components/PaneComponents/FlairPane.vue'
import InboxNavDrawer from '@/components/InboxComponents/InboxNavDrawer.vue'
import ScotNavBar from '@/components/NavigationComponents/ScotNavBar.vue'
import Journal from '@/components/JournalComponents/Journal.vue'
import { Getter, Action, Mutation } from 'vuex-class';
import SelectedIRElement from '@/components/IRElementComponents/SelectedIRElement.vue'
import EntityClassComboBox from '@/components/EntityClassComponents/EntityClassIconComboBox.vue'
import QuickSettingsDrawer from '@/components/UserSettingsComponent/QuickSettingsDrawer.vue'
import AddTagSourceDialog from '@/components/IRElementComponents//AddTagSourceDialog.vue'
import { IRElement, IRElementType, IRElementMeta, Entry, EntryClassEnum } from '@/store/modules/IRElements/types'
import { User } from '../store/modules/user/types'
import { default_title } from '@/constants';
import { convertFromSnakeCase } from '@/utils/elementUtils'

const namespace: string = 'IRElements';

@Component({
    components: {
        Splitpanes,
        Pane,
        MetaCard,
        ScotNavBar,
        InboxNavDrawer,
        SelectedIRElement,
        QuickSettingsDrawer,
        QueueTableVuetify,
        FlairPane,
        Journal,
        EntityClassComboBox,
        AddTagSourceDialog
    },
})

export default class ResponseView extends Vue {

    @Mutation('setElementListPage', { namespace }) setElementListPage: CallableFunction;
    @Mutation('setElementListSortBy', { namespace }) setElementListSortBy: CallableFunction;
    @Mutation('setElementListSortDesc', { namespace }) setElementListSortDesc: CallableFunction;
    @Mutation('clearElementListFilter', { namespace }) clearElementListFilter: CallableFunction;
    @Mutation('toggleFlair', { namespace }) toggleFlair: CallableFunction;
    @Mutation('setFlairMenuEntity', { namespace }) setFlairMenuEntity: CallableFunction;

    @Getter('elementType', { namespace }) elementType: IRElementType | null;
    @Getter('elementTypePluralized', { namespace }) elementTypePluralized: string | null;
    @Getter('isAlertGroupElementType', { namespace }) isAlertGroupElementType: boolean;
    @Getter('currentUser', { 'namespace': 'user' }) currentUser: User;
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
    @Action('retrieveElementList', { namespace }) retrieveElementList: any;
    @Getter('tabulatorQueueTableRows', { namespace }) tabulatorQueueTableRows: Array<any> | null;
    @Action('retrieveSelectedElementbyID', { namespace }) retrieveSelectedElementbyID: any;
    @Action('clearSelectedElement', { namespace }) clearSelectedElement: CallableFunction;
    @Action('clearSelectedElementFlair', { namespace }) clearSelectedElementFlair: CallableFunction;
    @Action('retrieveElementListWithFilter', { namespace }) retrieveElementListWithFilter: CallableFunction
    @Getter('elementList', { namespace }) elementList: Array<IRElementMeta> | null;
    @Getter('inboxView', { 'namespace': 'user' }) inboxView: boolean
    @Getter('darkMode', { 'namespace': 'user' }) darkMode: boolean
    @Action('retrieveSelectedElementEntitiesbyID', { namespace }) retrieveSelectedElementEntitiesbyID: CallableFunction
    @Getter('selectedElementFlairedEntities', { namespace }) selectedElementFlairedEntities: Array<any>;
    @Getter('flairDialog', { namespace }) flairDialog: boolean
    @Action('flairDialogSetToTrue', { namespace }) flairDialogSetToTrue: CallableFunction;
    @Action('flairDialogSetToFalse', { namespace }) flairDialogSetToFalse: CallableFunction;
    @Getter('flairMenuEntity', { namespace }) flairMenuEntity: any | null;
    @Getter('selectedElementPaneSize', { namespace }) selectedElementPaneSize: number;
    @Getter('queueTablePaneSize', { namespace }) queueTablePaneSize: number;
    @Action('setSelectedElementSize', { namespace }) setSelectedElementSize: CallableFunction;
    @Getter('elementListFilterDict', { namespace }) elementListFilterDict: any;
    @Action('removeFlairedEntity', { namespace }) removeFlairedEntity: CallableFunction;
    @Getter('selectedElementEntityIndex', { namespace }) selectedElementEntityIndex: CallableFunction;
    @Action('addNewEntryWithEditModeOn', { namespace }) addNewEntryWithEditModeOn: CallableFunction;
    @Getter('linkedElementEntries', { namespace }) linkedElementEntries: CallableFunction;
    @Action('updateLinkedElement', { namespace }) updateLinkedElement: CallableFunction;
    @Action('removeEntityClasses', { namespace }) removeEntityClasses: CallableFunction;
    @Action('unAssignTagOrSourceDescription', { namespace }) unAssignTagOrSourceDescription: CallableFunction;
    mini: boolean = true;
    drawer: boolean = false;
    firstClick: boolean = false
    tab: number | null = null
    navigationAbortController: AbortController | null = null;
    trackedEntityItems = ['tracked', 'untracked']
    removingEntityClass: Array<any> = []
    entityTagsDialog: boolean = false
    elementTypeShortLetters: any = {
        [IRElementType.Alertgroup]: 'A',
        [IRElementType.Event]: 'E',
        [IRElementType.Intel]: 'I',
        [IRElementType.Product]: 'P',
        [IRElementType.Incident]: 'N',
        [IRElementType.Dispatch]: 'D',
        [IRElementType.Guide]: 'G',
        [IRElementType.Signature]: 'S',
        [IRElementType.ThreatModelItem]: 'M',
        [IRElementType.Entity]: 'EN',
        [IRElementType.Entry]: 'T',
        [IRElementType.Feed]: 'F',
        [IRElementType.Pivot]: 'P',
        [IRElementType.EntityClass]: 'EC',
        [IRElementType.VulnFeed]: 'VF',
        [IRElementType.VulnTrack]: 'VT',
    }

    getElementTypeAbbrev(elementType: IRElementType) {
        return elementType in this.elementTypeShortLetters ? this.elementTypeShortLetters[elementType] : elementType.toString()
    }

    async onEntityClassRemove(entityId: number, entityClassId: number) {
        this.removingEntityClass.push(entityClassId)
        await this.removeEntityClasses({ entityClassId: entityClassId, targetEntityId: entityId })
        const idx = this.removingEntityClass.findIndex(a => a == entityClassId)
        this.removingEntityClass.splice(idx, 1)
    }

    async handleKeyboardShortcuts(e: KeyboardEvent) {
        // Check for event target so this doesn't fire if someone's typing in a text box or somethingf
        if (e.target && (e.target as HTMLElement).tagName == 'BODY' && !(e.metaKey || e.altKey || e.ctrlKey) && !e.repeat) {
            if (e.key == 'f' && this.selectedElement) {
                if (this.selectedElementPaneSize == 100) {
                    this.setSelectedElementSize(60)
                }
                else {
                    this.setSelectedElementSize(100)
                }
            }
            if (e.key == 't' && !(e.metaKey || e.altKey || e.ctrlKey)) {
                this.toggleFlair()
            }
        }
    }

    openPivot(pivotUrl:string){
        window.open(pivotUrl, '_blank')
    }
    async onFlairModalClosed() {
        await this.flairDialogSetToFalse()
    }
    get showFlairDialog() {
        return this.flairDialog
    }
    
    set showFlairDialog(value: any) {
        if (value == true) {
            this.flairDialogSetToTrue()
        }
        else {
            this.flairDialogSetToFalse()
        }
    }

    async removeFlairedEntityTab(entity:any) {
        await this.removeFlairedEntity({entity:entity})
    }

    async onResize(e: any) {
        if (e.length > 1) {
            this.setSelectedElementSize(e[1].size)
            await this.$nextTick()
            this.$root.$emit('recalcSize')
        }
    }

    transitionToNewElement = false

    @Watch('$route', { immediate: true })
    async onUrlChange(newVal: any, oldVal: any) {
        // We are loading a previously-unselected table
        if (this.elementType != this.$router.currentRoute.meta?.itemType || this.elementList?.length == 0 || oldVal == undefined) {
            if (this.navigationAbortController) {
                this.navigationAbortController.abort()
            }
            this.navigationAbortController = new AbortController()
            this.clearElementListFilter()
            // Add mandatory filters from route if necessary
            const totalFilterDict = this.$router.currentRoute.meta?.extraFilters ? { ...this.elementListFilterDict, ...this.$router.currentRoute.meta?.extraFilters } : this.elementListFilterDict
            await this.retrieveElementListWithFilter({
                elementType: this.$router.currentRoute.meta?.itemType,
                filterDict: totalFilterDict,
                abortController: this.navigationAbortController
            })
            this.navigationAbortController = null
        }
        if (newVal?.params.id != undefined && (newVal?.params.id != oldVal?.params.id || newVal?.name != oldVal?.name)) { // I am navigating to a new element ID
            this.transitionToNewElement = true
            //await this.clearSelectedElement() disabled to make transitions more seamless
            await this.clearSelectedElementFlair()
            let succeeded = false
            if (this.$router.currentRoute.meta?.itemType == IRElementType.Entry) {
                succeeded = await this.retrieveSelectedElementbyID({
                    elementID: newVal.params.target_id,
                    elementType: convertFromSnakeCase(newVal.params.target_type)
                })
            }
            else {
                succeeded = await this.retrieveSelectedElementbyID({
                    elementID: newVal.params.id,
                    elementType: this.$router.currentRoute.meta?.itemType
                })
            }
            if (succeeded && ![IRElementType.Pivot, IRElementType.EntityClass].includes(this.$router.currentRoute.meta?.itemType)) {
                document.title = this.getElementTypeAbbrev(this.$router.currentRoute.meta?.itemType) + newVal.params.id
                if (this.$router.currentRoute.meta?.itemType == IRElementType.Entry) {
                    await this.retrieveSelectedElementEntitiesbyID({
                        elementID: newVal.params.target_id,
                        elementType: convertFromSnakeCase(newVal.params.target_type)
                    })
                }
                else {
                    await this.retrieveSelectedElementEntitiesbyID({
                        elementID: newVal.params.id,
                        elementType: this.$router.currentRoute.meta?.itemType
                    })
                }
            }
            this.transitionToNewElement = false
        }
        else if (newVal?.params.id == undefined) {
            await this.clearSelectedElementFlair()
            await this.$nextTick()
            await this.clearSelectedElement()
            document.title = default_title
        }
    }

    updated() {
        this.$vuetify.theme.dark = this.darkMode
    }

    @Watch('flairDialog')
    onChange(newVal: boolean) {
        if (newVal == true) {
            this.$modal.show('flairModal')
        }
        else {
            this.$modal.hide('flairModal')

        }
    }

    async mounted() {
        if (this.$route.params.id != undefined) {
            this.setSelectedElementSize(60)
        }
        document.addEventListener("keydown", this.handleKeyboardShortcuts)
    }

    async beforeDestroy() {
        document.removeEventListener("keydown", this.handleKeyboardShortcuts)
    }

    @Watch('inboxView')
    inboxChanged() {
        this.$root.$emit('recalcSize')
    }

    @Watch('selectedElementFlairedEntities.length')
    flairedEntitiesChanged(newVal: any, oldVal: any) {
        if (newVal > oldVal && this.tab != null) {
            this.tab = newVal - 1
        }
    }

    @Watch('flairMenuEntity')
    flairClickEntityChanged(newVal: any, oldVal: any) {
        if (newVal) {
            const flairModalIdx = this.selectedElementFlairedEntities.findIndex((el: any) => el.id == newVal.id)
            this.tab = flairModalIdx
            this.setFlairMenuEntity(null)
        }
    }

    async copyTextToClipboard(text: string) {
        navigator.clipboard.writeText(text)
    }

    async updateEntityTrackedStatus(entityId: number, newStatus: string) {
        await this.updateLinkedElement({
            updateData: { status: newStatus },
            linkedElementId: entityId,
            linkedElementType: IRElementType.Entity,
            linkedElementIndex: this.selectedElementEntityIndex(entityId)
        })
    }

    async addNewEntityEntry(entityId: number) {
        const entityEntries = this.linkedElementEntries(entityId, IRElementType.Entity)
        if (entityEntries != undefined) {
            const newEntryAlreadyExists = entityEntries.findIndex((entry: Entry) => entry.id === -1) != -1
            if (newEntryAlreadyExists == false) {
                console.log("making new entry")
                const newEntryPayload = {
                    'owner': this.currentUser.username,
                    'IRElementType': IRElementType.Entity,
                    'IRElementTypeId': entityId,
                    'EntryClassEnum': EntryClassEnum[EntryClassEnum.entry]
                }
                await this.addNewEntryWithEditModeOn({
                    newEntryPayload: newEntryPayload,
                    linkedElementType: IRElementType.Entity,
                    linkedElementId: entityId,
                    linkedElementIndex: this.selectedElementEntityIndex(entityId),
                    treePath: null
                })
            }
        }
    }

    async removeTagById(id: number, target_type: string, target_id: number) {
        await this.unAssignTagOrSourceDescription({ id: id, type: "tag", targetElementType: target_type, targetElementId: target_id })
    }
}
</script>

<style scoped>
    .flairTabText {
        max-width: 200px;
        overflow: hidden;
        white-space: nowrap;
    }

    .flairModal {
        pointer-events: none;
    }

    .lightModeBackground {
        background-color: #f2f2f2;
    }

    .darkModeBackground {
        background-color: #1D1D1D;
    }

    /deep/ .flairModal .vm--overlay {
        opacity: 0;
    }

    /deep/ .flairModalDialog {
        pointer-events: initial;
    }

    .flex-column-noscroll {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .scroll-child {
        max-height: 100%;
        overflow-y: auto;
    }

    .child-noscroll > :first-child {
        height: 100%;
    }

    .tag-source-group {
        border: 1px solid;
        border-radius: 10px;
        display: inline-block;
        padding-left: 3px;
        padding-right: 3px;
        min-width: 7em;
        max-width: 100%;
    }

    .flairModal {
        z-index: 101
    }
</style>
