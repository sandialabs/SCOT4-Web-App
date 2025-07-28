<template>
    <v-chip :outlined="isChild" :ripple="false" text-color="black" :color="isChild ? 'lime-accent-2':'lime accent-1'" @click.prevent.stop="onFlairClick" v-bind:class="{'child pr-0': isChild, 'my-n1 pl-1 pr-0': !isChild}">
        <slot>{{ entity.value }}</slot>
        <v-badge color="black" inline v-if="entity.entry_annotation != null" class="mr-n1">
            <template v-slot:badge>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon v-on="on">
                            mdi-note-outline
                        </v-icon>
                    </template>
                    <span>{{ entity.entry_annotation }}</span>
                </v-tooltip>
            </template>
        </v-badge>
        <v-badge inline :color="isChild ? 'red': 'green'" :content="entityCountString(entity.entity_count)" class="badges mr-n1"> </v-badge>
        <v-badge inline v-for="icon in entity.classes" :key=icon.id class="badges mx-n1">
            <template v-slot:badge>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon v-if="icon.icon" v-on="on" v-html="icon.icon">
                        </v-icon>
                        <span v-else v-on="on">
                            {{  icon.name.slice(0,8) }}
                        </span>
                    </template>
                    <span>{{ icon.display_name }}</span>
                </v-tooltip>
            </template>
        </v-badge>
    </v-chip>
</template>



<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { Action } from 'vuex-class';

const namespace: string = 'IRElements';

@Component({
  components: {},
})
export default class FlairComponent extends Vue{
    @Prop() entity: any
    @Prop({ default: false }) isChild: boolean
    @Prop() vuetify: any
    @Prop() addFlairedEntity: CallableFunction
    @Prop() flairDialogSetToTrue: CallableFunction

    @Action('addFlairedEntity', { namespace }) addFlairedEntityGlobal: CallableFunction
    @Action('flairDialogSetToTrue', { namespace }) flairDialogSetToTrueGlobal: CallableFunction

    addFlairedEntityReal: CallableFunction
    flairDialogSetToTrueReal: CallableFunction

    async onEntityClick() {
        this.addFlairedEntityReal({ entity: this.entity })
    }

    get icons() {
        const min = Math.ceil(1);
        const max = Math.floor(3);
        const num = Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive 
        const sampleIcons = ["mdi-server", "mdi-wall", "mdi-block-helper", "mdi-microsoft-azure"]
        return sampleIcons.sort(() => .5 - Math.random()).slice(0, num)
    }

    created() {
        // Populate functions from global store if available and not given as props
        if (!this.addFlairedEntity || !this.flairDialogSetToTrue) {
            this.addFlairedEntityReal = this.addFlairedEntityGlobal
            this.flairDialogSetToTrueReal = this.flairDialogSetToTrueGlobal
        }
        else {
            this.addFlairedEntityReal = this.addFlairedEntity
            this.flairDialogSetToTrueReal = this.flairDialogSetToTrue
            this.$vuetify = this.vuetify
        }
    }

    entityCountString(count: number) {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + "M"
        }
        else if (count >= 1000) {
            return (count / 1000).toFixed(1) + "K"
        }
        return count.toString()
    }

    async onFlairClick(e: any) {
        await this.flairDialogSetToTrueReal()
        await this.addFlairedEntityReal({ entity: this.entity })
    }
}


</script>
<style scoped>

.v-chip {
    white-space: normal;
    display: inline;
    padding-top: 2px;
    padding-bottom: 2px;
    vertical-align: baseline;
    user-select: auto;
}

.v-chip::before {
    content: unset;
}

.v-chip::v-deep .v-chip__content {
    display: inline;
}

.child {
    opacity: 1;
    padding-left: 2px;
    border-color: black !important;
    border-style: solid !important;
    padding-top: 1px;
    padding-bottom: 1px;
    vertical-align: unset;
}

.badges {
    vertical-align: baseline;
    line-height: unset;
    user-select: none;
}

.badges::v-deep .v-badge__badge {
    height: 19px;
    vertical-align: baseline;
}

.badges::v-deep .v-icon {
    vertical-align: bottom;
}
</style>
