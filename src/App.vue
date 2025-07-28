<!-- App.vue -->
<template>
    <v-app>
        <ScotNavBar style="z-index: 99;"/>
        <v-main style="max-height: 100vh">
            <QuickSettingsDrawer />
            <SearchDialog v-if="showSearchOverlay"/>
            <router-view></router-view>
        </v-main>
        <v-footer app padless>
            <v-card elevation=0 width="100%" class="text-center">
                <v-card-text>
                </v-card-text>
            </v-card>
        </v-footer>
        <v-snackbar v-model="showErrorPopup"
                    multi-line>
            {{ errorText }}
            <template v-slot:action="{ attrs }">
                <v-btn color="red"
                       text
                       v-bind="attrs"
                       @click="showErrorPopup = false">
                    Close
                </v-btn>
            </template>
        </v-snackbar>
    </v-app>
</template>


<script lang="ts">
    import Vue from 'vue';
    import Component from 'vue-class-component';
    import ScotNavBar from '@/components/NavigationComponents/ScotNavBar.vue'
    import QuickSettingsDrawer from '@/components/UserSettingsComponent/QuickSettingsDrawer.vue'
    import SearchDialog from '@/components/IRElementComponents/SearchDialog.vue'
    import { Getter, Mutation } from 'vuex-class';
    import { Watch } from 'vue-property-decorator'
    import { IRElementType } from './store/modules/IRElements/types';

    @Component({
        components: {
            ScotNavBar,
            QuickSettingsDrawer,
            SearchDialog
        },
    })
    export default class App extends Vue {

        @Getter('showQuickSettings', { 'namespace': 'user' }) showQuickSettings: boolean;
        @Getter('darkMode', { 'namespace': 'user' }) darkMode: boolean
        @Getter('firehose', { 'namespace': 'user' }) firehose: EventSource | undefined
        @Getter('error') error: boolean
        @Getter('errorText') errorText: string
        @Getter('showSearchOverlay', { 'namespace': 'user' }) showSearchOverlay: boolean
        @Mutation('clearError') clearError: CallableFunction
        metaInfo() {
            return { meta: [{ "http-equiv": "Content-Security-Policy", "content": "upgrade-insecure-requests" }] }
        }

        showErrorPopup: boolean = false

        @Watch('showErrorPopup')
        errorSnackbarChange(newValue: boolean) {
            if (!newValue) {
                this.clearError()
            }
        }

        @Watch('error')
        errorChange(newVal: boolean) {
            if (newVal) {
                this.showErrorPopup = true
            }
        }

        @Watch('darkMode')
        onDarkModeChange() {
            this.$vuetify.theme.dark = this.darkMode
        }

        transitionName() {
            if (this.$route.meta && this.$route.meta.transitionName != undefined) {
                return this.$route.meta.transitionName
            }
            else {
                return "fast"
            }
        }
    }
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.theme--light.v-data-table {
    color: rgba(0, 0, 0, 1)
}

html {
    overflow: hidden;
    background-color: black;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: .25s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0;
  
}

.fast-enter-active,
.fast-leave-active {
  transition-duration: .05s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fast-enter,
.fast-leave-active {
  opacity: 0
}

/* Fixes for splitpanes package when in dark mode */
.theme--dark .splitpanes.default-theme .splitpanes__pane {
    background-color: #121212;
}

.theme--dark .splitpanes.default-theme .splitpanes__splitter {
    background-color: #00000026;
}

.theme--dark .splitpanes.default-theme .splitpanes__splitter::before,
.theme--dark .splitpanes.default-theme .splitpanes__splitter::after {
    background-color: #fff;
}

.theme--dark .default-theme.splitpanes--horizontal > .splitpanes__splitter {
    border-top: 1px solid #121212;
}

.theme--dark .default-theme.splitpanes--vertical > .splitpanes__splitter {
    border-left: 1px solid #121212;
}
</style>
