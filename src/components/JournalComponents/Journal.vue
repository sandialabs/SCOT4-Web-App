<template>
    <v-progress-circular v-if="loading"
                         indeterminate
                         color="primary">
    </v-progress-circular>
    <v-container id="journal" fluid v-else-if="journalEntries != null && journalEntries.length > 0" :class="{ 'py-1': dense }">
        <PermissionsPicker v-model="permissionsDialog" :target="permissionsEntry"></PermissionsPicker>
        <EntryEntityDialog v-model="entityDialog" :target="entityEntry"></EntryEntityDialog>
        <EntryCell v-for="(entry,index) in journalEntries"
                   :id="`entry${index}`"
                   :linkedElementType=linkedElementType
                   :linkedElementIndex=linkedElementIndex
                   :linkedElementId=linkedElementId
                   :entryType="entry.entry_class"
                   :entryId="entry.id"
                   :key="entry.id"
                   :class="{ 'py-1 px-0': dense }"
                   @permissions-click="permissionsEntry = $event,permissionsDialog = true"
                   @entry-entities-click="entityEntry = $event,entityDialog = true">
        </EntryCell>
        <v-divider v-if="!dense" />

    </v-container>
    <v-container v-else class="indigo--text text--darken-2">
        No entries were found. Click the "Add Entry" button to add one.
    </v-container>
</template>


<script lang="ts">
import { Component, Vue, Watch, Prop} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, Entry, NewEntry } from '@/store/modules/IRElements/types'
import EntryCell from '@/components/JournalComponents/EntryCellComponents/EntryCell.vue'
import EntryEntityDialog from '@/components/IRElementComponents/EntryEntityDialog.vue'
import PermissionsPicker from '@/components/IRElementComponents/PermissionsPicker.vue'

const namespace: string = 'IRElements';

@Component({
  components: {
        EntryCell,
        PermissionsPicker,
        EntryEntityDialog
    },
})

export default class Journal extends Vue {
    @Prop({ default: null }) linkedElementType: IRElementType | null
    @Prop({ default: null }) linkedElementId: number | null
    @Prop({ default: null }) linkedElementIndex: number | null
    @Prop({ default: false, type: Boolean }) dense: boolean

    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
    @Getter('selectedElementEntries', { namespace }) selectedElementEntries: Array<Entry | NewEntry> | null;
    @Action('retrieveLinkedElementEntries', { namespace }) retrieveLinkedElementEntries: CallableFunction
    @Getter('entitiesLoaded', { namespace }) entitiesLoaded: boolean
    @Getter('selectedElementEntities', { namespace }) selectedElementEntities: Record<string, Record<string, any>>
    @Action('addFlairedEntity', { namespace }) addFlairedEntity: CallableFunction
    @Action('flairDialogSetToTrue', { namespace }) flairDialogSetToTrue: CallableFunction;
    @Getter('selectedElementEntriesLength', { namespace }) selectedElementEntriesLength: number;
    @Getter('linkedElementEntries', { namespace }) linkedElementEntries: CallableFunction;
    @Getter('linkedEntriesChanged', { namespace }) linkedEntriesChanged: boolean

    alreadyMounted = false
    permissionsDialog: boolean = false
    permissionsEntry: Entry | null = null
    entityDialog: boolean = false
    entityEntry: Entry | null = null
    journalEntries: Array<Entry | NewEntry> | null = null
    loading = false


    async mounted() {
        await this.$nextTick()
        if (this.linkedElementType == this.selectedElement?.ElementType && this.linkedElementId == this.selectedElement?.id ||
            !this.linkedElementType && !this.linkedElementId) {
            window.journal = this
            this.journalEntries = this.selectedElementEntries
        }
        else if (this.linkedElementType != null && this.linkedElementId != null && this.linkedElementIndex != null) {
            this.loading = true
            await this.retrieveLinkedElementEntries({
                linkedElementId: this.linkedElementId,
                linkedElementType: this.linkedElementType,
                linkedElementIndex: this.linkedElementIndex
            })
            if (!window.journal) {
                window.journal = this
            }
            this.journalEntries = this.linkedElementEntries(this.linkedElementId, this.linkedElementType)
            this.loading = false
        }
    }

    timeout(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }


    @Watch('linkedEntriesChanged')
    async onEntitiesLoaded() {
        if (this.linkedEntriesChanged == true) {
            if (this.linkedElementType != null && this.linkedElementId != null && this.linkedElementIndex != null) {
                this.loading = true
                await this.retrieveLinkedElementEntries({
                    linkedElementId: this.linkedElementId,
                    linkedElementType: this.linkedElementType,
                    linkedElementIndex: this.linkedElementIndex
                })
                if (!window.journal) {
                    window.journal = this
                }
                this.journalEntries = null
                await this.$nextTick()
                this.journalEntries = this.linkedElementEntries(this.linkedElementId, this.linkedElementType)
                this.loading = false
            }
        }
    }

    @Watch('selectedElementEntries')
    onSelectedElementEntriesChanged() {
        if (this.linkedElementType == this.selectedElement?.ElementType && this.linkedElementId == this.selectedElement?.id
                || !this.linkedElementType && !this.linkedElementId) {
            this.journalEntries = this.selectedElementEntries
        }
    }
}
</script>

<style scoped>

/deep/ html{
  overflow:scroll;
}
</style>