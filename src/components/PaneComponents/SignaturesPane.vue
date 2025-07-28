<template>
    <v-container fluid>
        <span v-if="addingSig">
            <v-text-field class="spanTextField" v-model="sigToAdd" :loading="sigAddLoading" :error-messages="sigAddHint" placeholder="ID # of signature" hide-details="auto"></v-text-field>
            <v-btn color="green" :icon=true @click="sigAddSubmit" class="spanChild">
                <v-icon>
                    mdi-check
                </v-icon>
            </v-btn>
            <v-btn color="red" class="spanChild" :icon=true @click="sigAddHint='', addingSig = false, sigToAdd = ''">
                <v-icon>
                    mdi-close
                </v-icon>
            </v-btn>
        </span>
        <v-btn v-else-if="selectedElement.ElementType == 'Guide'" class="green ml-3 mb-1" @click="addingSig = true">
            <v-icon>
                mdi-plus
            </v-icon>
            Link Signature
        </v-btn>

        <v-container fluid v-if="loading">
            <v-progress-circular indeterminate></v-progress-circular>
        </v-container>

        <v-container fluid v-else-if="sigSelected == null && this.selectedElement?.linkedElements?.Signature.length == 0">
            No Associated Signatures
        </v-container>

        <v-container fluid v-else-if="sigSelected == null">
            <v-data-table :headers="signatureTableHeaders"
                          :items="this.selectedElement?.linkedElements?.Signature.map(sig => sig.element)"
                          item-key="id"
                          class="elevation-1"
                          @click:row="onRowClick">
                <template v-slot:[`item.delete`]="{ item }">
                    <v-btn icon @click.stop="unlinkSignature(item.id)">
                        <v-icon>mdi-link-variant-off</v-icon>
                    </v-btn>
                </template>
                <template v-slot:[`item.modified`]="{ item }">
                    {{ transformDateString(item.modified)["date"] + " " + transformDateString(item.modified)["time"] }}
                </template>
            </v-data-table>
        </v-container>

        <v-container fluid v-else>
            <v-system-bar v-if="selectedElement.ElementType != 'Signature'">
                <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon
                               v-bind="attrs"
                               v-on="on"
                               @click="clearSelectedSig">
                            <v-icon color="grey lighten-1">
                                mdi-keyboard-backspace
                            </v-icon>
                        </v-btn>
                    </template>
                    <span>Go back to signature table</span>
                </v-tooltip>
            </v-system-bar>

            <v-card>
                <v-card-title v-if="sigSelected.type == 'splunk' && 'search_link' in sigSelected.data">
                    Signature:&nbsp;<a :href="sigSelected.data.search_link">{{sigSelected.name}}</a>
                </v-card-title>
                <v-card-title v-else>
                    Signature Name:&nbsp;<router-link :to="'/signatures/' + sigSelected.id.toString()">{{sigSelected.name}}</router-link>
                </v-card-title>
                <v-card-subtitle>
                    Signature Type: {{sigSelected.type}}
                </v-card-subtitle>
                <v-card-subtitle class="py-0 mt-n3" v-if="sigSelected.type == 'splunk' && selectedElement?.back_refs">
                    <a :href="selectedElement.back_refs">View in Splunk</a>
                </v-card-subtitle>
                <v-list>
                    <v-subheader>Signature Attributes</v-subheader>
                    <v-divider />
                    <v-list-item v-for="(val, propName) in sigSelected.data" :key=propName>
                        <v-list-item-content>
                            <v-list-item-title>
                                <b>{{propName}}</b>
                            </v-list-item-title>
                            <span v-if="propName == 'signature_body'" style="white-space: pre-line;">{{val}}</span>
                            <span v-else>{{val}}</span>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
                <v-card-actions>
                    Signature Owner: {{sigSelected.owner}}
                    <v-spacer />
                    Last Modified: {{ transformDateString(sigSelected.modified)["date"] + " " + transformDateString(sigSelected.modified)["time"] }}
                </v-card-actions>
            </v-card>

        </v-container>
    </v-container>
</template>

<script lang="ts">
import { Component, Vue, Watch} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType } from '@/store/modules/IRElements/types'
const namespace: string = 'IRElements';

@Component({
  components: {
    },
})

export default class SignaturesPane extends Vue{
@Getter('selectedElement', { namespace }) selectedElement: IRElement|null;
@Action('retrieveLinkedSignatures', { namespace }) retrieveLinkedSignatures: CallableFunction
@Action('retrieveLinkedSignaturesById', { namespace }) retrieveLinkedSignaturesById: CallableFunction
@Action('createElement', { namespace }) createElement: CallableFunction
@Action('deleteLinksBetweenElements', { namespace }) deleteLinksBetweenElements: CallableFunction

sigSelected: any = null
sigEnum: IRElementType = IRElementType.Signature
loading: boolean = false
addingSig: boolean = false
sigAddLoading: boolean = false
sigToAdd: string = ""
sigAddHint: string = ""
signatureTableHeaders: Array<any> = [{"text": "ID", "value": "id"},
                                     {"text":"Name", "value": "name"},
                                     {"text":"Signature Type", "value": "type"},
                                     {"text":"Owner", "value": "owner"},
                                     {"text": "Last Modified", "value": "modified"},
                                     {"text": "Actions", "value": "delete"}]

async mounted(){
    this.sigSelected = null
    this.retrieveSignatures()
}

async unlinkSignature(signatureId: number){
    await this.deleteLinksBetweenElements({
        elementType0: IRElementType.Signature.toLowerCase(),
        elementId0: signatureId,
        elementType1: IRElementType.Guide.toLowerCase(),
        elementId1: this.selectedElement?.id
    })
}

async sigAddSubmit() {
    this.sigAddLoading = true
    const sigIdAsNumber = Number.parseInt(this.sigToAdd)
    if (isNaN(sigIdAsNumber)) {
        this.sigAddHint = "You must enter a valid signature ID"
    }
    else if (this.selectedElement?.linkedElements?.Signature.map(s => s.element.id).includes(sigIdAsNumber)) {
        this.sigAddHint = "This signature is already linked"
    }
    else {
        await this.linkSignature(sigIdAsNumber)
        this.addingSig = false
        this.sigAddHint = ""
    }
    this.sigAddLoading = false
}

async linkSignature(signatureId: number){
    await this.createElement({
        elementType: IRElementType.Link, createData: {
            v0_type: IRElementType.Signature.toLowerCase(),
            v0_id: signatureId,
            v1_type: IRElementType.Guide.toLowerCase(),
            v1_id: this.selectedElement?.id,
            weight: 1,
            context: "Linked guide"
        }
    })
    await this.retrieveSignatures()
}
    
transformDateString(dateString: string) {
    const date: any = new Date(dateString)
    const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
    return { date: date.toLocaleDateString(undefined, options), time: date.toLocaleTimeString('en-US') }
}

@Watch("selectedElement")
async retrieveSignatures() {
    this.sigSelected = null
    if (this.selectedElement?.ElementType == IRElementType.Signature && this.selectedElement.linkedElements) {
        this.selectedElement.linkedElements.Signature = [{ "element": this.selectedElement, entries: [] }]
        this.sigSelected = this.selectedElement.linkedElements.Signature[0].element
    }
    else if (this.selectedElement && this.selectedElement.associated_sig_guide_map != null) {
        this.loading = true
        await this.retrieveLinkedSignatures({ associatedSigGuideMap: this.selectedElement.associated_sig_guide_map })
        if (this.selectedElement?.linkedElements?.Signature.length == 1) {
            this.sigSelected = this.selectedElement?.linkedElements?.Signature[0].element
        }
        else {
            const postfixSigs = this.selectedElement?.linkedElements?.Signature.filter(s => this.selectedElement?.subject?.endsWith(s.element.name))
            if (postfixSigs?.length == 1) {
                this.sigSelected = postfixSigs[0].element
            }
        }
        this.loading = false
    }
    else if (this.selectedElement) {
        this.loading = true
        await this.retrieveLinkedSignaturesById({ elementType: IRElementType.Guide, elementId: this.selectedElement.id })
        if (this.selectedElement?.linkedElements?.Signature.length == 1) {
            this.sigSelected = this.selectedElement?.linkedElements?.Signature[0].element
        }
        this.loading = false
    }
    this.sigAddHint = ''
    this.addingSig = false
    this.sigToAdd = ''
}


clearSelectedSig(){
    this.sigSelected = null
}

onRowClick(row: any){
  this.sigSelected = row
}

}
</script>

<style scoped>
    .spanChild {
        display: inline-block;
    }

    .spanTextField {
        display: inline-block;
        padding: 0;
        margin-left: 12px;
    }
</style>