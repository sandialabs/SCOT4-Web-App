<template>
    <v-card :title="type == 'AuthEdit' ? 'Edit Authentication Method' : 'New Authentication Method'">
        <v-card-text>
            <v-form v-model="formValid" validate-on="input">
                <v-container>
                    <v-row>
                        <v-col v-if="type == 'AuthEdit'">
                            <v-text-field v-model="selectedAuthMethod.id" readonly label="ID"/>
                        </v-col>
                        <v-col>
                            <v-select v-model="selectedAuthMethod.auth" :items="authTypes" :readonly="type == 'AuthEdit'" label="Type" @update:model-value="defaultValues"/>
                        </v-col>
                    </v-row>
                    <span v-if="selectedAuthMethod.auth_properties">
                        <span v-for="property in Object.keys(selectedAuthMethod.auth_properties)" :key="property">
                            <v-checkbox
                                v-if="typeof selectedAuthMethod.auth_properties[property] === 'boolean' || booleanFieldNames.includes(property)"
                                v-model="selectedAuthMethod.auth_properties[property]"
                                :label="authPrettyNames[selectedAuthMethod.auth][property] || property"
                                :hint="authConfigHelp[selectedAuthMethod.auth][property]"
                            />
                            <v-text-field
                                v-else
                                v-model="selectedAuthMethod.auth_properties[property]"
                                :label="authPrettyNames[selectedAuthMethod.auth][property] || property"
                                :hint="authConfigHelp[selectedAuthMethod.auth][property]"
                            />
                        </span>
                    </span>
                </v-container>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn @click="submit" color="green" :loading="submitLoading" :text="type == 'AuthEdit' ? 'Save Changes' : 'Create'"/>
            <v-btn @click="Dialog.ToggleDialog()" text="Cancel"/>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue';
import { useGET_APIStore, usePUT_APIStore, useDialogStore, usePOST_APIStore } from '@/stores';
import { AuthType } from '@/types/irelement';

const Dialog = useDialogStore()
const getAPI = useGET_APIStore()
const putAPI = usePUT_APIStore()
const postAPI = usePOST_APIStore()
const incomingProps = defineProps(['params'])
const emit = defineEmits(['RefreshSelectedView'])
const type = ref("")
const formValid = ref(true)
const selectedAuthMethod = reactive({} as any)
const submitLoading = ref(false)
const authTypes = ref([])
const authConfigHelp = reactive({})
const authPrettyNames = reactive({})

const booleanFieldNames = ["group_autocreate", "un_email_usernames"]

onMounted(async () => {
    const data = await getAPI.GET_AuthenticationHelp()
    if (data) {
        Object.assign(authConfigHelp, data.config_help)
        Object.assign(authPrettyNames, data.config_name_pretty)
    }

    const keys = Object.keys(AuthType)
    const values = Object.values(AuthType)
    for (let i = 0; i < keys.length; i++) {
        authTypes.value.push({
            title: keys[i],
            value: values[i],
        })
    }

    if (incomingProps.params) {
        Object.assign(selectedAuthMethod, incomingProps.params.authentication)
        defaultValues()
        Object.assign(selectedAuthMethod.auth_properties, incomingProps.params.authentication.auth_properties)
        type.value = "AuthEdit"
    }
    else {
        Object.assign(selectedAuthMethod, {auth: "", auth_properties: {}})
        type.value = "AuthNew"
    }
})

async function submit() {
    if (formValid.value) {
        submitLoading.value = true
        let succeeded: any = false
        if (type.value == "AuthEdit") {
            succeeded = await putAPI.UpdateAuthentication(selectedAuthMethod.id, {auth_properties: selectedAuthMethod.auth_properties})  
        }
        else {
            succeeded = await postAPI.POST_CreateAuthentication(selectedAuthMethod)
        }
        submitLoading.value = false
        if (succeeded) {
            emit('RefreshSelectedView', true)
            Dialog.ToggleDialog()
        }
    }
}

function defaultValues() {
    selectedAuthMethod.auth_properties = {}
    const keys = Object.keys(authConfigHelp[selectedAuthMethod.auth])
    for (let i = 0; i < keys.length; i++) {
        selectedAuthMethod.auth_properties[keys[i]] = ""
    } 
}
</script>