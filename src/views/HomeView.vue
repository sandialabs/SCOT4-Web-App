<template>
  <div class="text-center pt-5" v-if="!isLoading">
    <img class="scot-logo-background text-center" src="../assets/scot-logo.png" />
    <v-row>
      <v-col class="active-user-panel pa-2 ma-4">
        <h3 class="text-center">Active Users</h3>
        <v-chip-group column>
          <v-chip class="grey py-5 pr-0" label v-for="user in orderedUserActivityKeys" :key="user">
            <span class="mr-2">{{ user }} </span>
            <v-chip v-if="!isLoadingActivityChip" small>{{ userTimeString(userActivity[user]) }}</v-chip>
            <LoadingSingleLine v-else />
          </v-chip>

        </v-chip-group>
      </v-col>
      <v-col>
        <h3 class="text-center">Welcome to SCOT!</h3>
      </v-col>
      <v-col class="game-panel pa-2 ma-4">
        <h3 class="text-center">Leaderboard</h3>
        <v-carousel v-if="gameResults.length > 0" class="game-carousel" cycle hide-delimiters hide-delimiter-background :show-arrows="false" height="100%">
          <v-carousel-item v-for="result in gameResults" :key="result.name">
            <div class="text-h6 text-center">{{ result.name }} - {{ result.tooltip }}</div>
            <v-list class="game-carousel">
              <v-list-item dense class="game-list-item" v-for="(count, user, index) in result.results" :key="user">
                <span class="text-body-1">
                  <span v-if="index == 0">&#x1F947;</span>
                  <span v-if="index == 1">&#x1F948;</span>
                  <span v-if="index == 2">&#x1F949;</span>
                  {{ user }}
                  <v-chip>{{ count }}</v-chip>
                </span>
              </v-list-item>
            </v-list>
          </v-carousel-item>
        </v-carousel>
        <LoadingSingleLine v-else-if="isLoadingGameCarousel"></LoadingSingleLine>
        <div v-else>No leaderboard results</div>
      </v-col>
    </v-row>
  </div>
  <LoadingApplication v-else />
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, computed } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUser, faGear, faKey, faClipboard, faTasks } from '@fortawesome/free-solid-svg-icons'
import { useGET_APIStore } from '@/stores';
import LoadingApplication from '@/components/Loaders/LoadingApplication.vue';
import LoadingSingleLine from '@/components/Loaders/LoadingSingleLine.vue';

const API_GET = useGET_APIStore()
let isLoading = ref(false)
let isLoadingActivityChip = ref(false)
let isLoadingGameCarousel = ref(false)
let userActivity = ref({})
let gameResults = ref([])
let intervalTimer = ref()

onMounted(() => {
  isLoadingActivityChip.value = true
  GetGameResults()
  GetUserActivity()
  intervalTimer.value = setInterval(GetUserActivity, 30000)
})

onUnmounted(() => {
  clearInterval(intervalTimer.value)
})

const orderedUserActivityKeys = computed(() => {
  return Object.keys(userActivity.value).sort((a: string, b: string) => (userActivity.value[b] > userActivity.value[a]) ? 1 : ((userActivity.value[a] > userActivity.value[b]) ? -1 : 0))
})

function GetUserActivity() {
  API_GET.GET_UserActivity()
    .then((v: any) => {
      userActivity.value = v
    }).finally(() => {
      isLoadingActivityChip.value = false
    })
}

function GetGameResults() {
    isLoadingGameCarousel.value = true
    API_GET.GET_GameResults()
        .then((v: any) => {
            gameResults.value = v
        })
        .finally(() => {
            isLoadingGameCarousel.value = false
        })
}

function userTimeString(time: string) {
  let activeTime = new Date(time)
  let secDiff = Math.abs(new Date().getTime() - activeTime.getTime()) / 1000
  if (secDiff > 120) {
    return Math.round(secDiff / 60).toString() + " minutes"
  }
  else {
    return Math.ceil(secDiff).toString() + " seconds"
  }
}

</script>
<style>
    .game-list-item {
        align-content: center;
        text-align: center;
    }

    .scot-theme-light .game-panel {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .scot-theme-dark .active-user-panel {
        background-color: rgb(40, 40, 40);
        color: rgb(250, 250, 250);
    }

    .scot-theme-light .active-user-panel {
        background-color: rgba(0, 0, 0, 0.1);
    }

    .scot-theme-dark .game-panel {
        background-color: rgb(40, 40, 40);
        color: rgb(250, 250, 250);
    }

    .game-panel {
        padding: 12px;
        height: 50%;
        max-height: 300px;
        border-radius: 8px;
    }

    .active-user-panel {
        padding: 12px;
        height: 50%;
        border-radius: 8px;
    }

    .game-carousel {
        max-height: 200px;
    }

    .scot-theme-light .game-carousel {
        background-color: rgb(250, 250, 250) !important;
    }

    .scot-theme-dark .game-carousel {
        background-color: rgb(30, 30, 30) !important;
    }

    .active-user-panel .v-slide-group__content {
        justify-content: center;
    }
</style>