import { watch } from 'vue'

// Vue stops this watcher on unmount. Each running interval owns exactly one frame.
export function useRaceClock(store) {
  watch(() => store.phase, (phase, previous, onCleanup) => {
    if (phase !== 'running') return
    let last = performance.now()
    let id
    function frame(now) {
      store.advance(now - last)
      last = now
      if (store.phase === 'running') id = requestAnimationFrame(frame)
    }
    id = requestAnimationFrame(frame)
    onCleanup(() => cancelAnimationFrame(id))
  }, { flush: 'sync', immediate: true })
}
