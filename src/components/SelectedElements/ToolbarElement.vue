<template>
    <div class="d-flex justify-content-evenly flex-grow-0" style="padding-left: 2px; padding-right: 2px;">
        <v-btn size="small" rounded="0" variant="outlined" :color="isSubscribe ? 'primary' : ''"
            v-tooltip:bottom="'Subscribe'" v-if="IRElementQuickButtons[currentRouteName]?.includes('subscribe')"
            @click="Subscribe(isSubscribe)">
            <FontAwesomeIcon :icon="faBell" />
        </v-btn>

        <v-btn size="small" rounded="0" variant="outlined" @click="Favorite()" v-tooltip:bottom="'Favorite'"
            v-if="IRElementQuickButtons[currentRouteName]?.includes('favorite')">
            <FontAwesomeIcon :icon="faHeart" :color="isFavorite ? 'red' : ''" />
        </v-btn>
        <v-btn size="small" class="flex-fill" rounded="0" variant="outlined" color="success"
            v-if="IRElementQuickButtons[currentRouteName]?.includes('add_entry')" @click="AddEntry()">
            <FontAwesomeIcon :icon="faPlusCircle" />&nbsp; Add Entry
        </v-btn>
        <v-menu
            v-if="IRElementQuickButtons[currentRouteName]?.includes('popularity') && Auth.GetUserPreferences.showPopularity"
            :close-on-content-click="false">
            <template v-slot:activator="{ props }">
                <v-btn v-bind="props" size="small" class="flex-fill" rounded="0" variant="outlined" color="blue">
                    <FontAwesomeIcon :icon="faPoll" />&nbsp; Popularity &nbsp;
                    <FontAwesomeIcon :icon="faChevronDown" />
                </v-btn>
            </template>
            <v-list>
                <v-list-item subtitle="View Entries within range" :disabled="Popularity.min == Popularity.max">
                    <v-range-slider class="mt-8 mr-5 ml-5" step="1" density="compact" thumb-label="always"
                        :min="Popularity.min" :max="Popularity.max" v-model="Popularity.value" hide-details strict />
                </v-list-item>
                <v-list-item title="Reset" @click="Popularity.value = [Popularity.min, Popularity.max]"
                    :disabled="Popularity.min == Popularity.max" />
            </v-list>
        </v-menu>
        <v-btn size="small" class="flex-fill" rounded="0" variant="outlined" @click="Flair.ToggleFlair()"
            v-if="IRElementQuickButtons[currentRouteName]?.includes('flair')">
            <FontAwesomeIcon :icon="faEye" v-if="!Flair.GetFlairActive" />
            <FontAwesomeIcon :icon="faEyeSlash" v-if="Flair.GetFlairActive" />
            <span v-if="!Flair.GetFlairActive"> &nbsp;Show Flair</span>
            <span v-else> &nbsp;Hide Flair</span>
        </v-btn>
        <v-btn size="small" class="flex-fill" rounded="0" variant="outlined"
            @click="Dialog.ToggleDialog('permissions', { targetType: currentRouteName, targetId: currentRouteId, entryIds: entryIds })"
            v-if="IRElementQuickButtons[currentRouteName]?.includes('permissions')">
            <FontAwesomeIcon :icon="faUsers" />&nbsp; Permissions
        </v-btn>
        <v-btn size="small" class="flex-fill" rounded="0" variant="outlined"
            @click="Dialog.ToggleDialog('history', { targetType: currentRouteName, targetId: currentRouteId })"
            v-if="IRElementQuickButtons[currentRouteName]?.includes('history')">
            <FontAwesomeIcon :icon="faClockFour" />&nbsp; History
        </v-btn>
        <v-menu v-if="IRElementQuickButtons[currentRouteName]?.includes('export')">
            <template v-slot:activator="{ props }">
                <v-btn size="small" class="flex-fill" rounded="0" variant="outlined" v-bind="props">
                    <FontAwesomeIcon :icon="faDownload" />&nbsp; Export &nbsp;
                    <FontAwesomeIcon :icon="faChevronDown" />
                </v-btn>
            </template>
            <v-list>
                <v-list-item title="as HTML" @click="Export('html')" />
                <v-list-item title="as DOCX" @click="Export('docx')" />
                <v-list-item title="as PDF" @click="Export('pdf')" />
                <v-list-item title="as Markdown" @click="Export('md')" />
            </v-list>
        </v-menu>
        <v-btn size="small" class="flex-fill" rounded="0" variant="outlined" color="red" @click="OpenAll()"
            v-if="IRElementQuickButtons[currentRouteName]?.includes('open')">
            <FontAwesomeIcon :icon="faFolderOpen" />&nbsp; Open All
        </v-btn>
        <v-btn size="small" class="flex-fill" rounded="0" variant="outlined" color="green" @click="CloseAll()"
            v-if="IRElementQuickButtons[currentRouteName]?.includes('close')">
            <FontAwesomeIcon :icon="faFolderClosed" /> &nbsp; Close All
        </v-btn>
        <v-btn size="small" class="flex-fill" rounded="0" variant="outlined" color="primary" @click="Reflair()"
            v-if="IRElementQuickButtons[currentRouteName]?.includes('reflair')">
            <FontAwesomeIcon :icon="faBoltLightning" />&nbsp; Reflair
        </v-btn>
        <v-menu v-if="IRElementQuickButtons[currentRouteName]?.includes('promote')" class="flex-fill">
            <template v-slot:activator="{ props }">
                <v-btn class="flex-fill" size="small" rounded="0" variant="outlined" color="warning" v-bind="props">
                    <FontAwesomeIcon :icon="faBullhorn" />&nbsp; Promote &nbsp;
                    <FontAwesomeIcon :icon="faChevronDown" />
                </v-btn>
            </template>
            <v-list>
                <v-list-item title="Promote" @click="Promote(false)" />
                <v-list-item title="Promote and Copy Tags" @click="Promote(true)" />
                <v-list-item title="Promote to Existing"
                             @click="Dialog.ToggleDialog('promote-to-existing', { ir_element: currentRouteName, id: selectedElement.id, tags: selectedElement?.tags?.map((t: any) => t.name), sources: selectedElement?.sources?.map((t: any) => t.name) })" />
            </v-list>
        </v-menu>
        <v-btn size="small" class="flex-fill" rounded="0" variant="outlined" color="red" @click="DeleteElement()"
            v-if="IRElementQuickButtons[currentRouteName]?.includes('delete')">
            <FontAwesomeIcon :icon="faTrashCan" />&nbsp; Delete
        </v-btn>
    </div>

    <div class="d-flex justify-content-start mt-1" v-if="isExtraToolbarActive"
        style="padding-left: 2px; padding-right: 2px;">
        <v-btn size="small" rounded="0" variant="outlined" color="red" @click="StatusAlert('open')">
            <FontAwesomeIcon :icon="faFolderOpen" />&nbsp; Open
        </v-btn>
        <v-btn size="small" rounded="0" variant="outlined" color="green" @click="StatusAlert('closed')">
            <FontAwesomeIcon :icon="faFolderClosed" /> &nbsp; Close
        </v-btn>
        <v-menu>
            <template v-slot:activator="{ props }">
                <v-btn size="small" rounded="0" variant="outlined" color="warning" v-bind="props">
                    <FontAwesomeIcon :icon="faBullhorn" />&nbsp; Promote &nbsp;
                    <FontAwesomeIcon :icon="faChevronDown" />
                </v-btn>
            </template>
            <v-list>
                <v-list-item title="Promote" @click="Promote(false)" />
                <v-list-item title="Promote and Copy Tags" @click="Promote(true)" />
                <v-list-item title="Promote to Existing"
                             @click="Dialog.ToggleDialog('promote-to-existing', { ir_element: currentRouteName, id: alertPaneSelectedIds, tags: selectedElement?.sources?.map((t: any) => t.name), sources: selectedElement?.tags?.map((t: any) => t.name) })" />
            </v-list>
        </v-menu>
        <v-btn size="small" rounded="0" variant="outlined" color="red" @click="DeleteAlert()">
            <FontAwesomeIcon :icon="faTrashCan" />&nbsp; Delete
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn size="small" rounded="0" variant="outlined" color="warning" @click="clearSelectedAlerts">
            <FontAwesomeIcon :icon="faTimes" />&nbsp; Deselect Alerts
        </v-btn>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronDown, faPoll, faHeart, faEye, faBullhorn, faTimes, faEyeSlash, faUsers, faClockFour, faDownload, faFolderOpen, faFolderClosed, faBoltLightning, faTrashCan, faPlusCircle, faBell, faUnderline } from '@fortawesome/free-solid-svg-icons'
import { usePopularityStore, useFlairStore, useDialogStore, useGET_APIStore, usePUT_APIStore, useDELETE_APIStore, useSnackBarStore, usePOST_APIStore, useBusStore, useAuthStore, useNotificationStore } from '@/stores'
import { IRElementQuickButtons, IRElementStatus, IRElementAPIPaths, IRElementAPIPathsNoSlash, IRElementTypeSingular } from '@/types/irelement'
import { ModelElementPromote, NewEntry } from '@/models'
import { useTextPipe } from '@/pipes'

const Text = useTextPipe()
const Flair = useFlairStore()
const Auth = useAuthStore()
const Dialog = useDialogStore()
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()
const API_PUT = usePUT_APIStore()
const API_DELETE = useDELETE_APIStore()
const SnackBar = useSnackBarStore()
const Bus = useBusStore()
const Notification = useNotificationStore()
const Popularity = usePopularityStore()

const entryIds = ref([] as number[])
let currentRouteName = ref("")
let currentRouteId = ref()
let isExtraToolBarActive = ref(false)
let isFavorite = ref(false)
let isSubscribe = ref(false)
let selectedElement: any = reactive({})
let alertPaneSelectedIds = ref([] as number[])
let incomingProps = defineProps(['targetType', 'targetId', 'isExtraToolbarActive', 'isFavorited', 'isSubscribed', 'selectedItem', 'alertSelectedIds', 'entryIds'])
const emit = defineEmits(['RefreshElement', 'ToggleExtraToolBar', 'CreateEntry'])

onMounted(() => {
    currentRouteName.value = incomingProps.targetType
    currentRouteId.value = incomingProps.targetId
    isExtraToolBarActive.value = incomingProps.isExtraToolbarActive
    isFavorite.value = incomingProps.isFavorited
    isSubscribe.value = incomingProps.isSubscribed
    selectedElement = incomingProps.selectedItem
    alertPaneSelectedIds.value = incomingProps.alertSelectedIds
    entryIds.value = incomingProps.entryIds
})

watch(
    () => incomingProps.alertSelectedIds,
    (newValue) => {
        alertPaneSelectedIds.value = newValue;
    }
);

watch(
    () => incomingProps.entryIds,
    (newValue) => {
        entryIds.value = newValue;
    }
);

function mergeAlertsWithAlertgroup(alertData: any, alertgroup: any) {
    if (!Array.isArray(alertData)) {
        alertData = [alertData]
    }
    for (const alert of alertData) {
        const alertDataEntry = alertgroup.full_alert_data.find(a => a.id == alert.id)
        if (alertDataEntry) {
            alertDataEntry.status = alert.status
            Object.assign(alertDataEntry, alert.data)
        }
        const alertDataFlairedEntry = alertgroup.full_alert_data_flaired.find(a => a.id == alert.id)
        if (alertDataFlairedEntry) {
            alertDataFlairedEntry.status = alert.status
            Object.assign(alertDataFlairedEntry, alert.data_flaired)
        }
    }
    alertgroup.open_count = alertgroup.full_alert_data.filter(a => a.status == "open").length
    alertgroup.closed_count = alertgroup.full_alert_data.filter(a => a.status == "closed").length
    alertgroup.promoted_count = alertgroup.full_alert_data.filter(a => a.status == "promoted").length
    return alertgroup
}

async function Reflair() {
    await API_GET.GET_ReflairElementById(IRElementAPIPaths[currentRouteName.value], currentRouteId.value)
        .then((v) => {
            v ? SnackBar.ToggleSnackbar("Reflair Submitted") : SnackBar.ToggleSnackbar("Reflair Error")
        })
}

async function CloseAll() {
    const allOpenAlerts = selectedElement?.full_alert_data?.filter((alert: any) => alert.status == IRElementStatus.Open)?.map((alert: any) => alert.id)
    if (allOpenAlerts && allOpenAlerts.length > 0) {
        const alerts = await API_PUT.UpdateManyElementsByIds("/alert", allOpenAlerts, { status: IRElementStatus.Closed })
        const alertgroup = mergeAlertsWithAlertgroup(alerts, selectedElement)
        emit('RefreshElement', alertgroup)
    }
    else {
        await API_PUT.UpdateElementById(IRElementAPIPaths[currentRouteName.value], currentRouteId.value, { status: IRElementStatus.Closed }).then((v: any) => {
            v ? emit('RefreshElement', v) : null
        })
    }
}

async function OpenAll() {
    const allClosedAlerts = selectedElement?.full_alert_data?.filter((alert: any) => alert.status == IRElementStatus.Closed)?.map((alert: any) => alert.id)
    if (allClosedAlerts && allClosedAlerts.length > 0) {
        const alerts = await API_PUT.UpdateManyElementsByIds("/alert", allClosedAlerts, { status: IRElementStatus.Open })
        const alertgroup = mergeAlertsWithAlertgroup(alerts, selectedElement)
        emit('RefreshElement', alertgroup)
    }
    else {
        await API_PUT.UpdateElementById(IRElementAPIPaths[currentRouteName.value], currentRouteId.value, { status: IRElementStatus.Open }).then((v: any) => {
            v ? emit('RefreshElement', v) : null
        })
    }
}

async function Favorite() {
    const res = await API_POST.POST_Favorite(IRElementAPIPaths[currentRouteName.value], currentRouteId.value)
    if (res) {
        isFavorite.value = !isFavorite.value
    }
}

async function Subscribe(subscribed: boolean) {
    if (subscribed) {
        await Notification.POST_unSubscribe({ target_type: IRElementTypeSingular[currentRouteName.value], target_id: parseInt(currentRouteId.value) })
            .then(() => {
                isSubscribe.value = !isSubscribe.value
            })
    }
    else {
        await Notification.POST_Subscribe({ target_type: IRElementTypeSingular[currentRouteName.value], target_id: parseInt(currentRouteId.value) })
            .then(() => {
                isSubscribe.value = !isSubscribe.value
            })
    }
}

async function DeleteElement() {
    if (confirm("Are you sure you want to delete " + IRElementAPIPathsNoSlash[currentRouteName.value] + " " + currentRouteId.value + "?")) {
        await API_DELETE.DeleteElementById(IRElementAPIPathsNoSlash[currentRouteName.value], currentRouteId.value)
            .then((v: any) => {
                v ? emit('RefreshElement', null) : null
                Bus.ToggleReloadQueueView()
            })
    }
}

async function AddEntry() {
    const dummyEntry = new NewEntry("entry", { html: "" }, Auth.GetUser.username, null, incomingProps.targetId, IRElementTypeSingular[incomingProps.targetType])
    dummyEntry.id = -1
    emit('CreateEntry', dummyEntry)
    /*await API_POST.POST_CreateIRElement("/entry", { entry: new NewEntry("entry", { html: NewEntryHTML }, Auth.GetUser.username, null, parseInt(currentRouteId.value), IRElementAPIPathsNoSlash[currentRouteName.value]) })
        .then((v: any) => {
            emit('CreateEntry', v)
        })*/
}

async function Promote(addTagsSources: boolean) {
    let source = "undefined"
    let sourceIds = [selectedElement.id]
    if (currentRouteName.value) {
        source = currentRouteName.value.includes("alertgroup") ? "alert" : IRElementAPIPathsNoSlash[currentRouteName.value]
        sourceIds = currentRouteName.value.includes("alertgroup") ? alertPaneSelectedIds.value : [selectedElement.id]
    }

    const promotionTargetMap: Record<string, string> = {
        "alert": "event",
        "event": "incident",
        "events": "incident",
        "dispatch": "intel",
        "dispatches": "intel",
        "vuln_feed": "vuln_track",
        "vulnerability/feed": "vuln_track"
    }

    await API_POST.POST_PromoteElements(new ModelElementPromote(
        promotionTargetMap[source],
        undefined,
        sourceIds.map(element => {
            return { type: source, id: element }
        }),
        addTagsSources ? selectedElement?.sources?.map((t: any) => t.name) : undefined,
        addTagsSources ? selectedElement?.tags?.map((t: any) => t.name) : undefined
    )).then((v: any) => {
        // Just re-retrieve the whole *original* object to see what changed, the api return is the new object that was promoted to
        v ? emit('RefreshElement', false) : null
    })
}

async function StatusAlert(status: string) {
    if (alertPaneSelectedIds.value.length == 1) {
        API_PUT.UpdateElementById('/alert', alertPaneSelectedIds.value[0], { status: status })
            .then((v: any) => {
                const alertgroup = mergeAlertsWithAlertgroup(v, selectedElement)
                alertgroup ? emit('RefreshElement', alertgroup) : null
            })
    }
    else if (alertPaneSelectedIds.value.length > 1) {
        API_PUT.UpdateManyElementsByIds("/alert", alertPaneSelectedIds.value, { status: status })
            .then((v: any) => {
                const alertgroup = mergeAlertsWithAlertgroup(v, selectedElement)
                alertgroup ? emit('RefreshElement', alertgroup) : null
            })
    }
}

async function DeleteAlert() {
    const result = confirm("Are you sure you want to delete the selected alerts?");
    if (result) {
        if (alertPaneSelectedIds.value.length == 1) {
            API_DELETE.DeleteElementById('alert', alertPaneSelectedIds.value[0])
                .then((v: any) => {
                    const alertIdx = selectedElement?.full_alert_data?.findIndex(a => a.id == v?.id)
                    if (alertIdx) {
                        selectedElement.full_alert_data.splice(alertIdx, 1)
                    }
                    const alertIdxFlaired = selectedElement?.full_alert_data_flaired?.findIndex(a => a.id == v?.id)
                    if (alertIdx) {
                        selectedElement.full_alert_data_flaired.splice(alertIdxFlaired, 1)
                    }
                })
        }
        else if (alertPaneSelectedIds.value.length > 1) {
            API_DELETE.DeleteManyElementsByIds("alert", alertPaneSelectedIds.value)
                .then((v: any) => {
                    for (const alert of v) {
                        const alertIdx = selectedElement?.full_alert_data?.findIndex(a => a.id == alert?.id)
                        if (alertIdx) {
                            selectedElement.full_alert_data.splice(alertIdx, 1)
                        }
                        const alertIdxFlaired = selectedElement?.full_alert_data_flaired?.findIndex(a => a.id == alert?.id)
                        if (alertIdx) {
                            selectedElement.full_alert_data_flaired.splice(alertIdxFlaired, 1)
                        }
                    }
                })
        }
    }
}

function clearSelectedAlerts() {
    alertPaneSelectedIds.value.splice(0)
    emit('ToggleExtraToolBar', false)
}

async function Export(format: string) {
    await API_GET.GET_ExportIRElementData(currentRouteName.value, selectedElement.id, format)
}
</script>