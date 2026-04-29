import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useModalStore } from './modal'
export const useFlairStore = defineStore('flair', () => {
    const Modal = useModalStore()
    const isFlairActive: any = ref(true)
    const selectedFlairedEntities: any = ref([])
    const flairModalSelect = ref(-1)
    const GetFlairActive: any = computed(() => isFlairActive.value)
    const GetSelectedFlairedEntities: any = computed(() => selectedFlairedEntities.value)
    const GetFlairModalSelect: any = computed(() => flairModalSelect.value)
    function ToggleFlair() {
        isFlairActive.value = !isFlairActive.value
    }
    function ToggleSelectedFlair(incomingFlair: any) {
        const currentSelectedFlair = selectedFlairedEntities.value
        let existingIdx: number | null = null;
        if (currentSelectedFlair.length > 0) {
            currentSelectedFlair.forEach((flairItem, idx) => {
                if (flairItem.id == incomingFlair.id) {
                    existingIdx = idx;
                }
        });
        }
        if (existingIdx == null) {
            selectedFlairedEntities.value.push(incomingFlair)
            flairModalSelect.value = selectedFlairedEntities.value.length - 1
        }
        else {
            flairModalSelect.value = existingIdx
        }
    }
    function ClearSelectedFlair() {
        selectedFlairedEntities.value = []
    }
    function RemoveFromSelectedEntities(index: any) {
        if (selectedFlairedEntities.value.length > 0) {
            selectedFlairedEntities.value.splice(index, 1);
        } 
        if (selectedFlairedEntities.value.length == 0) {
            Modal.ToggleModal()
        }

    }
    return { RemoveFromSelectedEntities, ToggleFlair, ToggleSelectedFlair, ClearSelectedFlair, GetFlairActive, GetSelectedFlairedEntities, GetFlairModalSelect }
})
