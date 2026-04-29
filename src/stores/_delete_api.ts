import { defineStore } from 'pinia'
import { environment as env } from '@/environments/environment'
import axiosDefault, { Axios } from 'axios';
import { inject } from 'vue';

export const useDELETE_APIStore = defineStore('delete_api', () => {
    const axios = inject<Axios>('axios', axiosDefault)

    async function DeleteElementById(IRType: string, id: number | string): Promise<any> {
        return axios
            .delete(`${env.APIHost}/${IRType}/${id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function () {
                return false
            })
            .finally(function () { })
    }

    async function DeleteManyElementsByIds(IRType: string, ids: Array<number>): Promise<any> {
        return axios
            .delete(`${env.APIHost}/${IRType}/many`, { params: {ids: ids}, paramsSerializer: {indexes: null}})
            .then(function (response) {
                return response.data
            })
            .catch(function () {
                return false
            })
            .finally(function () { })
    }

    async function DELETE_User(id: number) {
        return axios
            .delete(`${env.APIHost}/users/${id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function () {
                return false
            })
            .finally(function () { })
    }

    async function DELETE_Role(id: number) {
        return axios
            .delete(`${env.APIHost}/role/${id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function () {
                return false
            })
            .finally(function () { })
    }

    async function DELETE_Storage(id: number) {
        return axios
            .delete(`${env.APIHost}/settings/storage_provider/${id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function () {
                return false
            })
            .finally(function () { })
    }

    async function DELETE_Authentication(id: number) {
        return axios
            .delete(`${env.APIHost}/settings/auth/${id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function () {
                return false
            })
            .finally(function () { })
    }

    async function DELETE_Tag(id: number) {
        return axios
            .delete(`${env.APIHost}/tag/${id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function () {
                return false
            })
            .finally(function () { })
    }

    async function DELETE_Source(id: number) {
        return axios
            .delete(`${env.APIHost}/source/${id}`)
            .then(function (response) {
                return response.data
            })
            .catch(function () {
                return false
            })
            .finally(function () { })
    }


    return { DeleteElementById, DeleteManyElementsByIds, DELETE_User, DELETE_Role, DELETE_Storage, DELETE_Authentication, DELETE_Tag, DELETE_Source }
})
