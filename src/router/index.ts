import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import ElementView from '../views/ElementQueueView.vue'
import CalendarView from '../views/CalendarView.vue'
import ProfileView from '../views/ProfileView.vue'
import TagsSourcesView from '@/views/TagsSourcesView.vue'
import { IRElementType } from '../types/irelement'
import { useAuth_APIStore } from '@/stores'
import { useStorage } from '@/storage/storage'
import AdminView from '@/views/AdminView.vue'
import StatsView from '@/views/StatsView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/team/calendar',
      name: 'Calendar',
      component: CalendarView
    },
    {
      path: '/alertgroups/:id?/:entryId?',
      name: IRElementType.Alertgroup,
      component: ElementView,
      alias: '/alertgroup/:id?/:entryId?',
    },
    {
      path: '/events/:id?/:entryId?',
      name: IRElementType.Event,
      component: ElementView,
      alias: '/event/:id?/:entryId?',
    },
    {
      path: '/incidents/:id?/:entryId?',
      name: IRElementType.Incident,
      component: ElementView,
      alias: '/incident/:id?/:entryId?',
    },
    {
      path: '/dispatches/:id?/:entryId?',
      name: IRElementType.Dispatch,
      component: ElementView,
      alias: '/dispatch/:id?/:entryId?',
    },
    {
      path: '/intels/:id?/:entryId?',
      name: IRElementType.Intel,
      component: ElementView,
      alias: '/intel/:id?/:entryId?',
    },
    {
      path: '/products/:id?/:entryId?',
      name: IRElementType.Product,
      component: ElementView,
      alias: '/product/:id?/:entryId?',
    },
    {
      path: '/feeds/:id?/:entryId?',
      name: IRElementType.Feed,
      component: ElementView,
      alias: '/feed/:id?/:entryId?',
    },
    {
      path: '/entities/:id?/:entryId?',
      name: IRElementType.Entity,
      component: ElementView,
      alias: '/entity/:id?/:entryId?',
    },
    {
      path: '/tasks/:id?/:target_type?/:target_id?',
      name: IRElementType.Entry,
      component: ElementView,
      alias: '/task/:id?/:target_type?/:target_id?',
    },
    {
      path: '/signatures/:id?/:entryId?',
      name: IRElementType.Signature,
      component: ElementView,
      alias: '/signature/:id?/:entryId?',
    },
    {
      path: '/guides/:id?/:entryId?',
      name: IRElementType.Guide,
      component: ElementView,
      alias: '/guide/:id?/:entryId?',
    },
    {
      path: '/pivots/:id?/:entryId?',
      name: IRElementType.Pivot,
      component: ElementView,
      alias: '/pivot/:id?/:entryId?',
    },
    {
      path: '/entity-classes/:id?/:entryId?',
      name: IRElementType.EntityClass,
      component: ElementView,
    },
    {
      path: '/vuln_feeds/:id?/:entryId?',
      name: IRElementType.VulnFeed,
      component: ElementView,
      alias: '/vuln_feed/:id?/:entryId?',
    },
    {
      path: '/vuln_tracks/:id?/:entryId?',
      name: IRElementType.VulnTrack,
      component: ElementView,
      alias: '/vuln_track/:id?/:entryId?',
    },
    {
      path: '/tags/:id?',
      name: 'tags',
      component: TagsSourcesView,
    },
    {
      path: '/sources/:id?',
      name: 'sources',
      component: TagsSourcesView,
    },
    {
      path: '/stats/:id?',
      name: 'stats',
      component: StatsView,
    },
    {
      path: '/threat_model_items/:id?/:entryId?',
      name: IRElementType.ThreatModelItem,
      component: ElementView,
      alias: '/threat_model_item/:id?/:entryId?',
    },
    {
      path: "/admin",
      name: "Admin",
      component: AdminView,
      children: [
        {
          path: "global-settings",
          name: "global-settings",
          component: AdminView
        },
        {
          path: "users-groups",
          name: "users-groups",
          component: AdminView
        },
        {
          path: "authentication",
          name: "authentication",
          component: AdminView
        },
        {
          path: "audit-logs",
          name: "audit-logs",
          component: AdminView
        },
        {
          path: "storage",
          name: "storage",
          component: AdminView
        },
        {
          path: "permissions",
          name: "permissions",
          component: AdminView
        }
      ]
    },
    {
      path: '/profile',
      name: "UserProfile",
      component: ProfileView,
      children: [
        {
          path: 'user-profile',
          name: 'one',
          component: ProfileView,
        },
        {
          path: 'user-preferences',
          name: 'two',
          component: ProfileView,
        },
        {
          path: 'api-keys',
          name: 'three',
          component: ProfileView,
        },
        {
          path: 'user-logs',
          name: 'four',
          component: ProfileView,
        },
        {
          path: 'user-permissions',
          name: 'five',
          component: ProfileView,
        }
      ],

    },
  ]
})

router.beforeResolve(async (to, _from, next) => {
  const Auth = useAuth_APIStore()
  const Storage = useStorage()
  // console.log('tokenvalid', Auth.isAuthTokenExpired)
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    if (to.name == 'Landing' && code && state) {
      // await store.dispatch('user/completeAzureAD', { code, state })
      // if (store.getters['user/isLoggedIn']) {
      //     const redirectUrl = await Vue.prototype.$storage.getItem('loginRedirect')
      //     const currentUrlNoParams = new URL(location.pathname + location.hash, window.location.origin)
      //     if (redirectUrl) {
      //         Vue.prototype.$storage.removeItem('loginRedirect')
      //         let fullRedirectHref = currentUrlNoParams.href + redirectUrl
      //         if (currentUrlNoParams.href.endsWith('/')) {
      //             fullRedirectHref = currentUrlNoParams.href + redirectUrl.substring(1)
      //         }
      //         window.location.replace(fullRedirectHref)
      //     }
      //     else {
      //         window.location.replace(currentUrlNoParams)
      //     }
      // }
    }
    //else if (to.name !== 'Login' && Auth.isAuthTokenExpired) {
    //  Storage.setItem('loginRedirect', to.path)
    //  next({ name: 'Login' })
    //}
    // else if (to.name == 'Admin' && store.getters['user/currentUser'].is_superuser != true) {
    //     next({ name: 'Landing' })
    // }
    else {
      next()
    }
  }
  catch (e) {
    console.log(e)
  }
})
export default router
