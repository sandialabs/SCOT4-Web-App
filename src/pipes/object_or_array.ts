import { defineStore } from 'pinia'

export const useObjectOrArrayPipe = defineStore('objectOrArray', () => {
    function IsObjectOrArray(value: any): any {
        try {
            let obj = JSON.parse(value)
            if (Array.isArray(obj)) {
                return obj
            }
            else {
                return false
            }
        }
        catch (e) {
            return false
        }
    }

    return { IsObjectOrArray }
})