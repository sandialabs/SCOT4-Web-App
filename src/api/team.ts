import { AxiosStatic } from "axios"
import qs from "qs"

export default (axios: AxiosStatic) => ({
      async getHandlers(startRange:string, endRange:string): Promise<any> {
        return axios({
        url: `/handler/?start_date=${startRange}&end_date=${endRange}`,
        method: 'GET',
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json'
        },
    })
    },

    async getAllUsernames(): Promise<any> {
        return axios({
            url: '/users/usernames',
            method: 'GET',
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            },
        })
    },

    async createHandler(createData: any): Promise<any> {
        return axios({
            url: '/handler/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true,
            data: createData
        })
    },

    async updateHandler(handlerId: number, updateData: any): Promise<any> {
        const path = '/handler/' + handlerId
        return axios({
            url: path,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: updateData,
            withCredentials: true
        })
    },

    async deleteHandler(handlerId: number): Promise<any> {
        const path = '/handler/' + handlerId
        return axios({
            url: path,
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })
    },

    async retrieveGlobalSettings(): Promise<any> {
        const path = '/settings/'
        return axios({
            url: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        })
    },

    async updateGlobalSettings(updateData: any): Promise<any> {
        const path = '/settings/'
        return axios({
            url: path,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            data: updateData,
            withCredentials: true
        })
    },

    async retrieveAuditsWithFilter(filter: any, abortController: AbortController): Promise<any> {
        const path = '/audit/'
        return axios({
            url: path,
            method: 'GET',
            params: filter,
            withCredentials: true,
            signal: abortController?.signal
        })
    },

    async deleteAudit(id: number): Promise<any> {
        const path = '/audit/' + id
        return axios({
            url: path,
            method: 'DELETE',
            withCredentials: true
        })
    },

    async getGameResults(game_ids: Array<number> | undefined = undefined,
        date_range: Array<string> | undefined = undefined,
        num_top_users: number = 3,
        exclude_users: Array<string> = []
    ) {
        const path = '/game/results'
        const sixMonthsAgo = new Date().setMonth(new Date().getMonth() - 6)
        const dates = date_range ? date_range : [sixMonthsAgo]
        return axios({
            url: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                game_ids: game_ids,
                dates: dates,
                num_top_users: num_top_users,
                exclude_users: exclude_users
            },
            withCredentials: true
        })
    },

    async getMetricResults(metric_ids: Array<number> | undefined = undefined,
        date_range: Array<string> | undefined = undefined,
        exclude_users: Array<string> = []
    ) {
        const path = '/metric/results';
        return axios({
            url: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                metric_ids: metric_ids,
                dates: date_range,
                exclude_users: exclude_users
            },
            withCredentials: true
        })
    },
    
    async getSpecialMetric(skip: number = 0,
        limit: number = 1000,
        metric_type: Array<string> = [],
        start_time: Array<string> = [],
        end_time: Array<string> = [],
        created: Array<string> = [],
        modified: Array<string> = []
    ) {
        const path = '/special_metric/';
        return axios({
            url: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            params: {
                skip: skip,
                limit: limit,
                metric_type: metric_type,
                start_time: start_time,
                end_time: end_time,
                created: created,
                modified: modified, 
            },
            withCredentials: true
        })
    },
    
    async getUserActivity() {
        const path = '/users/activity'
        return axios({
            url: path,
            method: 'GET',
            withCredentials: true
        })
    }
});
