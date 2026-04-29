<template>
    <v-container fluid class="flex-column-noscroll pa-0">
        <div>
            <v-toolbar flat title="Administration Settings"/>
        </div>
        <v-row no-gutters class="d-flex" style="min-height: 0">
            <v-col class="flex-shrink-1 flex-grow-0 flex-column-noscroll">
                <v-tabs direction="vertical" v-model="tab" selected-class="theme-green-color">
                    <v-tab value="global-settings" @click.stop="router.push('/admin/global-settings')">
                        <FontAwesomeIcon :icon="faCog" class="fs-3" />
                        <span class="ms-2">Global Settings</span>
                    </v-tab>
                    <v-tab value="users-groups" @click.stop="router.push('/admin/users-groups')">
                        <FontAwesomeIcon :icon="faUsers" class="fs-3" />
                        <span class="ms-2">Users & Groups</span>
                    </v-tab>
                    <v-tab value="authentication" @click.stop='router.push("/admin/authentication")'>
                        <FontAwesomeIcon :icon="faLock" class="fs-3" />
                        <span class="ms-2">Authentication</span>
                    </v-tab>
                    <v-tab value="audit-logs" @click.stop='router.push("/admin/audit-logs")'>
                        <FontAwesomeIcon :icon="faClipboard" class="fs-3" />
                        <span class="ms-2">Audit Logs</span>
                    </v-tab>
                    <v-tab value="storage" @click.stop='router.push("/admin/storage")'>
                        <FontAwesomeIcon :icon="faDatabase" class="fs-3" />
                        <span class="ms-2">Object Storage</span>
                    </v-tab>
                    <v-tab value="permissions" @click.stop='router.push("/admin/permissions")'>
                        <FontAwesomeIcon :icon="faTasks" class="fs-3" />
                        <span class="ms-2">Default Permissions</span>
                    </v-tab>
                </v-tabs>
            </v-col>
            <v-col class="flex-column-noscroll" cols="*">
                <v-tabs-window v-model="tab" class="tabs-window-width">
                    <v-window-item value="global-settings">
                        <GlobalSettings />
                    </v-window-item>
                    <v-window-item value="users-groups">
                        <UsersGroups />
                    </v-window-item>
                    <v-window-item value="authentication">
                        <AuthenticationMethods />
                    </v-window-item>
                    <v-window-item value="audit-logs">
                        <UserLogs />
                    </v-window-item>
                    <v-window-item value="storage">
                        <StorageProvider />
                    </v-window-item>
                    <v-window-item value="permissions">
                        <DefaultPermissions />
                    </v-window-item>
                </v-tabs-window>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCog, faUsers, faClipboard, faDatabase, faTasks, faLock } from '@fortawesome/free-solid-svg-icons'
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from 'vue-router'
import GlobalSettings from '@/components/Admin/GlobalSettings.vue';
import UsersGroups from '@/components/Admin/UsersGroups.vue';
import UserLogs from '@/components/Settings/AuditLogs.vue';
import StorageProvider from '@/components/Admin/StorageProvider.vue';
import AuthenticationMethods from '@/components/Admin/AuthenticationMethods.vue';
import DefaultPermissions from '@/components/Admin/DefaultPermissions.vue';

const tab: any = ref("global-settings")
const route = useRoute()
const router = useRouter()

onMounted(() => {
    route?.name && route.name != "Admin" ? tab.value = route.name : tab.value = "global-settings"
})
</script>
<style scoped>
    .flex-column-noscroll {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .scroll-child {
        max-height: 100%;
        overflow-y: auto;
    }

    :deep(.v-window > div), .v-window-item {
        height: 100%;
    }
</style>