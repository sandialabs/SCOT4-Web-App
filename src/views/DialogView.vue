<template>
    <v-dialog class="dialog-z" transition="dialog-bottom-transition"
        :fullscreen="fullscreenDialogs.includes(Dialog.GetDialogType)"
        :class="{ 'small-modal': !largeDialogs.includes(Dialog.GetDialogType), 'large-modal': largeDialogs.includes(Dialog.GetDialogType) }"
        :model-value="Dialog.GetDialogActive" @update:modelValue="Dialog.ToggleDialog" scrollable>
            <HistoryDialogView v-if="Dialog.GetDialogType == 'history'" :params="Dialog.GetDialogParams" />
            <TagView v-else-if="Dialog.GetDialogType == 'tags'" :params="Dialog.GetDialogParams" @RefreshQueueView="RefreshQueueView" @RefreshSelectedView="RefreshSelectedView" />
            <SourceView v-else-if="Dialog.GetDialogType == 'sources'" :params="Dialog.GetDialogParams" @RefreshQueueView="RefreshQueueView" @RefreshSelectedView="RefreshSelectedView" />
            <TitleView v-else-if="Dialog.GetDialogType == 'title'" :params="Dialog.GetDialogParams" @RefreshQueueView="RefreshQueueView" @RefreshSelectedView="RefreshSelectedView" />
            <HandlerView v-else-if="Dialog.GetDialogType == 'calendar-add-handler'" :params="Dialog.GetDialogParams" />
            <HandlerEntryView v-else-if="Dialog.GetDialogType == 'calendar-edit-handler'" :params="Dialog.GetDialogParams" />
            <SearchView v-else-if="Dialog.GetDialogType == 'search'" :search="Dialog.GetDialogParams" />
            <PermissionsView v-else-if="Dialog.GetDialogType == 'permissions'" :params="Dialog.GetDialogParams" />
            <FileUploadView v-else-if="Dialog.GetDialogType == 'file-upload'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView" />
            <UserFavesSubsView v-else-if="Dialog.GetDialogType == 'favorites_subs'" />
            <GeoMappingPane v-else-if="Dialog.GetDialogType == 'ipGeoMap'" :params="Dialog.GetDialogParams" />
            <JournalView v-else-if="Dialog.GetDialogType == 'journal'" :params="Dialog.GetDialogParams" />
            <UserCreate v-else-if="Dialog.GetDialogType == 'users_create'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView" />
            <RoleView v-else-if="Dialog.GetDialogType == 'role_create'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView" />
            <ConfirmDeleteView v-else-if="Dialog.GetDialogType == 'confirm_delete'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView" />
            <AuthenticationCreateView v-else-if="Dialog.GetDialogType == 'authentication_create'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView" />
            <StorageCreateView v-else-if="Dialog.GetDialogType == 'storage_create'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView" />
            <ReplaceTagSourceView v-else-if="Dialog.GetDialogType == 'replace_tag_or_source'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView" />
            <AddRemoveClassifyView v-else-if="Dialog.GetDialogType == 'add_remove_classify'" :params="Dialog.GetDialogParams" />
            <ClassView v-else-if="Dialog.GetDialogType == 'class'" :params="Dialog.GetDialogParams" @RefreshQueueView="RefreshQueueView" @RefreshSelectedView="RefreshSelectedView" />
            <FileEditView v-else-if="Dialog.GetDialogType == 'file-edit'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView" />
            <PromoteToExistingView v-else-if="Dialog.GetDialogType == 'promote-to-existing'" :params="Dialog.GetDialogParams" />
            <EntryEntityView v-else-if="Dialog.GetDialogType == 'entry-entities-click'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView" />
            <PivotEntityTypeView v-else-if="Dialog.GetDialogType == 'pivot-entity-type'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView" />
            <EntryEditConfirmView v-else-if="Dialog.GetDialogType == 'entry-edit-confirm'" :params="Dialog.GetDialogParams" />
            <SplunkPasteConfirmView v-else-if="Dialog.GetDialogType == 'splunk-paste-confirm'" :params="Dialog.GetDialogParams" />
            <CreateEntityView v-else-if="Dialog.GetDialogType == 'create-entity'" :params="Dialog.GetDialogParams" />
            <SignatureView v-else-if="Dialog.GetDialogType == 'add_signature'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView"/>
            <ThreatModelItemView v-else-if="Dialog.GetDialogType == 'add_threat_model_item'" :params="Dialog.GetDialogParams" @RefreshSelectedView="RefreshSelectedView"/>            
    </v-dialog>
</template>

<script setup lang="ts">
import HistoryDialogView from '@/components/Dialogs/HistoryView.vue'
import TagView from '@/components/Dialogs/TagView.vue'
import SourceView from '@/components/Dialogs/SourceView.vue'
import TitleView from '@/components/Dialogs/TitleView.vue'
import HandlerView from '@/components/Dialogs/HandlerView.vue'
import HandlerEntryView from '@/components/Dialogs/HandlerEntryView.vue'
import SearchView from '@/components/Dialogs/SearchView.vue'
import PermissionsView from '@/components/Dialogs/PermissionsView.vue'
import UserFavesSubsView from '@/components/Dialogs/UserFavesSubsView.vue'
import GeoMappingPane from '@/components/SelectedElementPanes/GeoMappingPane.vue'
import FileUploadView from '@/components/Dialogs/FileUploadView.vue'
import JournalView from './JournalView.vue'
import UserCreate from '@/components/Dialogs/UserCreateView.vue'
import RoleView from '@/components/Dialogs/RoleView.vue'
import ConfirmDeleteView from '@/components/Dialogs/ConfirmDeleteView.vue'
import AuthenticationCreateView from '@/components/Dialogs/AuthenticationCreateView.vue'
import StorageCreateView from '@/components/Dialogs/StorageCreateView.vue'
import ReplaceTagSourceView from '@/components/Dialogs/ReplaceTagSourceView.vue'
import AddRemoveClassifyView from '@/components/Dialogs/AddRemoveClassifyView.vue'
import ClassView from '@/components/Dialogs/ClassView.vue'
import FileEditView from '@/components/Dialogs/FileEditView.vue'
import PromoteToExistingView from '@/components/Dialogs/PromoteToExistingView.vue'
import EntryEntityView from '@/components/Dialogs/EntryEntityView.vue'
import PivotEntityTypeView from '@/components/Dialogs/PivotEntityTypeView.vue'
import EntryEditConfirmView from '@/components/Dialogs/EntryEditConfirmView.vue'
import SplunkPasteConfirmView from '@/components/Dialogs/SplunkPasteConfirmView.vue'
import CreateEntityView from '@/components/Dialogs/CreateEntityView.vue'
import SignatureView from '@/components/Dialogs/SignatureView.vue'
import ThreatModelItemView from '@/components/Dialogs/ThreatModelItemView.vue'
import { useDialogStore, useBusStore } from '@/stores'

const Dialog = useDialogStore()
const Bus = useBusStore()
const largeDialogs = ['search', 'favorites_subs', 'ipGeoMap', 'journal', "users_create", "entry-entities-click"]
const fullscreenDialogs = ['journal']

function RefreshQueueView() {
    Bus.ToggleReloadQueueView()
}
function RefreshSelectedView(showLoading: boolean) {
    Bus.ToggleReloadSelectedView(showLoading)
}
</script>