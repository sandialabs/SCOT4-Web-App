import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import axios from 'axios'

//import 'bootstrap/dist/css/bootstrap.min.css'
//import 'bootstrap'
import 'splitpanes/dist/splitpanes.css'
import "@mdi/font/css/materialdesignicons.css";

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import './assets/main.css'
import { aliases, custom } from '@/icons'
import localforage from 'localforage'
import VueWordCloud from 'vuewordcloud';
import VueObserveVisibility from 'vue3-observe-visibility'
import VResizable from 'v-resizable'

const app = createApp(App)

const LightTheme = {
    dark: false,
}
const DarkTheme = {
    dark: true,
}
const vuetify = createVuetify({
    components: {
        ...components,
        ...labsComponents
    },
    directives,
    theme: {
        defaultTheme: 'LightTheme',
        themes: {
            LightTheme,
            DarkTheme
        }
    },
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            custom,
        },
    },
})

const axiosInstance = axios.create({ withCredentials: true })
////temp header for development
///Use authorization header for api key
// axiosInstance.defaults.headers.common['Authorization'] = `${env.APIKey}`;
app.provide('axios', axiosInstance)

const pinia = createPinia()
app.use(VResizable)
app.use(pinia)
app.use(vuetify)
app.use(VueObserveVisibility)
localforage.config({ driver: localforage.INDEXEDDB, name: 'scot-cache' })
app.component(VueWordCloud.name, VueWordCloud);
app.use(router)
app.mount('#app')

function interceptClickEvent(e: any) {
    const target = e.target || e.srcElement;
    if (target.tagName === 'A') {
        const href = target.getAttribute('href');
        if (!href.startsWith('#')) {
            const url = (new URL(href))
            e.preventDefault()
            if (window.location.hostname != url.hostname) {
                const answer = window.confirm('You are navigating to an external link. Are you sure you want to proceed?')
                if (answer === true) {
                    window.open(url, '_blank')
                }
            }
        }
    }
}

//listen for link click events at the document level
if (document.addEventListener) {
    document.addEventListener('click', interceptClickEvent);
} 
