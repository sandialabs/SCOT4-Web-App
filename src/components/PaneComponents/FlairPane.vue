<template :key="entity.id">
    <v-card class="flex-column" flat>
        <v-row class="ma-0">
            <h3 v-if="!loadedPivotsAndEnrichments"> Loading Pivots and Enrichments</h3>
            <v-component mobile-breakpoint="sm" :is="$vuetify.breakpoint.xlOnly ? 'span' : 'v-slide-group'" v-else>
                <v-tooltip top color="primary" v-for="pivot in entityPivots" :key="pivot.id">
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn class="mr-1"
                            color="primary"
                            dark
                            v-bind="attrs"
                            :link=true
                            :href="pivot.pivot_value"
                            target="_blank"
                            v-on="on">
                            {{ pivot.title }}
                        </v-btn>
                    </template>
                    <span>{{ pivot.description }}</span>
                </v-tooltip>
            </v-component>
        </v-row>
        <v-tabs v-model="tab"  :background-color="$vuetify.theme.dark ? '#404000' : 'yellow lighten-4'"  height="36px">
            <v-tab key="appearances">
                Recent Appearances
            </v-tab>
            <v-tab key="timeline">
                Timeline
            </v-tab>
            <v-tab v-for="enrichmentName in Object.keys(entityEnrichments)" :key="enrichmentName">
                {{  enrichmentName }}
            </v-tab>

        </v-tabs>

        <v-tabs-items v-model="tab" class="child-noscroll">
            <v-tab-item key="appearances" class="flex-column-noscroll">
                <EntityAppearancesPane :entity="entity" class="flex-column-noscroll"></EntityAppearancesPane>
            </v-tab-item>
            <v-tab-item key="timeline" class="flex-column-noscroll">
                <TimelineView :entity="entity" class="flex-column-noscroll"></TimelineView>
            </v-tab-item>
            <v-tab-item  v-for="enrichment in Object.keys(entityEnrichments)" :key="enrichment" class="scroll-child">
            <v-card>

                <!-- Replay Button -->
                <v-btn @click="replayEnrichment(entity.id)">
                    Replay Enrichments
                </v-btn>

                <v-card-subtitle v-if="entity.enrichments[enrichment][entityEnrichmentIndicies[enrichment]].description">
                    {{ `Description:  ${entity.enrichments[enrichment][entityEnrichmentIndicies[enrichment]].description} `}}
                    <v-divider vertical></v-divider>
                </v-card-subtitle>

                <component v-bind:is="enrichmentClassMap[entity.enrichments[enrichment][entityEnrichmentIndicies[enrichment]].enrichment_class]" :enrichment="entity.enrichments[enrichment][entityEnrichmentIndicies[enrichment]]"></component>
            <v-card-actions v-if="entity.enrichments[enrichment].length > 1" >
                <v-tooltip bottom v-if="entityEnrichmentIndicies[enrichment] < entity.enrichments[enrichment].length - 1">
                    <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon   @click="changeEnrichmentIndex(enrichment, 1)">
                    <v-icon>
                        mdi-arrow-left
                    </v-icon>
                </v-btn>
                </template>
                <span> Go to an earlier verison of this enrichment </span>
                </v-tooltip>
                <v-tooltip bottom v-if="entityEnrichmentIndicies[enrichment] > 0">
                    <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon  @click="changeEnrichmentIndex(enrichment, -1)">
                    <v-icon>
                        mdi-arrow-right
                    </v-icon>
                </v-btn>
                    </template>
                    <span> Go to a later verison of this enrichment </span>
                    </v-tooltip>
                <v-spacer>
                </v-spacer>
                {{ `Modified:  ${entity.enrichments[enrichment][entityEnrichmentIndicies[enrichment]].modified} `}}
            </v-card-actions>
            </v-card>
            </v-tab-item>
            
        </v-tabs-items>
        <!-- Success Snackbar -->
        <v-snackbar v-model="successSnackbar" top left :timeout="3000">
            <v-card>
                <v-card-title>Enrichment request successful!</v-card-title>
                <v-card-text>Please wait - data will automatically refresh when complete.</v-card-text>
            </v-card>
            <template v-slot:action="{ attrs }">
                <v-btn color="red" text @click="successSnackbar = false" v-bind="attrs">
                    Close
                </v-btn>
            </template>
        </v-snackbar>

        <!-- Failure Snackbar -->
        <v-snackbar v-model="failureSnackbar" top left :timeout="3000">
            <v-card>
                <v-card-title>Enrichment request failed!</v-card-title>
                <v-card-text>{{ failureMessage }}</v-card-text>
            </v-card>
            <template v-slot:action="{ attrs }">
                <v-btn color="red" text @click="failureSnackbar = false" v-bind="attrs">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-card>    
</template>


<script lang="ts">
import { Component, Vue, Watch, Prop} from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter, Action } from 'vuex-class';
import { IRElement, IRElementType, IRElementMeta, Entry, NewEntry } from '@/store/modules/IRElements/types'
import Journal from '@/components/JournalComponents/Journal.vue'
import EntityAppearancesPane from '@/components/PaneComponents/EntityAppearancesPane.vue'
import TimelineView from '@/components/PaneComponents/TimelineView.vue';
import JsonTreePane from '@/components/EnrichmentPaneComponents/JsonTreePane.vue';
import MarkdownPane from '@/components/EnrichmentPaneComponents/MarkdownPane.vue';
import PlainTextPane from '@/components/EnrichmentPaneComponents/PlainTextPane.vue';
import LineChartPane from '@/components/EnrichmentPaneComponents/LineChartPane.vue';
import { Line } from 'vue-chartjs/legacy';
const namespace: string = 'IRElements';



@Component({
    components: {
        Journal,
        EntityAppearancesPane,
        JsonTreePane,
        TimelineView,
        MarkdownPane,
        PlainTextPane,
        LineChartPane,
    },
})

export default class FlairPane extends Vue{
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
    @Getter('selectedElementEntitiesArray', { namespace }) selectedElementEntitiesArray: Array<any>
    @Action('addFlairedEntity', { namespace }) addFlairedEntity: CallableFunction
    @Action('resetFlairedEnrichmentsAndPivotsValue', { namespace }) resetFlairedEnrichmentsAndPivotsValue: CallableFunction
    @Action('enrichEntityByID', {namespace}) enrichEntityByID: CallableFunction
    @Getter('flairedEnrichmentsandPivotsLoaded', { namespace }) flairedEnrichmentsandPivotsLoaded: any
    @Getter('selectedElementFlairedEntities', { namespace }) selectedElementFlairedEntities: Array<any>;
    @Prop() entity: any
    enrichmentClassMap: Record<string,any> = {"linechart":LineChartPane, "markdown":MarkdownPane, "jsontree":JsonTreePane, "plaintext":PlainTextPane}
    entityAppearancesHeaders: Array<any> = [{ "text": "ID", "value": "id", "class": "text-no-wrap" }, { "text": "Type", "value": "type", "class": "text-no-wrap" }, { "text": "Subject", "value": "subject", "class": "text-no-wrap" }, { "text": "Status", "value": "status", "class": "text-no-wrap" }, { "text": "Last Updated", "value": "last_updated" }]

    tab = null

    entityEnrichmentIndicies:any = {}
    loadedPivotsAndEnrichments: boolean = false
    entityEnrichments:any = {}
    entityPivots:any = []
    
    // Snackbar control properties
    successSnackbar: boolean = false;
    failureSnackbar: boolean = false;
    failureMessage: string = '';
    successMessage: string = '';

    changeEnrichmentIndex(enrichmentName:string, step:number){
        if (this.entityEnrichmentIndicies[enrichmentName] == 0 && step < 0)
        {
            this.entityEnrichmentIndicies[enrichmentName] = 0
        }
        else{
            this.entityEnrichmentIndicies[enrichmentName] += step
        }
    }

    initializeEntityEnrichmentIndicies(){
        if (this.entity.enrichments){
            this.entityEnrichmentIndicies = {}
            for (const enrichment of Object.keys(this.entity.enrichments))
            {
                Vue.set(this.entityEnrichmentIndicies, enrichment, 0)
            }
        }
    }

    @Watch('flairedEnrichmentsandPivotsLoaded')
   async onEnrichmentsAndPivotsLoaded(newVal:any, oldVal:any){
        if(newVal == this.entity.id)
        {
            for (const enrichment of Object.keys(this.entity.enrichments))
            {
                Vue.set(this.entityEnrichmentIndicies, enrichment, 0)
            }
            this.entityEnrichments = this.entity['enrichments']
            this.entityPivots = this.entity['pivots']
            this.loadedPivotsAndEnrichments = true
            await this.resetFlairedEnrichmentsAndPivotsValue()

        }
    }
    mounted() {
        if (this.entity.enrichments && this.entity.pivots) {
            this.entityEnrichments = this.entity.enrichments
            this.entityPivots = this.entity.pivots
            this.loadedPivotsAndEnrichments = true
        }
        this.initializeEntityEnrichmentIndicies()
    }

    transformDateString(dateString: string) {
        const date: any = new Date(dateString)
        const options: any = { year: 'numeric', month: 'numeric', day: 'numeric' }
        return { date: date.toLocaleDateString(undefined, options), time: date.toLocaleTimeString('en-US') }
    }

    objectStatusColor(status: string) {
        switch (status) {
            case "open":
            case "disabled":
                return "red"
            case "closed":
            case "enabled":
                return "green"
            case "promoted":
                return "amber"
            default:
                return "white"
        }
    }

    // Method to handle the replay button click
    async replayEnrichment(entityId: string) {
        try {
            const enrichResponse = await this.enrichEntityByID({ entityID: entityId });
            const message = enrichResponse.message;
            if (message === "Enrichment queued") {
                this.successMessage = message;
                this.successSnackbar = true;
            } else {
                this.failureMessage = message;
                this.failureSnackbar = true;
            }
        } catch (error) {
            console.error('Error replaying enrichment:', error);
            this.failureMessage = 'An error occurred while processing your request.';
            this.failureSnackbar = true;
        }
    }

}
</script>

<style scoped>
.theme--dark .selectedRow {
    background-color: steelblue;
}

.theme--dark .selectedRow:hover {
    cursor: pointer;
    background-color: steelblue !important;
}

.selectedRow {
    background-color: skyblue;
}

.selectedRow:hover {
    cursor: pointer;
    background-color: skyblue !important;
}

.notSelectedRow:hover{
  cursor:pointer
}

.promotedAlertStatus{
    cursor: pointer;
}

.flex-column-noscroll {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.flex-column {
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

/deep/ .v-data-footer__select .v-select{
    margin-top: 4px;
    margin-bottom: 4px;
}

.console-font {
    font-family: "Courier New", monospace;
    font-size: 12px;
}
</style>