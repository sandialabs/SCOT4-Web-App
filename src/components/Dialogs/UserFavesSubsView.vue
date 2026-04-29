<template>
    <v-card>
        <v-card-text>
            <v-tabs direction="horizontal" :value-model="tab" selected-class="theme-green-color" align-tabs="center" grow>
                <v-tab value="favorite" @click.stop="GetUserLinks('favorite')">
                    <FontAwesomeIcon :icon="faHeart" class="fs-5" />
                    <span class="ms-2">Favorites</span>
                </v-tab>
                <v-tab value="subscription" @click.stop="GetUserLinks('subscription')">
                    <FontAwesomeIcon :icon="faBell" class="fs-5" />
                    <span class="ms-2">Subscriptions</span>
                </v-tab>
            </v-tabs>
            <v-tabs-window v-model="tab" class="tabs-window-width">
                <v-window-item value="favorite">
                    <v-data-table-server
                        v-model:items-per-page="itemsPerPage"
                        :headers="headers"
                        hide-default-header
                        :items="favoritesData"
                        :items-length="favoritesData.length"
                        :loading="isLoadingFavorites"
                        item-value="name"
                        density="compact"
                        @click:row="Navigate"
                    >
                        <template v-slot:loading>
                            <LoadingSingleLine />
                        </template>
                        <template v-slot:[`item.target_type`]="{item}">
                            <span v-if="item.parent_target_type && item.parent_target_id">
                                {{ `${item.parent_target_type}/${item.target_type}` }}
                            </span>
                            <span v-else>
                                {{ item.target_type }}
                            </span>
                        </template>
                        <template v-slot:[`item.action`]="{item}">
                            <v-btn variant="outlined" class="mx-1" rounded="lg" elevation="1" @click.stop="UnFavorite(item['target_type'], item['target_id'])">
                                <FontAwesomeIcon :icon="faHeartBroken" />&nbsp;Unfavorite
                            </v-btn>
                        </template>
                    </v-data-table-server>
                </v-window-item>
                <v-window-item value="subscription">
                    <v-data-table-server
                        v-model:items-per-page="itemsPerPage"
                        :headers="headers"
                        hide-default-header
                        :items="subscriptionData"
                        :items-length="subscriptionData.length"
                        :loading="isLoadingSubscriptions"
                        item-value="name"
                        density="compact"
                        @click:row="Navigate"
                    >
                        <template v-slot:loading>
                            <LoadingSingleLine />
                        </template>                    
                        <template v-slot:[`item.target_type`]="{item}">
                            <span v-if="item.parent_target_type && item.parent_target_id">
                                {{ `${item.parent_target_type}/${item.target_type}` }}
                            </span>
                            <span v-else>
                                {{ item.target_type }}
                            </span>
                        </template>
                        <template v-slot:[`item.action`]="{item}">
                            <v-btn variant="outlined" class="mx-1" rounded="lg" elevation="1" @click.stop="UnSubscribe(item['target_id'], item['target_type'])">
                                <FontAwesomeIcon :icon="faBellSlash" />&nbsp;Unsubscribe
                            </v-btn>
                        </template>
                    </v-data-table-server>
                </v-window-item>
            </v-tabs-window>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" />&nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGET_APIStore, usePOST_APIStore, useNotificationStore } from '@/stores'
import LoadingSingleLine from '../Loaders/LoadingSingleLine.vue'
import { useDialogStore } from '../../stores/dialog'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, faHeart, faBell, faHeartBroken, faBellSlash } from '@fortawesome/free-solid-svg-icons'
import { useRouter } from 'vue-router'
import { useTextPipe } from '@/pipes'

const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const Dialog = useDialogStore()
const Router = useRouter()
const Notifications = useNotificationStore()
const textPipe = useTextPipe()

let itemsPerPage = ref(10)
const headers = ref([{ title: 'Name', key: 'name' }, { title: 'target_type', key: 'target_type' }, { title: 'Action', key: 'action' }])
let tab: any = ref("favorite")
let isLoadingFavorites = ref(true)
let isLoadingSubscriptions = ref(true)
let favoritesData = ref([] as any[])
let subscriptionData = ref([] as any[])

onMounted(() => {
    GetUserLinks('favorite')
})

async function GetUserLinks(type: string) {
    tab.value = type
    type == "favorite" ? isLoadingFavorites.value = true : isLoadingSubscriptions.value = true
    await API_GET.GET_UserLinks(type)
        .then((v: any) => {
            type == "favorite" ? favoritesData.value = v.result : subscriptionData.value = v.result

        })
        .finally(() => {
            type == "favorite" ? isLoadingFavorites.value = false : isLoadingSubscriptions.value = false
        })
}

async function UnSubscribe(target_id: any, target_type: any) {
    await Notifications.POST_unSubscribe({ target_id: target_id, target_type: target_type })
        .then(() => {
            GetUserLinks('subscription')
        })
}
async function UnFavorite(target_type, target_id) {
    await API_POST.POST_Favorite("/" + target_type, target_id)
        .then(() => {
            GetUserLinks('favorite')
        })
}

function Navigate(event: any, row: any) {
    let route = ""
    if (row.item.parent_target_type && row.item.parent_target_id) {
        route = `${textPipe.toIRElementPath(row.item.parent_target_type)}/${row.item.parent_target_id}/${row.item.target_id}`
    }
    else {
        route = `${textPipe.toIRElementPath(row.item.target_type)}/${row.item.target_id}`
    }
    Router.push(route)
    Dialog.ToggleDialog()
}
</script>
