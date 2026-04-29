<template>
    <v-card v-if="!isLoading" title="Edit Handler Entry">
        <v-form v-model="valid">
            <v-card-text>
                <v-date-input label="Start Date input" variant="outlined" :model-value="calendarEntry.start_date"
                    @update:modelValue="BindValue($event, 'start_date')" required :rules="validate"></v-date-input>
                <v-date-input label="End Date input" variant="outlined" :model-value="calendarEntry.end_date" required
                    @update:modelValue="BindValue($event, 'end_date')" :rules="validate"></v-date-input>
                <v-combobox label="User" :items="usernames" variant="outlined" :model-value="calendarEntry.username"
                    @update:modelValue="BindValue($event, 'username')" required :rules="validate"></v-combobox>
                <v-combobox label="Position" :items="positionChoices" variant="outlined"
                    @update:modelValue="BindValue($event, 'position')" :model-value="calendarEntry.position" required
                    :rules="validate"></v-combobox>
            </v-card-text>
        </v-form>
        <v-card-actions>
            <v-spacer/>
            <v-btn v-if="valid" @click="UpdateCalendarEntry()" color="success" rounded="lg" elevation="1"
                variant="outlined">
                <FontAwesomeIcon :icon="faSave" /> &nbsp;Save
            </v-btn>
            <v-btn @click="DeleteCalendarEntry()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTrashCan" /> &nbsp;Delete
            </v-btn>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" /> &nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
    <LoadingCard v-if="isLoading" />
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import LoadingCard from '../Loaders/LoadingCard.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave, faTimes, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { useDialogStore, useGET_APIStore, useBusStore, usePUT_APIStore, useDELETE_APIStore } from '@/stores';

const Dialog = useDialogStore()
const Bus = useBusStore()
const API_GET = useGET_APIStore()
const API_PUT = usePUT_APIStore()
const API_DELETE = useDELETE_APIStore()

let isLoading = ref(true)
let positionChoices: Array<string> = ["Incident Handler", "Hunter"]
let usernames = reactive([])
let valid = ref(false)
let validate = [
    (value: any) => {
        if (value) return true

        return false
    },
]
let incomingProps = defineProps(['params'])
let calendarEntry: any = reactive({})
let calendarEntryId: any = ref(null)

onMounted(() => {
    calendarEntry = incomingProps.params.event.data
    calendarEntryId = incomingProps.params.event.data.id
    GetUsernames()
})

function BindValue(e: any, field: any) {
    // Set time to end of day if the end date
    if (field == 'end_date') {
        e.setHours(23)
        e.setMinutes(59)
        e.setSeconds(59)
    }
    calendarEntry[field] = e
}

async function DeleteCalendarEntry() {
    isLoading.value = true
    await API_DELETE.DeleteElementById("handler", calendarEntryId)
        .then(() => {
            Bus.ToggleReloadCalendarView()
            Dialog.ToggleDialog()
        })
}

async function UpdateCalendarEntry() {
    isLoading.value = true
    await API_PUT.UpdateElementById("/handler", calendarEntryId, calendarEntry)
        .then(() => {
            Bus.ToggleReloadCalendarView()
            Dialog.ToggleDialog()
        })
}

async function GetUsernames() {
    await API_GET.GET_Usernames()
        .then((v) => {
            usernames = v.result
        })
        .finally(() => {
            isLoading.value = false
        })
}
</script>
