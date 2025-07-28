<template>
    <v-system-bar v-if="entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType)!=null"
                  :class="{'open-task': entryClass == 'task' && entryData.status != 'closed', 'closed-task': entryClass == 'task' && entryData.status == 'closed'}">
        <v-icon v-if="collapsed" @click="onToggleCollapse">mdi-chevron-right</v-icon>
        <v-icon v-else @click="onToggleCollapse">mdi-chevron-down</v-icon>
        [<router-link class="match-color" :to="'/' + elementTypePluralized.toLowerCase() + '/' + selectedElement.id.toString() + '/' + entryId.toString()">{{entryId}}</router-link>]
        <span class="truncate-on-overflow ml-1">
            {{entryOwner}} @ {{entryCreatedString + (entryClass == 'task' ? " -- assigned to " + entryData.assignee : "") + (entryCreatedString == entryModifiedString ? "" : " (modified " + entryModifiedString + ")")}}
        </span>
        <v-chip class="ma-2" color="amber" small v-if="entryClass == 'promotion'">
            Promoted Entry
        </v-chip>
        <v-chip class="ma-2" color="red" small v-else-if="!entryData?.flaired_html">
            Unflaired Entry
        </v-chip>
        <NewEntityMenu v-if="selectedText" :buttonVisible="textSelected" :entityText="selectedText" :entryId="entryId" />
        <v-spacer></v-spacer>
        <v-btn class="py-1 px-1" icon @click="subscribeItem" title="Subscribe to notifications for this entry">
            <v-icon v-if="entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType).subscribed" color="blue">mdi-bell</v-icon>
            <v-icon v-else color="blue">mdi-bell-outline</v-icon>
        </v-btn>
        <v-btn class="py-1 px-1" icon @click="favoriteItem" title="Favorite this entry">
            <v-icon v-if="entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType).favorite" :color="entryClass == 'task' && entryData.status != 'closed' ? 'black' : 'red'">mdi-heart</v-icon>
            <v-icon v-else :color="entryClass == 'task' && entryData.status != 'closed' ? 'black' : 'red'">mdi-heart-outline</v-icon>
        </v-btn>
        <PopularityElement :voted="entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType).popularity_voted" :count="entryById(entryId, treePath, linkedElementId, linkedElementIndex, linkedElementType).popularity_count" :entry="{entryId: this.entryId, treePath: this.treePath, linkedElementId: this.linkedElementId, linkedElementIndex: this.linkedElementIndex, linkedElementType: this.linkedElementType}"></PopularityElement>
        <TLPPicker :value="entryTLP" @input="tlpPickerInput"></TLPPicker>
        <v-icon @click="editClicked" v-if="entryClass != 'promotion'">mdi-circle-edit-outline </v-icon>
        <v-icon @click="addChildEntry" v-if="!fullScreenMode">mdi-reply-outline</v-icon>
        <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-btn icon
                       v-bind="attrs"
                       v-on="on">
                    <v-icon>mdi-arrow-down-drop-circle</v-icon>
                </v-btn>
            </template>
            <v-list>
                <v-list-item-group>
                    <v-list-item @click="makeSummary" v-if="entryClass == 'entry'">
                        <v-list-item-title>Make Summary</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="unmakeSummary" v-if="entryClass == 'summary'">
                        <v-list-item-title>Remove Summary</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="makeTask" v-if="entryClass == 'entry'">
                        <v-list-item-title>Make Task</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="completeTask" v-if="entryClass == 'task' && entryData.status != 'closed' && entryData.assignee == currentUser.username">
                        <v-list-item-title>Mark Complete</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="reopenTask" v-if="entryClass == 'task' && entryData.status == 'closed'">
                        <v-list-item-title>Reopen Task</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="assignTaskToMe" v-if="entryClass == 'task' && entryData.status != 'closed' && entryData.assignee != currentUser.username">
                        <v-list-item-title>Assign Task to Me</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="unmakeTask" v-if="entryClass == 'task'">
                        <v-list-item-title>Remove Task</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="$emit('permissions-click')" v-if="entryClass != 'promotion'">
                        <v-list-item-title>Permissions</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="$emit('entry-entities-click')" v-if="entryClass != 'promotion'">
                        <v-list-item-title>View Entities</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="deleteEntry" v-if="entryClass != 'promotion'">
                        <v-list-item-title>Delete Entry</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="reflairEntry">
                        <v-list-item-title>Reflair Entry</v-list-item-title>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-menu>
        <v-icon v-if="fullScreenMode!=true" @click="expandToFullScreen">mdi-arrow-expand</v-icon>
        <v-icon v-else @click="collapseFromFullScreen">mdi-arrow-collapse</v-icon>
    </v-system-bar>
</template>

<script lang="ts">
import { Component, Vue, Prop} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, EntryClassEnum, TLPCode } from '@/store/modules/IRElements/types'
import TLPPicker from '@/components/IRElementComponents/TLPPicker.vue';
import PopularityElement from '@/components/IRElementComponents/PopularityElement.vue';
import {User} from '@/store/modules/user/types'
import NewEntityMenu from '@/components/IRElementComponents/NewEntityMenu.vue';

const namespace: string = 'IRElements';

@Component({
    components: {
        TLPPicker,
        NewEntityMenu,
        PopularityElement
    },
})

export default class EntryCellViewSystemBar extends Vue {
    @Prop() entryId: number;
    @Prop({ default: null }) linkedElementType: IRElementType | null
    @Prop({ default: "" }) treePath: string;
    @Prop({ default: null }) linkedElementId: number | null
    @Prop({ default: null }) linkedElementIndex: number | null
    @Prop({ default: false }) fullScreenMode: boolean
    @Action('editEntryModeOn', { namespace }) editEntryModeOn: CallableFunction
    @Action('removeEntryByID', { namespace }) removeEntryByID: CallableFunction
    @Action('addNewEntryWithEditModeOn', { namespace }) addNewEntryWithEditModeOn: CallableFunction;
    @Getter('currentUser', { 'namespace': 'user' }) currentUser: User;
    @Getter('entryById', { namespace }) entryById: CallableFunction
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
    @Getter('elementType', { namespace }) elementType: IRElementType | null;
    @Getter('allEntryIds', { namespace }) allEntryIds: CallableFunction;
    @Action('toggleExpandEntry', { namespace }) toggleExpandEntry: CallableFunction;
    @Action('toggleCollapseEntry', { namespace }) toggleCollapseEntry: CallableFunction;
    @Getter('elementTypePluralized', { namespace }) elementTypePluralized: string | null;
    @Action('updateEntryAttributes', { namespace }) updateEntryAttributes: CallableFunction;
    @Action('reflairSelectedElementbyID', { namespace }) reflairSelectedElementbyID: CallableFunction
    @Action('favoriteElement', { namespace }) favoriteElement: CallableFunction;
    @Action('subscribeElement', { namespace }) subscribeElement: CallableFunction;
    @Action('unsubscribeElement', { namespace }) unsubscribeElement: CallableFunction;

    selectedText: string = ""
    textSelected: boolean = false

    async mounted() {
        document.addEventListener("selectionchange", this.onSelectionChange)
    }

    async beforeDestroy() {
        document.removeEventListener("selectionchange", this.onSelectionChange)
    }

    async favoriteItem() {
        if (this.selectedElement) {
            await this.favoriteElement({elementID: this.entryId, elementType: IRElementType.Entry, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementIndex: this.linkedElementIndex})
        }
    }

    async subscribeItem() {
        const entry = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType)
        if (!entry.subscribed) {
            await this.subscribeElement({ elementID: this.entryId, elementType: IRElementType.Entry, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementIndex: this.linkedElementIndex })
        }
        else {
            await this.unsubscribeElement({ elementID: this.entryId, elementType: IRElementType.Entry, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementIndex: this.linkedElementIndex })
        }
    }

    transformDateString(dateString: string) {
        const date: any = new Date(dateString)
        const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
        return { date: date.toLocaleDateString(undefined, options), time: date.toLocaleTimeString('en-US') }
    }

    onSelectionChange() {
        const selection = document.getSelection()
        // Only update potential flair selection if selected text is entirely in an view entry
        if (selection && selection.anchorNode && selection.focusNode &&
            this.$el.parentElement?.contains(selection.anchorNode) && !this.$el.contains(selection.anchorNode) &&
            this.$el.parentElement?.contains(selection.focusNode) && !this.$el.contains(selection.focusNode)) {
            this.selectedText = selection.toString()
            this.textSelected = true
        }
        else {
            this.textSelected = false
        }
    }



    get collapsed() {
        return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).collapsed
    }

    async addChildEntry() {
        const newEntryAlreadyExists = this.allEntryIds().findIndex((id: number) => id === -1) != -1
        if (newEntryAlreadyExists == false) {
            const newEntryPayload = { 'owner': this.currentUser.username, 'IRElementType': this.elementType, 'IRElementTypeId': this.selectedElement?.id, 'EntryClassEnum': EntryClassEnum[EntryClassEnum.entry] }
            const isExpaned = this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType)['repliesExpanded']

            if (isExpaned != true) {
                await this.toggleExpandEntry({ entryId: this.entryId, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementIndex: this.linkedElementIndex })
            }
            const childTreePath = this.treePath + "|" + this.entryId
            await this.addNewEntryWithEditModeOn({ newEntryPayload: newEntryPayload, linkedElementType: this.linkedElementType, linkedElementId: this.linkedElementId, linkedElementIndex: this.linkedElementIndex, treePath: childTreePath, parentEntryId: this.entryId })
        }
        else {
            this.$root.$emit('highlightEntry-1')
        }
    }

    async deleteEntry() {
        await this.removeEntryByID({
            entryId: this.entryId, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex
        })
    }

    async makeSummary() {
        await this.updateEntryAttributes({
            entryId: this.entryId,
            linkedElementType: this.linkedElementType,
            linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex,
            treePath: this.treePath,
            updateData: { entry_class: EntryClassEnum.summary }
        })
    }


    async reflairEntry() {
        await this.reflairSelectedElementbyID({elementType: IRElementType.Entry, elementID: this.entryId})   
    }

    async unmakeSummary() {
        await this.updateEntryAttributes({
            entryId: this.entryId,
            linkedElementType: this.linkedElementType,
            linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex,
            treePath: this.treePath,
            updateData: { entry_class: EntryClassEnum.entry }
        })
    }

    async makeTask() {
        // Add task-specific properties
        const newData = {
            ...this.entryData,
            "status": "open",
            "task_time": new Date().toISOString(),
            "assignee": this.currentUser.username
        }

        await this.updateEntryAttributes({
            entryId: this.entryId,
            linkedElementType: this.linkedElementType,
            linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex,
            treePath: this.treePath,
            updateData: { entry_class: EntryClassEnum.task, entry_data: newData }
        })
    }

    async completeTask() {
        // Add task-specific properties
        const newData = {
            ...this.entryData,
            "status": "closed",
            "task_time": new Date().toISOString()
        }

        await this.updateEntryAttributes({
            entryId: this.entryId,
            linkedElementType: this.linkedElementType,
            linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex,
            treePath: this.treePath,
            updateData: { entry_data: newData }
        })
    }

    async reopenTask() {
        // Add task-specific properties
        const newData = {
            ...this.entryData,
            "status": "open",
            "task_time": new Date().toISOString()
        }

        await this.updateEntryAttributes({
            entryId: this.entryId,
            linkedElementType: this.linkedElementType,
            linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex,
            treePath: this.treePath,
            updateData: { entry_data: newData }
        })
    }

    async assignTaskToMe() {
        // Add task-specific properties
        const newData = {
            ...this.entryData,
            "task_time": new Date().toISOString(),
            "assignee": this.currentUser.username
        }

        await this.updateEntryAttributes({
            entryId: this.entryId,
            linkedElementType: this.linkedElementType,
            linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex,
            treePath: this.treePath,
            updateData: { entry_data: newData }
        })
    }

    async unmakeTask() {
        // Delete task-specific properties
        const { status, task_time, assignee, ...newData } = this.entryData

        await this.updateEntryAttributes({
            entryId: this.entryId,
            linkedElementType: this.linkedElementType,
            linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex,
            treePath: this.treePath,
            updateData: { entry_class: EntryClassEnum.entry, entry_data: newData }
        })
    }

    async editClicked() {
        await this.editEntryModeOn({
            entryId: this.entryId, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex
        })
    }
    async expandToFullScreen() {
        if (this.selectedElement) {
            let newRouteString = ""
            if (this.linkedElementType != null && this.linkedElementIndex != null && this.linkedElementId != null) {
                newRouteString = "/" + this.elementTypePluralized?.toLowerCase() + "/" + this.selectedElement.id + "/" + "entry" + "/" + this.entryId + "/fullScreen" + `?linkedElementId=${this.linkedElementId}&linkedElementIndex=${this.linkedElementIndex}&treePath=${this.treePath}&linkedElementType=${this.linkedElementType}`/** need to pluralize the element type to match the route */

            }
            else if (this.treePath) {
                newRouteString = "/" + this.elementTypePluralized?.toLowerCase() +
                    "/" + this.selectedElement.id + "/" + "entry" + "/" + this.entryId + "/fullScreen"
                    + `?treePath=${this.treePath}`/** need to pluralize the element type to match the route */

            }
            else {
                newRouteString = "/" + this.elementTypePluralized?.toLowerCase() + "/" + this.selectedElement.id + "/" + "entry" + "/" + this.entryId + "/fullScreen"/** need to pluralize the element type to match the route */

            }
            this.$router.push(newRouteString).catch((err: any) => { return })
        }

    }

    async collapseFromFullScreen() {
        if (this.selectedElement) {
            let newRouteString = "/" + this.elementTypePluralized?.toLowerCase() + "/" + this.selectedElement.id // need to pluralize the element type to match the route */
            this.$router.push(newRouteString).catch((err: any) => { return })
        }

    }

    async tlpPickerInput(val: TLPCode) {
        await this.updateEntryAttributes({
            entryId: this.entryId,
            linkedElementType: this.linkedElementType,
            linkedElementId: this.linkedElementId,
            linkedElementIndex: this.linkedElementIndex,
            treePath: this.treePath,
            updateData: { tlp: val }
        })
    }

    async onToggleCollapse() {
        await this.toggleCollapseEntry({ entryId: this.entryId, treePath: this.treePath, linkedElementType: this.linkedElementType, linkedElementIndex: this.linkedElementIndex })
    }

    get entryTLP() {
        return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).tlp
    }

    get entryClass() {
        return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).entry_class
    }

    get entryModifiedString() {
        const modifiedParts = this.transformDateString(this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).modified)
        return modifiedParts.date + ' ' + modifiedParts.time
    }

    get entryCreatedString() {
        const createdParts = this.transformDateString(this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).created)
        return createdParts.date + ' ' + createdParts.time
    }

    get entryOwner() {
        return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType).owner
    }

    get entryData() {
        if (this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType)?.entry_data) {
            return this.entryById(this.entryId, this.treePath, this.linkedElementId, this.linkedElementIndex, this.linkedElementType)?.entry_data
        }
        return undefined
    }
}



</script>
<style scoped>
    .match-color {
        color: inherit;
    }

    .truncate-on-overflow {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }

    .open-task {
        background-color: #cd5c5c;
    }

    .closed-task {
        background-color: #009500;
    }
</style>