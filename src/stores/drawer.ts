import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDrawerStore = defineStore('drawer', () => {
    const isDrawerActive: any = ref(false)
    const GetDrawerActive: any = computed(() => isDrawerActive.value)
    function ToggleDrawer() {
        isDrawerActive.value = !isDrawerActive.value
    }
    return { GetDrawerActive, ToggleDrawer }
})
