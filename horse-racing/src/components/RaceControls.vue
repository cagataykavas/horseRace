<script setup>
import { computed } from 'vue'
import { useRaceStore } from '../stores/race.js'
const store = useRaceStore()
const label = computed(() => ({ running: 'Pause', paused: 'Resume', completed: 'Finished' })[store.phase] ?? 'Start')
</script>

<template>
  <header class="topbar">
    <h1><span class="flag-mark" aria-hidden="true"></span>Horse Racing</h1>
    <div class="controls">
      <button class="generate" @click="store.generateProgram">
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 5h3c4 0 5 10 9 10h3m-3-3 3 3-3 3M2 15h3c1.5 0 2.7-1.4 3.7-3.3M11 7.8c1-1.6 2-2.8 3-2.8h3m-3-3 3 3-3 3"/></svg>
        Generate program
      </button>
      <button class="toggle" :disabled="['idle', 'completed'].includes(store.phase)" @click="store.toggleRace">
        <svg viewBox="0 0 20 20" aria-hidden="true" fill="currentColor">
          <path v-if="store.phase === 'running'" d="M4 3h4v14H4zm8 0h4v14h-4z"/>
          <path v-else-if="store.phase === 'completed'" fill="none" stroke="currentColor" stroke-width="2" d="m3 10 4 4L17 4"/>
          <path v-else d="m5 3 12 7-12 7z"/>
        </svg>
        {{ label }}
      </button>
    </div>
  </header>
</template>
