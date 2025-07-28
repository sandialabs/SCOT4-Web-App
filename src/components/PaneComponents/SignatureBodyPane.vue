<template>
    <v-card :loading="loading">
        <v-list>
            <v-list-item-group v-if="Array.isArray(sigSelected.data.signature_body)">
                <v-list-item v-ripple="false" v-for="body, idx in sigSelected.data.signature_body" :key=idx>
                    <v-list-item-content>
                        <v-textarea :readonly="sigSelected.data.external_location != null" @blur="updateSignatureData" auto-grow outlined @click.prevent.stop="" label="Signature Body" v-model="sigSelected.data.signature_body[idx]"></v-textarea>
                    </v-list-item-content>
                </v-list-item>
            </v-list-item-group>
            <v-list-item-group v-else>
                <v-list-item v-ripple="false">
                    <v-list-item-content>
                        <v-textarea :readonly="sigSelected.data.external_location != null" @blur="updateSignatureData" auto-grow outlined @click.prevent.stop="" label="Signature Body" v-model="sigSelected.data.signature_body"></v-textarea>
                    </v-list-item-content>
                </v-list-item>
            </v-list-item-group>
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

export default class SignatureBodyPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null
    @Action('updateElementInList', { namespace }) updateElementInList: CallableFunction

    sigSelected: IRElement | null = null
    loading: boolean = false

    async mounted() {
        if (this.selectedElement?.ElementType == IRElementType.Signature) {
            this.sigSelected = this.selectedElement
        }
        else {
            this.sigSelected = null
        }
    }

    @Watch('selectedElement')
    async onSelectedElementChange(newval: IRElement, oldval: IRElement) {
        if (newval && newval != oldval) {
            this.sigSelected = newval
        }
    }

    async updateSignatureData() {
        if (this.sigSelected) {
            const updateData = {
                data: this.sigSelected.data
            }
            this.loading = true
            this.updateElementInList({ elementId: this.sigSelected.id, elementType: IRElementType.Signature, updateData: updateData })
            this.loading = false
        }
    }
}
</script>