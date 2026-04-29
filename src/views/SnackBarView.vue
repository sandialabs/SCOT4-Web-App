<template>
    <v-snackbar multi-line :model-value="SnackBar.GetSnackbarActive" @update:model-value="SnackBar.ToggleSnackbar(null)">
        <template v-slot:text>
            {{ SnackBar.GetSnackbarMessage }}
        </template>
        <template v-slot:actions>
            <v-btn color="red" variant="text" @click="SnackBar.ToggleSnackbar(null)">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script setup lang="ts">
import { useSnackBarStore } from '@/stores/snackbar';

const SnackBar = useSnackBarStore()



</script>