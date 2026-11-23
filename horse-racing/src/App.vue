<script setup>
import RaceControls from './components/RaceControls.vue'
import HorseList from './components/HorseList.vue'
import RaceTrack from './components/RaceTrack.vue'
import RoundPanel from './components/RoundPanel.vue'
import { useRaceClock } from './composables/useRaceClock.js'
import { useRaceStore } from './stores/race.js'

const store = useRaceStore()
useRaceClock(store)
</script>

<template>
  <RaceControls />
  <main class="dashboard">
    <HorseList :horses="store.horses" />
    <RaceTrack />
    <div class="boards">
      <RoundPanel kind="program" :rounds="store.schedule" :current="store.currentRound?.number" />
      <RoundPanel kind="results" :rounds="store.results" :current="store.results.length" />
    </div>
  </main>
</template>
