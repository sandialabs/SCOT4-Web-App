import { defineStore } from 'pinia'
import { environment as env } from '@/environments/environment'
import axiosDefault, { Axios } from 'axios';
import { inject } from 'vue';
import { useSnackBarStore } from './snackbar';
import { IRElementAPIPathsNoSlash, IRElementType } from '@/types/irelement';

export const useGET_APIStore = defineStore('get_api', () => {
    const SnackBar = useSnackBarStore()
    const axios = inject<Axios>('axios', axiosDefault)
    async function GET_IRElementData(IRType: string, skip: number, limit: number, sort: string, searchFilters: object = {}, abortController: AbortController | undefined = undefined): Promise<any> {
        const params: any = {}
        if (Object.keys(searchFilters).length > 0) {
            for (let [key, value] of Object.entries(searchFilters)) {
                if (value === undefined || value == "") {
                    continue;
                }
                else if (key == "created" || key == "modified" || key == "occurred_date") {
                    if (value.length == 1) {
                        params[key] = (value[0] as Date).toISOString()
                    }
                    else if (value.length > 1) {
                        params[key] = `(${(value[0] as Date).toISOString()},${(value[value.length - 1] as Date).toISOString()})`
                    }
                }
                else if (key == "tags" || key == "sources") {
                    if (value.length > 0) {
                        params[key.slice(0, -1)] = `[${value.join(",")}]`
                    }
                }
                else {
                    params[key] = value
                }
            }
        }

        params.skip = skip
        params.limit = limit
        params.sort = sort
        params.entry_class = IRType == "/entry" ? "task" : undefined
        return axios.get(`${env.APIHost}${IRType}/`, {
                params: params,
                signal: abortController?.signal
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                if (!axiosDefault.isCancel(error)) {
                    SnackBar.ShowSnackBarError(error)
                }
                return error
            })
    }

    async function GET_IRElementDataSelected(IRType: string, id: number): Promise<any> {
        return axios
            .get(`${env.APIHost}${IRType}/${id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error
            })
            .finally(function () { })
    }

    async function GET_Source(id: string | number): Promise<any> {
        return axios
            .get(`${env.APIHost}/source/${id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error
            })
            .finally(function () { })
    }

    async function GET_IRElementSources(limit: number = 25, name: string = undefined, sort: string = undefined): Promise<any> {
        return axios
            .get(`${env.APIHost}/source/`, {
                params: {
                    limit: limit,
                    name: name,
                    sort: sort
                }
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error
            })
            .finally(function () { })
    }

    async function GET_IRElementTagAppearances(params: any): Promise<any> {
        return axios
            .get(`${env.APIHost}/tag/target_appearance`, {
                params: params,
                headers: {
                    'Content-Type': 'application/json'
                },
                paramsSerializer: { indexes: null }
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)

            })
            .finally(function () { })
    }

    async function GET_IRElementSourceAppearances(params: any): Promise<any> {
        return axios
            .get(`${env.APIHost}/source/target_appearance`, {
                params: params,
                headers: {
                    'Content-Type': 'application/json'
                },
                paramsSerializer: { indexes: null }
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)

            })
            .finally(function () { })
    }

    async function GET_IRElementEntity(IRType: string, id: string): Promise<any> {
        return axios
            .get(`${env.APIHost}${IRType}/${id}/entity`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error
            })
            .finally(function () { })
    }

    async function GET_IRElementHistory(IRType: string, id: string): Promise<any> {
        const url = env.APIHost + IRType + "/" + id + "/history"
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_Tag(id: string | number): Promise<any> {
        return axios
            .get(`${env.APIHost}/tag/${id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ToggleSnackbar(error.response.data.detail)
                return error

            })
            .finally(function () { })
    }

    async function GET_TagTargetTypes(name: string | null = null, id: string | null = null) {
        return axios
            .get(`${env.APIHost}/tag/target_types`, {
                params: {
                    name: name,
                    id: id,
                }
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ToggleSnackbar(error.response.data.detail)
                return error
            })
            .finally(function () { })
    }

    async function GET_SourceTargetTypes(name: string | null = null, id: string | null = null) {
        return axios
            .get(`${env.APIHost}/source/target_types`, {
                params: {
                    name: name,
                    id: id,
                }
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ToggleSnackbar(error.response.data.detail)
                return error
            })
            .finally(function () { })
    }

    async function GET_SearchTags(name: string = null, id: string | null = null, limit: number = 25, sort: string | null = null): Promise<any> {
        return axios
            .get(`${env.APIHost}/tag/`, {
                params: {
                    name: name,
                    id: id,
                    limit: limit,
                    sort: sort
                }
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_PermissionsRoles(IRType: string, id: number): Promise<any> {
        return axios
            .get(`${env.APIHost}/permissions/getroles`, { params: { target_type: IRType, target_id: id } })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_Roles(skip?: number, limit?: number): Promise<any> {
        return axios
            .get(`${env.APIHost}/role/`, { params: { sort: "id", skip: skip, limit: limit } })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_IRElementGuide(guideId: string): Promise<any> {
        const url = env.APIHost + "/guide/" + guideId
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_IRElementSignature(IRType: string, id: number): Promise<any> {
        const url = `${env.APIHost}${IRType}/${id}/signatures`
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_IRElementThreatModelItem(IRType: string, id: number): Promise<any> {
        const url = `${env.APIHost}${IRType}/${id}/threat_model_item`
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_IRElementGuideEntries(guideId: string): Promise<any> {
        const url = env.APIHost + "/guide/" + guideId + '/entry?limit=-1'
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_IRElementGuideEntity(guideId: string): Promise<any> {
        const url = env.APIHost + "/guide/" + guideId + '/entity'
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_IRElementJournalEntries(IRType: string, id: string): Promise<any> {
        return axios
            .get(`${env.APIHost}${IRType}/${id}/entry`, {
                params: {
                    limit: -1
                }
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error
            })
            .finally(function () { })
    }

    async function GET_IRElementPromotedAlerts(promotedAlertId: string): Promise<any> {
        return axios
            .get(`${env.APIHost}/alert/${promotedAlertId}`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error
            })
            .finally(function () { })
    }

    async function GET_IRElementFilesData(IRType: string, id: string): Promise<any> {
        return axios
            .get(`${env.APIHost}${IRType}/${id}/files`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_DownloadFile(id: number, password: string | undefined = undefined) {
        const a = document.createElement("a")
        return axios
            .get(`${env.APIHost}/file/download/${id}`, {
                responseType: "blob",
                params: {
                    password: password
                }
            })
            .then(function (response) {
                a.href = URL.createObjectURL(response.data)
                a.download = response.headers["content-disposition"]?.split(";")[1].split("=")[1].slice(1, -1)
                a.target = "_blank"
                a.click();
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () {
                URL.revokeObjectURL(a.href)
                a.remove()
            })
    }

    async function GET_DownloadManyFiles(ids: number[], password: string | undefined = undefined) {
        const a = document.createElement("a")
        return axios
            .get(`${env.APIHost}/file/download/many`, {
                responseType: "blob",
                params: {
                    ids: ids,
                    password: password
                },
                paramsSerializer: { indexes: null }
            })
            .then(function (response) {
                a.href = URL.createObjectURL(response.data)
                a.download = response.headers["content-disposition"]?.split(";")[1].split("=")[1].slice(1, -1)
                a.target = "_blank"
                a.click();
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () {
                URL.revokeObjectURL(a.href)
                a.remove()
            })
    }

    async function GET_Handlers(startDate: string, endDate: string): Promise<any> {
        const url = env.APIHost + "/handler/?start_date=" + startDate + "&end_date=" + endDate
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error
            })
            .finally(function () { })
    }

    async function GET_UserLinks(type: string): Promise<any> {
        const url = env.APIHost + "/user_links/?link_type=" + type + "&limit=-1"
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_ReflairElementById(IRType: string, id: string): Promise<any> {
        const url = env.APIHost + IRType + "/" + id + "/reflair"
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_FlairAppearancesById(entityId: string): Promise<any> {
        const url = env.APIHost + "/entity/" + entityId + "/flair_appearances?limit=25"
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_EnrichmentById(entityId: string): Promise<any> {
        const url = env.APIHost + "/entity/" + entityId + "/enrichment"
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_PivotById(entityId: string): Promise<any> {
        const url = env.APIHost + "/entity/" + entityId + "/pivot"
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_APIKeys(): Promise<any> {
        const url = env.APIHost + "/apikey/"
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_Usernames(): Promise<any> {
        const url = env.APIHost + "/users/usernames"
        return axios
            .get(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_Users(skip: number = 0, limit: number = 100): Promise<any> {
        return axios
            .get(`${env.APIHost}/users/`, { params: { skip: skip, limit: limit } })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () { })
    }

    async function GET_Authentications(): Promise<any> {
        return axios
            .get(`${env.APIHost}/settings/auth`,)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_AuthenticationHelp(): Promise<any> {
        return axios
            .get(`${env.APIHost}/settings/auth/help`,)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_Storages(): Promise<any> {
        return axios
            .get(`${env.APIHost}/settings/storage_provider`,)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_StorageHelp(): Promise<any> {
        return axios
            .get(`${env.APIHost}/settings/storage_provider_help`,)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_Audits(skip?: number, limit?: number, sort?: string, when_date?: string, username?: string, what?: string, thing_type?: string, thing_id?: number): Promise<any> {
        return axios
            .get(`${env.APIHost}/audit/`, {
                params: {
                    skip: skip,
                    limit: limit,
                    sort: sort,
                    when_date: when_date,
                    username: username,
                    what: what,
                    thing_type: thing_type,
                    thing_id: thing_id
                }
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_GameResults(
        game_ids: Array<number> | undefined = undefined,
        date_range: Array<string> | undefined = undefined,
        num_top_users: number = 3,
        exclude_users: Array<string> | undefined = undefined): Promise<any> {
        const path = '/game/results'
        const sixMonthsAgo = new Date().setMonth(new Date().getMonth() - 6)
        const dates = date_range ? date_range : [sixMonthsAgo]
        return axios
            .get(`${env.APIHost}` + path, {
                params: {
                    game_ids: game_ids,
                    dates: dates,
                    num_top_users: num_top_users,
                    exclude_users: exclude_users
                },
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_Metrics(
        metric_ids?: number[],
        date_range?: [string, string],
        exclude_users: string[] = []
        ): Promise<{
        name: string
        tooltip: string
        results: Record<string, number>
        }[]> {
        const today      = new Date()
        const oneYearAgo = new Date(today)
        oneYearAgo.setFullYear(today.getFullYear() - 1)

        const [start, end] = date_range ?? [
            oneYearAgo.toISOString().slice(0,10),
            today    .toISOString().slice(0,10),
        ]

        const params = new URLSearchParams()
        metric_ids?.forEach(id => params.append('metric_ids',   id.toString()))
        params.append('dates', start)
        params.append('dates', end)
        exclude_users.forEach(u => params.append('exclude_users', u))

        const { data } = await axios.get<
            { name: string; tooltip: string; results: Record<string,number> }[]
        >(`${env.APIHost}/metric/results`, { params })

        return data  
        }
                    
    async function GET_SpecialMetric(
        skip: number = 0,
        limit: number = 1000,
        metric_type: Array<string> = [],
        start_time: Array<string> = [],
        end_time: Array<string> = [],
        created: Array<string> = [],
        modified: Array<string> = []) {
        const path = '/special_metric/';
        return axios
            .get(`${env.APIHost}` + path, {
                params: {
                    skip: skip,
                    limit: limit,
                    metric_type: metric_type,
                    start_time: start_time,
                    end_time: end_time,
                    created: created,
                    modified: modified, 
                },
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_UserActivity(): Promise<any> {
        return axios
            .get(`${env.APIHost}/users/activity`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_EntityClasses(name: string = null, limit: number = -1): Promise<any> {
        return axios
            .get(`${env.APIHost}/entity_class/`, {
                params: {
                    name: name,
                    limit: limit
                }
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_EntityTypes(name: string = null, limit: number = -1): Promise<any> {
        return axios
            .get(`${env.APIHost}/entity_type/`, {
                params: {
                    name: name,
                    limit: limit
                }
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function GET_ExportIRElementData(type: IRElementType, id: number, format: string) {
        const a = document.createElement("a")
        return axios
            .get(`${env.APIHost}/${IRElementAPIPathsNoSlash[type]}/export`, {
                responseType: "blob",
                params: {
                    id: id,
                    format: format
                }
            })
            .then(function (response) {
                a.href = URL.createObjectURL(response.data)
                a.download = response.headers["content-disposition"]?.split(";")[1].split("=")[1].slice(1, -1)
                a.target = "_blank"
                a.click();
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () {
                URL.revokeObjectURL(a.href)
                a.remove()
            })
    }

    async function GET_DownloadAttackNavigator(type: IRElementType, searchFilters: object = {}) {
        const params: any = {}
        if (Object.keys(searchFilters).length > 0) {
            for (let [key, value] of Object.entries(searchFilters)) {
                if (value === undefined || value == "") {
                    continue;
                }
                else if (key == "created" || key == "modified" || key == "occurred_date") {
                    if (value.length == 1) {
                        params[key] = (value[0] as Date).toISOString()
                    }
                    else if (value.length > 1) {
                        params[key] = `(${(value[0] as Date).toISOString()},${(value[value.length - 1] as Date).toISOString()})`
                    }
                }
                else if (key == "tags" || key == "sources") {
                    if (value.length > 0) {
                        params[key.slice(0, -1)] = `[${value.join(",")}]`
                    }
                }
                else {
                    params[key] = value
                }
            }
        }

        params.entry_class = type == IRElementType.Entry ? "task" : undefined
        const a = document.createElement("a")
        return axios
            .get(`${env.APIHost}/${IRElementAPIPathsNoSlash[type]}/attack_navigator`, {
                responseType: "blob",
                params: params,
            })
            .then(function (response) {
                a.href = URL.createObjectURL(response.data)
                a.download = response.headers["content-disposition"]?.split(";")[1].split("=")[1].slice(1, -1)
                a.target = "_blank"
                a.click();
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
                return error

            })
            .finally(function () {
                URL.revokeObjectURL(a.href)
                a.remove()
            })
    }


    return {
        GET_IRElementPromotedAlerts,
        GET_IRElementGuideEntity,
        GET_IRElementSignature,
        GET_IRElementThreatModelItem,
        GET_FlairAppearancesById,
        GET_UserLinks,
        GET_ReflairElementById,
        GET_Roles,
        GET_PermissionsRoles,
        GET_IRElementFilesData,
        GET_DownloadFile,
        GET_DownloadManyFiles,
        GET_IRElementJournalEntries,
        GET_IRElementTagAppearances,
        GET_IRElementSourceAppearances,
        GET_Handlers,
        GET_IRElementGuideEntries,
        GET_IRElementGuide,
        GET_Tag,
        GET_TagTargetTypes,
        GET_SourceTargetTypes,
        GET_SearchTags,
        GET_IRElementData,
        GET_IRElementDataSelected,
        GET_Source,
        GET_IRElementSources,
        GET_IRElementEntity,
        GET_IRElementHistory,
        GET_EnrichmentById,
        GET_PivotById,
        GET_APIKeys,
        GET_Usernames,
        GET_Users,
        GET_Authentications,
        GET_AuthenticationHelp,
        GET_Storages,
        GET_StorageHelp,
        GET_Audits,
        GET_GameResults,
        GET_Metrics,
        GET_SpecialMetric,
        GET_UserActivity,
        GET_EntityClasses,
        GET_EntityTypes,
        GET_ExportIRElementData,
        GET_DownloadAttackNavigator
    }
})
