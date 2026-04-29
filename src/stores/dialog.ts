import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDialogStore = defineStore('dialog', () => {
    const dialogActive: any = ref(false)
    const dialogType: any = ref(null)
    const dialogParams: any = ref(null)
    const GetDialogActive: any = computed(() => dialogActive.value)
    const GetDialogType: any = computed(() => dialogType.value)
    const GetDialogParams: any = computed(() => dialogParams.value)
    function ToggleDialog(type: any = null, params: any = null) {
        dialogActive.value = !dialogActive.value
        dialogType.value = type
        dialogParams.value = params
    }
    return { GetDialogActive, GetDialogType, GetDialogParams, ToggleDialog }
})
