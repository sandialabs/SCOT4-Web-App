import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { environment as env } from '@/environments/environment'
import axiosDefault, { Axios } from 'axios';
import { inject } from 'vue';
import { useSnackBarStore } from './snackbar';
import { useSnakePipe } from '@/pipes';

export const useNotificationStore = defineStore('notifications', () => {
    const SnackBar = useSnackBarStore()
    const snakePipe = useSnakePipe()
    const axios = inject<Axios>('axios', axiosDefault)

    const items = ref([] as any[])
    const mute = ref(false)
    const acknowledging = ref(false)
    const count = ref(0)
    const badge = ref(false)
    const remaining = ref(0)
    const getAll = ref(false)
    const loading = ref(false)
    const menu = ref(0)
    const alertRender = ref(0)
    const alertUpdateTask = ref()

    const notifications = computed(() => items.value.sort((a, b) => a.created > b.created ? -1 : 1))

    async function GET_Notifications(includeAcknowledged: boolean | undefined = undefined, skip: number | undefined = undefined, limit: number | undefined = undefined): Promise<any> {
        return axios
            .get(`${env.APIHost}/notification/`, {params: {include_acked: includeAcknowledged, skip: skip, limit: limit}})
            .then(function (response) {
                for (const notification of response.data.result) {
                    const notificationIndex = items.value.findIndex((el: any) => el.id == notification.id)
                    if (notificationIndex != -1) {
                        Object.assign(items.value[notificationIndex], notification)
                    }
                    else {
                        items.value.push(notification)
                    }
                }
                remaining.value = response.data.totalCount - response.data.resultCount - (skip || 0)
                if (remaining.value < 0) {
                    remaining.value = 0
                }
                count.value = items.value.filter((a: any) => a.ack == false).length
                badge.value = count.value > 0 && acknowledging.value == false && !mute.value
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_Subscribe(subscribeData: any): Promise<any> {
        return axios
            .post(`${env.APIHost}/notification/subscribe`, subscribeData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_unSubscribe(unsubscribeData: any): Promise<any> {
        return axios
            .post(`${env.APIHost}/notification/unsubscribe`, unsubscribeData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_AcknowledgeNotification(ids: Array<number>) {
        return axios
            .post(`${env.APIHost}/notification/ack`, {notification_ids: ids})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_BroadcastNotification(message: string, priority: string, expires: Date) {
        return axios
            .post(`${env.APIHost}/notification/broadcast`, {message: message, priority: priority, expires: expires})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function onOpenClose(value: boolean) {
        if (!value && !acknowledging.value) {
            const notificationIds = items.value.filter((a: any) => !a.ack).map((a: any) => a.id)
            if (notificationIds.length > 0) {
                acknowledging.value = true
                const ids = await POST_AcknowledgeNotification(notificationIds)
                setNotificationsAcked(ids)
                acknowledging.value = false
            }
        }
        else if (value) {
            menu.value++
        }
    }

    function pluralized(target: string) {
        if (target == "entity"){
            return "entities"
        }
        else if (target == "dispatch"){
            return "dispatches"
        }
        else if (target == "entry") {
            return "entries"
        }
        else{
            return target + "s"
        }
    }

    function link(notification: any) {
        if (notification?.ref_id == "broadcast") {
            return null
        }
        else if (notification?.ref_id) {
            const parts = notification.ref_id.split(" ")
            const type = pluralized(parts[0])
            const id = parts[1]
            if (parts.length == 2) {
                return "/" + type + "/" + id
            }
            // Entries
            else if (parts.length == 4) {
                const entry_id = parts[3]
                return "/" + type + "/" + id + "/" + entry_id
            }
            else {
                return null
            }
        }
        return null
    }

    function headerText(notification: any){
        if (notification?.ref_id == "broadcast"){
            return "Announcement"
        }
        else if (notification?.ref_id) {
            const parts = notification.ref_id.split(" ")
            return snakePipe.convertFromSnakeCase(parts[0]) + " " + parts[1]
        }
        return ""
    }

    async function loadMore(isIntersecting: boolean) {
        if (isIntersecting && remaining.value > 0) {
            loading.value = true
            await GET_Notifications(getAll.value, items.value.length)
            loading.value = false
        }
    }

    async function showAll() {
        getAll.value = true
        GET_Notifications(getAll.value)
    }

    function setNotificationsAcked(ids: Array<number>) {
        for (const notification of items.value) {
            if (ids.includes(notification.id)) {
                notification.ack = true
            }
        }
        count.value = items.value.filter((a: any) => a.ack == false).length
        badge.value = count.value > 0 && acknowledging.value == false && !mute.value
    }

    function getAlert() {
        if (mute.value) {
            return []
        }
        const alerts = items.value.filter(
            (a: any) => a.priority != "low"
            && !a.ack
            && (a.priority == "high" || Date.now() - new Date(a.created).getTime() < 15000)
            && alertRender.value > -1 // Forces a re-render whenever this is incremented
        ).sort((n1, n2) => new Date(n1.created).getTime() - new Date(n2.created).getTime())

        if (alerts && alerts.length > 0) {
            if (!alertUpdateTask.value) {
                // As long as there was one alert, re-render the alert menu every 5 seconds
                alertUpdateTask.value = setInterval(() => {
                    alertRender.value++
                }, 5000)
            }
        }
        else if (alertUpdateTask.value) {
            clearInterval(alertUpdateTask.value)
            alertUpdateTask.value = null
        }
        return alerts
    }

    return {
        GET_Notifications,
        POST_Subscribe,
        POST_unSubscribe,
        POST_AcknowledgeNotification,
        POST_BroadcastNotification,
        getAlert,
        headerText,
        link,
        showAll,
        loadMore,
        onOpenClose,
        setNotificationsAcked,
        notifications,
        count,
        badge,
        acknowledging,
        mute,
        getAll,
        loading
    }
})