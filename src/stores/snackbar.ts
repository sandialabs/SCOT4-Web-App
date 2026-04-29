import axios from 'axios'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSnackBarStore = defineStore('snackbar', () => {
    const snackbarActive: any = ref(false)
    const snackbarMessage: any = ref(null)
    const GetSnackbarActive: any = computed(() => snackbarActive.value)
    const GetSnackbarMessage: any = computed(() => snackbarMessage.value)
    function ToggleSnackbar(message: string | null = null) {
        snackbarActive.value = !snackbarActive.value
        snackbarMessage.value = message
    }
    function ShowSnackBarError(error: any) {
        if (axios.isAxiosError(error) && error.response) {
            if (error.response.data.detail) {
                let detail = error.response.data.detail
                if (Array.isArray(detail)) {
                    detail = detail[0]
                }
                if (detail.msg) {
                    snackbarMessage.value = "Error: " + detail.msg + ": " + detail.loc
                }
                else {
                    snackbarMessage.value = "Error: " + detail
                }
            }
            else {
                snackbarMessage.value = error.response.data
            }
            snackbarActive.value = true
        }
        else if (axios.isAxiosError(error)) {
            snackbarMessage.value = "Error connecting to server: " + error.message
            snackbarActive.value = true
        }
        else {
            console.error(error)
        }
    }
    return { GetSnackbarActive, GetSnackbarMessage, ToggleSnackbar, ShowSnackBarError }
})
