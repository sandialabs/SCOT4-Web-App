import { defineStore } from 'pinia'
import { DateTime as DT } from 'luxon'

export const useDatePipe = defineStore('date', () => {
    function ConvertDate(dateForConversion: string): string {
        const dateNow = DT.fromISO(dateForConversion)
        const formattedDate = dateNow.toFormat('M/d/y tt');
        return formattedDate.toString()
    }
    function ConvertDateFromString(dateForConversion: string): any {
        const response: Date = new Date(dateForConversion)
        return response;
    }
    function ConvertLongDate(dateForConversion: string) {
        const date = new Date(dateForConversion)
        const options: any = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
        return date.toLocaleDateString(undefined, options)
    }
    function ConvertTime(dateForConversion: string) {
        return new Date(dateForConversion).toLocaleTimeString('en-US')
    }

    return { ConvertDate, ConvertDateFromString, ConvertLongDate, ConvertTime }
})