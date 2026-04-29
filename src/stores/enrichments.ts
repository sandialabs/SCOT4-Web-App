import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'

export const useEnrichmentStore = defineStore('enrichment', () => {

    const enrichmentData: any = reactive([])
    const currentEnrichmentData: any = reactive({})

    function SetCurrentEnrichmentData (currentIndex: any) {
        const currentData = ref({});
        Object.keys(enrichmentData).forEach((enrichmentName) => {
            if (enrichmentData[enrichmentName]?.length > 0) {
                const index = currentIndex[enrichmentName] || 0; // Default to index 0
                currentData[enrichmentName] = enrichmentData[enrichmentName][index];
            }
        });
        Object.assign(currentEnrichmentData, currentData);
    }
    
    return { enrichmentData, currentEnrichmentData, SetCurrentEnrichmentData }
})
