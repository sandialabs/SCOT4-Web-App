import { defineStore } from 'pinia'

export const useSnakePipe = defineStore('snake', () => {
    function convertToSnakeCase(nameForConversion: string): string {
        if (!nameForConversion) {
            return undefined;
        }
        return nameForConversion.replace(/[A-Z]/g, (letter, index) => { return index == 0 ? letter.toLowerCase() : '_' + letter.toLowerCase(); });
    }
    function convertFromSnakeCase(nameForConversion: string): string {
        if (!nameForConversion) {
            return undefined;
        }
        return nameForConversion.charAt(0).toUpperCase() + nameForConversion.slice(1).replace(/_[a-z]/, (match) => { return match.charAt(1).toUpperCase() });
    }

    return { convertToSnakeCase, convertFromSnakeCase }
})