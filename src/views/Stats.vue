<template>
    <v-container fluid style="max-height: 100%" class="overflow-y-auto">
        <StatsPane />
    </v-container>

</template>

<script lang="ts">
    import { Component, Vue } from 'vue-property-decorator'
    import StatsPane from '@/components/StatsComponents/StatsPane.vue'
    import { default_title } from '@/constants';

    @Component({
        components: {
            StatsPane
        },
    })

    export default class StatsView extends Vue {
        mounted() {
            document.title = default_title
        }
    }

</script>
