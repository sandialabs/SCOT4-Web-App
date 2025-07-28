<template>
    <div>
        <v-app-bar app absolute tile clipped-left id="ScotAppBar" height="60" elevation="0">
            <router-link to="/">
                <v-img width="50px" src="@/assets/scot-logo.png"></v-img>
            </router-link>
            <v-tabs class="mt-n4"
                    id="NavBarTabs"
                    hide-slider
                    optional>
                <v-menu offset-y
                        v-for="tab in tabs"
                        :key="tab.tabName"
                        style="color: inherit">
                    <template v-slot:activator="{ on, attrs }">
                        <v-tab :key=tab.tabName
                               :id=tab.tabName
                               v-bind="attrs"
                               v-on="on"
                               :class="{'grey lighten-1': routeMatches($route.path, tab) && !$vuetify.theme.dark, 'grey darken-3': routeMatches($route.path, tab) && $vuetify.theme.dark}">
                            <v-container :class="{'pb-0': routeMatches($route.path, tab)}">
                                <v-row no-gutters>
                                    <v-col>
                                        {{ tab.tabName }}
                                        <v-icon right>
                                            mdi-menu-down
                                        </v-icon>
                                    </v-col>
                                </v-row>
                                <v-row no-gutters v-if="routeMatches($route.path, tab)" class="text-caption mt-n2"><v-col>{{ subTabForRoute(routeMatches($route.path, tab), tab) }}</v-col></v-row>
                            </v-container>
                        </v-tab>
                    </template>
                    <v-list :class="{'grey lighten-3': !$vuetify.theme.dark, 'grey darken-4': $vuetify.theme.dark}">
                        <router-link v-for="(item, index) in tab.subTabs"
                                     :to="tab.routes[index]"
                                     :key="item"
                                     :id="item"
                                     custom
                                     v-slot="{ href, isActive }">
                            <v-list-item :class="{'grey lighten-1': isActive && !$vuetify.theme.dark, 'grey darken-3': isActive && $vuetify.theme.dark}"
                                         :href="href">
                                {{ item }}
                            </v-list-item>
                        </router-link>
                    </v-list>
                </v-menu>
                <router-link to="/team/calendar"
                             v-slot="{ isActive }">
                    <v-tab v-if="currentIH != undefined && currentIH.length > 1" to="/team/calendar" id="calendarTab"
                           :class="{'grey lighten-1': isActive && !$vuetify.theme.dark, 'grey darken-3': isActive && $vuetify.theme.dark}">
                        Incident Handlers: <br>
                        {{currentIH[0].username}} <br>
                        {{currentIH[1].username}}
                    </v-tab>
                    <v-tab v-else-if="currentIH != undefined && currentIH.length > 0" to="/team/calendar" id="calendarTab"
                           :class="{'grey lighten-1': isActive && !$vuetify.theme.dark, 'grey darken-3': isActive && $vuetify.theme.dark}">
                        Incident Handler: {{currentIH[0].username}}
                    </v-tab>
                    <v-tab v-else to="/team/calendar" id="calendarTab"
                           :class="{'grey lighten-1': isActive && !$vuetify.theme.dark, 'grey darken-3': isActive && $vuetify.theme.dark}">
                        Incident Handler: &lt;None&gt;
                    </v-tab>
                </router-link>
            </v-tabs>


            <v-chip v-if="globalSettings.environment_level" label style="overflow: inherit">
                {{globalSettings.environment_level}}
            </v-chip>


            <v-text-field hide-details
                          prepend-icon="mdi-magnify"
                          @keydown="onSearchKeyDown"
                          v-model="searchInput"
                          :loading="currentlySearching"
                          :append-icon="clearSearchIcon"
                          @click:append="onClearSearchResults"
                          single-line></v-text-field>

            <v-btn @click="settingsButtonClicked()" icon>
                <v-icon>mdi-cog</v-icon>
            </v-btn>


            <v-menu v-if="notifications != undefined" @input="onOpenCloseNotifications" offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-badge overlap class="mt-2" :value="unAckdNotifications > 0 && ackingNotifications == false && !muteNotifications" :content="unAckdNotifications > 0 ? unAckdNotifications : null">
                        <v-btn v-on="on" v-bind="attrs" class="mr-n2 mt-n2" icon>
                            <v-icon>mdi-bell</v-icon>
                        </v-btn>
                    </v-badge>
                </template>
                <v-list v-if="notifications.length > 0" class="pb-0 notifications-list" :key="notificationMenuRender">
                    <v-list-item v-for="notification in notifications" :key="notification.id" class="px-0" :to="linkForNotification(notification)">
                        <v-list-item-content class="py-0">
                            <v-card outlined>
                                <v-card-subtitle class="py-0 ml-n1">
                                    {{notificationHeaderText(notification)}}
                                </v-card-subtitle>
                                <v-card-text :style="notification.ack ? '' : 'font-weight: bold'">
                                    <div class="text--primary notification-text">{{notification.message}}</div>
                                    <div class="pt-1 mb-n2 ml-n1"><i>{{getRelativeTime(notification.created)}}</i></div>
                                </v-card-text>
                            </v-card>
                        </v-list-item-content>
                    </v-list-item>
                    <v-list-item v-observe-visibility.quiet="loadMoreNotifications" style="min-height: 15px">
                        <v-progress-circular indeterminate v-if="loadingMoreNotifications"></v-progress-circular>
                        <div class="pa-2" v-else-if="!getAllNotifications">
                            <a @click="showAllNotifications">Show All Notifications</a>
                        </div>
                    </v-list-item>
                    <v-divider />
                </v-list>
                <v-list v-else class="pb-0 notifications-list">
                    <v-list-item ß>
                        <v-list-item-content>
                            <v-list-item-title>
                                <div>No New Notifications</div>
                                <div class="pt-3" v-if="!getAllNotifications">
                                    <a @click.stop="showAllNotifications">Show All Notifications</a>
                                </div>
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-btn v-else icon>
                <v-icon>mdi-bell</v-icon>
            </v-btn>
            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon
                           v-bind="attrs"
                           v-on="on">
                        <v-icon>mdi-help-circle</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item target="_blank" :link="true" :href="apiDocsLink()">
                        <v-list-item-icon>
                            <v-icon>mdi-api</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>
                                API Docs
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <ScotExternalLinks></ScotExternalLinks>
                </v-list>
            </v-menu>

            <v-menu offset-y v-if="currentUser != undefined">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon
                           v-bind="attrs"
                           v-on="on">
                        <v-icon id="userIcon">mdi-account</v-icon>
                    </v-btn>
                </template>
                <v-list>
                    <router-link to="/profile" custom v-slot="{ href }">
                        <v-list-item :href="href">
                            <v-list-item-content>
                                <v-list-item-title>
                                    {{ currentUser.fullname }}
                                </v-list-item-title>
                                <v-list-item-subtitle>
                                    @{{ currentUser.username }}
                                </v-list-item-subtitle>
                            </v-list-item-content>
                        </v-list-item>
                    </router-link>
                    <v-divider />
                    <v-list-item id="userLinks" link @click="loadUserLinks">
                        <v-list-item-content>
                            <v-list-item-title>
                                Favorites/Subscriptions
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                    <v-divider />
                    <router-link v-if="currentUser.is_superuser == true" to="/admin" custom v-slot="{ href }">
                        <v-list-item id="adminButton" :href="href">
                            <v-list-item-content>
                                <v-list-item-title>
                                    Administration
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </router-link>
                    <v-divider v-if="currentUser.is_superuser == true" />
                    <v-list-item id="logoutButton" link @click="logout()">
                        <v-list-item-content>
                            <v-list-item-title>
                                Logout
                            </v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
            <div class="notification-alert-toasts">
                <TransitionGroup name="alert">
                    <v-alert v-for="notification in getAlertNotifications()" dismissible colored-border :color="notification.priority == 'high' ? 'amber' : 'blue'" border="left" style="border: 1px solid grey; width: 300px" class="py-1 pr-3 pl-1" :key="notification.id">
                        <template v-slot:close="">
                            <v-icon :color="notification.priority == 'high' ? 'amber' : 'blue'" @click="ackNotifications({notifications: [notification]})">mdi-close-circle</v-icon>
                        </template>
                        <v-card flat>
                            <v-card-subtitle class="py-0 ml-n1">
                                {{notificationHeaderText(notification)}}
                            </v-card-subtitle>
                            <v-card-text>
                                <div class="text--primary notification-text">{{notification.message}}</div>
                                <div class="pt-1 mb-n2 ml-n1">{{getRelativeTime(notification.created)}}</div>
                            </v-card-text>
                        </v-card>
                    </v-alert>
                </TransitionGroup>
            </div>
        </v-app-bar>

        <v-dialog v-model="userLinkDialog" max-width="850px">
            <v-card>
                <v-tabs center-active grow v-model="userLinkTab">
                    <v-tab v-for="user_link in userLinkTabs" :key="user_link.link_type">{{ pluralized(user_link.link_type) }}</v-tab>
                </v-tabs>
                <v-tabs-items v-model="userLinkTab">
                    <v-tab-item v-for="user_link in userLinkTabs" :key="user_link.link_type">
                        <v-data-table :id="user_link.link_type"
                                      :headers="user_link.headers"
                                      :items="user_link.table"
                                      :loading="user_link.loading"
                                      dense
                                      hide-default-header>
                            <template v-slot:[`item.link`]="{item}">
                                <v-btn class="clip-text" v-if="item.name" @click="followUserLink(item)" text small color="blue" block>{{item.name}}</v-btn>
                                <v-btn class="clip-text" v-else @click="followUserLink(item)" text small color="blue" block>{{buttonTitle(item)}}</v-btn>
                            </template>
                            <template v-slot:[`item.target`]="{item}">
                                <span>{{buttonTitle(item)}}</span>
                            </template>
                            <template v-slot:[`item.actions`]="{item}">
                                <v-btn tile @click="unsubscribe(item, user_link.table)" :loading="item.loading">
                                    <v-icon left color="blue">mdi-bell-off</v-icon>
                                    Unsubscribe
                                </v-btn>
                            </template>
                        </v-data-table>
                    </v-tab-item>
                </v-tabs-items>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="red darken-1"
                        text
                        @click="userLinkDialog = false"
                    >
                        Close
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Watch} from 'vue-property-decorator'
    import { Action, Getter } from 'vuex-class';
    import { User, Notification, UserLinksEnum, UserLinkTab, UserLinks } from '@/store/modules/user/types'
    import { Settings } from '../../store/modules/team/types';
    import ScotExternalLinks from '@/components/NavigationComponents/ScotExternalLinks.vue'
    import { convertFromSnakeCase } from '@/utils/elementUtils'

    const namespace: string = 'user';

    @Component({
        components: {
            ScotExternalLinks
        },
    })

    export default class ScotNavBar extends Vue {
        @Getter('notifications', { namespace }) notifications: Array<Notification>
        @Getter('unAckdNotifications', { namespace }) unAckdNotifications: number
        @Getter('notificationsRemaining', { namespace }) notificationsRemaining: number
        @Getter('currentIH', { 'namespace': 'team' }) currentIH: Array<any>
        @Getter('currentUser', { namespace }) currentUser: User
        @Getter('globalSettings', { 'namespace': 'team' }) globalSettings: Settings
        @Getter('isLoggedIn', { namespace }) isLoggedIn: boolean
        @Getter('searchResults', { namespace }) searchResults: any
        @Getter('muteNotifications', { namespace }) muteNotifications: boolean
        @Action('settingsButtonClicked', { namespace }) settingsButtonClicked: any;
        @Action('logout', { namespace }) logoutAction: CallableFunction
        @Action('clearSelectedElement', { 'namespace': 'IRElements' }) clearIRElement: CallableFunction
        @Action('getCurrentIH', { 'namespace': 'team' }) getCurrentIH: CallableFunction
        @Action('retrieveGlobalSettings', { 'namespace': 'team' }) retrieveGlobalSettings: CallableFunction
        @Action('performTextSearch', { namespace }) performTextSearch: CallableFunction
        @Action('clearSearchResults', { namespace }) clearSearchResults: CallableFunction
        @Action('changeShowSearchOverlay', { namespace }) changeShowSearchOverlay: CallableFunction
        @Action('ackNotifications', { namespace }) ackNotifications: CallableFunction
        @Action('getFavorites', { namespace }) getFavorites: CallableFunction
        @Action('getSubscriptions', { namespace }) getSubscriptions: CallableFunction
        @Action('retrieveNotifications', { namespace }) retrieveNotifications: CallableFunction
        @Action('unsubscribeElement', { 'namespace': 'IRElements' }) unsubscribeElement: CallableFunction;

        responseItems: Array<string> = ["Alertgroups", "Events", "Incidents"]
        threatItems: Array<string> = ["Dispatches", "Intels", "Products", "Feeds", "Entities"]
        toolItems: Array<string> = ["Tasks", "Signatures", "Guides", "Pivots", "Entity Classes", "Tags", "Sources", "Stats"]
        vulnerabilityItems: Array<string> = ["Vuln Feed", "Vuln Track"]
        accountItems: Array<string> = ["Logout"]
        tabs: Array<any> = [
            { tabName: "Response", subTabs: this.responseItems, routes: this.responseItems.map((t) => '/' + t.toLowerCase().replace(' ', '_')) },
            { tabName: "Threat", subTabs: this.threatItems, routes: this.threatItems.map((t) => '/' + t.toLowerCase().replace(' ', '_')) },
            { tabName: "Vulnerability", subTabs: this.vulnerabilityItems, routes: this.vulnerabilityItems.map((t) => '/' + t.toLowerCase().replace(' ', '_') + 's') },
            { tabName: "Tools", subTabs: this.toolItems, routes: this.toolItems.map((t) => '/' + t.toLowerCase().replace(' ', '_')) },
        ]

        searchResultsExists = false
        getAllNotifications: boolean = false
        clearSearchIcon: string | undefined = ""
        settings: boolean = false
        currentPage: string | null = null
        notificationMenuRender: number = 0
        alertRender: number = 0
        ackingNotifications: boolean = false
        loadingMoreNotifications: boolean = false
        alertUpdateTask: number | null = null
        searchInput: string | undefined = ""
        currentlySearching: boolean = false

        userLinkTab: any = null
        userLinkTabs: Array<UserLinkTab> = [
            { "link_type": UserLinksEnum.favorite, "headers": [{ text: "", value: "link" }, { text: "", value: "target" }], "table": [], "loading": false, },
            { "link_type": UserLinksEnum.subscription, "headers": [{ text: "", value: "link" }, { text: "", value: "target" }, { text: "", value: "actions" }], "table": [], "loading": false, }
        ]
        userLinkDialog: boolean = false

        async onOpenCloseNotifications(value: boolean) {
            if (!value && !this.ackingNotifications) {
                this.ackingNotifications = true
                await this.ackNotifications({ notifications: this.notifications })
                this.ackingNotifications = false
            }
            else if (value) {
                // Force re-render of menu when it opens
                this.notificationMenuRender++;
            }
        }

        async logout() {
            this.$router.push('/login').catch(() => { return })
            await this.clearIRElement()
            await this.logoutAction()
        }

        routeMatches(route: string, tab: any) {
            for (const tabRoute of tab.routes) {
                if (route.startsWith(tabRoute)) {
                    return tabRoute
                }
            }
            return null
        }

        apiDocsLink() {
            return process.env.VUE_APP_API_BASE.replace('/v1', '/docs')
        }

        subTabForRoute(route: string, tab: any) {
            const idx = tab.routes.indexOf(route)
            return tab.subTabs[idx]
        }

        async onClearSearchResults() {
            if (this.currentlySearching === false) {
                await this.clearSearchResults()
                this.searchResultsExists = false
                this.clearSearchIcon = undefined
                this.searchInput = ""
            }
        }

        getAlertNotifications() {
            if (this.muteNotifications) {
                return []
            }
            const alerts = this.notifications.filter(
                (n) => n.priority != "low"
                && !n.ack
                && (n.priority == "high" || Date.now() - new Date(n.created).getTime() < 15000)
                && this.alertRender > -1 // Forces a re-render whenever this is incremented
            ).sort((n1, n2) => new Date(n1.created).getTime() - new Date(n2.created).getTime())
            if (alerts && alerts.length > 0) {
                if (!this.alertUpdateTask) {
                    // As long as there was one alert, re-render the alert menu every 5 seconds
                    this.alertUpdateTask = setInterval(() => {
                        this.alertRender++
                    }, 5000)
                }
            }
            else if (this.alertUpdateTask) {
                clearInterval(this.alertUpdateTask)
                this.alertUpdateTask = null
            }
            return alerts
        }

        showAllNotifications() {
            this.getAllNotifications = true
            this.retrieveNotifications({ includeAcked: this.getAllNotifications })
        }

        async loadMoreNotifications(isIntersecting: boolean) {
            if (isIntersecting && this.notificationsRemaining > 0) {
                this.loadingMoreNotifications = true
                await this.retrieveNotifications({ includeAcked: this.getAllNotifications, skip: this.notifications.length })
                this.loadingMoreNotifications = false
            }
        }

        linkForNotification(notification: Notification) {
            if (notification?.ref_id == "broadcast") {
                return null
            }
            else if (notification?.ref_id) {
                const parts = notification.ref_id.split(" ")
                const type = this.pluralized(parts[0])
                const id = parts[1]
                if (parts.length == 2) {
                    return "/" + type + "/" + id
                }
                // Entries
                else if (parts.length == 4) {
                    const entry_id = parts[3]
                    return "/" + type + "/" + id + "/" + entry_id
                }
                else {
                    return null
                }
            }
            return null
        }

        notificationHeaderText(notification: Notification){
            if (notification?.ref_id == "broadcast"){
                return "Announcement"
            }
            else if (notification?.ref_id) {
                const parts = notification.ref_id.split(" ")
                return convertFromSnakeCase(parts[0]) + " " + parts[1]
            }
            return ""
        }

        getRelativeTime(timestamp: Date) {
            timestamp = new Date(timestamp)
            const relativeTimeMs = new Date().valueOf() - timestamp.valueOf()
            if (relativeTimeMs < 0) {
                return "In the future"
            }
            else if (relativeTimeMs <= 5000) {
                return "Just now"
            }
            else if (relativeTimeMs < 60000) {
                return Math.floor(relativeTimeMs / 1000) + " seconds ago"
            }
            else if (relativeTimeMs < 2 * 60 * 1000) {
                return "1 minute ago"
            }
            else if (relativeTimeMs < 60 * 60 * 1000) {
                return Math.floor(relativeTimeMs / (1000 * 60)) + " minutes ago"
            }
            else if (relativeTimeMs < 2 * 60 * 60 * 1000) {
                return "1 hour ago"
            }
            else if (relativeTimeMs < 24 * 60 * 60 * 1000) {
                return Math.floor(relativeTimeMs / (1000 * 60 * 60)) + " hours ago"
            }
            else if (relativeTimeMs < 2 * 24 * 60 * 60 * 1000) {
                return "1 day ago"
            }
            else if (relativeTimeMs < 7 * 24 * 60 * 60 * 1000) {
                return Math.floor(relativeTimeMs / (1000 * 60 * 60 * 24)) + " days ago"
            }
            else if (relativeTimeMs < 366 * 24 * 60 * 60 * 1000) {
                return timestamp.toLocaleDateString(undefined, { month: "short", day: "numeric" })
            }
            else {
                return timestamp.getFullYear().toString()
            }
        }

        async onSearchKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter' && this.currentlySearching === false) {
                this.currentlySearching = true
                await this.performTextSearch({ searchText: this.searchInput })
                this.currentlySearching = false
                this.changeShowSearchOverlay({ value: true })
                this.clearSearchIcon = "mdi-close"
            }

        }

        async mounted() {
            if (this.isLoggedIn) {
                await this.getCurrentIH()
                await this.retrieveGlobalSettings()
                if (!this.notifications || this.notifications.length == 0) {
                    await this.retrieveNotifications()
                }
            }
        }

        @Watch('isLoggedIn')
        async loggedInChanged(newVal: boolean) {
            if (newVal) {
                await this.getCurrentIH()
                await this.retrieveGlobalSettings()
                if (!this.notifications || this.notifications.length == 0) {
                    await this.retrieveNotifications()
                }
            }
        }
    
        pluralized(target: string) {
            if (target == "entity"){
                return "entities"
            }
            else if (target == "dispatch"){
                return "dispatches"
            }
            else if (target == "entry") {
                return "entries"
            }
            else {
                return target + "s"
            }
        }
    
        buttonTitle(userLink: UserLinks) {
            if (userLink.target_type == "entry" && userLink.parent_target_type && userLink.parent_target_id) {
                return `${convertFromSnakeCase(userLink.parent_target_type)}: ${userLink.parent_target_id} - ${convertFromSnakeCase(userLink.target_type)}: ${userLink.target_id}`
            }
            else {
                return `${convertFromSnakeCase(userLink.target_type)}: ${userLink.target_id}`
            }
        }

        async loadUserLinks() {
            this.userLinkDialog = true
            this.userLinkTabs.forEach(async (user_link) => {
                user_link.loading = true
                if (user_link.link_type == UserLinksEnum.favorite) {
                    const result = await this.getFavorites()
                    if (result) {
                        user_link.table = result.result
                        user_link.table.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
                    }
                }
                if (user_link.link_type == UserLinksEnum.subscription) {
                    const result = await this.getSubscriptions()
                    if (result) {
                        user_link.table = result.result
                        user_link.table.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
                    }
                }
                user_link.loading = false
            })
        }

        async followUserLink(user_link: any) {
            this.userLinkDialog = false
            if (user_link.target_type == 'entry') {
                this.$router.push(`/${this.pluralized(user_link.parent_target_type)}/${user_link.parent_target_id}/${user_link.target_id}`)
            }
            else {
                this.$router.push(`/${this.pluralized(user_link.target_type)}/${user_link.target_id}`)
            }
        }

        async unsubscribe(user_link: UserLinks, table: Array<any>) {
            const idx = table.findIndex((ul) => ul.id == user_link.id)
            if (idx != -1) {
                Vue.set(table[idx], 'loading', true)
            }
            const result = await this.unsubscribeElement({ elementID: user_link.target_id, elementType: user_link.target_type })
            if (result && idx != -1) {
                table.splice(idx, 1)
            }
            else if (idx != -1) {
                Vue.set(table[idx], 'loading', false)
            }
        }
    }
</script>

<style scoped>
.v-app-bar-title__content{
  width: 200px !important
}

/* Override "primary" color to make selections look nicer */
.v-application .theme--light .primary--text .v-tab {
    color: #2c3e50;
}

.v-application .theme--dark .primary--text .v-tab {
    color: #adbfd2;
}

em{
  background-color: yellow;
}

.notification-text {
    max-height: 150px;
    overflow-y: auto;
}

.notifications-list {
    overflow-y: auto;
    max-width: 300px;
    min-width: 250px;
    max-height: 90vh;
}

.notification-alert-toasts {
    position: fixed;
    right: 20px;
    top: 65px;
    max-width: 300px;
    min-width: 300px;
    word-break: break-word;
}

.alert-leave-active {
   position: absolute;
}

.alert-enter,
.alert-leave-to {
    opacity: 0;
}

.alert-move,
.alert-enter-active,
.alert-leave-active {
    transition: all 0.5s ease;
}

.clip-text {
    text-overflow: ellipsis ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 400px;
    display: block;
}

::v-deep .clip-text .v-btn__content {
    display: inline;
}

::v-deep .theme--light tbody tr:nth-of-type(odd) {
    background-color: rgba(247, 247, 247);
}

::v-deep .theme--dark tbody tr:nth-of-type(odd) {
    background-color: rgba(0, 0, 0)
}
</style>
