<template>
    <v-container v-if="incidentData == null && !isLoading" class="pane-container">
        <h3 class="text-center">No Associated Incident Details</h3>
    </v-container>
    <v-container v-else-if="incidentData != null && !isLoading" class="pane-container">
        <v-list v-if="incidentData.data_ver != 'incident'" class="bg-transparent" density="compact" slim>
            <v-list-item v-for="(item, index) in v2Fields" :key="index" density="compact">
                <v-select density="compact" hide-details :items="incidentChoicesV2[item]" :label="fieldNames[item]" v-model="incidentData.data[item]" @update:model-value="updateIncidentField('data')"/>
            </v-list-item>
            <v-list-item density="compact">
                <v-select density="compact" hide-details chips closable-chips multiple no-data-text="None" :items="ciaChoices" label="Confidentiality/Integrity/Availability" v-model="incidentData.data.cia" @update:model-value="updateIncidentField('data')"/>
            </v-list-item>
        </v-list>
        <v-list v-else class="bg-transparent" density="compact" slim>
            <v-list-item v-for="(item, index) in v1Fields" :key="index" density="compact">
                <v-select density="compact" hide-details :items="incidentChoicesV2[item]" :label="fieldNames[item]" v-model="incidentData.data[item]" @update:model-value="updateIncidentField('data')"/>
            </v-list-item>
        </v-list>
        <v-list class="bg-transparent" density="compact" slim>
            <v-list-item density="compact">
                <v-date-input label="Date/Time Occurred (local time)" clearable v-model="incidentData.occurred_date" @update:model-value="updateIncidentDateField('occurred_date')"/>
            </v-list-item>
            <v-list-item density="compact">
                <v-date-input label="Date/Time Discovered (local time)" clearable v-model="incidentData.discovered_date" @update:model-value="updateIncidentDateField('discovered_date')"/>
            </v-list-item>
            <v-list-item density="compact">
                <v-date-input label="Date/Time Reported (local time)" clearable v-model="incidentData.reported_date" @update:model-value="updateIncidentDateField('reported_date')"/>
            </v-list-item>
            <v-list-item v-for="(item, index) in extraIncidentFields()" :key="index" density="compact">
                <v-text-field density="compact" hide-details :label="item" v-model="incidentData.data[item]" @update:model-value="updateIncidentField('data')"/>
            </v-list-item>
        </v-list>
    </v-container>
    <v-container v-else>
        <LoadingCard />
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import LoadingCard from '../Loaders/LoadingCard.vue'
import { usePUT_APIStore } from '../../stores'
import { v2Fields, incidentChoicesV2, fieldNames, ciaChoices, v1Fields } from '@/types/incidents';
import { IRElementAPIPaths, IRElementType } from '@/types/irelement';

const incomingProps = defineProps(['data'])
const incidentData: any = ref(null)
const isLoading = ref(true)
const apiPUT = usePUT_APIStore()

onMounted(() => {
    incidentData.value = incomingProps.data
    //set default data
    if (incidentData.value.data_ver != "incident") {
        for (let i = 0; i < v2Fields.length; i++) {
            incidentData.value.data[v2Fields[i]] = getChoiceWithDefault(incidentData.value.data[v2Fields[i]], incidentChoicesV2[v2Fields[i]])
        }
    }
    else {
        for (let i = 0; i < v2Fields.length; i++) {
            incidentData.value.data[v2Fields[i]] = getChoiceWithDefault(incidentData.value.data[v2Fields[i]], incidentChoicesV2[v2Fields[i]])
        }
    }
    isLoading.value = false
})

function getChoiceWithDefault(value: string, choices: Array<string>) {
    if (!value) {
        return choices[0];
    }
    return value; // Give back value even if not in choices
}

async function updateIncidentField(fieldToUpdate: string) {
    await apiPUT.UpdateElementById(
        IRElementAPIPaths[IRElementType.Incident],
        incidentData.value.id, {
            [fieldToUpdate]: incidentData.value[fieldToUpdate]
        }
    )
}

async function updateIncidentDateField(fieldToUpdate: string) {
    const date = (incidentData.value[fieldToUpdate] as Date).toISOString()
    const dataKey = fieldToUpdate.substring(0, fieldToUpdate.length - 5) // Chop off the "_date" from the field name
    incidentData.value.data[dataKey] = date
    incidentData.value[fieldToUpdate] = date

    await apiPUT.UpdateElementById(
        IRElementAPIPaths[IRElementType.Incident],
        incidentData.value.id, {
            [fieldToUpdate]: date,
            data: incidentData.value.data
        }
    )
}

function extraIncidentFields() {
    return Object.keys(incidentData.value.data).filter(key => !Object.keys(fieldNames).includes(key))
}
</script>