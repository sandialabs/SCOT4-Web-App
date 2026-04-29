<template>
    <v-card flat title="Default Permissions" :subtitle="subtitle" class="full-height d-flex flex-column">
        <v-card-text class="d-flex flex-column" style="min-height: 0px; overflow-y: auto;">
            <v-row v-for="perm, index in defaultPermissions" :key="perm.key">
                <v-col v-if="perm.key == 'default'" class="text-h6 align-self-center" style="width: 15em">
                    <v-row no-gutters>
                        <v-col cols="2" class="align-self-center">
                            Default (all)
                        </v-col>
                        <v-col>
                            <v-switch v-if="permissionType == 'user'" inline hide-details v-model="includeUserDefault" class="mt-0 switch-justify-end" />
                        </v-col>
                    </v-row>
                </v-col>
                <v-col v-else style="width: 15em">
                    <v-row>
                        <v-col>
                            <v-select density="compact" :items="permissionTypesChoices(perm.key)" v-model="perm.key" hide-details />
                        </v-col>
                        <v-col>
                            <v-btn @click=" defaultPermissions.splice(index, 1)" color="red">
                                <FontAwesomeIcon :icon="faTrash" />
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-col>
                <v-col class="align-self-center">
                    <v-row>
                        <v-col class="align-self-center">
                            <v-autocomplete density="compact" chips multiple clearable closable-chips
                                            :items="roles"
                                            item-title="name"
                                            item-value="id"
                                            label="Read"
                                            v-model="perm.read"
                                            :menu-props="{ location: 'left' }"
                                            :disabled="perm.key == 'default' && permissionType == 'user' && !includeUserDefault"
                                            hint="The roles that can read this type of object by default (blank means everyone)"
                                            hide-details="auto"/>
                        </v-col>
                        <v-col class="align-self-center">
                            <v-autocomplete density="compact" chips multiple clearable closable-chips
                                            :items="roles"
                                            item-title="name"
                                            item-value="id"
                                            label="Modify"
                                            v-model="perm.modify"
                                            :menu-props="{ location: 'left' }"
                                            :disabled="perm.key == 'default' && permissionType == 'user' && !includeUserDefault"
                                            hint="The roles that can modify this type of object by default (blank means everyone)"
                                            hide-details="auto"/>
                        </v-col>
                        <v-col class="align-self-center">
                            <v-autocomplete density="compact" chips multiple clearable closable-chips
                                            :items="roles"
                                            item-title="name"
                                            item-value="id"
                                            label="Delete"
                                            v-model="perm.delete"
                                            :menu-props="{ location: 'left' }"
                                            :disabled="perm.key == 'default' && permissionType == 'user' && !includeUserDefault"
                                            hint="The roles that can delete this type of object by default (blank means everyone)"
                                            hide-details="auto"/>
                        </v-col>
                    </v-row>
                </v-col>
            </v-row>
            <v-row style="background-color: initial">
                <v-btn v-if="Object.keys(permissionTypes).length >= Object.keys(defaultPermissions).length" @click="addNewDefaultPermission" color="green" variant="outlined">
                    <FontAwesomeIcon :icon="faPlus" />
                </v-btn>
            </v-row>
        </v-card-text>
        <v-card-actions>
            <v-btn @click="updateSettings" color="green" :loading="submitLoading" text="Save Changes"/>
            <v-btn @click="copyFromSettings" text="Discard Changes"/>
        </v-card-actions>
    </v-card>
</template>

<style>
    .switch-justify-end .v-input__slot {
        justify-content: flex-end;
    }

    .scot-theme-light .v-card-text>.v-row:nth-of-type(odd) {
        background-color: rgba(247, 247, 247);
    }

    .scot-theme-dark .v-card-text>.v-row:nth-of-type(odd) {
        background-color: rgba(0, 0, 0)
    }

    .full-height {
        height: 100%;
    }
</style>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { ref, onMounted } from 'vue'
import { useSettingsStore, useGET_APIStore, useAuthStore } from '@/stores'

const prop = defineProps({
    permissionType: {
        type: String,
        default: "global"
    }
})

const settings = useSettingsStore()
const apiGET = useGET_APIStore()
const auth = useAuthStore()
const subtitle = ref("")
const submitLoading = ref(false)
const defaultPermissions = ref([] as any[])
const includeUserDefault = ref(false)
const roles = ref([] as any[])

const permissionTypes: Array<any> = [
    { value: "alertgroup", title: "Alertgroup" },
    { value: "dispatch", title: "Dispatch" },
    { value: "event", title: "Event" },
    { value: "guide", title: "Guide" },
    { value: "incident", title: "Incident" },
    { value: "intel", title: "Intel" },
    { value: "product", title: "Product" },
    { value: "signature", title: "Signature" },
    { value: "entity_class", title: "Entity Class" },
    { value: "entity_type", title: "Entity Type" },
    { value: "feed", title: "Feed" },
    { value: "pivot", title: "Pivot" },
    { value: "vuln_feed", title: "Vuln Feed" },
    { value: "vuln_track", title: "Vuln Track" }

]

onMounted(async () => {
    const data = await apiGET.GET_Roles()
    if (data) {
        roles.value = data.result
    }

    if (prop.permissionType == "global") {
        subtitle.value = 'These are the permissions objects will have on creation (blank means "everyone"). These settings are overridable by individual users for things they create.'
    }
    else {
        
        subtitle.value = 'These are the permissions objects will have when you create them (blank means "everyone"). The global settings will be used if these settings are unset.'
    }

    copyFromSettings()
})

function copyFromSettings() {
    defaultPermissions.value = []

    if (settings.GetSettings.default_permissions != null && prop.permissionType == "global") {
        const keys = Object.keys(settings.GetSettings.default_permissions)
        for (let i = 0; i < keys.length; i++) {
            defaultPermissions.value.push({
                key: keys[i],
                read: settings.GetSettings.default_permissions[keys[i]].read,
                modify: settings.GetSettings.default_permissions[keys[i]].modify,
                delete: settings.GetSettings.default_permissions[keys[i]].delete
            })
        }
    }

    else if (auth.GetUserPreferences?.default_permissions != null && prop.permissionType == "user") {
        if ("default" in auth.GetUserPreferences.default_permissions) {
            includeUserDefault.value = true
        }
        else {
            includeUserDefault.value = false
        }
        const keys = Object.keys(auth.GetUserPreferences.default_permissions)
        for (let i = 0; i < keys.length; i++) {
            defaultPermissions.value.push({
                key: keys[i],
                read: auth.GetUserPreferences.default_permissions[keys[i]].read,
                modify: auth.GetUserPreferences.default_permissions[keys[i]].modify,
                delete: auth.GetUserPreferences.default_permissions[keys[i]].delete
            })
        }
    }
    else {
        defaultPermissions.value.push({
            key: "default",
            read: [],
            modify: [],
            delete: []
        })
    }

    for (let i = 0; i < defaultPermissions.value.length; i++) {
        const keys = Object.keys(defaultPermissions.value[i])
        for (let j = 0; j < keys.length; j++) {
            if (Array.isArray(defaultPermissions.value[i][keys[j]])) {
                const verifiedList = [] as number[]
                const roleIds = defaultPermissions.value[i][keys[j]]
                for (let k = 0; k < roleIds.length; k++) {
                    if(roles.value.find(r => r.id == roleIds[k])) {
                        verifiedList.push(roleIds[k])
                    }
                }
                defaultPermissions.value[i][keys[j]] = verifiedList
            }
        }
    }
}

async function updateSettings() {
    submitLoading.value = true
    const permissions: any = {}
    for (let i = 0; i < defaultPermissions.value.length; i++) {
        permissions[defaultPermissions.value[i].key] = {
            read: defaultPermissions.value[i].read,
            modify: defaultPermissions.value[i].modify,
            delete: defaultPermissions.value[i].delete,
        }
    }

    if(prop.permissionType == "global") {
        await settings.UpdateSettings("default_permissions", permissions)
        submitLoading.value = false
    }
    else if (prop.permissionType == "user") {
        const newPreferences: any = {}
        Object.assign(newPreferences, auth.GetUserPreferences)
        newPreferences.default_permissions = permissions
        if (!includeUserDefault.value) {
            delete newPreferences.default_permissions["default"]
        }
        await auth.UpdateUser({preferences: newPreferences})
        submitLoading.value = false
    }
}

function permissionTypesChoices(type: string) {
    return permissionTypes.filter(p => p.value == type || !Object.keys(defaultPermissions).includes(p.value))
}

function addNewDefaultPermission() {
    defaultPermissions.value.push({
        key: "",
        read: [],
        modify: [],
        delete: [],
    })
}
</script>