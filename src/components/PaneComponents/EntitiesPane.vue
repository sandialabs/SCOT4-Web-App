<template>
    <v-card flat class="flex-column-noscroll">
        <v-card-text class="scroll-child">
            <v-list v-for="entities, entityType in displayedEntities" :key="entityType">
                <h3>
                    <u> Entity Type: {{ entityType }} </u>
                    <v-tooltip right>
                        <template v-slot:activator=" { on }">
                            <v-btn icon v-on="on" @click="selectAllEntities(entityType)">
                                <v-icon>
                                    mdi-checkbox-multiple-marked-outline
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>
                            Select all entities of this type for tagging/classifying
                        </span>
                    </v-tooltip>
                    <v-tooltip right>
                        <template v-slot:activator=" { on }">
                            <v-btn icon v-on="on" @click="copyEntityTypeClipboard(entityType)">
                                <v-icon>
                                    mdi-content-copy
                                </v-icon>
                            </v-btn>
                        </template>
                        <span>
                            Copy entity values of this type to clipboard
                        </span>
                    </v-tooltip>
                </h3>
                <v-list-item v-for="entity of entities" :key="entity.id" dense v-observe-visibility="{callback: (isVisible) => entityVisible(isVisible, entity), once: true, intersection: {rootMargin: '300px 0px 300px 0px', threshold: 0.2}}">
                    <v-checkbox :value="entity.id" v-model="selectedEntityIds" />
                    <FlairComponent :entity="entity" v-if="flaired && visibleEntities.has(entity.id)"></FlairComponent>
                    <span v-else>{{entity.value}}</span>
                </v-list-item>
                <v-divider />
            </v-list>
        </v-card-text>
        <v-card-actions>
            <v-btn @click="openClassifyModal()" :disabled="selectedEntityIds.length === 0">
                Add Class or Tag
            </v-btn>
            <v-btn @click="openRemoveClassifyModal()" :disabled="selectedEntityIds.length === 0">
                Remove Class or Tag
            </v-btn>
            <v-btn @click="openMappingModal()" v-if="hasIpAddresses()">
                IP Geo Map
            </v-btn>
            <v-btn @click="copyAllEntitiesToClipboard()">
                Copy All Entities
            </v-btn>
        </v-card-actions>
        <ClassifyEntityDialog
            v-model="isClassifyModalOpen"
            :selectedEntityIds="selectedEntityIds"
            :isRemove="isClassifyModalRemove"
            :selectedEntityClasses="selectedEntityClasses"
            :selectedEntityTags="selectedEntityTags"
            @submit-success="submitSuccess"
        />
        <GeoMappingPane
            ref="geoMappingPane"
            v-model="isMappingModalOpen"
            :displayedEntities="displayedEntities"
            :target="selectedElement"
        />    
    </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import 'splitpanes/dist/splitpanes.css'
import { Getter } from 'vuex-class';
import { IRElement } from '@/store/modules/IRElements/types'
import ClassifyEntityDialog from '@/components/PaneComponents/ClassifyEntityDialog.vue';
import GeoMappingPane from '@/components/PaneComponents/GeoMappingPane.vue';
import FlairComponent from '@/components/JournalComponents/EntryCellComponents/WYSIWYGCell/FlairPlugin/FlairComponent.vue';
const namespace: string = 'IRElements';

@Component({
    components: {
        FlairComponent,
        ClassifyEntityDialog,
        GeoMappingPane
    },
})
export default class EntitiesPane extends Vue{
    @Prop({ default: null }) entities: Array<any>
    @Prop({ default: true }) flaired: boolean
    @Getter('selectedElement', { namespace }) selectedElement: IRElement | null;
    @Getter('selectedElementEntities', { namespace }) selectedElementEntities: Record<string, Record<string, any>>
    @Getter('selectedElementEntityCount', { namespace }) selectedElementEntityCount: number
    @Getter('entitiesLoaded', { namespace }) entitiesLoaded: boolean;

    displayedEntities: Record<string, Record<string, any>> = {}
    visibleEntities: Set<number> = new Set()
    populatingEntities: boolean = false
    selectedEntityIds: number[] = []
    selectedEntityClasses: any[] = []
    selectedEntityTags: any[] = []
    isClassifyModalOpen: boolean = false
    isClassifyModalRemove: boolean = false
    isMappingModalOpen:boolean = false
    

    mounted() {
        this.populateEntities();
    }

    submitSuccess() {
        this.selectedEntityIds = [];
        this.selectedEntityClasses = []
        this.selectedEntityTags = []
        this.populateEntities()
    }

    @Watch('selectedElementEntities')
    async onEntitiesLoaded() {
        if (!this.populatingEntities) {
            await this.populateEntities()
        }
    }

    async populateEntities() {
        this.populatingEntities = true
        await this.$nextTick()
        if (this.entities == null) {
            this.displayedEntities = JSON.parse(JSON.stringify(this.selectedElementEntities)) // Clone object for better reactivity
        }
        else {
            this.displayedEntities = this.entities.reduce((obj, item) => {
                const t = String(item['type_name'])
                const value = String(item['value'])
                if (t in obj) {
                    obj[t][value] = item
                }
                else {
                    obj[t] = {}
                    obj[t][value] = item
                }
                return obj
            }, {})
        }
        this.populatingEntities = false
    }

    entityVisible(isVisible: boolean, entity: any) {
        if (this.flaired && isVisible && !this.visibleEntities.has(entity.id)) {
            this.visibleEntities.add(entity.id)
            Vue.set(entity, "displayed", true)
        }
    }

    copyEntityTypeClipboard(entityType: string) {
        let textString = ""
        const entities = this.displayedEntities[entityType]
        for (const entityKey of Object.keys(entities)) {
            const entity = this.selectedElementEntities[entityType][entityKey]
            textString += `${entity.value}\n`
        }
        navigator.clipboard.writeText(textString)
    }

    copyAllEntitiesToClipboard() {
        let textString = ""
        for (const [entityType, entities] of Object.entries(this.displayedEntities)) {
            for (const entityKey of Object.keys(entities)) {
                const entity = this.selectedElementEntities[entityType][entityKey]
                textString += `${entity.value}\n`
            }
        }
        navigator.clipboard.writeText(textString)
    }

    selectAllEntities(entityType: string) {
        const entities = this.displayedEntities[entityType];
        for (const entityKey of Object.keys(entities)) {
            const entity = entities[entityKey];
            if (!this.selectedEntityIds.includes(entity.id)) {
                this.selectedEntityIds.push(entity.id);
            }
        }
    }

    openClassifyModal() {
        this.isClassifyModalRemove = false;
        this.isClassifyModalOpen = true;
    }

    openRemoveClassifyModal() {
        for (const entityType in this.displayedEntities) {
            for (const entityName in this.displayedEntities[entityType]) {
                if (this.selectedEntityIds.includes(this.displayedEntities[entityType][entityName].id)) {
                    this.selectedEntityClasses = [...this.selectedEntityClasses, ...this.displayedEntities[entityType][entityName].classes]
                    this.selectedEntityTags = [...this.selectedEntityTags, ...this.displayedEntities[entityType][entityName].tags]
                }
            }
        }
        this.isClassifyModalRemove = true;
        this.isClassifyModalOpen = true;
    }

    openMappingModal() {
        this.isMappingModalOpen = true;
    }

    hasIpAddresses() {
        return this.displayedEntities["ipaddr"] && Object.keys(this.displayedEntities["ipaddr"]).length > 0;
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

.selectedEntityRow {
    background-color: skyblue;
}

.selectedEntityRow:hover {
    cursor: pointer;
    background-color: skyblue !important;
}

.notSelectedEntityRow:hover{
  cursor:pointer
}

.v-list-item .v-chip {
    height: unset;
}

.promotedAlertStatus{
    cursor: pointer;
}

.flex-column-noscroll {
    min-height: 100%;
    display: flex;
    flex-direction: column;
}

.scroll-child {
    max-height: 90%;
    overflow-y: auto;
}

</style>