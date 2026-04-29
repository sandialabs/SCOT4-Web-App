<template>
    <v-navigation-drawer :width="309" location="right" temporary :model-value="Drawer.GetDrawerActive" @update:modelValue="Drawer.ToggleDrawer">
        <v-list>
            <v-list-item class="mt-2">
                <template v-slot:prepend>
                    <span class="fs-4 mt-1">Quick Settings</span>
                </template>
                <template v-slot:append>
                    <v-btn color="danger" rounded="lg" elevation="1" variant="outlined" @click="Drawer.ToggleDrawer">
                        <FontAwesomeIcon :icon="faClose" />
                    </v-btn>
                </template>
            </v-list-item>
        </v-list>
        <v-divider></v-divider>

        <div class="ms-2">Display</div>
        <v-list>
            <v-list-item>
                <template v-slot:prepend>
                    <v-switch class="ms-2"color="green-darken-2" v-model="Auth.GetUserPreferences.darkMode"
                        @change="UpdateUserPreferences" inset></v-switch>
                </template>
                <template v-slot:append>
                    <div>
                        <v-list-item-title>Dark Mode</v-list-item-title>
                        <v-list-item-subtitle>Change Application Theme</v-list-item-subtitle>
                    </div>
                </template>
            </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <div class="ms-2">Interactions</div>
        <v-list>
            <v-list-item>
                <template v-slot:prepend>
                    <v-switch class="ms-2" color="green-darken-2" v-model="Auth.GetUserPreferences.muteNotifications"
                        @change="UpdateUserPreferences" inset></v-switch>
                </template>
                <template v-slot:append>
                    <div>
                        <v-list-item-title>Mute Notifications</v-list-item-title>
                        <v-list-item-subtitle>Don't show notifications</v-list-item-subtitle>
                    </div>
                </template>
            </v-list-item>
            <v-list-item>
                <template v-slot:prepend>
                    <v-switch class="ms-2" color="green-darken-2" v-model="Auth.GetUserPreferences.showPopularity"
                        @change="UpdateUserPreferences" inset></v-switch>
                </template>
                <template v-slot:append>
                    <div>
                        <v-list-item-title>Display Popularity</v-list-item-title>
                        <v-list-item-subtitle>Show buttons and totals</v-list-item-subtitle>
                    </div>
                </template>
            </v-list-item>
        </v-list>
        <v-divider></v-divider>
        <v-list>
            <v-list-item class="m-auto text-end">
                <v-btn color="secondary" rounded="lg" elevation="1" variant="outlined" @click="NavigateToProfile">
                    Full Settings
                </v-btn>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>

</template>

<script setup lang="ts">
import { useDrawerStore, useAuthStore } from '@/stores'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faClose } from '@fortawesome/free-solid-svg-icons'

const Drawer = useDrawerStore()
const Router = useRouter()
const Auth = useAuthStore()

function NavigateToProfile() {
    Router.push('/profile')
    Drawer.ToggleDrawer()
}

function UpdateUserPreferences() {
    Auth.UpdateUser({ preferences: Auth.GetUserPreferences })
}
</script>