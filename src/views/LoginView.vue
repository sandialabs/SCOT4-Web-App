<template>
    <div class="loading-application-wrapper" v-if="!isLoading">
        <div class="loading-application-image">
            <img class="scot-logo-background-logo" src="../assets/scot-logo.png" />
        </div>
        <v-form @submit.prevent>
            <v-text-field name="Username" label="Username" v-model="username" variant="outlined" autocomplete="off" />
            <v-text-field name="Password" label="Password"  v-model="password" variant="outlined"
                          autocomplete="off" :type="isPasswordVisible ? 'text' : 'password'" :append-inner-icon="isPasswordVisible ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="isPasswordVisible = !isPasswordVisible"

/>

            <v-btn variant="outlined" class="mb-2" rounded="lg" elevation="1" block type="submit" @click="LoginLocal()">
                Login
            </v-btn>
            <span class="text-center d-block">or</span>
            <v-btn variant="outlined" class="my-2" rounded="lg" elevation="1" block @click="LoginSSO()">
                SSO
            </v-btn>
        </v-form>
    </div>
    <LoadingApplication v-else />
</template>
<script setup lang="ts">

import { onMounted, ref } from 'vue';
import { useAuth_APIStore, useAuthStore, useSnackBarStore } from '@/stores';
import { useStorage } from '@/storage/storage'
import { useRouter } from 'vue-router';
import { AuthLocalLogin } from '@/models';
import LoadingApplication from '@/components/Loaders/LoadingApplication.vue';

const AUTH_API = useAuth_APIStore()
const USER_API = useAuthStore()
const Storage = useStorage()
const Router = useRouter()
const SnackBar = useSnackBarStore()
let isLoading = ref(false)
let username = ref(null)
let password = ref(null)
let isPasswordVisible = ref(false)
const emit = defineEmits(['isLoginSuccess'])

onMounted(async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    if (code && state) {
        try {
            isLoading.value = true
            const res = await AUTH_API.Auth_CompleteAzureAD({ code, state })
            const newpath = await Storage.getItem('loginRedirect')
            const currentUrlNoParams = new URL(location)
            currentUrlNoParams.searchParams.delete('code')
            currentUrlNoParams.searchParams.delete('state')
            currentUrlNoParams.searchParams.delete('client_info')
            currentUrlNoParams.searchParams.delete('session_state')
            history.replaceState(history.state, null, currentUrlNoParams)
            if (newpath) {
                await Storage.removeItem('loginRedirect')
                await Router.replace(newpath)
            }
            else {
                await Router.replace('/')
            }
            await SetLoginExpire(ParseExpireDate(res.access_token))
        }
        catch (error) {
            SnackBar.ShowSnackBarError(error)
            emit('isLoginSuccess', false)
            isLoading.value = false
        }
    }
})

function ParseExpireDate(access_token: string) {
    const base64Url = access_token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    const expireDate = new Date(JSON.parse(jsonPayload)['exp'] * 1000)
    return expireDate
}
function LoginLocal() {
    isLoading.value = true
    AUTH_API.Auth_LocalUser(new AuthLocalLogin(username.value, password.value))
        .then((v) => {
            SetLoginExpire(ParseExpireDate(v.access_token))
        })
        .catch((error) => {
            SnackBar.ShowSnackBarError(error)
            emit('isLoginSuccess', false)
            isLoading.value = false
        })
}
function SetLoginExpire(date: any) {
  return Storage.setItem('loginExpire', date)
    .then(() => {
      emit('isLoginSuccess', true)
    })
    .then(() => {
      isLoading.value = false
    })
}
function LoginSSO() {
  AUTH_API.Auth_StartAzureAD()
    .then((v) => {
        let url: string = v.url
        Storage.setItem('loginRedirect', Router.currentRoute.value.path)
        window.location.href = url
    })
}
</script>