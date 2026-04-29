import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
    const dateFrom: Ref<Date | null> = ref(null)
    const dateTo: Ref<Date | null> = ref(null)
    const popularityFrom: Ref<string | null> = ref(null)
    const popularityTo: Ref<string | null> = ref(null)
    const sortApplied = ref([])
    const sortAppliedDesc = ref([])
    const ownerFilter = ref("")
    const showSearchOptions = ref(false)
    const searchTypes = ref([])
    return { dateFrom, dateTo, popularityFrom, popularityTo, sortApplied, sortAppliedDesc, ownerFilter, showSearchOptions, searchTypes }
})
