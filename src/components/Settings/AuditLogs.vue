<template>
    <v-card v-if="!isLoading" flat title="Audit Logs" class="full-height d-flex flex-column">
        <v-card-text class="d-flex flex-column" style="min-height: 0px">
            <v-row>
                <v-col>
                    <v-select density="compact" v-model="users" :disabled="!Auth.GetUser.is_superuser" :items="usernames" label="Username" @update:model-value="getAudits" multiple clearable/>
                </v-col>
                <v-col>
                    <v-date-input density="compact" v-model="dateRange" label="Date Range" max-width="290px" min-width="auto" multiple="range" clearable  @update:model-value="getAudits" placeholder="YYYY-MM-DD HH:MM"/>
                </v-col>
                <v-col>
                    <v-select density="compact" v-model="logType" label="Log Type" :items="auditTypeChoices" @update:model-value="getAudits" multiple clearable/>
                </v-col>
                <v-col>
                    <v-select density="compact" v-model="thingType" :items="objectTypeChoices" label="Object Type" @update:model-value="getAudits" clearable/>
                </v-col>
                <v-col>
                    <v-text-field density="compact" v-model="thingId" label="Object ID" @update:model-value="getAudits"/>
                </v-col>
            </v-row>
            <v-row style="min-height: 0px">
                <v-data-table-server
                    :headers="auditColumns"
                    :items="auditEntries"
                    select-strategy="single"
                    :items-per-page="itemsPerPage"
                    :sort-by="sortBy"
                    width="100%"
                    density="compact"
                    show-expand
                    expand-on-click
                    :loading="loadingAudits"
                    :items-length="total"
                    @update:options="auditSearch"
                    fixed-header
                    class="full-height"
                />
            </v-row>
        </v-card-text>
    </v-card>
    <LoadingCard v-else />
</template>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import LoadingCard from '../Loaders/LoadingCard.vue';
import { useAuthStore, useGET_APIStore } from '@/stores'
import { IRElementType, IRElementTypeSingular } from '@/types/irelement';

let isLoading: any = ref(true)

const Auth = useAuthStore()
const apiGET = useGET_APIStore()
const users = ref([] as string[])
const usernames = ref([] as string[])
const dateRange = ref([] as Date[])
const logType = ref([] as string[])
const thingType = ref<IRElementType>()
const thingId = ref<number>()

const auditTypeChoices = ref(["create", "read", "update", "delete", "login", "undelete"])
const objectTypeChoices = ref([] as string[])
const auditColumns = [
    { title: "ID", key: "id", width: "7em" },
    { title: "Time", key: "when_date", width: "1%"},
    { title: "Username", key: "username", width: "10em" },
    { title: "Action", key: "what", width: "14em" },
    { title: "Object Type", key: "thing_type", width: "10em" },
    { title: "Object ID", key: "thing_id", width: "9em" },
    { title: "Source IP", key: "src_ip", width: "11em" },
    { title: "User Agent", key: "user_agent"},
]
const auditEntries = ref([] as any[])
const page = ref(1)
const total = ref(0)
const itemsPerPage = ref(25)
const sortBy = ref([] as any[])
const loadingAudits = ref(false)

onMounted(async () => {
    objectTypeChoices.value = Object.values(IRElementType)
    const data = await apiGET.GET_Usernames()
    if (data) {
        usernames.value = data.result
    }
    if (!Auth.GetUser.is_superuser) {
        users.value = [Auth.GetUser.username]
    }

    isLoading.value = false
})

async function getAudits() {
    //do the search with the current options
    auditSearch({page: page.value, itemsPerPage: itemsPerPage.value, sortBy: sortBy.value,})
}

async function auditSearch(options: any) {
    loadingAudits.value = true
    let order = options.sortBy.length == 1 ? options.sortBy[0].order : "asc"
    order = order == "asc" ? "+" : "-"
    let skip = (options.page - 1) * options.itemsPerPage;
    let limit = options.itemsPerPage
    let sort = options.sortBy.length == 1 ? `${order}${options.sortBy[0].key}` : "id"

    let when_date: string = undefined
    if (dateRange.value.length != 0) {
        if (dateRange.value.length == 1) {
            const nextDay = new Date(dateRange.value[0])
            nextDay.setDate(dateRange.value[0].getDate() + 1)
            when_date = `(${dateRange.value[0].toISOString()},${nextDay.toISOString()})`
        }
        else {
            const firstDate = dateRange.value.reduce((min, curr) => !min || curr < min ? curr : min)
            const lastDate = dateRange.value.reduce((min, curr) => !min || curr > min ? curr : min)
            when_date = `(${firstDate.toISOString()},${lastDate.toISOString()})`
        }
    }

    let who: string = undefined
    if (users.value.length != 0) {
        who = `[${users.value.toString()}]`
    }

    let what: string = undefined
    if (logType.value.length != 0) {
        what = `[${logType.value.toString()}]`
    }

    let thing_type = thingType.value ? IRElementTypeSingular[thingType.value] : undefined

    const data = await apiGET.GET_Audits(skip, limit, sort, when_date, who, what, thing_type, thingId.value ? thingId.value : undefined)
    if (data) {
        auditEntries.value = data.result
        total.value = data.totalCount
    }

    loadingAudits.value = false
}
</script>
<style scoped>
    .full-height {
        height: 100%;
    }
</style>