import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const usePanesStore = defineStore('panes', () => {
    const PanesActive: any = ref(false)
    const GetPanesActive: any = computed(() => PanesActive.value)
    function TogglePanes() {
        PanesActive.value = !PanesActive.value
    }
    function ToggleOpenTwoPanes() {
        PanesActive.value = true
    }
    function ToggleCloseTwoPanes() {
        PanesActive.value = false
    }
    return { ToggleCloseTwoPanes, ToggleOpenTwoPanes, TogglePanes, GetPanesActive }
})
