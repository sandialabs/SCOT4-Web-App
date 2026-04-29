import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useModalStore = defineStore('modal', () => {
    const RefreshModalEntity: any = ref(false)
    const ModalActive: any = ref(false)
    const GetModalActive: any = computed(() => ModalActive.value)
    const GetRefreshModalEntity: any = computed(() => RefreshModalEntity.value)
    function ToggleModal() {
        ModalActive.value = !ModalActive.value
    }
    function ToggleRefreshModalEntity() {
        RefreshModalEntity.value = !RefreshModalEntity.value
    }
    return { ToggleModal, ToggleRefreshModalEntity, GetModalActive, GetRefreshModalEntity }
})
