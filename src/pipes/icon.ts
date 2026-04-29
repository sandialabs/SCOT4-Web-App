import { defineStore } from 'pinia'

export const useIconPipe = defineStore('icon', () => {
    function Vue2TO3IconFormat(vue2Icon: string): string {
        if (vue2Icon.startsWith('$')) {
            const iconSplit = vue2Icon.split(".")
            return "$" + iconSplit[2]
        } else {
            return vue2Icon
        }

    }

    return { Vue2TO3IconFormat }
})