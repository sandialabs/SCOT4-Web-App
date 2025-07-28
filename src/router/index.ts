import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Login from '../views/Login.vue'
import Response from '../views/Response.vue'
import ComingSoon from '../views/ComingSoon.vue'
import Landing from '../views/Landing.vue'
import Calendar from '../views/Calendar.vue'
import ThreatModel from '../views/ThreatModel.vue'
import Admin from '../views/Admin.vue'
import FullScreenEntry from '../views/FullScreenEntry.vue'
import EntityClassIcons from '../views/EntityClassIcons.vue'
import { IRElementType } from '@/store/modules/IRElements/types'
import UserSettingsView from '../views/UserSettings.vue'
import Stats from '../views/Stats.vue'
import TagsSources from "../views/TagsSources.vue"

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/team/calendar',
        name: 'Calendar',
        component: Calendar
    },
    {
        path: '/threat_model/:type?',
        name: 'ThreatModel',
        component: ThreatModel
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin
    },
    {
        path: '/',
        name: 'Landing',
        component: Landing
    },
    {
        path: '/entities/:id?/:entryId?',
        name: 'Entities',
        component: Response,
        meta: { itemType: IRElementType.Entity },
        alias: '/entity/:id?/:entryId?'
    },
    {
        path: '/entity_classes_list',
        name: 'EntityClasses',
        component: EntityClassIcons
    },
    {
        path: '/alertgroups/:id?/:entryId?',
        name: 'Alertgroups',
        component: Response,
        meta: { itemType: IRElementType.Alertgroup },
        alias: '/alertgroup/:id?/:entryId?'
    },
    {
        path: '/events/:id?/:entryId?',
        name: 'Events',
        component: Response,
        meta: { itemType: IRElementType.Event },
        alias: '/event/:id?/:entryId?'
    },
    {
        path: '/vuln_feeds/:id?/:entryId?',
        name: 'Queue',
        component: Response,
        meta: { itemType: IRElementType.VulnFeed },
        alias: '/vuln_feed/:id?/:entryId?'
    },
    {
        path: '/vuln_tracks/:id?/:entryId?',
        name: 'Tracking',
        component: Response,
        meta: { itemType: IRElementType.VulnTrack },
        alias: '/vuln_track/:id?/:entryId?'
    },
    {
        path: '/signatures/:id?/:entryId?',
        name: 'Signatures',
        component: Response,
        meta: { itemType: IRElementType.Signature },
        alias: '/signature/:id?/:entryId?'
    },
    {
        path: '/incidents/:id?/:entryId?',
        name: 'Incidents',
        component: Response,
        meta: { itemType: IRElementType.Incident },
        alias: '/incident/:id?/:entryId?'
    },
    {
        path: '/intels/:id?/:entryId?',
        name: 'Intels',
        component: Response,
        meta: { itemType: IRElementType.Intel },
        alias: '/intel/:id?/:entryId?'
    },
    {
        path: '/dispatches/:id?/:entryId?',
        name: 'Dispatches',
        component: Response,
        meta: { itemType: IRElementType.Dispatch },
        alias: '/dispatch/:id?/:entryId?'
    },
    {
        path: '/products/:id?/:entryId?',
        name: 'Products',
        component: Response,
        meta: { itemType: IRElementType.Product },
        alias: '/product/:id?/:entryId?'
    },
    {
        path: '/feeds/:id?/:entryId?',
        name: 'Feed',
        component: Response,
        meta: { itemType: IRElementType.Feed },
        alias: '/feed/:id?/:entryId?'
    },
    {
        path: '/tasks/:id?/:target_type?/:target_id?',
        name: 'Task',
        component: Response,
        meta: { itemType: IRElementType.Entry, extraFilters: { "entry_class": "task" } },
        alias: '/task/:id?/:target_type?/:target_id?'
    },
    {
        path: '/guides/:id?/:entryId?',
        name: 'Guide',
        component: Response,
        meta: { itemType: IRElementType.Guide },
        alias: '/guide/:id?/:entryId?'
    },
    {
        path: '/pivots/:id?',
        name: 'Pivot',
        component: Response,
        meta: { itemType: IRElementType.Pivot },
        alias: '/pivot/:id?'
    },
    {
        path: '/entity_classes/:id?',
        name: 'EntityClass',
        component: Response,
        meta: { itemType: IRElementType.EntityClass }
    },
    {
        path: '/tags/:id?',
        name: 'Tags',
        component: TagsSources,
        meta: { itemType: "tag" }
    },
    {
        path: '/sources/:id?',
        name: 'Sources',
        component: TagsSources,
        meta: { itemType: "source" }
    },
    {
        path: '/hunts/:id?/:entryId?',
        name: 'Hunts',
        component: ComingSoon
    },
    {
        path: '/actors/:id?/:entryId?',
        name: 'Actors',
        component: ComingSoon
    },
    {
        path: '/profile',
        name: 'UserSettings',
        component: UserSettingsView,
    },
    {
        path: '/coming_soon',
        name: 'Coming Soon',
        component: ComingSoon,
    },
    {
        path: '/:elementType/:elementId/entry/:entryId/fullScreen',
        name: 'FullScreenEntry',
        component: FullScreenEntry
    },
    {
        path: '/stats',
        name: 'StatsCentral',
        component: Stats
    },
]

const router = new VueRouter({
  routes
})



router.afterEach((to, from) => {
  const toDepth = to.path.split('/').length
  const fromDepth = from.path.split('/').length
  if(to !=undefined && to.meta!=undefined && (to.name=='FullScreenEntry' || from.name=='FullScreenEntry')){
    to.meta.transitionName = 'fade'
  }
})

export default router
