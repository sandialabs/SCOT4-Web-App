<template>
    <v-card flat title="Send Global Announcement" subtitle="Announcements will be sent to all users as a notification">
        <v-card-text>
            <v-text-field v-model="announcementText" label="Announcement Text" />
            <v-row>
                <v-col>
                    <v-select :items="priorityChoices" label="Priority" v-model="priority" />
                </v-col>
                <v-col cols="7">
                    <v-row no-gutters>
                        <v-col class="pr-3">
                            <v-text-field v-model="expireAmount" label="Expiration" @input="onExpireInput" :error-messages="errorText" :error="errorText != null" hint="The amount of time that the announcement will be shown to any user who logs in that hasn't seen it yet (default 12 hours)" />
                        </v-col>
                        <v-col>
                            <v-select :items="timespanChoices" v-model="expireUnit" />
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-btn class="ml-2" variant="elevated" color="success" @click="submitAnnouncement" :loading="submitLoading" text="Submit Announcement">
                <template v-slot:loader v-if="submitComplete">
                    <span class="custom-loader">
                        <v-icon>mdi-check</v-icon>
                    </span>
                </template>
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores';
import { ref } from 'vue';
import { PriorityEnum } from '@/types/irelement';

const notificationStore = useNotificationStore()
const priorityChoices = ref(Object.keys(PriorityEnum))
const timespanChoices = ref(["Seconds", "Minutes", "Hours"])
const announcementText = ref("")
const priority = ref("Medium")
const expireAmount = ref("")
const errorText = ref(null)
const expireUnit = ref("Minutes")
const submitLoading = ref(false)
const submitComplete = ref(false)

function onExpireInput() {
    errorText.value = null
}

async function submitAnnouncement() {
    const now = new Date()
    const rawInput = Number.parseInt(expireAmount.value)
    if (Number.isNaN(rawInput)) {
        errorText.value = "You must enter a number"
        return
    }
    submitLoading.value = true
    let expireDate = undefined
    if (expireUnit.value == "Seconds") {
        expireDate = new Date(now.getTime() + rawInput * 1000)
    }
    else if (expireUnit.value == "Minutes") {
        expireDate = new Date(now.getTime() + rawInput * 60000)
    }
    else {
        expireDate = new Date(now.getTime() + rawInput * 3600000)
    }

    const result = await notificationStore.POST_BroadcastNotification(announcementText.value, priority.value.toLocaleLowerCase(), expireDate.toISOString())
    if (result) {
        submitComplete.value = true
        await new Promise(r => setTimeout(r, 2000))
        submitComplete.value = false
    }
    submitLoading.value = false

}
</script>