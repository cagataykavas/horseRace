<script setup>
defineProps({
  lane: { type: Number, required: true },
  moving: Boolean,
  started: Boolean,
})
</script>

<template>
  <svg class="horse" :class="{ started, moving }" viewBox="0 0 68 46" fill="currentColor" aria-hidden="true">
    <g class="dust" fill="#aaa48f"><circle cx="5" cy="39" r="2"/><circle cx="2" cy="36" r="1.5"/></g>
    <g class="body">
      <path class="tail" d="M16 17C9 15 4 21 3 29c4-2 7-5 12-7z"/>
      <g opacity=".72">
        <path class="back inner" d="m22 25-3 9-2 8h3l3-8 2-9z"/>
        <path class="front inner" d="m42 25 2 9 2 8h3l-2-9-2-8z"/>
      </g>
      <path d="M16 18c0-4 7-5 16-4 7 .5 12 0 16 2l-1 10c-6 1.5-19 1.5-28 0-3-1-4-5-3-8z"/>
      <path d="m27 14.2 10 .2-1 7.1-9.5-.3z" fill="#fff" fill-opacity=".94"/>
      <text x="31.8" y="19.8" text-anchor="middle" font-size="6" font-weight="800" fill="#242822">{{ lane }}</text>
      <g class="head">
        <path d="M43 16c3-5 7-9 11-10l2-2.5 1.5 3 5.5 5c.8 1 0 3-1.8 3.3l-4.7-.3c-2.5 3-5.5 7-9.5 9.5z"/>
        <circle cx="57.6" cy="9.3" r=".9" fill="#272820"/>
      </g>
      <path class="back" d="m19 25-4 8-2 9h3.2l3.3-8 3-9z"/>
      <path class="front" d="m44 25 4 8 3 9h3.2L51 32l-3.5-7z"/>
    </g>
  </svg>
</template>

<style scoped>
.horse { width: 54.4px; height: 36.8px; display: block; overflow: visible; }
.body { transform-origin: 34px 22px; }
.head { transform-origin: 45px 19px; }
.tail { transform-origin: 16px 17px; }
.back { transform-origin: 20px 25px; }
.front { transform-origin: 45px 25px; }
.dust { opacity: 0; }
.started .body { animation: pitch .34s infinite ease-in-out; }
.started .head { animation: nod .34s infinite ease-in-out; }
.started .tail { animation: wave .34s infinite ease-in-out; }
.started .front, .started .back.inner { animation: stride .34s infinite ease-in-out alternate; }
.started .back, .started .front.inner { animation: stride .34s infinite ease-in-out alternate-reverse; }
.started .dust { animation: kick .34s infinite ease-out; }
.started:not(.moving) * { animation-play-state: paused; }
.started:not(.moving) .dust { visibility: hidden; }
@keyframes pitch { 25% { transform: translateY(-2px) rotate(-3deg); } 75% { transform: translateY(1px) rotate(2deg); } }
@keyframes nod { 50% { transform: rotate(5deg); } }
@keyframes wave { 50% { transform: rotate(14deg); } }
@keyframes stride { from { transform: rotate(-32deg); } to { transform: rotate(34deg); } }
@keyframes kick { from { transform: translateX(0); opacity: .85; } to { transform: translate(-7px,-3px); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .horse.started * { animation: none; } }
</style>
