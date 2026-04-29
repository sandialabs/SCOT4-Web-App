
import { defineStore } from 'pinia'
import localforage from 'localforage'

export const useStorage = defineStore('storage', () => {

    function getItem(key: any) {
        return localforage.getItem(key)
    }
    function setItem(key: any, value: any) {
        return localforage.setItem(key, value)
    }
    function storageConfig(options: any) {
        return localforage.config(options)
    }
    function removeItem(key: any) {
        return localforage.removeItem(key)
    }
    function clearStorage() {
        return localforage.clear()
    }
    return { getItem, setItem, storageConfig, removeItem, clearStorage }
})
