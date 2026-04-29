import { defineStore } from 'pinia'
import { environment as env } from '@/environments/environment'
import { useSnackBarStore } from './snackbar';
import axiosDefault, { Axios } from 'axios';
import { inject } from 'vue';

export const usePUT_APIStore = defineStore('put_api', () => {
    const SnackBar = useSnackBarStore()
    const axios = inject<Axios>('axios', axiosDefault)

    async function UpdateElementById(IRType: string, id: number | string, updateData: any): Promise<any> {
        return axios.put(`${env.APIHost}${IRType}/${id}`, updateData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function UpdateManyElementsByIds(IRType: string, ids: Array<number>, updateData: any): Promise<any> {
        return axios
            .put(`${env.APIHost}${IRType}/many`, updateData, { params: {ids: ids}, paramsSerializer: {indexes: null}})
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function UpdateUser(id: number, updateData: any): Promise<any> {
        return axios.put(`${env.APIHost}/users/${id}`, updateData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function UpdateRole(id: number, updateData: any): Promise<any> {
        return axios.put(`${env.APIHost}/role/${id}`, updateData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function UpdateAuthentication(id: number, updateData: any): Promise<any> {
        return axios.put(`${env.APIHost}/settings/auth/${id}`, updateData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function UpdateStorage(id: number, updateData: any): Promise<any> {
        return axios.put(`${env.APIHost}/settings/storage_provider/${id}`, updateData)
            .then(function (response) {
                return response.data
            })
            .catch(function (error) {
                SnackBar.ShowSnackBarError(error)
            })
            .finally(function () { })
    }

    async function UpdateTag(id: number, name: string | null = null, description: string | null = null) {
        return axios.put(`${env.APIHost}/tag/${id}`, {
            name: name,
            description: description
        })
        .then(function (response) {
            return response.data
        })
        .catch(function (error) {
            SnackBar.ShowSnackBarError(error)
        })
        .finally(function () { })
    }

    async function UpdateSource(id: number, name: string | null = null, description: string | null = null) {
        return axios.put(`${env.APIHost}/source/${id}`, {
            name: name,
            description: description
        })
        .then(function (response) {
            return response.data
        })
        .catch(function (error) {
            SnackBar.ShowSnackBarError(error)
        })
        .finally(function () { })
    }

    async function UpdateEntry(id: number, data: any) {
        return axios.put(`${env.APIHost}/entry/${id}`, data)
        .then(function (response) {
            return response.data
        })
        .catch(function (error) {
            SnackBar.ShowSnackBarError(error)
        })
        .finally(function () { })
    }

    async function UpdatePivotEntityTypes(id: number, entity_types: any) {
        return axios.put(`${env.APIHost}/pivot/${id}/entity_type`, {
            entity_types: entity_types
        }).then(function (response) {
            return response.data
        }).catch(function (error) {
            SnackBar.ShowSnackBarError(error)
        }).finally(function () { })
    }

    async function UpdatePivotEntityClasses(id: number, entity_classes: any) {
        return axios.put(`${env.APIHost}/pivot/${id}/entity_class`, {
            entity_classes: entity_classes
        }).then(function (response) {
            return response.data
        }).catch(function (error) {
            SnackBar.ShowSnackBarError(error)
        }).finally(function () { })
    }

    return { UpdateElementById, UpdateManyElementsByIds, UpdateUser, UpdateRole, UpdateAuthentication, UpdateStorage, UpdateTag, UpdateSource, UpdateEntry, UpdatePivotEntityTypes, UpdatePivotEntityClasses }
})
