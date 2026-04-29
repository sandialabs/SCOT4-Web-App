import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBusStore = defineStore('bus', () => {
    const reloadQueueView: any = ref(false)
    const GetReloadQueueView: any = computed(() => reloadQueueView.value)
    function ToggleReloadQueueView() {
        reloadQueueView.value = !reloadQueueView.value
    }

    const reloadSelectedView: any = ref(false)
    const reloadSelectedViewShowLoading: any = ref(true)
    const GetReloadSelectedView: any = computed(() => reloadSelectedView.value)
    const GetReloadSelectedViewShowLoading: any = computed(() => reloadSelectedViewShowLoading.value)
    function ToggleReloadSelectedView(reload = true) {
        reloadSelectedView.value = !reloadSelectedView.value
        reloadSelectedViewShowLoading.value = reload
    }

    const reloadCalendarView: any = ref(false)
    const GetReloadCalendarView: any = computed(() => reloadCalendarView.value)
    function ToggleReloadCalendarView() {
        reloadCalendarView.value = !reloadCalendarView.value
    }

    return { GetReloadCalendarView, ToggleReloadCalendarView, GetReloadQueueView, ToggleReloadQueueView, GetReloadSelectedView, GetReloadSelectedViewShowLoading, ToggleReloadSelectedView }
})
