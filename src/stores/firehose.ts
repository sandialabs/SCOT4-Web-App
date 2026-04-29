import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { environment as env } from '@/environments/environment'
import { useSnackBarStore } from './snackbar';
import { useAuthStore, useNotificationStore } from '@/stores';
import { IRElementType } from '@/types/irelement';
import { useBusStore } from './bus';

export const useFirehoseStore = defineStore('firehose', () => {
    const SnackBar = useSnackBarStore()
    const Auth = useAuthStore()
    const Bus = useBusStore()
    const notificationStore = useNotificationStore()
    let firehose: EventSource = undefined

    const selectedElement: any = reactive({})
    const selectedElementType = ref<IRElementType>()
    const elementList = ref([] as any[])
    const elementListFilterDict = reactive<any>({})
    const entryIds = ref([] as number[])
    const firehoseReconnectTask = ref(null)
    async function connect(reconnect: boolean = false) {
        if (!firehose) {
            firehose = new EventSource(`${env.APIHost}/firehose/`, { withCredentials: true } );
        }
    
        firehose.onmessage = async (e: any) => {
            await useFirehoseStore().handleEvent(JSON.parse(e.data))
        }
        firehose.onerror = async () => {
            try {
                if (firehose != undefined) {
                    firehose.close()
                    firehose = undefined
                }
            }
            catch (e) {
                SnackBar.ShowSnackBarError(e)
            }

        }
        // If we're reconnecting, also retrieve item list and selected element again after we connect
        if (reconnect) {
            firehose.onopen = async () => {
                console.log("Reconnected to firehose")
                Bus.ToggleReloadQueueView()
                if (selectedElementType.value) {
                    Bus.ToggleReloadSelectedView()
                }
                notificationStore.GET_Notifications()
            }
        }
    }
    function setFirehoseReconnect(reconnect: boolean) {
        if (reconnect && !firehoseReconnectTask.value) {
            // Every 10 seconds, reconnect to the firehose if we aren't connected to it
            firehoseReconnectTask.value = setInterval(() => {
                if (firehose == undefined) {
                    connect(true)
                }
            }, 10000)
        }
        else if (!reconnect && firehoseReconnectTask.value) {
            clearInterval(firehoseReconnectTask.value)
            firehoseReconnectTask.value = null
        }
    }

    async function handleEvent(event: any) {
        // short random delay to ease instantaneous load on the api
        await new Promise(r => setTimeout(r, Math.random() * 1000))
        try {
            if (event.what == "create" || event.what == "delete" || event.what == "update") {
                // pull notification for this user
                if (event.element_type == "notification" && event.username == Auth.GetUser.username) {
                    if (event.what == "update" && event?.data?.ack) {
                        notificationStore.setNotificationsAcked([event.element_id])
                    }
                    else {
                        notificationStore.GET_Notifications()
                    }
                }
                // if element list type, re-retrieve the element list (except for item updates and tasks)
                /*else {
                    if (event.what != "update") {
                        Bus.ToggleReloadSelectedView()
                    }
                    if (event.what == "update" && elementList.value.includes(event.element_id) || event.element_id == selectedElement?.id) {
                        Bus.ToggleReloadQueueView()
                    }
                }*/
            }
        }
        catch (e) {
            SnackBar.ToggleSnackbar(e)
        }
    }

    return { connect, setFirehoseReconnect, handleEvent, selectedElement, selectedElementType, entryIds }
})