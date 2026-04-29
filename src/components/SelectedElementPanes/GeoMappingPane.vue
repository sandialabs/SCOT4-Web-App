<template>
    <v-card elevation="2" style="width: 80%; margin: 0 auto;">
        <v-card-text>
            <LoadingIRElement v-if="isLoading"/>
            <v-expansion-panels v-else flat v-model="panels">
                <v-expansion-panel static>
                    <v-expansion-panel-title class="text-h5 pa-0">
                        Select IP Addresses
                        <v-btn class="ml-2" icon="mdi-checkbox-multiple-marked-outline" variant="text" rounded="0" v-tooltip:right="'Select all IPs for mapping'" @click.stop="toggleSelectAll()"/>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-list v-model:selected="selectedEntities" select-strategy="classic" max-height="300px" density="compact">
                            <v-list-item
                                v-for="ipData in validIpGeoData"
                                :key="ipData.id"
                                :title="`${ipData.label} (${ipData.city}, ${ipData.country})`"
                                :value="ipData.id"
                            >
                                <template v-slot:prepend="{isSelected, select}">
                                    <v-list-item-action start>
                                        <v-checkbox-btn color="green-darken-2" :model-value="isSelected" @update:model-value="select"/>
                                    </v-list-item-action>
                                </template>
                            </v-list-item>
                        </v-list>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
            <v-alert v-if="errorMessage.length > 0" :text="errorMessage" type="error"/>
            <div id="map" class="mt-4" style="height: 400px; width: 100%; padding: 10px;"></div>
        </v-card-text>
        <v-card-actions>
            <v-spacer/>
            <v-btn class="hover-button" :loading="isSubmitting " color="primary" rounded="lg" elevation="10" @click="submitEntry()">
                Add Map As Entry
            </v-btn>
            <v-btn class="hover-button" @click="Dialog.ToggleDialog()" color="red" rounded="lg" elevation="10">
                Close
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import LoadingIRElement from '../Loaders/LoadingIRElement.vue';
import { useDialogStore, useGET_APIStore, usePOST_APIStore } from '@/stores'
import { EntryGeoLocation } from '@/models'
import { toPng } from 'html-to-image';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Dialog = useDialogStore()
const API_GET = useGET_APIStore()
const API_POST = usePOST_APIStore()

const errorMessage = ref("")
let isLoading = ref(true)
let incomingProps = defineProps(['params'])
let target_id = ref(-1)
let target_type = ref("")
let ipAddresses = ref([] as any[])
let selectedEntities = ref([] as number[])
let validIpGeoData = ref([])
const isSubmitting = ref(false)
let map: L.Map | null = null;
const panels = ref(0)

onMounted(() => {
    ipAddresses.value = incomingProps.params.ipAddresses
    target_id.value = incomingProps.params.target_id
    target_type.value = incomingProps.params.target_type
    FetchEnrichmentData()
})

watch(
    () => selectedEntities.value,
    () => {
        GenerateMap()
    }
)

function toggleSelectAll() {
    if (selectedEntities.value.length == validIpGeoData.value.length) {
        selectedEntities.value = []
    }
    else {
        selectedEntities.value = validIpGeoData.value.map(a => a.id)
    }
}

function GenerateMap() {
    const locations = validIpGeoData.value.filter(ip => selectedEntities.value.includes(ip.id));

    if (!map) {
        map = L.map('map').setView([0, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);
        map.invalidateSize();
    }
    else {
        //clear existing markers
        map.eachLayer((layer: any) => {
            if (layer instanceof L.Marker && map) {
                map.removeLayer(layer);
            }
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map)
    };

    const markerPositions: [number, number][] = [];
    locations.forEach(ip => {
        L.marker([ip.latitude, ip.longitude]).addTo(map).bindPopup(`${ip.label}<br>${ip.city}, ${ip.country}`);
        markerPositions.push([ip.latitude, ip.longitude]);
    });

    if (markerPositions.length > 0) {
        map.fitBounds(markerPositions);
    }
    map.invalidateSize();
}

async function FetchEnrichmentData() {
    errorMessage.value = ""
    for (let i = 0; i < ipAddresses.value.length; i++) {
        await API_GET.GET_EnrichmentById(ipAddresses.value[i].id)
            .then((v) => {
                if (v["Geo IP Summary"] && v["Geo IP Summary"].length > 0) {
                    const geoInfo: any = ParseMarkdown(v["Geo IP Summary"][0].data.markdown);
                    if (geoInfo.lat && geoInfo.long) {
                        validIpGeoData.value.push(new EntryGeoLocation(
                            ipAddresses.value[i].id,
                            geoInfo.city,
                            geoInfo.country,
                            geoInfo.lat,
                            geoInfo.long,
                            geoInfo.isp,
                            ipAddresses.value[i].id,
                            ipAddresses.value[i].value
                        ))
                    }
                }
            })
    }
    isLoading.value = false
    if (validIpGeoData.value.length == 0) {
        errorMessage.value = "No IP addresses with geographical information found."
    }
    GenerateMap()
}

function ParseMarkdown(markdown: string) {
    const lines = markdown.split('\n');
    const geoInfo: Record<string, any> = {};
    lines.forEach(line => {
        const parts = line.split('|').map(part => part.trim());
        if (parts.length === 4) {
            const key = parts[1];
            const value = parts[2];
            geoInfo[key] = value;
        }
    });
    return geoInfo;
}

async function submitEntry() {
    const mapContainer = document.getElementById("map"); // Get the map container
    if (mapContainer && target_id.value != -1 && target_type.value != "") {
        isSubmitting.value = true
        try {
            // some browsers have issues with the fonts so skip them
            const dataUrl = await toPng(mapContainer, {skipFonts: true})
            // Prepare the data structure for the entry
            API_POST.POST_AddEntry({
                target_id: target_id.value,
                target_type: target_type.value,
                entry_data: {
                    html: `<img src="${dataUrl}" alt="Map Image" />` // Wrap the Base64 data in an <img> tag
                }
            }).then(() => {
                errorMessage.value = ""
                Dialog.ToggleDialog()
            }).catch((error) => {
                errorMessage.value = `Error sending data to API. ${error}`
                isSubmitting.value = false
            })
        } catch (error) {
            errorMessage.value = `Error capturing the map. ${error}`
            isSubmitting.value = false
        }
    } else {
        errorMessage.value = "Error building mapping form."
    }
}
</script>
