<template>
    <div class="d-flex flex-column" style="height: 100%">
        <div class="container-fluid py-2 d-flex">
            <v-sheet>
                <v-btn variant="outlined"
                       class="mx-4"
                       color="grey-darken-2"
                       @click=goBackToToday>
                    Today
                </v-btn>
                <v-btn variant="text"
                       small
                       @click="prev"
                       color="grey-darken-2">
                    <v-icon small>
                        mdi-chevron-left
                    </v-icon>
                </v-btn>
                <v-btn variant="text"
                       small
                       @click="next"
                       color="grey-darken-2">
                    <v-icon small>
                        mdi-chevron-right
                    </v-icon>
                </v-btn>
            </v-sheet>
            <h2>
                {{ monthNames[currentMonth] }} {{ currentYear }}
            </h2>
            <div class="d-flex flex-grow-1 justify-end mr-4">
                <v-btn color="primary" rounded="lg" elevation="1" variant="outlined"
                       @click="Dialog.ToggleDialog('calendar-add-handler')">
                    <FontAwesomeIcon :icon="faPlus" />&nbsp;Add Handler
                </v-btn>
            </div>

        </div>
        <v-sheet class="flex-grow-1">
            <v-calendar ref="calendar" v-model="focus" :events="calendarData" view-mode="month" :weekdays="weekday"
                        show-adjacent-months v-if="!isLoading" :hide-week-number="true" class="calendar-view"
                        @click:event.stop="(clickEvent, handler) => Dialog.ToggleDialog('calendar-edit-handler', handler)"
                        @click:day="(clickEvent, day) => Dialog.ToggleDialog('calendar-add-handler', day)">
            </v-calendar>
        </v-sheet>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, reactive, useTemplateRef } from 'vue';
import { useGET_APIStore, useDialogStore, useBusStore } from '@/stores'
import { useDatePipe } from '@/pipes/date'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import LoadingCard from '@/components/Loaders/LoadingCard.vue'
import { isAxiosError } from 'axios';

const GET_API = useGET_APIStore()
const DatePipe = useDatePipe()
const Dialog = useDialogStore()
const Bus = useBusStore()
const weekday: any = [0, 1, 2, 3, 4, 5, 6]
const monthNames: Array<string> = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]
const calendar = useTemplateRef('calendar')
let focus = ref(new Date())
let calendarData: any = reactive([])
let isLoading = ref(false)
let currentMonth = ref(0)
let currentYear = ref(1970)


onMounted(() => {
    currentYear.value = focus.value.getFullYear()
    currentMonth.value = focus.value.getMonth()
    GetIRCalendar()
})

watch(
    () => Bus.GetReloadCalendarView,
    () => GetIRCalendar()
)

async function goBackToToday() {
    focus.value = new Date()
    currentYear.value = focus.value.getFullYear()
    currentMonth.value = focus.value.getMonth()
    await GetIRCalendar()
}

async function prev() {
    changeMonth(-1)
    await GetIRCalendar()
}

async function next() {
    changeMonth(1)
    await GetIRCalendar()
}

async function GetIRCalendar() {
    isLoading.value = true
    calendarData = []
    const startDate = new Date(currentYear.value, currentMonth.value, 1)
    const adjustedstartDate = new Date(startDate.valueOf() - (startDate.getDay() * 24 * 60 * 60 * 1000))
    const endDate = new Date(currentYear.value, currentMonth.value + 1, 0)
    const adjustedendDate = new Date(endDate.valueOf() + ((6 - endDate.getDay()) * 24 * 60 * 60 * 1000))
    const startRange = adjustedstartDate.toISOString();
    const endRange = adjustedendDate.toISOString();
    await GET_API.GET_Handlers(startRange, endRange)
        .then((v) => {
            if (!isAxiosError(v)) {
                v.result.forEach((event: any) => {
                    const startDate = DatePipe.ConvertDateFromString(event.start_date)
                    const endDate = DatePipe.ConvertDateFromString(event.end_date)
                    calendarData.push({
                        name: event.username,
                        start: startDate,
                        end: endDate,
                        color: event.position == 'Incident Handler' ? "green" : "blue",
                        allDay: true,
                        data: event
                    })
                });
                isLoading.value = false
            }
        })
}

function changeMonth(delta: number) {
    currentMonth.value = currentMonth.value + delta
    if(currentMonth.value >= 12 || currentMonth.value < 0) {
        currentYear.value += Math.floor(currentMonth.value / 12)
        currentMonth.value = ((currentMonth.value % 12) + 12) % 12 // modulo
    }
    focus.value = new Date(currentYear.value, currentMonth.value, 1)
}
</script>
