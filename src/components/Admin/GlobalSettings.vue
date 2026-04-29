<template>
    <v-card flat title="Global Settings" style="height: 100%; overflow-y: auto">
        <v-card-text class="pb-0">
            <span v-for="setting in enabledSettings" :key="setting">
                <v-switch v-if="typeof(settingsStore.GetSettings[setting]) === 'boolean'"
                          v-model="settingsStore.GetSettings[setting]"
                          :label="settingPrettyNames[setting]"
                          :hint="settingDescriptions[setting]"
                          persistent-hint
                          @update:model-value="settingsStore.UpdateSettings(setting, $event)" />
                <v-text-field v-else
                              class="mt-4"
                              v-model="settingsStore.GetSettings[setting]"
                              :label="settingPrettyNames[setting]"
                              :hint="settingDescriptions[setting]"
                              persistent-hint
                              @update:model-value="settingsStore.UpdateSettings(setting, $event)" />
            </span>
        </v-card-text>
        <GlobalAnnouncements style="max-width: 700px;" />
    </v-card>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import GlobalAnnouncements from '@/components/Admin/GlobalAnnouncements.vue'

const settingsStore = useSettingsStore()
const enabledSettings = ["site_name", "environment_level", "it_contact", "time_zone"]
const settingPrettyNames = {
    "site_name": "Site Name",
    "environment_level": "Environment Level",
    "it_contact": "IT Contact",
    "time_zone": "Time Zone",
}
const settingDescriptions = {
    "site_name": "A descriptive name for this SCOT instance",
    "environment_level": "The sensitivity level of data in this SCOT instance",
    "it_contact": "An email address for the IT contact for this SCOT instance",
    "time_zone": "The primary time zone of this SCOT instance (such as US/Mountain)"
}
</script>