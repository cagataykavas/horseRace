<script setup>
import { computed } from 'vue'
import { DISTANCES, FIELD_SIZE, progressAt } from '../domain/race.js'
import { useRaceStore } from '../stores/race.js'
import HorseSprite from './HorseSprite.vue'

const store = useRaceStore()
const lanes = computed(() => Array.from({ length: FIELD_SIZE }, (_, i) => {
  const runner = store.currentRound?.runners[i]
  return { lane: i + 1, horse: runner?.horse, progress: runner ? progressAt(runner, store.elapsedMs) : 0 }
}))
const finalAtLine = computed(() => store.currentRound && store.results.length > store.roundIndex)
const status = computed(() => {
  if (finalAtLine.value && store.phase === 'running') return 'Round finished'
  return { idle: 'Awaiting program', ready: 'Ready', running: 'Racing', paused: 'Paused', completed: 'All rounds finished' }[store.phase]
})
</script>

<template>
  <section class="panel track" aria-labelledby="track-heading">
    <div class="track-heading">
      <h2 id="track-heading">Race track</h2>
      <span class="status" :class="store.phase" role="status">
        <i aria-hidden="true"></i>{{ status }}<span v-if="store.currentRound" class="sr-only">, round {{ store.currentRound.number }} of {{ DISTANCES.length }}</span>
      </span>
    </div>
    <div class="course">
      <div class="track-key"><span>Lane</span><span>Finish</span></div>
      <ol class="lanes">
        <li v-for="entry in lanes" :key="entry.lane" class="lane">
          <span class="gate"><span class="gate-number">{{ entry.lane }}</span></span>
          <div class="runway">
            <div class="travel">
              <div v-if="entry.horse" :key="entry.horse.id" class="runner"
                :style="{ left: (entry.progress * 100) + '%', color: entry.horse.hex }"
                :aria-label="'Lane ' + entry.lane + ', ' + entry.horse.name"
                :title="entry.horse.name + ' · Condition ' + entry.horse.condition">
                <HorseSprite :lane="entry.lane" :started="store.elapsedMs > 0 && entry.progress < 1"
                  :moving="store.phase === 'running' && entry.progress < 1" />
                <span class="name-tag">{{ entry.horse.name.split(' ')[0] }}</span>
              </div>
            </div>
          </div>
        </li>
      </ol>
    </div>
    <footer class="round-summary">
      <div class="round-info">
        <span>Round <b>{{ store.currentRound?.number ?? '–' }}</b> of {{ DISTANCES.length }}</span>
        <strong>{{ store.currentRound ? store.currentRound.distance.toLocaleString('en-US') + ' m' : '– m' }}</strong>
      </div>
      <div class="round-strip" aria-hidden="true">
        <i v-for="(_, i) in DISTANCES" :key="i" :class="{ done: i < store.results.length, active: store.currentRound && i === store.roundIndex }"></i>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.lanes {
  display: grid; grid-template: repeat(10, minmax(0, 1fr)) / minmax(0, 1fr); position: relative; flex: 1; list-style: none; padding: 0;
  background: #edf0e6; border-block: 1px solid #c3c9bc;
}
.lanes::after { content: ''; position: absolute; right: var(--runoff); top: 0; bottom: 0; width: 2px; background: var(--finish); transform: translateX(1px); pointer-events: none; }
.lane { display: flex; flex-direction: row; align-items: stretch; min-height: 0; }
.lane + .lane { border-top: 1px dashed #a8b2a1; }
.lane:nth-child(even) { background: #e4e9df; }
.gate {
  flex: 0 0 var(--gate); display: grid; place-items: center; background: #476445; color: white;
  font-size: 14px; font-weight: 680; font-variant-numeric: tabular-nums;
  writing-mode: horizontal-tb; text-orientation: mixed; white-space: nowrap; transform: none;
}
.runway {
  flex: 1; min-width: 0; margin-right: var(--runoff); display: flex; align-items: center; position: relative;
  background: repeating-linear-gradient(90deg, transparent 0 calc(25% - 1px), #919d8c27 calc(25% - 1px) 25%);
}
.travel { position: absolute; left: 0; right: 50.4px; height: 100%; }
.runner { position: absolute; top: 50%; width: 54.4px; transform: translateY(-50%); }
.name-tag { display: block; text-align: center; color: #344335; font-size: 9px; line-height: 10px; font-weight: 620; }
.gate-number { display: inline-block; transform: rotate(-90deg); }
</style>
