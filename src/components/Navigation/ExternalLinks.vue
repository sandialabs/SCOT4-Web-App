<template>
    <div>
        <v-divider class="m-0" />
        <v-list-item target="_blank" link href="https://github.com/sandialabs/scot4/discussions">
            <v-list-item-title class="ms-2">Github Discussions</v-list-item-title>
            <template v-slot:prepend>
                <FontAwesomeIcon :icon="faComment" />
            </template>
        </v-list-item>
    </div>
</template>

<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
</script>