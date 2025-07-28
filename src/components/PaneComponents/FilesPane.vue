<template>
    <div>
        <v-data-table :headers="filesTableHeaders"
                    :items="retrievingFiles ? []: selectedElementFiles"
                    id="filesTable"
                    v-model=selectedFiles
                    ref="filesTable"
                    show-select
                    :items-per-page=-1
                    :hide-default-footer="true"
                    :loading="retrievingFiles == true">
            <template v-slot:footer>
                <v-divider></v-divider>
                <v-btn color="green" small class="mr-1" @click="setFileDialogVisible(true)">
                    <v-icon>
                        mdi-plus-circle
                    </v-icon>
                    Add File
                </v-btn>
                <v-btn v-if="selectedFiles.length > 0" color="blue" small class="mr-1" @click="editFile">
                    <v-icon>
                        mdi-file-edit
                    </v-icon>
                    {{selectedFiles.length > 1 ? "Edit Files" : "Edit File"}}
                </v-btn>
                <v-menu v-if="selectedFiles.length > 0" :close-on-content-click="false">
                    <template v-slot:activator="{on, attrs}">
                        <v-btn color="green" small class="mr-1" v-bind="attrs" v-on="on">
                            <v-icon>
                                mdi-file-download
                            </v-icon>
                            Download
                            <v-icon small>
                                mdi-chevron-down
                            </v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item class="pt-2">
                            <v-text-field dense label="Encryption Password" v-model="filePassword" hint="optional" persistent-hint/>
                        </v-list-item>
                        <v-list-item :href="downloadFiles" target="_blank">
                            {{selectedFiles.length > 1 ? "Download Files" : "Download File"}}
                        </v-list-item>
                    </v-list>
                </v-menu>
                <v-btn v-if="selectedFiles.length > 0" color="red" small @click="removeFiles">
                    <v-icon>
                        mdi-delete
                    </v-icon>
                    {{selectedFiles.length > 1 ? "Delete Files" : "Delete File"}}
                </v-btn>
            </template>
        </v-data-table>

        <v-dialog v-model="editDialog" max-width="600px">
            <v-card>
                <v-card-title class="text-h5">{{selectedFiles.length > 1 ? "Edit Files" : "Edit File"}}</v-card-title>
                <v-card-text>
                    <span v-for="file in editFiles" :key="file.Id">
                        <v-text-field v-model="file.filename" label="File Name" clearable :rules="[v => !!v || 'Required']" :data-filename="file.filename" required></v-text-field>
                        <v-text-field v-model="file.description" label="Description" clearable  :data-filename="file.description"></v-text-field>
                        <v-divider></v-divider>
                    </span>
                    <span class="red--text">{{fileErrorText}}</span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="red darken-1"
                        text
                        @click="onFileEditDialogCancel"
                    >
                        Cancel
                    </v-btn>
                    <v-btn
                        color="green darken-1"
                        text
                        @click="onSubmitEditFiles()"
                        :loading="editFileDialogLoading"
                    >
                        Submit
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action, Mutation } from 'vuex-class';
import { IRElement, ScotFile } from '@/store/modules/IRElements/types'
const namespace: string = 'IRElements';

@Component({
  components: {
    },
})

export default class FilesPane extends Vue {
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
    @Getter('selectedElementFiles', { namespace }) selectedElementFiles: Array<ScotFile>
    @Mutation('setFileDialogVisible', { namespace }) setFileDialogVisible: CallableFunction;
    @Action('retrieveSelectedElementFilesbyID', { namespace }) retrieveSelectedElementFilesbyID: CallableFunction
    @Action('deleteFile', { namespace }) deleteFile: CallableFunction
    @Action('retrieveElementEntriesbyID', { namespace }) retrieveElementEntriesbyID: CallableFunction
    @Action('updateFile', { namespace }) updateFile: CallableFunction

    filesTableHeaders: Array<any> = [
        { "text": "ID", "value": "id" },
        { "text": "File Name", "value": "filename" },
        { "text": "Description", "value": "description", "cellClass": "text-truncate truncate-size" },
        { "text": "File Size", "value": "filesize" },
        { "text": "Content Type", "value": "content_type" }
    ]
    tab = null
    selectedFiles: Array<any> = []
    retrievingFiles: boolean = false
    editFiles: Array<any> = []
    editDialog: boolean = false
    editFileDialogLoading: boolean = false
    fileErrorText: string | null = null
    filePassword: string | null = null


    async removeFiles() {
        if (this.selectedElement) {
            this.retrievingFiles = true
            await this.deleteFile({ fileId: this.selectedFiles.map((el: any) => el.id), targetId: this.selectedElement.id, targetType: this.selectedElement?.ElementType })
            await this.retrieveSelectedElementFilesbyID({ elementType: this.selectedElement?.ElementType, elementID: this.selectedElement.id })
            this.retrievingFiles = false
        }
    }

    async onFileSelected(isSelected: any, select: any) {
        select(!isSelected)
    }

    async editFile() {
        if (this.selectedElement) {
            this.selectedFiles.forEach((element: any) => {
                this.editFiles.push(Object.assign({}, element))
            });
            this.editDialog = true
            this.editFileDialogLoading = false
        }
    }

    async onFileEditDialogCancel() {
        if (!this.editFileDialogLoading) {
            this.editDialog = false
            this.editFiles = []
            this.selectedFiles = []
            this.editFileDialogLoading = false
        }
    }

    async onSubmitEditFiles() {
        if (this.selectedElement) {
            this.editFileDialogLoading = true
            let result = true
            for (const index in this.editFiles) {
                let update = this.editFiles[index]
                let original = this.selectedFiles.find(a => a.id == update.id)
                let filename = null
                if (update.filename != original.filename) {
                    filename = update.filename
                }
                let description = null
                if (update.description != original.description) {
                    description = update.description
                }
                if (filename != null || description != null) {
                    result = result && await this.updateFile({fileId: update.id, filename: filename, description: description})
                }
            }
            if (result) {
                await this.retrieveSelectedElementFilesbyID({ elementType: this.selectedElement?.ElementType, elementID: this.selectedElement.id })
            }
            this.editFiles = []
            this.selectedFiles = []
            this.editFileDialogLoading = false
            this.editDialog = false
        }
    }

    get downloadFiles() {
        if (this.selectedElement) {
            let password = ""
            if (this.filePassword) {
                password = `&password=${this.filePassword}`
                this.filePassword = null
            }
            const fileIds = this.selectedFiles.map(obj => `ids=${obj.id}`).join("&")
            return `${Vue.axios.defaults.baseURL}/file/download/many?${fileIds}${password}`
        }
        else {
            return null
        }
    }

    async mounted() {
        if (this.selectedElement) {
            this.retrievingFiles = true
            await this.retrieveSelectedElementFilesbyID({ elementType: this.selectedElement?.ElementType, elementID: this.selectedElement.id })
            this.retrievingFiles = false
        }
    }

    @Watch('selectedElement.id')
    async onSelectedElementChange() {
        if (this.selectedElement) {
            this.retrievingFiles = true
            await this.retrieveSelectedElementFilesbyID({ elementType: this.selectedElement?.ElementType, elementID: this.selectedElement.id })
            this.retrievingFiles = false
        }
    }

    @Watch('selectedElementFiles')
    async onSelectedElementFilesChanged(newVal: Array<ScotFile>) {
        if (this.selectedElement) {
            this.selectedElement.file_count = newVal.length
        }
    }
}
</script>

<style>
.truncate-size {
    max-width: 1px !important;
}
</style>
