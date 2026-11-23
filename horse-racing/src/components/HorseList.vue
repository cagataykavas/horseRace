<script setup>
defineProps({ horses: { type: Array, required: true } })
</script>

<template>
  <section class="panel roster" aria-labelledby="roster-title">
    <div class="panel-heading yellow">
      <h2 id="roster-title">Horse list</h2><span class="count">{{ horses.length }}</span>
    </div>
    <div class="roster-scroll" tabindex="0" aria-label="Horse list table">
      <table>
        <thead><tr><th scope="col">Name</th><th scope="col">Condition</th><th scope="col">Color</th></tr></thead>
        <tbody>
          <tr v-for="horse in horses" :key="horse.id">
            <td>{{ horse.name }}</td><td class="condition">{{ horse.condition }}</td>
            <td><span class="silk"><i :style="{ background: horse.hex }"></i>{{ horse.colorName }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
