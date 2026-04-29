<template>
    <v-card v-if="!isLoading" title="History" max-width="800px">
        <v-tabs v-model="tab" class="ms-2 flex-shrink-0">
            <v-tab value="view">View History</v-tab>
            <v-tab value="edit">Edit History</v-tab>
        </v-tabs>
        <v-card-text>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="view">
                    <div v-html="readAuditDisplay(historyDataView)"></div>
                </v-tabs-window-item>
                <v-tabs-window-item value="edit">
                    <div v-for="item in historyDataEdit" :key="item.id"
                        v-html="auditEntryDisplay(item)">
                    </div>
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn @click="Dialog.ToggleDialog()" color="danger" rounded="lg" elevation="1" variant="outlined">
                <FontAwesomeIcon :icon="faTimes" /> &nbsp;Close
            </v-btn>
        </v-card-actions>
    </v-card>
    <LoadingCard v-else/>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useDatePipe } from '../../pipes/date'
import { useDialogStore, useGET_APIStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faTimes, } from '@fortawesome/free-solid-svg-icons'
import { IRElementAPIPaths } from '@/types/irelement'
import LoadingCard from '../Loaders/LoadingCard.vue'

const API = useGET_APIStore()
const DatePipe = useDatePipe()
const Dialog = useDialogStore()

let historyData = ref([])
let historyDataEdit = ref([])
let historyDataView = ref([])
let isLoading = ref(true)
let tab = ref("view")
let incomingProps = defineProps(['params'])

onMounted(() => {
    GetHistoryData(incomingProps.params.targetType, incomingProps.params.targetId)
})

onUnmounted(() => {
    historyData.value = []
})

async function GetHistoryData(targetType, targetId) {
    await API.GET_IRElementHistory(IRElementAPIPaths[targetType], targetId)
        .then((v) => {
            if (v) {
                historyData.value = v
                historyData.value.forEach((item: any) => {
                    if (item.what == 'read') {
                        historyDataView.value.push(item)
                    } else {
                        historyDataEdit.value.push(item)
                    }
                })
                if (historyDataEdit.value.length > 0) {
                    historyDataEdit.value.sort((a, b) => a.when_date < b.when_date ? 1 : -1)
                }
            } else {
                historyData.value = []
            }
        })
        .finally(() => {
            isLoading.value = false
        })
}

function auditEntryDisplay(audit: any) {
    if (audit.what == 'read') {
        return `${DatePipe.ConvertDate(audit.when_date)} <b>${audit.username}</b> from IP ${audit.src_ip}`
    }
    if (audit.what == 'update') {
        let finalDisplay = `${DatePipe.ConvertDate(audit.when_date)} `
        if (audit.thing_type == 'alert' || audit.thing_type == 'entry') {
            if (Object.keys(audit.audit_data).length == 1 && audit.audit_data.status) {
                if (audit.audit_data.status == 'closed') {
                    finalDisplay += `<b>${audit.username}</b> closed ${audit.thing_type} ${audit.thing_id}`
                }
                if (audit.audit_data.status == 'promoted') {
                    finalDisplay += `<b>${audit.username}</b> promoted ${audit.thing_type} ${audit.thing_id}`
                }
                if (audit.audit_data.status == 'open') {
                    finalDisplay += `<b>${audit.username}</b> reopened ${audit.thing_type} ${audit.thing_id}`
                }
            }
            else {
                finalDisplay += `<b>${audit.username}</b> updated ${audit.thing_type} ${audit.thing_id}`
            }
        }
        else if (audit.audit_data) {
            for (const key in audit.audit_data) {
                finalDisplay += `<b>${audit.username}</b> changed ${key} to ${JSON.stringify(audit.audit_data[key])}`
            }
        }
        else {
            finalDisplay = ''
        }
        return finalDisplay
    }
    if (audit.what == 'create') {
        return `${DatePipe.ConvertDate(audit.when_date)} <b>${audit.username}</b> created ${audit.thing_type} ${audit.thing_id}`
    }
    if (audit.what == 'delete') {
        return `${DatePipe.ConvertDate(audit.when_date)} <b>${audit.username}</b> deleted ${audit.thing_type} ${audit.thing_id}`
    }
    return 'NO FORMAT'
}

function readAuditDisplay(audits: Array<any>) {
    const byUser = audits.reduce((userDict: any, audit: any) => {
        if (audit.username && audit.username in userDict) {
            userDict[audit.username].push(audit)
        }
        else if (audit.username) {
            userDict[audit.username] = [audit]
        }
        return userDict
    }, {})
    var result = '<table>'
    for (const user in byUser) {
        const earliestAudit = byUser[user].at(0)
        const latestAudit = byUser[user].at(-1)
        result += `<tr><td class="pr-2"><b>${user}</b></td><td>Earliest: ${DatePipe.ConvertDate(earliestAudit.when_date)} from IP ${earliestAudit.src_ip}</td></tr>`
        result += `<tr><td></td><td>Latest: ${DatePipe.ConvertDate(latestAudit.when_date)} from IP ${latestAudit.src_ip}</td></tr>`
    }
    result += '</table>'
    return result
}
</script>