<template>
    <v-card v-if="!isLoading" elevation="0">
        <v-card-title>Preferences</v-card-title>
        <v-card-text>
            <v-switch class="ms-2" label="Dark Mode" hint="Whether or not to enable the alternate dark color scheme"
                :persistent-hint="true" color="success" v-model="Auth.GetUserPreferences.darkMode"
                @change="UpdateUserPreferences" inset></v-switch>
        </v-card-text>
        <v-card-text>
            <v-switch class="ms-2" label="Mute Notifications" hint="Don't show notifications" :persistent-hint="true"
                color="success" v-model="Auth.GetUserPreferences.muteNotifications" @change="UpdateUserPreferences" inset></v-switch>
        </v-card-text>
        <v-card-text>
            <v-switch class="ms-2" label="Display Popularity" inset
                hint="Enable to display popularity counts and voting buttons in tables and on entries"
                :persistent-hint="true" color="success" v-model="Auth.GetUserPreferences.showPopularity"
                @change="UpdateUserPreferences"></v-switch>
        </v-card-text>
    </v-card>
    <LoadingCard v-else />
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LoadingCard from '../Loaders/LoadingCard.vue';
import { useAuthStore } from '@/stores'

let isLoading: any = ref(true)
const Auth = useAuthStore()

onMounted(() => {
    isLoading.value = false
})

function UpdateUserPreferences() {
    Auth.UpdateUser({ preferences: Auth.GetUserPreferences })
}
</script>
