import {AxiosStatic} from "axios"
import { PermissionEnum } from "../store/modules/IRElements/types";
import { UserLinksEnum } from "../store/modules/user/types";
export default (axios: AxiosStatic) => ({
    async updateUserMe(updateData: any): Promise<any> {
        return axios({
            url: '/users/me',
            method: 'PUT',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            },
            data: updateData,
        })
    },

    async updateUser(id: number, updateData: any): Promise<any> {
        return axios({
            url: '/users/' + id,
            method: 'PUT',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            },
            data: updateData,
        })
    },

    async createUser(createData: any): Promise<any> {
        return axios({
            url: '/users/',
            method: 'POST',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            },
            data: createData,
        })
    },

    async getUsers({ skip = undefined, limit = undefined, sort = 'id' } = {}): Promise<any> {
        return axios({
            url: '/users/',
            method: 'GET',
            withCredentials: true,
            params: {'skip': skip, 'limit': limit, 'sort': sort}
        })
    },

    async deleteUser(user_id: number): Promise<any> {
        return axios({
            url: '/users/' + user_id,
            method: 'DELETE',
            withCredentials: true
        })
    },

    async getRoles({ skip = undefined, limit = undefined, sort = 'id' } = {}): Promise<any> {
        return axios({
            url: '/role/',
            method: 'GET',
            withCredentials: true,
            params: {'skip': skip, 'limit': limit, 'sort': sort}
        })
    },

    async updateRole(id: number, updateData: any): Promise<any> {
        return axios({
            url: '/role/' + id,
            method: 'PUT',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            },
            data: updateData,
        })
    },

    async createRole(createData: any): Promise<any> {
        return axios({
            url: '/role/',
            method: 'POST',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            },
            data: createData,
        })
    },

    async assignRole(username: string, role_id?: number, role_name?: string): Promise<any> {
        return axios({
            url: '/role/assign',
            method: 'POST',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            },
            params: { username, role_id, role_name },
        })
    },

    async removeRole(username: string, role_id?: number, role_name?: string): Promise<any> {
        return axios({
            url: '/role/remove',
            method: 'POST',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            },
            params: { username, role_id, role_name },
        })
    },

    async deleteRole(role_id: number): Promise<any> {
        return axios({
            url: '/role/' + role_id,
            method: 'DELETE',
            withCredentials: true
        })
    },

    async getRolesForObject(objType: string, objId: number): Promise<any> {
        return axios({
            url: '/permissions/getroles',
            method: 'GET',
            withCredentials: true,
            params: { target_type: objType, target_id: objId }
        })
    },

    async grantPermission(roleId: number, objType: string, objId: number, permission: PermissionEnum): Promise<any> {
        return axios({
            url: '/permissions/grant',
            method: 'POST',
            withCredentials: true,
            data: { role_id: roleId, target_type: objType, target_id: objId, permission }
        })
    },

    async revokePermission(roleId: number, objType: string, objId: number, permission: PermissionEnum): Promise<any> {
        return axios({
            url: '/permissions/revoke',
            method: 'POST',
            withCredentials: true,
            data: { role_id: roleId, target_type: objType, target_id: objId, permission }
        })
    },

    // Note: this gets all api keys of the current user
    // TODO: pagination?
    async getUserApiKeys(): Promise<any> {
        return axios({
            url: '/apikey/',
            method: 'GET',
            withCredentials: true,
        })
    },

    async retrieveNotifications(includeAcked: boolean | undefined = undefined, skip: number | undefined = undefined, limit: number | undefined = undefined): Promise<any> {
        return axios({
            url: '/notification/',
            method: 'GET',
            withCredentials: true,
            params: { include_acked: includeAcked, skip, limit }
        })
    },


    async ackNotifications(notificationIds: Array<number>): Promise<any> {
        return axios({
            url: '/notification/ack',
            method: 'POST',
            data: {notification_ids:notificationIds},
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
        })
    },

    async sendBroadcastNotification(message: string, priority: string, expires: Date): Promise<any> {
        return axios({
            url: '/notification/broadcast',
            method: 'POST',
            data: { message, priority, expires },
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
        })
    },

    async updateApiKey(key: string, updateData: any): Promise<any> {
        return axios({
            url: '/apikey/' + key,
            method: 'PUT',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            },
            data: updateData,
        })
    },

    async createApiKey(): Promise<any> {
        return axios({
            url: '/apikey/',
            method: 'POST',
            withCredentials: true,
        })
    },

    async deleteApiKey(key: string): Promise<any> {
        return axios({
            url: '/apikey/' + key,
            method: 'DELETE',
            withCredentials: true,
        })
    },

    async callTextSearch(searchText: string, extraFilter: any = {}, sort: string | undefined = undefined): Promise<any> {
        return axios({
            url: '/search/',
            method: 'POST',
            withCredentials: true,
            data: { 'text': searchText, 'sort': sort, ...extraFilter },
            headers: {
                'Content-Type': 'application/json'
            },
            
        })
    },

    async getFavorites(abortController?: AbortController): Promise<any> {
        return axios({
            url: 'user_links/',
            method: "GET",
            withCredentials: true,
            params: { link_type: UserLinksEnum.favorite, limit: -1 },
            headers: {
                'Content-Type': 'application/json'
            },
            signal: abortController?.signal
        })
    },

    async getSubscriptions(abortController?: AbortController): Promise<any> {
        return axios({
            url: 'user_links/',
            method: "GET",
            withCredentials: true,
            params: { link_type: UserLinksEnum.subscription, limit: -1 },
            headers: {
                'Content-Type': 'application/json'
            },
            signal: abortController?.signal
        })
    }
});