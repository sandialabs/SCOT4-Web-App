<template>
    <v-app-bar tile absolute elevation="0" density="comfortable">
        <v-app-bar-nav-icon :to="{ name: 'Home' }"><img class="scot-logo" src="../assets/scot-logo.png"
                alt="SCOT Logo"></v-app-bar-nav-icon>
        <v-tabs v-model="selectedTab" show-arrows hide-slider active-class="bg-grey-lighten-1">
            <v-menu v-for="tab in tabs" :key="tab.tabName">
                <template v-slot:activator="{ props }">
                    <v-tab v-bind="props" :key="tab.tabName" :id="tab.tabName" :value="tab.tabName"
                        :class="tab.subTabs.includes(currentRouteName) ? (theme.current.value.dark ? 'bg-grey-darken-3' : 'bg-grey-lighten-1') : ''">
                        <template v-slot:append>
                            <FontAwesomeIcon :icon="faCaretDown" />
                        </template>
                        <v-list-item>
                            <div class="text-uppercase">
                                {{ tab.tabName }}
                            </div>
                            <v-list-item-subtitle v-if="tab.subTabs.includes(currentRouteName)"
                                class="text-uppercase text-caption">
                                {{
                                    currentRouteName == IRElementType.Entry ? "Tasks" : currentRouteName.split('/').pop().replace("_item", "").replace(/_/g, " ")
                                }}
                            </v-list-item-subtitle>
                        </v-list-item>
                    </v-tab>
                </template>
                <v-list :class="{ 'bg-grey-lighten-3': !theme.current.value.dark, 'bg-grey-darken-4': theme.current.value.dark }">
                    <v-list-item v-for="(item, i) in tab.subTabs" :key="item + i" :to="tab.routes[i]" :active-class="theme.current.value.dark ? 'bg-grey-darken-3' : 'bg-grey-lighten-1'">
                        {{ item == IRElementType.Entry ? "Tasks" : textPipe.CapitalizeString(item.split('/').pop().replace("_item", "").replace(/_/g, " ")) }}
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-tab :to="{ name: 'Calendar' }" :loading="isLoadingHandlers" value="Calendar"
                :active="Router.currentRoute.value.name == 'Calendar'"
                :active-class="theme.current.value.dark ? 'bg-grey-darken-3' : 'bg-grey-lighten-1'" class="text-center"
                style="max-width: 250px">
                <template v-if="handlerResults?.length > 1" v-slot:default>
                    Incident Handlers:<br>
                    {{ handlerResults[0].username }}<br>
                    {{ handlerResults[1].username }}
                </template>
                <template v-else-if="handlerResults?.length > 0" v-slot:default>
                    Incident Handler:
                    {{ handlerResults[0].username }}
                </template>
                <template v-else v-slot:default>
                    Incident Handler: &lt;None&gt;
                </template>
            </v-tab>
        </v-tabs>
        <v-spacer />

        <v-chip v-if="settings.GetSettings.environment_level" label style="overflow: inherit"
            :text="settings.GetSettings.environment_level" />

        <v-text-field clearable variant="outlined" label="Search" v-model="searchInput" density="compact"
            class="pt-6 mx-1" @keydown="onSearchKeyDown">
            <template v-slot:append>
                <v-btn variant="outlined" @click="SearchSubmit()" rounded="lg" elevation="1">
                    <FontAwesomeIcon :icon="faSearch" />
                </v-btn>
            </template>
        </v-text-field>

        <v-btn v-if="!Modal.GetModalActive && Flair.GetSelectedFlairedEntities.length > 0" variant="outlined"
            class="mx-1" @click="Modal.ToggleModal()" rounded="lg" elevation="1">
            <FontAwesomeIcon :icon="faWindowMaximize" />
        </v-btn>

        <v-btn variant="outlined" class="mx-1" @click="Drawer.ToggleDrawer()" rounded="lg" elevation="1">
            <FontAwesomeIcon :icon="faGear" />
        </v-btn>

        <v-menu @update:modelValue="notifications.onOpenClose" location="bottom end" target="parent" max-width="300px"
            min-width="250px">
            <template v-slot:activator="{ props }">
                <v-badge v-model="notifications.badge" :content="notifications.count != 0 ? notifications.count : null"
                    style="z-index: 1">
                    <v-btn variant="outlined" class="mx-1" v-bind="props" rounded="lg" elevation="1">
                        <FontAwesomeIcon :icon="faBell" />
                    </v-btn>
                </v-badge>
            </template>
            <v-list v-if="notifications.notifications.length > 0" class="pb-0 notifications-list">
                <v-list-item class="px-0 py-0" v-for="notification in notifications.notifications"
                    :key="notification.id" :class="{ 'cursor-default': !notifications.link(notification) }"
                    :to="notifications.link(notification)">
                    <v-card variant="outlined" style="border-color: rgba(0, 0, 0, 0.12)">
                        <v-card-subtitle class="py-0 ml-n1">
                            {{ notifications.headerText(notification) }}
                        </v-card-subtitle>
                        <v-card-text :style="notification.ack ? '' : 'font-weight: bold'" class="notification-body">
                            <div class="notification-text">{{ notification.message }}</div>
                            <div class="notification-time pt-1 mb-n2 ml-n1"><i>{{
                                textPipe.GetRelativeTime(notification.created)
                                    }}</i></div>
                        </v-card-text>
                    </v-card>
                </v-list-item>
                <v-list-item v-observe-visibility.quiet="notifications.loadMore" style="min-height: 15px;">
                    <v-progress-circular indeterminate v-if="notifications.loading" />
                    <div class="pt-3" v-else-if="!notifications.getAll">
                        <a class="text-primary text-decoration-none" @click.stop="notifications.showAll()">Show All
                            Notifications</a>
                    </div>
                </v-list-item>
            </v-list>
            <v-list class="notifications-list" v-else>
                <v-list-item>
                    <v-list-item-title>
                        <div>No New Notifications</div>
                        <div class="pt-3" v-if="!notifications.getAll">
                            <a class="text-primary text-decoration-none" @click.stop="notifications.showAll()">Show All
                                Notifications</a>
                        </div>
                    </v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>

        <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn variant="outlined" class="mx-1" v-bind="props" rounded="lg" elevation="1">
                    <FontAwesomeIcon :icon="faQuestion" />
                </v-btn>
            </template>
            <v-list>
                <v-list-item target="_blank" :link="true" :href="apiDocsLink()">
                    <v-list-item-title class="ms-2">API Docs</v-list-item-title>
                    <template v-slot:prepend>
                        <FontAwesomeIcon :icon="faPuzzlePiece" />
                    </template>
                </v-list-item>
                <external-links />
            </v-list>
        </v-menu>

        <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn variant="outlined" class="mx-1" v-bind="props" rounded="lg" elevation="1">
                    <FontAwesomeIcon :icon="faUser" />
                </v-btn>
            </template>
            <v-list>
                <v-list-item :to="{ name: 'UserProfile' }" :title="Auth.GetUser.fullname"
                    :subtitle="Auth.GetUser.username" />
                <v-divider class="m-0" />
                <v-list-item @click="Dialog.ToggleDialog('favorites_subs')" title="Favorites/Subscriptions" />
                <v-divider class="m-0" />
                <v-list-item v-if="Auth.GetUser.is_superuser" :to="{ name: 'Admin' }" title="Administration" />
                <v-divider v-if="Auth.GetUser.is_superuser" class="m-0" />
                <v-list-item @click="Logout()" title="Logout" />
            </v-list>
        </v-menu>

        <div class="notification-alert-toasts">
            <TransitionGroup name="alert">
                <v-alert v-for="notification in notifications.getAlert()" :key="notification.id" variant="elevated"
                    closable density="compact" :border-color="notification.priority == 'high' ? 'warning' : 'info'"
                    border="start" class="my-2" width="300px"
                    @click:close="notifications.POST_AcknowledgeNotification([notification.id])">
                    <template v-slot:title>
                        <v-alert-title class="py-0 text-subtitle-1">
                            {{ notifications.headerText(notification) }}
                        </v-alert-title>
                    </template>
                    <template v-slot:text>
                        <div class="notification-text text-body-2 ml-1 mr-n4">{{ notification.message }}</div>
                        <div class="notification-time pt-1 text-body-2">{{
                            textPipe.GetRelativeTime(notification.created) }}</div>
                    </template>
                </v-alert>
            </TransitionGroup>
        </div>
    </v-app-bar>
</template>

<script setup lang="ts">
import ExternalLinks from '@/components/Navigation/ExternalLinks.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faGear, faBell, faSearch, faQuestion, faPuzzlePiece, faWindowMaximize, faCaretDown, faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { useRoute, useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue';
import { useTheme } from 'vuetify'
import { useFirehoseStore, useSnackBarStore } from '@/stores';
import { useNotificationStore, useGET_APIStore, useDialogStore, useDrawerStore, useModalStore, useFlairStore, useAuth_APIStore, useAuthStore, useSettingsStore, } from '@/stores'
import { useStorage } from '@/storage/storage'
import { useTextPipe } from "@/pipes"
import { environment as env } from '@/environments/environment'
import { IRElementPaths, IRElementType, ThreatModelNames } from '@/types/irelement';

const settings = useSettingsStore()
const API_GET = useGET_APIStore()
const Route = useRoute()
const Drawer = useDrawerStore()
const Dialog = useDialogStore()
const SnackBar = useSnackBarStore()
const Modal = useModalStore()
const Flair = useFlairStore()
const Storage = useStorage()
const Router = useRouter()
const Auth = useAuthStore()
const textPipe = useTextPipe()
const notifications = useNotificationStore()
const theme = useTheme()
const Firehose = useFirehoseStore()

const currentRouteName = ref()
const searchInput: any = ref(null)
const handlerResults = ref([] as any[])
const isLoadingHandlers = ref(true)
const responseItems: string[] = [IRElementType.Alertgroup, IRElementType.Event, IRElementType.Incident]
const threatItems: string[] = [IRElementType.Dispatch, IRElementType.Intel, IRElementType.Product, IRElementType.Feed, IRElementType.Entity]
const toolItems: string[] = [IRElementType.Entry, IRElementType.Signature, IRElementType.Guide, IRElementType.Pivot, IRElementType.EntityClass, IRElementType.Tags, IRElementType.Sources, IRElementType.Stats, IRElementType.ThreatModelItem]
const vulnerabilityItems: Array<string> = [IRElementType.VulnFeed, IRElementType.VulnTrack]
const threatModelItems: string[] = [ThreatModelNames.attack]

const tabs: any[] = [
    { tabName: "Response", subTabs: responseItems, routes: responseItems.map((t) => IRElementPaths[t]) },
    { tabName: "Threat", subTabs: threatItems, routes: threatItems.map((t) => IRElementPaths[t]) },
    { tabName: "Vulnerability", subTabs: vulnerabilityItems, routes: vulnerabilityItems.map((t) => IRElementPaths[t]) },
    { tabName: "Tools", subTabs: toolItems, routes: toolItems.map((t) => IRElementPaths[t]) },
]
const selectedTab = ref()

onMounted(async () => {
    GetHandlers()
    currentRouteName.value = Route.name
    notifications.GET_Notifications()

    selectedTab.value = tabs.find((a: any) => a.subTabs.includes(Route.name))?.tabName
    if (!selectedTab.value) {
        selectedTab.value = Route.name
    }
    Firehose.$onAction(handleFirehose)
})

watch(Route, async (newRoute) => {
    currentRouteName.value = newRoute.name
    selectedTab.value = tabs.find((a: any) => a.subTabs.includes(Route.name))?.tabName
    if (!selectedTab.value) {
        selectedTab.value = Route.name
    }
})

async function handleFirehose({ name, store, args, after, onError }) {
    const event = args[0]
    // We only want to get events for incident handlers
    if (name == "handleEvent" && event.element_type == "handler") {
        GetHandlers()
    }
}

function SearchSubmit(e: KeyboardEvent | null = null) {
    if (searchInput.value !== null && searchInput.value.length > 3) {
        Dialog.ToggleDialog('search', { action: 'search', value: searchInput.value })
        searchInput.value = ""
    } else {
        SnackBar.ToggleSnackbar('Enter at least 3 characters to start search')
    }
}

async function GetHandlers() {
    const today = new Date()
    const tomorrow: Date | number | string = new Date(today.getTime() + (24 * 60 * 60 * 1000))
    await API_GET.GET_Handlers(today.toISOString(), tomorrow.toISOString())
        .then((v: any) => {
            handlerResults.value = v.result.filter(handler => handler.position == "Incident Handler")
        })
        .finally(() => {
            isLoadingHandlers.value = false
        })
}

function onSearchKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
        SearchSubmit()
    }

}

async function Logout() {
    await Auth.Logout()
        .then(() => {
            Router.push('/')

            Storage.removeItem('loginExpire')
                .then(() => {
                    //location.reload()
                })
        })
}

function apiDocsLink() {
    return env.APIHost.replace("/v1", "/docs");
}

</script>
<style scoped>
.alert-leave-active {
    position: absolute;
}

.alert-enter-from,
.alert-leave-to {
    opacity: 0;
}

.alert-move,
.alert-enter-active,
.alert-leave-active {
    transition: all 0.5s ease;
}

.notification-body {
    padding-top: 0px;
}

.notifications-list {
    overflow-y: auto;
    max-width: 300px;
    min-width: 250px;
    max-height: 90vh;
}

.scot-theme-light .notification-time {
    color: rgba(0, 0, 0, .6);
}

.scot-theme-dark .notification-time {
    color: hsla(0, 0%, 100%, .7);
}
</style>