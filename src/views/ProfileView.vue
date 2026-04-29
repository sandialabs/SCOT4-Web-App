<template>
    <v-container fluid>
        <v-row>
            <v-toolbar flat>
                <v-toolbar-title>User Profile & Settings</v-toolbar-title>
            </v-toolbar>
        </v-row>
        <v-row class="d-flex">
            <v-col class="flex-shrink-1 flex-grow-0">
                <v-tabs direction="vertical" v-model="tab" selected-class="theme-green-color">
                    <v-tab value="one" @click.stop='router.push("/profile/user-profile")'>
                        <FontAwesomeIcon :icon="faUser" class="fs-3" />
                        <span class="ms-2">User Profile</span>
                    </v-tab>
                    <v-tab value="two" @click.stop='router.push("/profile/user-preferences")'>
                        <FontAwesomeIcon :icon="faGear" class="fs-3" />
                        <span class="ms-2">User Preferences</span>
                    </v-tab>
                    <v-tab value="three" @click.stop='router.push("/profile/api-keys")'>
                        <FontAwesomeIcon :icon="faKey" class="fs-3" />
                        <span class="ms-2">API Keys</span>
                    </v-tab>
                    <v-tab value="four" @click.stop='router.push("/profile/user-logs")'>
                        <FontAwesomeIcon :icon="faClipboard" class="fs-3" />
                        <span class="ms-2">User Logs</span>
                    </v-tab>
                    <v-tab value="five" @click.stop='router.push("/profile/user-permissions")'>
                        <FontAwesomeIcon :icon="faTasks" class="fs-3" />
                        <span class="ms-2">User Permissions</span>
                    </v-tab>
                </v-tabs>
            </v-col>
            <v-col>
                <v-tabs-window v-model="tab" class="tabs-window-width">
                    <v-window-item value="one">
                        <UserProfile />
                    </v-window-item>
                    <v-window-item value="two">
                        <UserPreferences />
                    </v-window-item>
                    <v-window-item value="three">
                        <APIKeys />
                    </v-window-item>
                    <v-window-item value="four">
                        <UserLogs />
                    </v-window-item>
                    <v-window-item value="five">
                        <DefaultPermissions permission-type="user" />
                    </v-window-item>
                </v-tabs-window>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faGear, faKey, faClipboard, faTasks } from '@fortawesome/free-solid-svg-icons'
import APIKeys from '@/components/Settings/APIKeys.vue';
import UserProfile from '@/components/Settings/UserProfile.vue';
import UserPreferences from '@/components/Settings/UserPreferences.vue';
import UserLogs from '@/components/Settings/AuditLogs.vue';
import DefaultPermissions from '@/components/Admin/DefaultPermissions.vue';
import { useRoute, useRouter } from 'vue-router'

let tab: any = ref("one")
const route = useRoute()
const router = useRouter()

onMounted(() => {
    route?.name && route.name != "UserProfile" ? tab.value = route.name : tab.value = "one"
})
</script>
