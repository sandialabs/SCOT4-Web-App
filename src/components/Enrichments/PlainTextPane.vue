<template>
    <div class="markdown-div">
        <v-textarea v-model="incomingProps.data.plaintext" readonly auto-grow variant="outlined"/>
    </div>
</template>


<script setup lang="ts">
const incomingProps = defineProps(['data'])
</script>