import { ref, computed, reactive } from 'vue'
import { defineStore } from 'pinia'
import { environment as env } from '@/environments/environment'
import axiosDefault, { Axios } from 'axios';
import { inject } from 'vue';
import { useSnackBarStore } from './snackbar';

export const useSettingsStore = defineStore('settings', () => {
    const SnackBar = useSnackBarStore()
    const axios = inject<Axios>('axios', axiosDefault)

    const Settings = reactive({})
    const SettingsLoaded = ref(false)
    const GetSettings: any = computed(() => Settings)

    async function CallGetSettings() {
        const url = env.APIHost + "/settings/"
        return axios
            .get(url)
            .then(function (response) {
                Object.assign(Settings, response.data)
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                SettingsLoaded.value = true
            })
            .finally(function () {
                SettingsLoaded.value = true
            })
    }

    async function UpdateSettings(setting: string, value: any) {
        Settings[setting] = value
        const url = env.APIHost + "/settings/"
        return axios
            .put(url, Settings)
            .then(function (response) {
                Object.assign(Settings, response.data)
            })
            .catch(function (error) {
                SnackBar.ToggleSnackbar(error.response.data.detail)
                SettingsLoaded.value = true
            })
            .finally(function () {
                SettingsLoaded.value = true
            })
    }

    return {GetSettings, SettingsLoaded, CallGetSettings, UpdateSettings}
})
