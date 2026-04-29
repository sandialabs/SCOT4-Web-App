import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useToastStore = defineStore('toast', () => {
    const isToastActive: any = ref(false)
    const GetToastActive: any = computed(() => isToastActive.value)
    function ToggleToast() {
        isToastActive.value = !isToastActive.value
    }
    return { ToggleToast, GetToastActive }
})
