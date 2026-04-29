import { defineStore } from 'pinia'
import { environment as env } from '@/environments/environment'
import { ModelSourceRemove, ModelTagRemove, ModelElementPromote } from '@/models'
import axiosDefault, { Axios } from 'axios';
import { inject } from 'vue';
import { useSnackBarStore } from './snackbar';
import type { PermissionEnum } from '@/types/irelement';

export const usePOST_APIStore = defineStore('post_api', () => {
    const SnackBar = useSnackBarStore()
    const axios = inject<Axios>('axios', axiosDefault)
    async function POST_RemoveSource(sourceId: any, sourceData: ModelSourceRemove): Promise<any> {
        const url = env.APIHost + "/source/" + sourceId + '/remove'
        return axios
            .post(url, sourceData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_PromoteElements(promoteData: ModelElementPromote): Promise<any> {
        const url = env.APIHost + "/promotion/"
        return axios
            .post(url, promoteData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_RemoveTag(tagId: any, tagData: ModelTagRemove): Promise<any> {
        return axios
            .post(`${env.APIHost}/tag/${tagId}/untag`, tagData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_AddTag(tagData: any): Promise<any> {
        return axios
            .post(`${env.APIHost}/tag/tag_by_name`, tagData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_ReplaceTag(id: number, replace_id: number): Promise<any> {
        return axios
            .post(`${env.APIHost}/tag/${id}/replace/${replace_id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_AddSource(sourceData: any): Promise<any> {
        return axios
            .post(env.APIHost + "/source/source_by_name", sourceData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_ReplaceSource(id: number, replace_id: number): Promise<any> {
        return axios
            .post(`${env.APIHost}/source/${id}/replace/${replace_id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_Search(searchData: any): Promise<any> {
        const url = env.APIHost + "/search/"
        return axios
            .post(url, searchData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_Favorite(IRType: string, id: string): Promise<any> {
        const url = env.APIHost + IRType + "/" + id + '/favorite'
        return axios
            .post(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_Vote(IRType: string, id: string, voteType: string): Promise<any> {
        const url = env.APIHost + IRType + "/" + id + '/' + voteType
        return axios
            .post(url, {})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_File(formData: any, targetId: number, targetType: string, description: string): Promise<any> {
        const url = env.APIHost + "/file/"
        return axios
            .post(url,
                formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'target_type': targetType,
                    'target_id': targetId,
                    'description': description
                }
            }
            )
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_NewAPIKey(): Promise<any> {
        const url = env.APIHost + "/apikey/"
        return axios
            .post(url)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_CreateIRElement(targetType: string, createData: any): Promise<any> {
        const url = env.APIHost + targetType + "/"
        return axios
            .post(url, createData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_CreateManyIRElements(targetType: string, createData: Array<any>): Promise<any> {
        const url = env.APIHost + targetType + "/"
        return axios
            .post(url, createData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_AddEntry(entryData: any): Promise<any> {
        return axios
            .post(`${env.APIHost}/entry/`, entryData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_NewHandler(handlerData: any): Promise<any> {
        const url = env.APIHost + "/handler/"
        return axios
            .post(url, handlerData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_CreateUser(userData: any): Promise<any> {
        const url = env.APIHost + "/users/"
        return axios
            .post(url, userData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_ResetPasswordAttempts(username: string): Promise<any> {
        return axios
            .post(`${env.APIHost}/users/${username}/reset-failed-attempts`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_CreateRole(createData: any): Promise<any> {
        return axios
            .post(`${env.APIHost}/role`, createData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_AssignRole(username: string, id?: number, name?: string): Promise<any> {
        return axios
            .post(`${env.APIHost}/role/assign`, undefined, {params: {username: username, role_id: id, role_name: name}})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_RemoveRole(username: string, id?: number, name?: string): Promise<any> {
        return axios
            .post(`${env.APIHost}/role/remove`, undefined, {params: {username: username, role_id: id, role_name: name}})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_GrantPermission(role_id: number, type: string, id: number, permission: PermissionEnum): Promise<any> {
        return axios
            .post(`${env.APIHost}/permissions/grant`, {role_id: role_id, target_type: type, target_id: id, permission: permission})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_RevokePermission(role_id: number, type: string, id: number, permission: PermissionEnum): Promise<any> {
        return axios
            .post(`${env.APIHost}/permissions/revoke`, {role_id: role_id, target_type: type, target_id: id, permission: permission})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_SetPermission(type: string, id: number, permissions: object | null = null): Promise<any> {
        return axios
            .post(`${env.APIHost}/permissions/set`, {permissions: permissions, target_type: type, target_id: id})
            .then(function () {
                return true
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_CreateAuthentication(createData: any): Promise<any> {
        return axios
            .post(`${env.APIHost}/settings/auth`, createData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_CreateStorage(createData: any): Promise<any> {
        return axios
            .post(`${env.APIHost}/settings/storage_provider`, createData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_AddEntityClass(id: number, class_ids: number[]) {
        return axios
            .post(`${env.APIHost}/entity/${id}/entity_class`, {"entity_class_ids": class_ids})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_RemoveEntityClass(id: number, class_ids: number[]) {
        return axios
            .post(`${env.APIHost}/entity/${id}/entity_class/remove`, {"entity_class_ids": class_ids})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_AddEntityTag(id: number, tag_id: number) {
        return axios
            .post(`${env.APIHost}/entity/${id}/tag`, {"id": tag_id})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_RemoveEntityTag(id: number, tag_id: number) {
        return axios
            .post(`${env.APIHost}/entity/${id}/untag`, {"id": tag_id})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_EnrichEntityByID(id: number) {
        return axios
            .post(`${env.APIHost}/entity/${id}/enrich_request`)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function POST_DeleteLinksBetweenElements(IRType1: string, id1: number, IRType2: string, id2: number, bidirectional: boolean = true) {
        return axios
            .post(`${env.APIHost}/link/deletebetween`, {
                v0_type: IRType1,
                v0_id: id1,
                v1_type: IRType2,
                v1_id: id2,
                bidirectional
            })
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    return {
        POST_PromoteElements,
        POST_Vote,
        POST_Favorite,
        POST_RemoveSource,
        POST_RemoveTag,
        POST_Search,
        POST_AddTag,
        POST_AddSource,
        POST_File,
        POST_NewAPIKey,
        POST_CreateIRElement,
        POST_CreateManyIRElements,
        POST_AddEntry,
        POST_NewHandler,
        POST_CreateUser,
        POST_ResetPasswordAttempts,
        POST_CreateRole,
        POST_AssignRole,
        POST_RemoveRole,
        POST_GrantPermission,
        POST_RevokePermission,
        POST_SetPermission,
        POST_CreateAuthentication,
        POST_CreateStorage,
        POST_ReplaceTag,
        POST_ReplaceSource,
        POST_AddEntityClass,
        POST_AddEntityTag,
        POST_RemoveEntityClass,
        POST_RemoveEntityTag,
        POST_EnrichEntityByID,
        POST_DeleteLinksBetweenElements
    }
})
