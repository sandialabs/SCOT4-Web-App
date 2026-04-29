import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGET_APIStore } from '@/stores'; // Import the API store

export const useTimelineStore = defineStore('timeline', () => {
    const API_GET = useGET_APIStore(); // API store for making API calls

    // Reactive state
    const entityAppearances = ref([]); // Explicitly type as an array of Appearance objects
    const descriptionMapping = ref({}); // Explicitly type as an object with string keys and number values

    // Fetch appearances for a given entity ID
    async function fetchEntityAppearances(entityId: string) {
        entityAppearances.value = []; // Clear previous data
        descriptionMapping.value = {}; // Clear previous mapping

        await API_GET.GET_FlairAppearancesById(entityId)
            .then((v) => {
                for (const property in v) {
                    if (v[property].length > 0) {
                        v[property].forEach((element) => {
                            entityAppearances.value.push(element);
                        });
                    }
                }

                // Build description mapping
                entityAppearances.value.forEach((appearance, index) => {
                    const typeKey = `${appearance.type}, ${appearance.status}`;
                    if (!descriptionMapping.value[typeKey]) {
                        descriptionMapping.value[typeKey] = index + 1;
                    }
                });
            })
            .catch((error) => {
                console.error('Error fetching entity appearances:', error);
            });
    }

    return { entityAppearances, descriptionMapping, fetchEntityAppearances };
});