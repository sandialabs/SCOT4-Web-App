<template>
    <v-card v-if="!isLoading" elevation="0" title="Profile Information">
        <v-card-text>
            <v-form v-model="formIsValid">
                <v-row>
                    <v-col>
                        <v-text-field disabled v-model="userData.id" readonly label="ID" />
                    </v-col>
                    <v-col>
                        <v-text-field v-model="userData.username" readonly label="Username" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="userData.fullname" label="Full Name" />
                    </v-col>
                    <v-col>
                        <v-text-field v-model="userData.email" label="Email" />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col>
                        <v-text-field v-model="newPassword" type="password" label="New Password" />
                    </v-col>
                    <v-col>
                        <v-text-field v-model="newPasswordConfirm" :rules="[PasswordsMustMatch]" type="password" label="Confirm Password" />
                    </v-col>
                </v-row>
                <span class="subheading">Roles:</span>
                <v-chip-group column v-if="userData.roles?.length > 0">
                    <v-chip v-for="role in userData.roles" :key="role.id">
                        {{ role.name }}
                    </v-chip>
                </v-chip-group>
                <span v-else class="subheading"><br/>No roles assigned.</span>
            </v-form>
        </v-card-text>
        <v-card-actions>
            <v-btn @click="SaveUserProfile" color="success" rounded="lg" elevation="1" variant="outlined" :loading="isLoadingSave">
                <FontAwesomeIcon :icon="faSave" />&nbsp;Save Changes
            </v-btn>
        </v-card-actions>
    </v-card>
    <LoadingCard v-else />
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import LoadingCard from '../Loaders/LoadingCard.vue';
import { useAuthStore } from '@/stores'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave} from '@fortawesome/free-solid-svg-icons'

const userData: any = ref({})
const formIsValid: any = ref(true)
const isLoading: any = ref(true)
const isLoadingSave: any = ref(false)
const newPassword: any = ref("")
const newPasswordConfirm: any = ref("")

const Auth = useAuthStore()

onMounted(() => {
    userData.value = Auth.GetUser
    isLoading.value = false
})

function PasswordsMustMatch() {
    if (newPassword.value !== newPasswordConfirm.value) {
        return 'Passwords must match'
    } else {
        return true
    }
}

async function SaveUserProfile() {
    if (formIsValid.value) {
        isLoadingSave.value = true

        await Auth.UpdateUser({
            'fullname': userData.value.fullname,
            'email': userData.value.email,
            'password': newPasswordConfirm.value || null
        })

        isLoadingSave.value = false
    }
}
</script>
