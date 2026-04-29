<template>
    <v-card v-if="!isLoading" title="Add Handler">
        <v-form v-model="valid">
            <v-card-text>
                <v-date-input label="Start Date input" variant="outlined" v-model="calendarEntry.start_date"
                    @update:modelValue="BindValue($event, 'start_date')" required :rules="validate"></v-date-input>
                <v-date-input label="End Date input" variant="outlined" v-model="calendarEntry.end_date" required
                    @update:modelValue="BindValue($event, 'end_date')" :rules="validate" validate-on="input"></v-date-input>
                <v-combobox label="User" :items="usernames" variant="outlined" v-model="calendarEntry.username"
                    @update:modelValue="BindValue($event, 'username')" required :rules="validate"></v-combobox>
                <v-combobox label="Position" :items="positionChoices" variant="outlined"
                    @update:modelValue="BindValue($event, 'position')" v-model="calendarEntry.position" required
                    :rules="validate"></v-combobox>
            </v-card-text>
        </v-form>
        <v-card-actions>
            <v-spacer/>
            <v-btn :disabled="!valid" @click="SaveCalendarEntry()" color="success" rounded="lg" elevation="1"
                variant="outlined">
                <FontAwesomeIcon :icon="faSave" /> &nbsp;Save
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
import { faSave, faTimes, } from '@fortawesome/free-solid-svg-icons'
import { useDialogStore, useGET_APIStore, usePOST_APIStore, useBusStore } from '@/stores';

const Dialog = useDialogStore()
const Bus = useBusStore()
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()

let incomingProps = defineProps(['params'])
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
let calendarEntry = ref({})

onMounted(() => {
    const incomingDay = incomingProps.params?.date ? new Date(incomingProps.params.date + "T00:00:00") : null
    calendarEntry.value = {
        start_date: incomingDay,
        end_date: null,
        username: null,
        position: 'Incident Handler'
    }
    GetUsernames()
})

function BindValue(e: Date, field: any) {
    // Set time to end of day if the end date
    if (field == 'end_date') {
        e.setHours(23)
        e.setMinutes(59)
        e.setSeconds(59)
    }
    calendarEntry.value[field] = e
}

async function SaveCalendarEntry() {
    isLoading.value = true
    await API_POST.POST_NewHandler(calendarEntry.value)
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
