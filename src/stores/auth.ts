import { ref, computed, type ComputedRef } from 'vue'
import { defineStore } from 'pinia'
import { environment as env } from '@/environments/environment'
import axiosDefault, { Axios } from 'axios';
import { inject } from 'vue';
import { useSnackBarStore } from './snackbar';
import { useAuth_APIStore } from './_auth_api'

export const useAuthStore = defineStore('auth', () => {
    const SnackBar = useSnackBarStore()
    const AUTH_API = useAuth_APIStore()
    const axios = inject<Axios>('axios', axiosDefault)

    const User = ref(null)
    const UserLoaded = ref(false)
    const isAuthenticated = ref(false)
    const GetUser: ComputedRef<any> = computed(() => User.value)
    const GetUserPreferences: ComputedRef<any> = computed(() => User.value?.preferences ? User.value.preferences : {})
    const GetUserLoaded: ComputedRef<boolean> = computed(() => UserLoaded.value)
    const GetIsAuthenticated: ComputedRef<boolean> = computed(() => isAuthenticated.value)

    async function UpdateUser(data: any) {
        return axios
            .put(`${env.APIHost}/users/me`, data)
            .then(function (response) {
                User.value = response.data
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                UserLoaded.value = true
            })
            .finally(function () {
                UserLoaded.value = true
                isAuthenticated.value = true
            })
    }

    async function CallGetUser(): Promise<any> {
        const url = env.APIHost + "/users/whoami"
        return axios
            .get(url)
            .then(function (response) {
                User.value = response.data
                isAuthenticated.value = true
                return response.data
            })
            .catch(function (error) {
                if (error.status == 401) {
                    isAuthenticated.value = false
                }
                else {
                    SnackBar.ShowSnackBarError(error)
                }
                return null
            })
            .finally(function () {
                UserLoaded.value = true
            })
    }

    async function Logout() {
        isAuthenticated.value = false
        return await AUTH_API.Logout()
    }
    
    return { GetUser, GetUserLoaded, GetIsAuthenticated, GetUserPreferences, UpdateUser, CallGetUser, Logout }

})
