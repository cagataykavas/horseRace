<script setup>
import { ref, watch } from 'vue'
import { DISTANCES } from '../domain/race.js'
const props = defineProps({
  kind: { type: String, required: true },
  rounds: { type: Array, required: true },
  current: Number,
})
const scroller = ref(null)
watch([() => props.current, () => props.rounds], () => {
  const container = scroller.value
  if (!container) return
  const active = container.querySelector('[aria-current="step"]')
  container.scrollTop = active ? active.offsetTop : 0
}, { flush: 'post' })
</script>

<template>
  <section class="panel board" :aria-label="kind === 'program' ? 'Program' : 'Results'">
    <div class="panel-heading" :class="kind === 'program' ? 'blue' : 'green'">
      <h2>{{ kind === 'program' ? 'Program' : 'Results' }}</h2>
      <span class="count">{{ rounds.length }}<template v-if="kind === 'results'"> / {{ DISTANCES.length }}</template></span>
    </div>
    <div v-if="rounds.length" class="round-scroll" tabindex="0" :aria-label="kind + ' rounds'" ref="scroller">
      <section v-for="round in rounds" :key="round.number" class="round-block"
        :aria-current="round.number === current ? 'step' : undefined" :aria-label="'Round ' + round.number">
        <h3><span>Round {{ round.number }}</span><span>{{ round.distance }} m</span></h3>
        <table>
          <thead><tr><th scope="col">{{ kind === 'program' ? 'Lane' : 'Place' }}</th><th scope="col">Name</th></tr></thead>
          <tbody>
            <tr v-for="(runner, i) in round.runners" :key="runner.horse.id" :class="{ winner: kind === 'results' && i === 0 }">
              <td>{{ kind === 'program' ? runner.lane : i + 1 }}</td><td>{{ runner.horse.name }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
    <div v-else class="empty-board">
      <svg v-if="kind === 'program'" viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8m-8 4h5"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h10v6a5 5 0 0 1-10 0zM7 5H3v2a5 5 0 0 0 5 5m9-7h4v2a5 5 0 0 1-5 5m-4 2v5m-5 2h10"/>
      </svg>
      <strong>{{ kind === 'program' ? 'No program yet' : 'Awaiting results' }}</strong>
      <p>{{ kind === 'program' ? 'Generate a program to draw the six rounds.' : 'Standings appear when each round finishes.' }}</p>
    </div>
  </section>
</template>
