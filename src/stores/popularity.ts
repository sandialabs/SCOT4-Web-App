import { defineStore } from 'pinia'
import { ref } from 'vue'
export const usePopularityStore = defineStore('popularity', () => {    
    const min = ref(0)
    const max = ref(0)
    const value = ref([min.value, max.value])

    function set_range(count: number) {
        if (count > max.value) {
            max.value = count
        }
        if (count < min.value) {
            min.value = count
        }
        value.value = [min.value, max.value]
    }

    function reset() {
        min.value = 0
        max.value = 0
        value.value = [min.value, max.value]
    }

    return { min, max, value, set_range, reset }
})
