<template>
    <v-card :loading="loading">
        <v-list v-if="sigSelected != null">
            <v-list-item dense v-ripple="false" class="pt-2">
                <v-text-field dense label="Signature Type" @blur="updateSignatureField('type')" v-model="sigSelected.type"></v-text-field>
            </v-list-item>
            <v-list-item dense v-ripple="false">
                <v-list-item-content>
                    <v-text-field dense label="Signature Description" @blur="updateSignatureField('description')" v-model="sigSelected.description"></v-text-field>
                </v-list-item-content>
            </v-list-item>
            <v-list-item dense v-ripple="false" v-if="sigSelected.data.external_location != null">
                <v-text-field dense readonly label="External Location" @blur="updateSignatureField('data')" v-model="sigSelected.data.external_location" hint="The external location where this signature is stored (blank if only stored in SCOT)">
                    <template v-slot:append>
                        <a :href="sigSelected.data.external_location" target="_blank">
                            <v-icon v-if="sigSelected.data.external_location">
                                mdi-open-in-new
                            </v-icon>
                        </a>
                    </template>
                </v-text-field>
            </v-list-item>
            <v-list-item dense v-ripple="false" v-if="sigSelected.type != 'splunk' && sigSelected.data?.target">
                <v-list-item-content style="min-width: 23em">
                    <v-text-field class="mr-6 mb-0 flex-shrink-0 flex-grow-0" @blur="updateSignatureField('data')" label="Reference Type" style="width: 45%" hint="The SCOT datatype that orignated this signature" v-model="sigSelected.data.target.type" dense></v-text-field>
                    <v-text-field class="mr-6 flex-shrink-0 flex-grow-0" @blur="updateSignatureField('data')" label="Reference ID" style="width: 45%" hint="The id of the SCOT datatype that originated this signature" v-model="sigSelected.data.target.id" dense></v-text-field>
                </v-list-item-content>
            </v-list-item>
            <v-list-item dense v-ripple="false" v-if="sigSelected.type != 'splunk' && sigSelected.data" class="mt-n2">
                <v-list-item-content>
                    <v-combobox dense v-model="sigSelected.data.signature_group" @blur="updateSignatureField('data')" label="Signature Groups" hint="Group signatures under common names" multiple chips deletable-chips></v-combobox>
                </v-list-item-content>
            </v-list-item>
            <v-list-item dense v-ripple="false" v-if="sigSelected.type != 'splunk' && sigSelected.data" class="mt-n2">
                <v-list-item-content>
                    <v-select dense v-model="sigSelected.data.action" @blur="updateSignatureField('data')" :items="actionItems" label="Action" hint="The automated action that should take place when this signature is triggered" chips multiple></v-select>
                </v-list-item-content>
            </v-list-item>
        </v-list>
    </v-card>
</template>


<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType } from '@/store/modules/IRElements/types'

const namespace: string = 'IRElements';

@Component({
  components: {
    },
})

export default class EditSignaturePane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null
    @Action('updateElementInList', { namespace }) updateElementInList: CallableFunction
    sigSelected: IRElement | null = null
    loading: boolean = false
    actionItems: Array<string> = ["alert", "block"]

    async mounted() {
        if (this.selectedElement?.ElementType == IRElementType.Signature) {
            this.sigSelected = this.selectedElement
            if (!this.sigSelected.data) {
                this.sigSelected.data = {
                    "target": {},
                    "signature_group": []
                }
            }
            if (!this.sigSelected.data.target) {
                this.sigSelected.target = {}
            }
        }
        else {
            this.sigSelected = null
        }
    }

    @Watch('selectedElement')
    async onSelectedElementChange(newVal: Array<any>, oldVal: Array<any>) {
        if (this.selectedElement?.ElementType == IRElementType.Signature) {
            this.sigSelected = this.selectedElement
            if (!this.sigSelected.data) {
                this.sigSelected.data = {
                    "target": {},
                    "signature_group": []
                }
            }
            if (!this.sigSelected.data.target) {
                this.sigSelected.target = {}
            }
        }
        else {
            this.sigSelected = null
        }
    }
    
    // All individual fields get updated when their text boxes are modified
    async updateSignatureField(fieldToUpdate: string) {
        if (this.sigSelected) {
            const updateData = {
                [fieldToUpdate]: this.sigSelected[fieldToUpdate]
            }
            this.loading = true
            this.updateElementInList({ elementId: this.sigSelected.id, elementType: IRElementType.Signature, updateData: updateData })
            this.loading = false
        }
    }
}
</script>

<style>
    v-list-item::before {
        opacity: 0 !important;
    }
</style>