<template>
    <v-dialog v-model="dialogOpen" max-width="600px">
        <v-card>
            <v-card-title>
                {{ isRemove ? "Remove" : "Add" }} Class and/or Tag:
            </v-card-title>
            <v-card-text>
                <v-form ref="classifyForm">
                    <v-list dense>
                        <v-list-item v-for="entity in entities" :key="entity.id">
                            <v-list-item-content>
                                <v-list-item-title>
                                    <v-icon small class="mr-2">mdi-checkbox-blank-circle</v-icon>
                                    {{ entity.value}} ({{entity.type_name}})
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list>
                    <!-- Section for Class -->
                    <v-divider></v-divider>
                    <v-subheader>Class</v-subheader>
                    <v-autocomplete
                        v-model="selectedClass"
                        :items="classes.map(type => type.name)"
                        label="Select Class"
                        required
                        solo
                        clearable
                    ></v-autocomplete>
                     <!-- Section for Tag -->
                    <v-divider></v-divider>
                    <v-subheader>Tag</v-subheader>
                    <v-autocomplete
                        v-model="selectedTag"
                        :items="tags.map(type => type.name)"
                        label="Select Tag"
                        solo
                        clearable
                        :loading="loading"
                        :search-input.sync="tagSearch"
                        @update:search-input="onTagSearch"
                    ></v-autocomplete>
                    <v-alert v-if="errorMessage" type="error" dismissible @input="errorMessage = ''">
                        {{ errorMessage }}
                    </v-alert>
                    <!---Section for Comment Entry -->
                    <v-divider></v-divider>
                    <v-textarea label="Add Comments" outlined v-model="comments"></v-textarea>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-btn @click="submitClassifyForm" color="green" :loading="submitLoading">
                    Submit
                </v-btn>
                <v-btn @click="closeModal">
                    Cancel
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts">
import { EntryClassEnum, IRElementType } from '@/store/modules/IRElements/types';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Action, Getter } from 'vuex-class';
import { User } from '@/store/modules/user/types'
const namespace: string = 'IRElements';

@Component
export default class ClassifyModal extends Vue {
    @Prop({ default: false }) value!: boolean;
    @Prop({ default: () => [] }) selectedEntityIds!: number[];
    @Prop({ default: () => [] }) selectedEntityClasses!: any[];
    @Prop({ default: () => [] }) selectedEntityTags!: any[];
    @Prop({ default: false }) isRemove!: boolean;
    @Action('removeEntityClasses', { namespace }) removeEntityClasses: CallableFunction;
    @Action('submitEntityClasses', { namespace }) submitEntityClasses: CallableFunction;
    @Action('removeEntityTag', { namespace }) removeEntityTag: CallableFunction;
    @Action('submitEntityTag', { namespace }) submitEntityTag: CallableFunction;
    @Action('updateOrCreateEntryContent', { namespace }) updateOrCreateEntryContent: CallableFunction
    @Getter('currentUser', { 'namespace': 'user' }) currentUser: User;


    dialogOpen: boolean = false;
    selectedClass: string = '';
    selectedTag: string = '';
    classes: { id: number, name: string }[] = [];
    tags: { id: number, name: string }[] = [];
    entities: any[] = [];
    submitLoading: boolean = false;
    loading: boolean = false;
    classSearch: string = '';
    tagSearch: string = '';
    errorMessage: string = '';
    comments: string = '';

    mounted() {
        this.dialogOpen = this.value;
    }

    @Watch('value')
    onValueChange(newVal: boolean) {
        this.dialogOpen = newVal;
    }

    @Watch('dialogOpen')
    onDialogChange(newVal: boolean) {
        this.$emit('input', newVal);
        this.loadClassTypes();
        if (this.isRemove) {
            this.tags = this.selectedEntityTags
        }
    }

    async loadClassTypes() {
        try {
            const filterDict = {
                limit: -1
            };
            if (this.isRemove) {
                this.classes = this.selectedEntityClasses.map((item: any) => ({
                    id: item.id,
                    name: item.display_name
                }))
            }
            else {
                const response = await Vue.prototype.$api.elements.retrieveAllEntityClasses(filterDict)
                this.classes = response.data.result.map((item: any) => ({
                    id: item.id,
                    name: item.display_name
                }));
            }
        } catch (error) {
            this.errorMessage = 'Error fetching class types';
            console.error('Error fetching class types:', error);
        }
    }

    async onTagSearch(search: string) {
        this.tagSearch = search;
        this.loading = true;
        try {
            let filterDict: any = {
                name: search,
                limit: 10
            };
            //force the search to only include ids of the selected entity if any
            if (this.isRemove && this.selectedEntityTags.length > 0) {
                filterDict.id = `[${this.selectedEntityTags.map((a: any) => {return a.id}).join()}]`
            }
            const response = await Vue.prototype.$api.elements.retrieveTags(filterDict); // Call the search API for tags
            this.tags = response.data.result.map((item: any) => ({
                id: item.id,
                name: item.name
            }));
            this.tags.filter(tag => tag.name); // filter out null or empty names
        } catch (error) {
            this.errorMessage = 'Error searching tags';
            console.error('Error searching tags:', error);
        } finally {
            this.loading = false;
        }
    }

    closeModal() {
        this.dialogOpen = false;
    }

    async submitClassifyForm() {
        if (this.selectedEntityIds.length === 0) {
            this.errorMessage = 'Please select at least one entity.';
            return;
        }
        if (!this.selectedClass && !this.selectedTag) {
            this.errorMessage = 'Please select at least one class or tag.';
            return;
        }
        this.submitLoading = true;
        try {
            if (this.selectedClass) {
                const selectedClassType = this.classes.find(type => type.name === this.selectedClass);
                if (!selectedClassType) {
                    this.errorMessage = 'Selected class not found';
                    return;
                }
                const entityClassesToAdd = [selectedClassType.id];
                for (var i = 0; i < this.selectedEntityIds.length; i++) {
                    if (this.isRemove) {
                        await this.removeEntityClasses({entityClassId: entityClassesToAdd, targetEntityId: this.selectedEntityIds[i]})
                    }
                    else {
                        await this.submitEntityClasses({newEntityClasses: entityClassesToAdd, targetEntityId: this.selectedEntityIds[i]})
                    }
                }
            } 
            if (this.selectedTag) {
                const selectedTagType = this.tags.find(type => type.name === this.selectedTag);
                if (!selectedTagType) {
                    this.errorMessage = 'Selected tag not found';
                    return;
                }
                for (var j = 0; j < this.selectedEntityIds.length; j++) {
                    if (this.isRemove) {
                        await this.removeEntityTag({entityTagId: selectedTagType.id, targetEntityId: this.selectedEntityIds[j]})
                    }
                    else {
                        await this.submitEntityTag({newEntityTag: selectedTagType.id, targetEntityId: this.selectedEntityIds[j]})
                    }
                }
            }

            if (this.comments) {
                for (var k = 0; k < this.selectedEntityIds.length; k++) {
                    await Vue.prototype.$api.elements.updateOrCreateEntry(-1, {
                        owner: this.currentUser.username,
                        target_type: IRElementType.Entity,
                        target_id: this.selectedEntityIds[k],
                        entry_class: EntryClassEnum.entry,
                        entry_data: {"html": `<p>${this.comments}</p>`},
                    })
                }
            }
            this.$emit('submit-success');
            this.dialogOpen = false;
            this.closeModal();
        } catch (error) {
            this.errorMessage = 'Error during classification or tagging';
            console.error(this.errorMessage, error);
        }
        finally {
            this.submitLoading = false;
            this.comments = ""
            this.selectedClass = '';
            this.selectedTag = '';
        }
    }
}
</script>