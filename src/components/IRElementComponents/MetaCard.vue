<template>
    <v-sheet elevation=3>
        <PermissionsPicker :target="selectedElement" v-model="permissionsDialog" :entries="selectedElementEntries"></PermissionsPicker>
        <HistoryDialog :target="selectedElement" v-model="historyDialog" :allowedTypes="historyDialogTypes"></HistoryDialog>
        <v-container fluid class="py-1">
            <v-row dense>
                <v-col cols=1>
                    <v-row>
                        <v-col class="align-self-center pb-1">
                            <h3 class="text-left">
                                {{selectedElement.id}}
                            </h3>
                        </v-col>
                    </v-row>
                    <v-row v-if="selectedElement.hasOwnProperty('tlp')">
                        <v-col class="py-1 px-1">
                            <TLPPicker :value="selectedElement.tlp" @input="tlpPickerInput"></TLPPicker>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col :cols=8 class="align-self-center">
                    <h1 v-if="selectedElement.hasOwnProperty('subject')">
                        <v-text-field placeholder="<NO SUBJECT>"
                                      class="item-title"
                                      :append-icon="subjectBeingEdited ? 'mdi-checkbox-outline' : 'mdi-circle-edit-outline'"
                                      @blur="event => updateSubjectField(event, 'subject')"
                                      @focus="subjectBeingEdited = true"
                                      @click:append="subjectButtonClicked"
                                      @keydown.enter="subjectEnterPressed"
                                      dense solo flat hide-details grow
                                      :value="selectedElement.subject">
                        </v-text-field>
                    </h1>
                    <h1 v-else-if="selectedElement.hasOwnProperty('display_name')">
                        <v-text-field placeholder="<NO NAME>"
                                      class="item-title"
                                      :append-icon="subjectBeingEdited ? 'mdi-checkbox-outline' : 'mdi-circle-edit-outline'"
                                      @blur="event => updateSubjectField(event, 'display_name')"
                                      @focus="subjectBeingEdited = true"
                                      @click:append="subjectButtonClicked"
                                      @keydown.enter="subjectEnterPressed"
                                      dense solo flat hide-details grow
                                      :value="selectedElement.display_name">
                        </v-text-field>
                    <v-icon v-if="selectedElement.hasOwnProperty('icon')">
                        {{ selectedElement.icon }}
                    </v-icon>
                    </h1>
                    <h1 v-else-if="selectedElement.hasOwnProperty('name')">
                        <v-text-field placeholder="<NO NAME>"
                                      class="item-title"
                                      :append-icon="subjectBeingEdited ? 'mdi-checkbox-outline' : 'mdi-circle-edit-outline'"
                                      @blur="event => updateSubjectField(event, 'name')"
                                      @focus="subjectBeingEdited = true"
                                      @click:append="subjectButtonClicked"
                                      @keydown.enter="subjectEnterPressed"
                                      dense solo flat hide-details grow
                                      :value="selectedElement.name">
                        </v-text-field>
                    </h1>
                    <h1 v-else-if="selectedElement.hasOwnProperty('title')">
                        <v-text-field placeholder="<NO NAME>"
                                      class="item-title"
                                      :append-icon="subjectBeingEdited ? 'mdi-checkbox-outline' : 'mdi-circle-edit-outline'"
                                      @blur="event => updateSubjectField(event, 'title')"
                                      @focus="subjectBeingEdited = true"
                                      @click:append="subjectButtonClicked"
                                      @keydown.enter="subjectEnterPressed"
                                      dense solo flat hide-details grow
                                      :value="selectedElement.title">
                        </v-text-field>
                    </h1>

                    <h1 v-else-if="selectedElement.hasOwnProperty('value')"
                        placeholder="<NO NAME>"
                        class="px-4"
                        v-text="selectedElement.type_name + ': ' + selectedElement.value">
                    </h1>

                    <h1 v-else class="text-left px-4">
                        {{selectedElement.ElementType + ' ' + selectedElement.id}}
                    </h1>
                </v-col>
     
                <v-col :cols=3 class="pt-0">
                    <v-row no-gutters class="pb-1">
                        <v-col class="align-self-center text-right pa-0">
                            <h3 style="word-break: break-word">{{transformDateString(selectedElement.created)}} </h3>
                        </v-col>
                    </v-row>
                    <v-row no-gutters>
                        <v-col>
                            <v-select v-if="selectedElement.hasOwnProperty('owner')" label="Owner"
                                      class="ownerselect"
                                      persistent-placeholder
                                      :placeholder="selectedElement.owner"
                                      :value="selectedElement.owner"
                                      :items="ownerChoices()"
                                      dense
                                      @input="ownerSelectChanged"
                                      :readonly="selectedElement.owner == currentUser.username"
                                      no-data-text=""></v-select>
                        </v-col>
                        <v-col v-if="selectedElement.hasOwnProperty('status')">
                            <div v-if="elementType == 'Alertgroup'" class="text-right">
                                <v-chip small color="red" class="status-chip-triple">
                                    {{ selectedElement.open_count }}
                                </v-chip>
                                <v-chip small color="green" class="status-chip-triple">
                                    {{ selectedElement.closed_count }}
                                </v-chip>
                                <v-chip small color="amber" class="status-chip-triple">
                                    {{ selectedElement.promoted_count }}
                                </v-chip>
                                <v-menu>
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn icon v-bind="attrs" v-on="on">
                                            <v-icon>
                                                mdi-menu-down
                                            </v-icon>
                                        </v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item @click="openAllAlerts">
                                            <v-list-item-title>Reopen All</v-list-item-title>
                                        </v-list-item>
                                        <v-list-item @click="closeAllAlerts">
                                            <v-list-item-title>Close All</v-list-item-title>
                                        </v-list-item>
                                    </v-list>
                                </v-menu>
                            </div>
                            <v-select v-else dense solo flat label="Status"
                                      v-model="selectedElement.status"
                                      :items="statusChoices()"
                                      @change="statusSelectChanged"
                                      hide-details>
                                <template v-slot:selection="{ item }">
                                    <v-chip small :color="item.color" class="select-chip">
                                        {{ item.text }}
                                    </v-chip>
                                </template>
                                <template v-slot:item="{ item }">
                                    <v-chip small :color="item.color" class="select-chip">
                                        {{ item.text }}
                                    </v-chip>
                                </template>
                            </v-select>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row class="mt-n3" dense>
                <v-col class="text-left py-0">
                    <v-dialog v-model="descriptionsDialog"
                              max-width="600px">
                        <v-card>
                            <v-card-title>
                                Edit Description for {{ editDescriptionType }}: {{ editDescriptionTagSourceName }}
                            </v-card-title>
                            <v-textarea filled auto-grow v-model="editDescriptionInput">
                            </v-textarea>
                            <v-card-actions>
                                <v-btn @click=editTagSourceDescription()>
                                    Update Description
                                </v-btn>
                            </v-card-actions>
                        </v-card>

                    </v-dialog>
                         <v-dialog v-model="entityClassDescriptionDialog"
                              max-width="600px">
                        <v-card>
                            <v-card-title>
                                Edit Description for Entity Class: {{ editDescriptionEntityClassName }}
                                <v-icon> 
                                    {{ editDescriptionEntityClassIcon }}
                                </v-icon>
                            </v-card-title>
                            <v-textarea filled auto-grow v-model="editDescriptionEntityClass">
                            </v-textarea>
                            <v-card-actions>
                                <v-btn @click="OnUpdateEntityClassDescription()">
                                    Update Description
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <v-menu v-model="showRemoveUpdateTagSourceMenu"
                            :position-x="showRemoveUpdateTagSourceMenuX"
                            :position-y="showRemoveUpdateTagSourceMenuY"
                            absolute
                            offset-y>
                        <v-list>
                            <v-list-item @click=removeTagSource()>
                                <v-list-item-title>Remove</v-list-item-title>
                            </v-list-item>
                            <v-list-item @click=onEditDescriptionClick()>
                                <v-list-item-title>Edit Description</v-list-item-title>
                            </v-list-item>
                        </v-list>
                    </v-menu>

                    <fieldset class="tag-source-group" v-if="selectedElement.hasOwnProperty('sources')">
                        <legend class="mx-3 pa-0 mb-n2">Sources</legend>
                        <v-chip-group>
                            <v-tooltip v-for="(source,index) in selectedElement.sources" :key="source.id" color="black" bottom>
                                <template #activator="{ on }">
                                    <v-chip v-if="sourcesBeingEdited.includes(source.id)"
                                            v-on="on"
                                            v-on:keyup.enter="onExistingSourceEditSubmit(source.id, index)">
                                        <v-text-field dense class="shrink" v-model="updatedSourceText[index]" color="blue lighten-4"></v-text-field>
                                    </v-chip>
                                    <v-chip v-else v-on="on"
                                            @click=onExistingSourceClick(source.id)
                                            @contextmenu.prevent="function(e){onExistingTagSourceRightClick(e, source.id, 'source', source.name, source.description)}"
                                            close @click:close="removeTagSourceById(source.id, 'source')">
                                        {{ source.name }}
                                    </v-chip>
                                </template>
                                <span> Source: {{ source.description }}</span>
                            </v-tooltip>
                            <AddTagSourceDialog type="source" :target="selectedElement" v-model="sourcesDialog"></AddTagSourceDialog>
                            <v-tooltip color="black" bottom>
                                <template #activator="{ on }">
                                    <v-chip color="green" v-on="on" @click.stop="showSourcesDialog()"><v-icon>mdi-plus</v-icon></v-chip>
                                </template>
                                <span> Add a new source</span>
                            </v-tooltip>
                        </v-chip-group>
                    </fieldset>
                </v-col>
                <v-col class="py-0" v-if="selectedElement.hasOwnProperty('tags')">
                    <fieldset class="tag-source-group">
                        <legend class="mx-3 pa-0 mb-n2">Tags</legend>
                        <v-chip-group>
                            <v-tooltip v-for="(tag,index) in selectedElement.tags" :key="tag.id" color="black" bottom>
                                <template #activator="{ on }">
                                    <v-chip v-if="tagsBeingEdited.includes(tag.id)"
                                            v-on="on"
                                            v-on:keyup.enter="onExistingTagEditSubmit(tag.id, index)">
                                        <v-text-field dense class="shrink" v-model="updatedTagText[index]" color="purple lighten-4"></v-text-field>
                                    </v-chip>
                                    <v-chip v-else v-on="on"
                                            @click=onExistingTagClick(tag.id)
                                            @contextmenu.prevent="function(e) {onExistingTagSourceRightClick(e, tag.id, 'tag', tag.name, tag.description)}"
                                            close @click:close="removeTagSourceById(tag.id, 'tag')">
                                        {{ tag.name }}
                                    </v-chip>
                                </template>
                                <span> Tag: {{ tag.description }}</span>
                            </v-tooltip>
                            <AddTagSourceDialog type="tag" :target="selectedElement" v-model="tagsDialog"></AddTagSourceDialog>
                            <v-tooltip color="black" bottom>
                                <template #activator="{ on }">
                                    <v-chip color="green" @click.stop="showTagsDialog()" v-on="on"><v-icon>mdi-plus</v-icon></v-chip>
                                </template>
                                <span> Add a new tag</span>
                            </v-tooltip>
                        </v-chip-group>
                    </fieldset>
                </v-col>
              <v-col v-if="elementType=='Entity'" class="align-self-end mt-n3 py-0">
                    <v-chip-group>
                        <v-dialog v-model="entityClassesDialog"
                                  max-width="600px">
                            <v-card>
                                <v-card-title>Add Entity Class</v-card-title>
                                <v-card-text>
                                    <EntityClassComboBox :callback="onEntityClassesSubmitEvent" :entity-id="selectedElement.id"/>
                                </v-card-text>
                            </v-card>
                        </v-dialog>

                        <v-tooltip v-for="entityClass in selectedElement.classes" :key="entityClass.id" color="black" bottom>
                            <template #activator="{ on }">
                                <v-chip v-on="on"
                                 @click="function(e) {onEditEntityClassDescriptionClick(e, entityClass.id, entityClass.name, entityClass.description, entityClass.icon)}"
                                        close @click:close="removeEntityClassbyId(entityClass.id)"
                                
                                >
                                  <v-icon>
                                        {{ entityClass.icon }}
                                    </v-icon>
                                    <v-spacer />
                                    {{ entityClass.display_name }}
                                </v-chip>
                            </template>
                            <span> {{ entityClass.description }} </span>
                        </v-tooltip>

                        <v-tooltip color="black" bottom>
                            <template #activator="{ on }">
                                <v-chip color="blue" @click.stop="showEntityClassesDialog()" v-on="on"><v-icon>mdi-plus</v-icon></v-chip>
                            </template>
                            <span> Add a new entity class</span>
                        </v-tooltip>
                    </v-chip-group>
                </v-col>
                <v-spacer></v-spacer>
                <v-col class="align-self-end text-right pt-0">
                    <v-btn-toggle max=1 active-class="not-really-active">
                        <v-btn small v-for="button in quickButtons[elementType]" @click=button.onClick(...button.args) :key="button.text + button.icon" :class="button.cssClass" :id="button.text.replace(/ /g, '')">
                            <v-icon v-if="button.icon" :color="button.iconColor">
                                {{button.icon}}
                            </v-icon>
                            {{button.text}}
                            <v-menu v-if="button.subActions || button.subActionSlider">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn v-on="on" v-bind="attrs" class="mr-n1 elevation-2" outlined icon x-small>
                                        <v-icon small>
                                            mdi-chevron-down
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item v-for="subButton in button.subActions" @click=subButton.onClick(...subButton.args) :key="subButton.text" :class="subButton.class">
                                        <v-icon v-if="subButton.icon">
                                            {{subButton.icon}}
                                        </v-icon>
                                        {{subButton.text}}
                                    </v-list-item>
                                    <v-list-item v-if="button.subActionSlider" class="mr-9 mb-1">
                                        <v-range-slider vertical thumb-label="always" @change=button.subActionSlider.onChange(...button.subActionSlider.args) :min="popularityMin" :max="popularityMax" v-model="popularityValue"></v-range-slider>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-btn>
                        <!-- <v-btn small icon> This button isn't useful until we decide to do button overflows into a dropdown
                            <v-icon>mdi-chevron-down</v-icon>
                        </v-btn> -->
                    </v-btn-toggle>
                    <v-dialog v-model="promotionDialog" max-width="600px">
                        <v-card>
                            <v-card-title>
                                <span class="text-p">Promote to Existing</span>
                            </v-card-title>
                            <v-card-text>
                                <v-container>
                                    <v-text-field
                                    label="ID to Promote To"
                                    v-model="promoteToId"
                                    type="number"
                                    required
                                    autofocus
                                    @keydown.enter="promoteToExisting($event, promoteToId, selectedElement?.ElementType)"
                                    >
                                    </v-text-field>
                                </v-container>
                            </v-card-text>
                            <v-card-actions>
                            <v-spacer></v-spacer>
                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="promotionDialog = false"
                                >
                                    Close
                                </v-btn>
                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="promoteToExisting($event, promoteToId, selectedElement?.ElementType)"
                                    :loading="promotionDialogLoading"
                                >
                                    Submit
                                </v-btn>
                                </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <v-dialog v-model="fileDialog" max-width="600px" @click:outside="setFileDialogVisible(false)">
                        <v-card>
                            <v-card-title class="text-h5">Upload File</v-card-title>
                            <v-card-text>
                                <v-file-input v-model="filesToSubmit" small-chips multiple></v-file-input>
                                <span class="red--text">{{fileErrorText}}</span>
                                <span v-for="(file, index) in filesToSubmit" :key="file.Id">
                                    <v-text-field v-model="fileDescriptions[index]" :label="'Description for: ' + file.name" clearable></v-text-field>
                                </span>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="red darken-1"
                                    text
                                    @click="onFileDialogCancel"
                                >
                                    Cancel
                                </v-btn>
                                <v-btn
                                    color="green darken-1"
                                    text
                                    @click="onSubmitFiles()"
                                    :loading="fileDialogLoading"
                                >
                                    Submit
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>
                </v-col>
 
            </v-row>
            <v-row dense v-if="elementType == 'Alertgroup' && selectedElementAlertIds && selectedElementAlertIds.length > 0" class="mt-0">
                <v-spacer></v-spacer>
                <v-col class="align-self-end text-right pt-0">
                    <v-btn-toggle max=1 active-class="not-really-active">
                        <v-btn small v-for="button in alertExtraQuickButtons" @click=button.onClick(...button.args) :key="button.text + button.icon" :class="button.cssClass" :id="button.text.replace(/ /g, '') + button.icon">
                            <v-icon v-if="button.icon">
                                {{button.icon}}
                            </v-icon>
                            {{button.text}}
                            <v-menu v-if="button.subActions">
                                <template v-slot:activator="{ on, attrs }">
                                    <v-btn v-on="on" v-bind="attrs" class="mr-n1 elevation-2" outlined icon x-small>
                                        <v-icon small>
                                            mdi-chevron-down
                                        </v-icon>
                                    </v-btn>
                                </template>
                                <v-list>
                                    <v-list-item v-for="subButton in button.subActions" @click=subButton.onClick(...subButton.args) :key="subButton.text" :class="subButton.class">
                                        <v-icon v-if="subButton.icon">
                                            {{subButton.icon}}
                                        </v-icon>
                                        {{subButton.text}}
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </v-btn>
                        <v-btn small v-if="navigateVisible" :href="'/#' + this.eventIDStr">
                            Navigate
                        </v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>
        </v-container>
    </v-sheet>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from 'vue-property-decorator'
    import { Action, Getter, Mutation } from 'vuex-class';
    import { EntryClassEnum, IRElement, IRElementQuickButton, IRElementType, Entry, NewEntry, IRElementStatus, TLPCode } from '@/store/modules/IRElements/types'
    import { getExportURL } from '@/api/elements'
    import { User } from '@/store/modules/user/types';
    const namespace: string = 'IRElements';
    import EntityClassComboBox from '../EntityClassComponents/EntityClassIconComboBox.vue';
    import PermissionsPicker from '@/components/IRElementComponents/PermissionsPicker.vue';
    import TLPPicker from './TLPPicker.vue';
    import HistoryDialog from './HistoryDialog.vue';
    import AddTagSourceDialog from './AddTagSourceDialog.vue';
    @Component({
        components: {
            EntityClassComboBox,
            TLPPicker,
            PermissionsPicker,
            HistoryDialog,
            AddTagSourceDialog
        },
    })

    export default class MetaCard extends Vue {
        //@Action('retrieveElementList', { namespace }) retrieveElementList: any;
        @Mutation('toggleFlair', { namespace }) toggleFlair: CallableFunction;
        @Mutation('setSelectedAlertIds', { namespace }) setSelectedAlertIds: CallableFunction;
        @Mutation('setFileDialogVisible', { namespace }) setFileDialogVisible: CallableFunction;
        @Getter('selectedElementAlertIds', { namespace }) selectedElementAlertIds: Array<number> | null;
        @Getter('autoCompleteEntityClasses', { namespace }) autoCompleteEntityClasses: Array<any> | undefined;
        @Getter('currentUser', { 'namespace': 'user' }) currentUser: User;
        @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
        @Getter('elementType', { namespace }) elementType: IRElementType | null;
        @Getter('flairVisible', { namespace }) flairVisible: boolean
        @Getter('selectedElementEntries', { namespace }) selectedElementEntries: Array<Entry | NewEntry> | null;
        @Getter('elementTypePluralized', { namespace }) elementTypePluralized: string | null;
        @Getter('allEntryIds', { namespace }) allEntryIds: CallableFunction;
        @Getter('fileDialog', { namespace }) fileDialog: boolean;
        @Getter('showPopularity', { 'namespace': 'user' }) showPopularity: boolean
        @Action('retrieveSelectedElementbyID', { namespace }) retrieveSelectedElementbyID: any;
        @Action('retrieveElementEntriesbyID', { namespace }) retrieveElementEntriesbyID: CallableFunction
        @Action('updateSignatureStatsbyID', { namespace }) updateSignatureStatsbyID: CallableFunction
        @Action('retrieveSelectedElementFilesbyID', { namespace }) retrieveSelectedElementFilesbyID: CallableFunction
        @Action('getSignatureStatRankingbyID', { namespace }) getSignatureStatRankingbyID: CallableFunction
        @Action('modifySelectedAlertStatus', { namespace }) modifySelectedAlertStatus: CallableFunction;
        @Action('promoteSelectedAlerts', { namespace }) promoteSelectedAlerts: CallableFunction;
        @Action('promoteElements', { namespace }) promoteElements: CallableFunction;
        @Action('promoteSelectedToExisting', { namespace }) promoteSelectedToExisting: CallableFunction;
        @Action('retrieveSources', { namespace }) retrieveSources: CallableFunction;
        @Action('retrieveTags', { namespace }) retrieveTags: CallableFunction;
        @Action('submitTagsOrSources', { namespace }) submitTagsOrSources: CallableFunction;
        @Action('updateTagOrSourceDescription', { namespace }) updateTagOrSourceDescription: CallableFunction;
        @Action('unAssignTagOrSourceDescription', { namespace }) unAssignTagOrSourceDescription: CallableFunction;
        @Action('updateOrCreateEntryContent', { namespace }) updateOrCreateEntryContent: CallableFunction
        @Action('updateElementInList', { namespace }) updateElementInList: CallableFunction
        @Action('deleteElement', { namespace }) deleteElement: CallableFunction
        @Action('retrieveAllEntityClasses', { namespace }) retrieveAllEntityClasses: CallableFunction;
        @Action('updateEntityClassDescription', { namespace }) updateEntityClassDescription: CallableFunction
        @Action('removeEntityClasses', { namespace }) removeEntityClasses: CallableFunction
        @Action('submitFile', { namespace }) submitFile: CallableFunction
        @Action('addNewEntryWithEditModeOn', { namespace }) addNewEntryWithEditModeOn: CallableFunction;
        @Action('reflairSelectedElementbyID', { namespace }) reflairSelectedElementbyID: CallableFunction;
        @Action('favoriteElement', { namespace }) favoriteElement: CallableFunction;
        @Action('subscribeElement', { namespace }) subscribeElement: CallableFunction;
        @Action('unsubscribeElement', { namespace }) unsubscribeElement: CallableFunction;

        popularityMax: number = 0
        popularityMin: number = 0
        popularityValue: Array<number> = [this.popularityMin, this.popularityMax]

        alertExtraQuickButtons: Array<IRElementQuickButton> = [
            { "text": "Open", "onClick": this.changeAlertElementStatus, "icon": "mdi-eye", "cssClass": "red darken-1", "args": [IRElementStatus.Open] },
            { "text": "Close", "onClick": this.changeAlertElementStatus, "icon": "mdi-check-outline", "cssClass": "green", "args": [IRElementStatus.Closed] },
            { "text": "Promote", "onClick": this.changeAlertElementStatus, "icon": "mdi-alert-circle-outline", "cssClass": "amber", "args": [IRElementStatus.Promoted], "subActions": [
                { "text": "Promote and Copy Tags", "onClick": this.changeAlertElementStatus, args: [IRElementStatus.Promoted, true] },
                { "text": "Promote To Existing", "onClick": this.changeDialogToTrue, "cssClass": "purple", "args": [] }
            ]},
            { "text": "Delete Alerts", "onClick": this.deleteSelectedAlerts, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" },
        ]
        quickButtons: { [key in IRElementType]?: Array<IRElementQuickButton> } = {
            [IRElementType.Alertgroup]: [
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                    { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Open All", "onClick": this.openAllAlerts, "icon": "mdi-eye", "cssClass": "red darken-1", "args": [] },
                { "text": "Close All", "onClick": this.closeAllAlerts, "icon": "mdi-check-outline", "cssClass": "green", "args": [] },
                { "text": "Reflair Alertgroup", "onClick": this.requestReflair, "icon": "mdi-lightning-bolt", "cssClass": "blue", "args": [] },
                { "text": "Delete Alertgroup", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" },
            ],
            [IRElementType.Event]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                    { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                    { "text": "Add File", "onClick": this.addNewFileEntry, args: [] }
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": [true], "icon": "mdi-poll", cssClass: "",  "subActionSlider": {
                    "onChange": this.collapsePopularity,
                    "args": []
                }},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                    { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Promote", "onClick": this.promoteItem, "args": [], "icon": "mdi-bullhorn-outline", "cssClass": "amber", "subActions": [
                    { "text": "Promote and Copy Tags", "onClick": this.promoteItem, args: [true] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.Signature]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                    { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": ["all"], "icon": "mdi-poll", cssClass: "",  "subActions": [
                    { "text": "Show All", "onClick": this.collapsePopularity, args: ["all"] },
                    { "text": "Show Top", "onClick": this.collapsePopularity, args: ["top"] },
                    { "text": "Show Bottom", "onClick": this.collapsePopularity, args: ["bottom"] }
                ]},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                    { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.Incident]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                    { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                    { "text": "Add File", "onClick": this.addNewFileEntry, args: [] }
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": ["all"], "icon": "mdi-poll", cssClass: "",  "subActions": [
                    { "text": "Show All", "onClick": this.collapsePopularity, args: ["all"] },
                    { "text": "Show Top", "onClick": this.collapsePopularity, args: ["top"] },
                    { "text": "Show Bottom", "onClick": this.collapsePopularity, args: ["bottom"] }
                ]},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                    { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.Dispatch]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                    { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": ["all"], "icon": "mdi-poll", cssClass: "",  "subActions": [
                    { "text": "Show All", "onClick": this.collapsePopularity, args: ["all"] },
                    { "text": "Show Top", "onClick": this.collapsePopularity, args: ["top"] },
                    { "text": "Show Bottom", "onClick": this.collapsePopularity, args: ["bottom"] }
                ]},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                    { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Promote", "onClick": this.promoteItem, "args": [], "icon": "mdi-bullhorn-outline", "cssClass": "amber", "subActions": [
                    { "text": "Promote and Copy Tags", "onClick": this.promoteItem, args: [true] },
                    { "text": "Promote To Existing", "onClick": this.changeDialogToTrue, "cssClass": "purple", "args": [] }
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.Intel]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                    { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                    { "text": "Add File", "onClick": this.addNewFileEntry, args: [] }
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": ["all"], "icon": "mdi-poll", cssClass: "",  "subActions": [
                    { "text": "Show All", "onClick": this.collapsePopularity, args: ["all"] },
                    { "text": "Show Top", "onClick": this.collapsePopularity, args: ["top"] },
                    { "text": "Show Bottom", "onClick": this.collapsePopularity, args: ["bottom"] }
                ]},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                    { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.Product]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                    { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                    { "text": "Add File", "onClick": this.addNewFileEntry, args: [] }
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": ["all"], "icon": "mdi-poll", cssClass: "",  "subActions": [
                    { "text": "Show All", "onClick": this.collapsePopularity, args: ["all"] },
                    { "text": "Show Top", "onClick": this.collapsePopularity, args: ["top"] },
                    { "text": "Show Bottom", "onClick": this.collapsePopularity, args: ["bottom"] }
                ]},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                    { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.Entity]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                    { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": ["all"], "icon": "mdi-poll", cssClass: "",  "subActions": [
                    { "text": "Show All", "onClick": this.collapsePopularity, args: ["all"] },
                    { "text": "Show Top", "onClick": this.collapsePopularity, args: ["top"] },
                    { "text": "Show Bottom", "onClick": this.collapsePopularity, args: ["bottom"] }
                ]},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.Feed]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                        { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": ["all"], "icon": "mdi-poll", cssClass: "",  "subActions": [
                    { "text": "Show All", "onClick": this.collapsePopularity, args: ["all"] },
                    { "text": "Show Top", "onClick": this.collapsePopularity, args: ["top"] },
                    { "text": "Show Bottom", "onClick": this.collapsePopularity, args: ["bottom"] }
                ]},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                        { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.Guide]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                        { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": ["all"], "icon": "mdi-poll", cssClass: "",  "subActions": [
                    { "text": "Show All", "onClick": this.collapsePopularity, args: ["all"] },
                    { "text": "Show Top", "onClick": this.collapsePopularity, args: ["top"] },
                    { "text": "Show Bottom", "onClick": this.collapsePopularity, args: ["bottom"] }
                ]},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                        { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.Pivot]: [
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.EntityClass]: [
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]}
            ],
            [IRElementType.Entry]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]}
            ],
            [IRElementType.VulnFeed]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                    { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                    { "text": "Add File", "onClick": this.addNewFileEntry, args: [] }
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": ["all"], "icon": "mdi-poll", cssClass: "",  "subActions": [
                    { "text": "Show All", "onClick": this.collapsePopularity, args: ["all"] },
                    { "text": "Show Top", "onClick": this.collapsePopularity, args: ["top"] },
                    { "text": "Show Bottom", "onClick": this.collapsePopularity, args: ["bottom"] }
                ]},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                    { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Promote", "onClick": this.promoteItem, "args": [], "icon": "mdi-bullhorn-outline", "cssClass": "amber", "subActions": [
                    { "text": "Promote and Copy Tags", "onClick": this.promoteItem, args: [true] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
            [IRElementType.VulnTrack]: [
                { "text": "", "onClick": this.subscribeItem, "args": [], "icon": "mdi-bell-outline", "cssClass": "", "iconColor": "blue" },
                { "text": "", "onClick": this.favoriteItem, "args": [], "icon": "mdi-heart-outline", "cssClass": "", "iconColor": "red"},
                { "text": "Add Entry", "onClick": this.addNewWYSIWYGEntry, "args": [], "icon": "mdi-plus-circle-outline", "cssClass": "green", "subActions": [
                    { "text": "Add Action Entry", "onClick": this.addNewActionEntry, args: [] },
                    { "text": "Add File", "onClick": this.addNewFileEntry, args: [] }
                ]},
                { "text": "Popularity", "onClick": this.collapsePopularity, "args": ["all"], "icon": "mdi-poll", cssClass: "",  "subActions": [
                    { "text": "Show All", "onClick": this.collapsePopularity, args: ["all"] },
                    { "text": "Show Top", "onClick": this.collapsePopularity, args: ["top"] },
                    { "text": "Show Bottom", "onClick": this.collapsePopularity, args: ["bottom"] }
                ]},
                { "text": "Toggle Flair", "onClick": this.toggleFlairClicked, "args": [], "icon": "mdi-eye-off" },
                { "text": "Permissions", "onClick": this.openPermissionsDialog, "args": [], "icon": "mdi-account-multiple" },
                { "text": "History", "onClick": this.openViewHistoryDialog, "args": [], "icon": "mdi-clock-outline", "subActions": [
                    { "text": "View Edit History", "onClick": this.openEditHistoryDialog, args: [] },
                ]},
                { "text": "Export", "onClick": this.openExportDialog, "args": ["Export"], "icon": "mdi-export", "subActions": [
                    { "text": "as HTML", "onClick": this.exportItem, "args": ["html"] },
                    { "text": "as DOCX", "onClick": this.exportItem, "args": ["docx"] },
                    { "text": "as PDF", "onClick": this.exportItem, "args": ["pdf"] },
                    { "text": "as Markdown", "onClick": this.exportItem, "args": ["md"] },
                ]},
                { "text": "Delete", "onClick": this.deleteItem, "args": [], "icon": "mdi-delete-outline", "cssClass": "red" }],
        }

        sourcesDialog: boolean = false
        tagsDialog: boolean = false
        promotionDialog: boolean = false
        promotionDialogLoading: boolean = false
        promoteToId: number | null = null
        permissionsDialog: boolean = false
        historyDialog: boolean = false
        historyDialogTypes: Array<string> = ['read']
        editDescriptionEntityClassId: number|undefined = undefined
        entityClassesDialog: boolean = false
        descriptionsDialog: boolean = false
        entityClassDescriptionDialog: boolean = false
        subjectBeingEdited: boolean = false
        tagsBeingEdited: Array<number> = []
        sourcesBeingEdited: Array<number> = []
        editDescriptionTagSourceName: string = ""
        editDescriptionId: number | null = null
        filesToSubmit: Array<any> = []
        fileDescriptions: any = {}
        fileDialogLoading: boolean = false
        fileErrorText: string | null = null
        editDescriptionType: string = ""
        editDescriptionInput: string = ""
        updatedTagText: Array<string> = []
        updatedSourceText: Array<string> = []
        showRemoveUpdateTagSourceMenu: boolean = false
        showRemoveUpdateTagSourceMenuX: number = 0
        showRemoveUpdateTagSourceMenuY: number = 0
        editDescriptionEntityClassIcon = ""
        editDescriptionEntityClass = ""
        editDescriptionEntityClassName = ""
        showRemoveUpdateEntityClassMenu: boolean = false
        showRemoveUpdateEntityClassMenuX: number = 0
        showRemoveUpdateEntityClassMenuY: number = 0
        navigateVisible: boolean = false
        response: any
        eventIDStr: string = ""
    
        transformDateString(dateString: string) {
            const date: any = new Date(dateString)
            const options: any = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            return date.toLocaleDateString(undefined, options) + ' ' + date.toLocaleTimeString('en-US') 
        }

        async changeDialogToTrue() {
            this.promotionDialog = true
        }

        async favoriteItem() {
            if (this.selectedElement) {
                await this.favoriteElement({elementID: this.selectedElement.id, elementType: this.selectedElement.ElementType})
                this.setFavoriteIcons()
            }
        }

        async subscribeItem() {
            if (this.selectedElement) {
                if (!this.selectedElement.subscribed) {
                    await this.subscribeElement({ elementID: this.selectedElement.id, elementType: this.selectedElement.ElementType })
                }
                else {
                    await this.unsubscribeElement({ elementID: this.selectedElement.id, elementType: this.selectedElement.ElementType })
                }
                this.setSubscribeIcons()
            }
        }

        async requestReflair() {
            if (this.selectedElement && (this.selectedElement.ElementType == IRElementType.Alertgroup || this.selectedElement.ElementType == IRElementType.Entry))
            {
                await this.reflairSelectedElementbyID({elementType: this.selectedElement.ElementType, elementID: this.selectedElement.id})   
            }
        }

        async editTagSourceDescription() {
            await this.updateTagOrSourceDescription({ id: this.editDescriptionId, type: this.editDescriptionType, description: this.editDescriptionInput })
            this.descriptionsDialog = false
            this.editDescriptionTagSourceName = ""
            this.editDescriptionId = null
            this.editDescriptionType = ""
            this.editDescriptionInput = ""
        }

        onFileChange(e: File[]) {
            this.filesToSubmit = e
        }

        async onSubmitFiles() {
            if (this.selectedElement && this.filesToSubmit.length > 0) {
                this.fileDialogLoading = true
                let result = true
                for (const fileNumber in this.filesToSubmit) {
                    let description = null
                    if (Object.prototype.hasOwnProperty.call(this.fileDescriptions, fileNumber)) {
                        description = this.fileDescriptions[fileNumber]
                    }
                    const formData = new FormData()
                    formData.append('file', this.filesToSubmit[fileNumber])
                    result = result && await this.submitFile({formData:formData, targetType: String(this.elementType), targetId: String(this.selectedElement.id), description})
                }
                if (result) {
                    this.filesToSubmit = []
                    this.fileDescriptions = {}
                    this.setFileDialogVisible(false)
                    this.fileErrorText = null
                }
                else {
                    this.fileErrorText = "An error occurred during upload, your files may not have been uploaded"
                }
                this.fileDialogLoading = false
            }
        }

        async onFileDialogCancel() {
            if (!this.fileDialogLoading) {
                this.fileDialogLoading = false
                this.filesToSubmit = []
                this.fileDescriptions = {}
                this.fileErrorText = null
                this.setFileDialogVisible(false)
            }
        }
        
        async addNewFileEntry() {
            this.setFileDialogVisible(true)
        }


        onEntityClassesSubmitEvent() {
            this.entityClassesDialog = false
        }


        async callUpdateSignatureStats() {
            if(this.selectedElement!= null)
            {
                await this.updateSignatureStatsbyID({signatureId: this.selectedElement.id})
            }
        }


        async callSignatureStatRanking() {
            if(this.selectedElement!= null)
            {
                await this.getSignatureStatRankingbyID({signatureId: this.selectedElement.id})
            }
        }

        statusChoices() {
            if (this.elementType == IRElementType.Signature) {
                return [
                    { value: 'enabled', text: 'Enabled', color: 'green' },
                    { value: 'disabled', text: 'Disabled', color: 'red' }
                ]
            }
            else if (this.elementType == IRElementType.Entity) {
                return [
                    { value: 'tracked', text: 'Tracked', color: 'green' },
                    { value: 'untracked', text: 'Untracked', color: 'red' },
                ]
            }
            else if (this.elementType == IRElementType.Feed) {
                return [
                    { value: 'active', text: 'Active', color: 'green' },
                    { value: 'paused', text: 'Paused', color: 'red' },
                ]
            }
            else if (this.elementType == IRElementType.Guide) {
                return [
                    { value: 'current', text: 'Current', color: 'green' },
                    { value: 'outdated', text: 'Outdated', color: 'red' },
                ]
            }
            else if (this.selectedElement?.status == IRElementStatus.Promoted) {
                return [
                    { value: 'promoted', text: 'Promoted', color: 'amber' },
                    { value: 'open', text: 'Open', color: 'red' },
                    { value: 'closed', text: 'Closed', color: 'green' }
                ]
            }
            else {
                return [
                    { value: 'open', text: 'Open', color: 'red' },
                    { value: 'closed', text: 'Closed', color: 'green' }
                ]
            }
        }

        ownerChoices() {
            if (this.selectedElement?.owner == this.currentUser.username) {
                return []
            }
            else {
                return [{ value: null, text: 'Take Ownership' }]
            }
        }

        async removeTagSource() {
            if (this.selectedElement != null) {
                await this.unAssignTagOrSourceDescription({ id: this.editDescriptionId, type: this.editDescriptionType, targetElementType: this.elementType, targetElementId: this.selectedElement.id })
            }
        }

        async removeTagSourceById(id: number, type: string) {
            if (this.selectedElement != null) {
                await this.unAssignTagOrSourceDescription({ id: id, type: type, targetElementType: this.elementType, targetElementId: this.selectedElement.id })
            }
        }

        async showSourcesDialog() {
            this.sourcesDialog = true
        }

        async showTagsDialog() {
            this.tagsDialog = true
        }

        async showEntityClassesDialog() {
            await this.retrieveAllEntityClasses()
            this.entityClassesDialog= true
        }

        async removeEntityClassbyId(entityClassId:number){
            if (this.selectedElement && this.selectedElement.classes){
                await this.removeEntityClasses({entityClassId: entityClassId, targetEntityId:this.selectedElement.id})
            }
        }

        onExistingTagSourceRightClick(e: any, tagSourceId: number, tagSourceType: string, tagSourceName: string, tagSourceDescription: string) {
            this.editDescriptionTagSourceName = tagSourceName
            this.editDescriptionId = tagSourceId
            this.editDescriptionType = tagSourceType
            this.editDescriptionInput = tagSourceDescription
            this.showRemoveUpdateTagSourceMenuX = e.clientX
            this.showRemoveUpdateTagSourceMenuY = e.clientY
            this.showRemoveUpdateTagSourceMenu = true
        }

        onEditEntityClassDescriptionClick(e:any, id:number, name:string, description:string, icon:string){
            this.editDescriptionEntityClass = description
            this.editDescriptionEntityClassId = id
            this.editDescriptionEntityClassName = name
            this.editDescriptionEntityClassIcon = icon
            this.entityClassDescriptionDialog = true
        }

        onEditDescriptionClick() {
            this.showRemoveUpdateTagSourceMenu = false
            this.descriptionsDialog = true
        }

        async OnUpdateEntityClassDescription(){
            if (this.selectedElement)
            {
                await this.updateEntityClassDescription({entityClassId:this.editDescriptionEntityClassId, newDescription: this.editDescriptionEntityClass})
                this.entityClassDescriptionDialog = false
            }
        }
        onExistingTagClick(tagID: number) {
            this.tagsBeingEdited.push(tagID)
        }

        async onExistingSourceEditSubmit(sourceID: number, updatedSourceIndex: number) {
            if (this.sourcesBeingEdited.includes(sourceID)) {
                if (this.selectedElement != null) {
                    const toChangeText = this.updatedSourceText[updatedSourceIndex]
                    await this.unAssignTagOrSourceDescription({
                        id: sourceID,
                        type: "source",
                        targetElementType: this.elementType,
                        targetElementId: this.selectedElement.id
                    })
                    var index = this.sourcesBeingEdited.indexOf(sourceID);
                    if (index !== -1) {
                        this.sourcesBeingEdited.splice(index, 1);
                    }
                    await this.submitTagsOrSources({
                        newTagsOrSources: [toChangeText],
                        type: "source",
                        targetElementType: this.selectedElement.ElementType,
                        targetElementId: this.selectedElement.id
                    })
                }
            }
        }

        onExistingSourceClick(tagID: number) {
            this.sourcesBeingEdited.push(tagID)
        }

        async onExistingTagEditSubmit(tagID: number, updatedTagIndex: number) {
            if (this.tagsBeingEdited.includes(tagID)) {
                if (this.selectedElement != null) {
                    const toChangeText = this.updatedTagText[updatedTagIndex]
                    await this.unAssignTagOrSourceDescription({
                        id: tagID,
                        type: "tag",
                        targetElementType: this.elementType,
                        targetElementId: this.selectedElement.id
                    })
                    var index = this.tagsBeingEdited.indexOf(tagID);
                    if (index !== -1) {
                        this.tagsBeingEdited.splice(index, 1);
                    }
                    await this.submitTagsOrSources({
                        newTagsOrSources: [toChangeText],
                        type: "tag",
                        targetElementType: this.selectedElement.ElementType,
                        targetElementId: this.selectedElement.id
                    })
                }
            }
        }

        refreshTags() {
            this.updatedTagText = []
            if (this.selectedElement != null && this.selectedElement.tags != null) {
                for (const t of this.selectedElement.tags) {
                    this.updatedTagText.push(t.name)
                }
            }
        }

        refreshSources() {
            this.updatedSourceText = []
            if (this.selectedElement != null && this.selectedElement.sources != null) {
                for (const t of this.selectedElement.sources) {
                    this.updatedSourceText.push(t.name)
                }
            }
        }

        @Watch("showPopularity")
        showHidePopularityButton() {
            for (const item in this.quickButtons) {
                const buttons = this.quickButtons[item as IRElementType] || null
                if (buttons) {
                    for (const button of buttons) {
                        if (button.text == "Popularity") {
                            button.cssClass = this.showPopularity ? "" : "d-none"
                        }
                    }
                }
            }
        }

        async beforeDestroy() {
            document.removeEventListener("keydown", this.handleKeyboardShortcuts)
        }

        mounted() {
            this.refreshTags()
            this.refreshSources()
            this.setFlairIcons()
            this.showHidePopularityButton()
            this.updatePopularityRangeSelector()
            this.setFavoriteIcons()
            this.setSubscribeIcons()
            document.addEventListener('keydown', this.handleKeyboardShortcuts)
        }

        updated() {
            this.refreshTags()
            this.refreshSources()
            this.setFavoriteIcons()
            this.setSubscribeIcons()
        }

        async addNewWYSIWYGEntry() {
            // Only allow one entry to be added at a time. So check to see if any entries have an entry id of -1.
            if (this.selectedElementEntries != null) {
                const newEntryAlreadyExists = this.allEntryIds().findIndex((id: number) => id === -1) != -1
                if (newEntryAlreadyExists == false) {
                    const newEntryPayload = {
                        'owner': this.currentUser.username,
                        'IRElementType': this.elementType,
                        'IRElementTypeId': this.selectedElement?.id,
                        'EntryClassEnum': EntryClassEnum[EntryClassEnum.entry]
                    }
                    await this.addNewEntryWithEditModeOn({
                        newEntryPayload: newEntryPayload,
                        linkedElementType: null,
                        linkedElementId: null,
                        linkedElementIndex: null,
                        treePath: null
                    })  
                }
                else {
                    this.$root.$emit('highlightEntry-1')
                }
            }
        }

        @Watch("selectedElementEntries", {deep: true})
        updatePopularityRangeSelector() {
            //get all popularity counts from all entries
            let popularityCounts = this.selectedElementEntries?.map(a => a?.popularity_count) //get all parent entry popularity counts
                .concat( //add to parent list
                    this.selectedElementEntries?.map(a => a?.childEntries?.map(b => b?.popularity_count) //get all child popularity counts
                ).flatMap(a => a)) //make all sub arrays a single array
                .filter((item): item is number => !!item) //filter out any undefined items making sure to call out that there will be no undefined values otherwise typescript will complain
                .sort((a, b) => (a - b)) //sort number correctly because it does it by some ascii nonsense for some reason like an array of [-2, -1, 1] will be sorted to [-1, -2, 1] why, WHO KNOWS!

            //if we have some numbers
            if (popularityCounts && popularityCounts.length > 0) {
                //update min and max only if changed
                const min = popularityCounts[0] as number
                let reset = false
                if (min != this.popularityMin) {
                    this.popularityMin = min
                    reset = true
                }
                const max = popularityCounts[popularityCounts.length - 1] as number
                if (max != this.popularityMax) {
                    this.popularityMax = max
                    reset = true
                }
                if (reset)
                    //reset collapse because numbers changed
                    this.collapsePopularity(true)
            }
        }

        async collapsePopularity(reset: boolean = false) {
            if (reset)
                this.popularityValue = [this.popularityMin, this.popularityMax]

            function collapse(entry: Entry | NewEntry, popularityMin: number, popularityMax: number) {
                if (entry.popularity_count) {
                    if (entry.popularity_count >= popularityMin && entry.popularity_count <= popularityMax) {
                        entry.collapsed = false
                    }
                    else {
                        entry.collapsed = true
                    }
                }
            }
            this.selectedElementEntries?.forEach(a => {
                a.childEntries?.forEach(b => {
                    collapse(b, this.popularityValue.at(0) as number, this.popularityValue.at(-1) as number)
                })
                collapse(a, this.popularityValue.at(0) as number, this.popularityValue.at(-1) as number)
            })
        }

        async addNewActionEntry() {
            // Only allow one entry to be added at a time. So check to see if any entries have an entry id of -1.
            if (this.selectedElementEntries != null) {
                const newEntryAlreadyExists = this.selectedElementEntries.findIndex(entry => entry.id === -1) != -1
                if (newEntryAlreadyExists == false) {
                    const newEntryPayload = {
                        'owner': this.currentUser.username,
                        'IRElementType': this.elementType,
                        'IRElementTypeId': this.selectedElement?.id,
                        'EntryClassEnum': EntryClassEnum[EntryClassEnum.action]
                    }
                    await this.addNewEntryWithEditModeOn({
                        newEntryPayload: newEntryPayload,
                        linkedElementType: null,
                        linkedElementId: null,
                        linkedElementIndex: null,
                        treePath: null
                    })
                }
            }
        }

        async changeAlertElementStatus(status: IRElementStatus, propagateSourcesTags: boolean = false) {
            if (status == IRElementStatus.Promoted ){
                this.navigateVisible = true
            }
            else{
                this.navigateVisible = false
            }

            if (status == IRElementStatus.Promoted && this.selectedElementAlertIds && this.selectedElementAlertIds.length > 0) {
                this.response = await this.promoteSelectedAlerts({
                    selectedAlertIds: this.selectedElementAlertIds,
                    newTags: propagateSourcesTags ? this.selectedElement?.tags?.map(t => t.name) : undefined,
                    newSources: propagateSourcesTags ? this.selectedElement?.sources?.map(t => t.name) : undefined,
                })
                this.eventIDStr = "/events/" + this.response.id.toString()
            }
            else if (this.selectedElementAlertIds && this.selectedElementAlertIds.length > 0) {
                await this.modifySelectedAlertStatus({ selectedAlertIds: this.selectedElementAlertIds, newStatus: status })
            }
        }

        async deleteSelectedAlerts() {
            var result = confirm("Are you sure you want to delete the selected alerts?");
            if (result) {
                const deletePromises = []
                if (this.selectedElementAlertIds) {
                    for (const alertID of this.selectedElementAlertIds) {
                        deletePromises.push(this.deleteElement({ elementId: alertID, elementType: IRElementType.Alert }))
                    }
                }
                await Promise.all(deletePromises)
                this.setSelectedAlertIds([])
            }
        }

        async promoteToExisting(e: any, promoteId: number, elementType: IRElementType, propagateSourcesTags: boolean = false) {
            this.promotionDialogLoading = true
            let selectedIds = [this.selectedElement?.id]
            if (this.selectedElementAlertIds && this.selectedElementAlertIds.length > 0) {
                selectedIds = this.selectedElementAlertIds
                elementType = IRElementType.Alert
            }
            await this.promoteSelectedToExisting({
                selectedIds: selectedIds,
                elementType: elementType,
                existingEventId: promoteId,
                newTags: propagateSourcesTags ? this.selectedElement?.tags?.map(t => t.name) : undefined,
                newSources: propagateSourcesTags ? this.selectedElement?.sources?.map(t => t.name) : undefined,
            })
            this.promotionDialogLoading = false
            this.promotionDialog = false
        }

        async promoteItem(propagateSourcesTags: boolean = false) {
            await this.promoteElements({
                elementIds: [this.selectedElement?.id],
                elementType: this.elementType,
                newTags: propagateSourcesTags ? this.selectedElement?.tags?.map(t => t.name) : undefined,
                newSources: propagateSourcesTags ? this.selectedElement?.sources?.map(t => t.name) : undefined,
            })
            await this.retrieveSelectedElementbyID({ elementID: this.selectedElement?.id,
                elementType: this.elementType})
                
        }

        
        async updateSubjectField(event: FocusEvent, key: string) {
            this.subjectBeingEdited = false
            if (event.target instanceof HTMLElement) {
                const updateData = { [key]: (event.target as HTMLInputElement).value }
                await this.updateElementInList({
                    elementId: this.selectedElement?.id,
                    elementType: this.selectedElement?.ElementType,
                    updateData: updateData
                })
            }
        }

        async subjectButtonClicked(event: MouseEvent) {
            this.subjectBeingEdited = !this.subjectBeingEdited
            const button = event.target as Element
            if (this.subjectBeingEdited) {
                const inputElement = button.parentElement?.parentElement?.parentElement?.querySelector("input")
                if (inputElement) {
                    inputElement.focus()
                }
            }
            else {
                (document.activeElement as HTMLElement).blur()
            }
        }

        async subjectEnterPressed(event: KeyboardEvent) {
            this.subjectBeingEdited = false;
            (event.target as HTMLElement).blur();
        }

        async ownerSelectChanged(newVal: any) {
            if (newVal == null) { // User is taking ownership for themselves
                const updateData = { owner: this.currentUser.username }
                if (this.selectedElement) {
                    this.selectedElement.owner = this.currentUser.username
                }
                await this.updateElementInList({
                    elementId: this.selectedElement?.id,
                    elementType: this.selectedElement?.ElementType,
                    updateData: updateData
                })
            }
        }

        async statusSelectChanged(newVal: any) {
            if (newVal) {
                const updateData = { status: newVal }
                await this.updateElementInList({
                    elementId: this.selectedElement?.id,
                    elementType: this.selectedElement?.ElementType,
                    updateData: updateData
                })
            }
        }

        async handleKeyboardShortcuts(e: KeyboardEvent) {
            //only run for elements that have the status property
            if(Object.prototype.hasOwnProperty.call(this.selectedElement, "status")) {
                // Check for event target so this doesn't fire if someone's typing in a text box or something
                if (e.target && (e.target as HTMLElement).tagName == 'BODY' && !(e.metaKey || e.altKey || e.ctrlKey)) {
                    if (e.key == 'c' && this.selectedElement?.status == IRElementStatus.Open) {
                        await this.statusSelectChanged(IRElementStatus.Closed)
                    }
                    if (e.key == 'o' && this.selectedElement?.status == IRElementStatus.Closed) {
                        await this.statusSelectChanged(IRElementStatus.Open)
                    }
                }
            }
        }

        async closeAllAlerts() {
            const allOpenAlertIds = this.selectedElement?.full_alert_data
                ?.filter((alert) => alert.status == IRElementStatus.Open.toLowerCase())
                ?.map((alert) => alert.id)
            if (allOpenAlertIds) {
                await this.modifySelectedAlertStatus({ selectedAlertIds: allOpenAlertIds, newStatus: IRElementStatus.Closed })
            }
        }

        async openAllAlerts() {
            const allClosedAlertIds = this.selectedElement?.full_alert_data
                ?.filter((alert) => alert.status == IRElementStatus.Closed.toLowerCase())
                ?.map((alert) => alert.id)
            if (allClosedAlertIds) {
                await this.modifySelectedAlertStatus({ selectedAlertIds: allClosedAlertIds, newStatus: IRElementStatus.Open })
            }
        }

        async tlpPickerInput(val: TLPCode) {
            if (this.selectedElement && val) {
                const updateData = { tlp: val }
                await this.updateElementInList({
                    elementId: this.selectedElement?.id,
                    elementType: this.selectedElement?.ElementType,
                    updateData: updateData
                })
                this.selectedElement.tlp = val
            }
        }

        async closeElement() {
            let newRouteString = "/" + this.elementTypePluralized?.toLowerCase()
            this.$router.push(newRouteString).catch((err: any) => { return })
        }

        async deleteItem() {
            if (this.selectedElement) {
                var result = confirm("Are you sure you want to delete " + this.elementType + " " + String(this.selectedElement.id) + "?");
                if(result){
                    await this.deleteElement({ elementId: this.selectedElement.id, elementType: this.elementType })
                    await this.closeElement()
                }
            }
        }

        toggleFlairClicked() {
            this.toggleFlair()
            this.setFlairIcons()
        }

        setFlairIcons() {
            for (const item in this.quickButtons) {
                const buttons = this.quickButtons[item as IRElementType] || null
                if (buttons) {
                    for (const button of buttons) {
                        if (button.text == "Toggle Flair") {
                            if (this.flairVisible) {
                                button.icon = "mdi-eye-off"
                            }
                            else if (!this.flairVisible) {
                                button.icon = "mdi-eye"
                            }
                        }
                    }
                }
            }
        }

        setFavoriteIcons() {
            const buttons = this.quickButtons[this.selectedElement?.ElementType as IRElementType] || null
            if (buttons) {
                for (const button of buttons) {
                    if (button.onClick == this.favoriteItem) {
                        if (this.selectedElement?.favorite) {
                            button.icon = "mdi-heart"
                        }
                        else {
                            button.icon = "mdi-heart-outline"
                        }
                    }
                }
            }
        }

        setSubscribeIcons() {
            const buttons = this.quickButtons[this.selectedElement?.ElementType as IRElementType] || null
            if (buttons) {
                for (const button of buttons) {
                    if (button.onClick == this.subscribeItem) {
                        if (this.selectedElement?.subscribed) {
                            button.icon = "mdi-bell"
                        }
                        else {
                            button.icon = "mdi-bell-outline"
                        }
                    }
                }
            }
        }

        openPermissionsDialog() {
            this.permissionsDialog = true
        }

        openViewHistoryDialog() {
            this.historyDialogTypes = ['read']
            this.historyDialog = true
        }

        openEditHistoryDialog() {
            this.historyDialogTypes = ['create', 'update', 'delete']
            this.historyDialog = true
        }

        openExportDialog(id: string) {
            document.querySelector(`#${id}`)?.querySelector("button")?.click()
        }

        async exportItem(format: string) {
            if (this.selectedElement && this.selectedElement.id && this.elementType) {
                let link = document.createElement("a")
                link.href = `${Vue.axios.defaults.baseURL}${getExportURL(this.elementType, this.selectedElement.id, format)}`
                link.click()
            }
            else {
                return null
            }
        }
    }
</script>
<style scoped>
    .item-title {
        font-size: xx-large;
        min-width: 200px;
        width: 100%;
    }

    /deep/ .item-title input {
        max-height: 100%;
    }

    .v-btn--active.not-really-active:not(:hover)::before {
        opacity: 0 !important;
    }

    [contenteditable][placeholder]:empty:before {
        content: attr(placeholder);
        color: gray;
        background-color: transparent;
    }

    .select-chip {
        width: 95%;
        justify-content: center;
    }

    .status-chip-triple {
        width: 25%;
        justify-content: center;
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

    /deep/.ownerselect input::placeholder {
        color: inherit;
        opacity: 1;
    }

    /deep/.ownerselect .v-text-field__details {
        display: none;
    }
</style>
