<template>
  <v-app v-if="!isLoading && !isShowingLogin">
    <HeaderView />
    <v-main>
      <RouterView />
      <DialogView />
      <DrawerView />
    </v-main>
    <ModalView v-if="Modal.GetModalActive" />
  </v-app>
  <LoadingApplication v-if="isLoading && !isShowingLogin" />
  <LoginView v-if="isShowingLogin" @isLoginSuccess="ToggleLoginSuccess" />
  <SnackBarView />
</template>

<script setup lang="ts">
import { inject, onMounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import { RouterView, useRoute, type RouteLocation } from 'vue-router'
import { storeToRefs } from 'pinia'
import type { AxiosInstance } from 'axios'
import { useStorage } from '@/storage/storage'
import HeaderView from './views/HeaderView.vue'
import DialogView from './views/DialogView.vue'
import DrawerView from './views/DrawerView.vue'
import SnackBarView from './views/SnackBarView.vue'
import ModalView from './views/ModalView.vue'
import { useAuthStore, useModalStore, useNotificationStore, useFirehoseStore } from '@/stores'
import LoadingApplication from './components/Loaders/LoadingApplication.vue'
import LoginView from './views/LoginView.vue'
import { useSettingsStore } from './stores/settings'
import { IRElementType } from './types/irelement'
import { default_title } from './constants'

let isLoading = ref(true)
let isShowingLogin = ref(false)
const Storage = useStorage()
const Route = useRoute()
const Modal = useModalStore()
const USER_API = useAuthStore()
const SETTINGS_API = useSettingsStore()
const notificationStore = useNotificationStore()
const firehose = useFirehoseStore()
const theme = useTheme()
const axios = inject<AxiosInstance>('axios')

onMounted(() => {
    axios.interceptors.response.use(response => response,
        error => {
            if (error.status === 401 && !error.config.url.endsWith("/logout") && !isShowingLogin.value) {
                firehose.setFirehoseReconnect(false)
                USER_API.Logout().then(() => {
                    isShowingLogin.value = true
                })
            }
            return Promise.reject(error)
        }
    )
    ValidateCurrentAuthToken()
})

async function Login() {
  await USER_API.CallGetUser()
    .then(async (v) => {
      if (!v){
        isShowingLogin.value = true
      }
      else{
        SetTheme(v.preferences?.darkMode)
        await SETTINGS_API.CallGetSettings()
        notificationStore.mute = v.preferences?.muteNotifications
        firehose.connect(false)
        firehose.setFirehoseReconnect(true)
      }
    }).finally(() => {
       isLoading.value = false
    })
}

const { GetIsAuthenticated, GetUserPreferences } = storeToRefs(USER_API)
watch(GetIsAuthenticated, (newVal) => {
    isShowingLogin.value = !newVal
})
watch(() => GetUserPreferences.value?.darkMode, (newVal) => {
    SetTheme(newVal)
})

function ToggleLoginSuccess(v: boolean) {
  v ? ValidateCurrentAuthToken() : null
}

async function ValidateCurrentAuthToken(): Promise<any> {
  isShowingLogin.value = false
  return Storage.getItem("loginExpire")
    .then(function (value) {
      if (value < new Date() || value == null) {
        isShowingLogin.value = true
        isLoading.value = false
      } else {
        Login()
      }
    }).catch(function (err) {
      isShowingLogin.value = true
      isLoading.value = false
    });
}

function SetTheme(darkMode = false) {
  if (darkMode) {
    theme.change('DarkTheme')
    document.body.classList.add('scot-theme-dark')
    document.body.classList.remove('scot-theme-light')
  } else {
    theme.change('LightTheme')
    document.body.classList.add('scot-theme-light')
    document.body.classList.remove('scot-theme-dark')
  }
}

// Change document title when we change routes
watch(Route, (newRoute: RouteLocation) => {
    const elementTypeShortLetters: any = {
        [IRElementType.Alertgroup]: 'A',
        [IRElementType.Event]: 'E',
        [IRElementType.Intel]: 'I',
        [IRElementType.Product]: 'P',
        [IRElementType.Incident]: 'N',
        [IRElementType.Dispatch]: 'D',
        [IRElementType.Guide]: 'G',
        [IRElementType.Signature]: 'S',
        [IRElementType.ThreatModelItem]: 'M',
        [IRElementType.Entity]: 'EN',
        [IRElementType.Entry]: 'T',
        [IRElementType.Feed]: 'F',
        [IRElementType.Pivot]: 'P',
        [IRElementType.EntityClass]: 'EC',
        [IRElementType.VulnFeed]: 'VF',
        [IRElementType.VulnTrack]: 'VT',
    }
    if (newRoute.name in elementTypeShortLetters && newRoute.params.id) {
        document.title = elementTypeShortLetters[newRoute.name] + newRoute.params.id.toString()
    }
    else {
        document.title = default_title
    }
})
</script>
