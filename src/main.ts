import Vue from 'vue'
import qs from 'qs'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import axios from "axios"
import store from "./store"
import VueAxios from "vue-axios"
import Auth from "@/api/auth"
import Elements from "@/api/elements"
import User from "@/api/user"
import File from "@/api/file"
import VueCookies from "vue-cookies"
import Storage from '@/storage/localForage'
import localforage from 'localforage'
import Team from './api/team'
import StorageProvider from './api/storage_provider'
import { ValidationProvider } from 'vee-validate';
import VModal from 'vue-js-modal'
import VueObserveVisibility from 'vue-observe-visibility'
import VueMeta from 'vue-meta'
import VueWordCloud from 'vuewordcloud';

Vue.use(VueObserveVisibility)
Vue.config.productionTip = false
Vue.component('ValidationProvider', ValidationProvider);
Vue.component(VueWordCloud.name, VueWordCloud);
Vue.use(VueMeta)
Vue.use(VModal, {
  dialog: true
})

const vueAxios = axios.create({
    paramsSerializer: params => qs.stringify(params, { arrayFormat: "repeat" })
})

vueAxios.interceptors.response.use(response => response,
    error => {
        const navigatedRoute = router.currentRoute
        if (error.response && error.response.status === 401 && error.response.config.url != "/logout" && !error.response.config.url.startsWith("/login") && navigatedRoute.path != "/login") {
            store.dispatch("user/logout").then(() => {
                if (navigatedRoute.name) {
                    Vue.prototype.$storage.setItem('loginRedirect', navigatedRoute.path)
                }
                if (router.currentRoute.path != '/login') {
                    router.push('/login')
                }
            })
        }
        return Promise.reject(error)
    }
)

Vue.use(VueAxios, vueAxios)
Vue.use(VueCookies)
Vue.prototype.$storage = Storage()
Vue.prototype.$storage.storageConfig({ driver: localforage.INDEXEDDB, name: 'scot-cache' })
Vue.prototype.$api = { auth: Auth(Vue.axios), elements: Elements(Vue.axios), user: User(Vue.axios), storageProvider: StorageProvider(Vue.axios), team: Team(Vue.axios), file: File(Vue.axios) }
Vue.axios.defaults.baseURL = process.env.VUE_APP_API_BASE

function interceptClickEvent(e:any) {
  const target = e.target || e.srcElement;
  if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (!href.startsWith('#')) {
          const url = (new URL(href))
          if (window.location.hostname != url.hostname) {
              e.preventDefault()
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

// This is a router guard that checks to make sure the user is currently logged in. If the user is not
// then this guard will route them back to login instead. 
router.beforeEach(async (to, _from, next) => {
    try {
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        const state = urlParams.get('state')
        if (to.name == 'Landing' && code && state) {
            await store.dispatch('user/completeAzureAD', { code, state })
            if (store.getters['user/isLoggedIn']) {
                const redirectUrl = await Vue.prototype.$storage.getItem('loginRedirect')
                const currentUrlNoParams = new URL(location.pathname + location.hash, window.location.origin)
                if (redirectUrl) {
                    Vue.prototype.$storage.removeItem('loginRedirect')
                    let fullRedirectHref = currentUrlNoParams.href + redirectUrl
                    if (currentUrlNoParams.href.endsWith('/')) {
                        fullRedirectHref = currentUrlNoParams.href + redirectUrl.substring(1)
                    }
                    window.location.replace(fullRedirectHref)
                }
                else {
                    window.location.replace(currentUrlNoParams)
                }
            }
        }
        else if (to.name !== 'Login' && (store.getters['user/isLoggedIn'] === false || store.getters['user/loginExpiration'] < new Date())) {
            // See if our http only cookie is still set by doing a /api/whoami request.
            await store.dispatch('user/retrieveUserInfo')
            if (store.getters['user/isLoggedIn'] != false) {
                // If our firehose is undefined, let's connect to it. This means we have a logged in user so we're ok to connect.
                await store.dispatch('user/connectToFirehose')
                await store.dispatch('user/setFirehoseReconnect', true)
                next() 
            }
            else {
                Vue.prototype.$storage.setItem('loginRedirect', to.path)
                next({ name: 'Login' })
            }
        }
        else if (to.name == 'Admin' && store.getters['user/currentUser'].is_superuser != true) {
            next({ name: 'Landing' })
        }
        else {
            next()
        }
    }
    catch (e) {
        console.log(e)
    }
})

export default new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
