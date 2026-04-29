import { defineStore } from 'pinia'
import axiosDefault, { type AxiosInstance } from 'axios';
import { inject } from 'vue';
import { environment as env } from '@/environments/environment'
import { AuthLocalLogin } from '@/models'

export const useAuth_APIStore = defineStore('auth_api', () => {
    const axios = inject<AxiosInstance>('axios', axiosDefault)

    function Auth_LocalUser(authData: AuthLocalLogin): Promise<any> {
        const url = env.APIHost + "/login/access-token"

        return axios
            .post(url,
                authData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            })
            .then(function (response) {
                return response.data
            })
    }
    function Auth_StartAzureAD(): Promise<any> {
        return axios
            .get(env.APIHost + '/login/oauth-url?auth_type=aad')
            .then(function (response) {
                return response.data
            })
    }
    function Auth_CompleteAzureAD(params): Promise<any> {
        return axios
            .get(env.APIHost + '/login/aad-callback',
                {
                    params: params, withCredentials: true, headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            .then(function (response) {
                return response.data
            })
    }

    function Logout(): Promise<any> {
        const url = env.APIHost + '/logout'

        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
    }
    return {
        Auth_LocalUser,
        Auth_StartAzureAD,
        Auth_CompleteAzureAD,
        Logout
    }
})
