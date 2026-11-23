const HORSE_NAMES = [
  'Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton', 'Joan Clarke',
  'Katherine Johnson', 'Hedy Lamarr', 'Radia Perlman', 'Barbara Liskov',
  'Frances Allen', 'Shafi Goldwasser', 'Jean Bartik', 'Betty Holberton',
  'Marlyn Meltzer', 'Ruth Teitelbaum', 'Kathleen Antonelli', 'Evelyn Boyd',
  'Annie Easley', 'Carol Shaw', 'Adele Goldberg', 'Karen Sparck Jones',
]

const SILKS = [
  ['Crimson', '#DC2626'], ['Royal Blue', '#2563EB'], ['Amber', '#B56608'],
  ['Emerald', '#06835E'], ['Purple', '#7C3AED'], ['Teal', '#0D9488'],
  ['Rose', '#E11D48'], ['Indigo', '#4F46E5'], ['Orange', '#D65E08'],
  ['Cyan', '#07849F'], ['Lime', '#639316'], ['Fuchsia', '#BA26CB'],
  ['Brown', '#78350F'], ['Navy', '#1E3A8A'], ['Olive', '#4D671F'],
  ['Coral', '#EC7952'], ['Violet', '#662B9E'], ['Slate', '#475569'],
  ['Magenta', '#C12973'], ['Forest', '#166534'],
]

export function shuffled(items, random = Math.random) {
  const copy = [...items]
  for (let end = copy.length - 1; end > 0; end--) {
    const pick = Math.floor(random() * (end + 1))
    const last = copy[end]
    copy[end] = copy[pick]
    copy[pick] = last
  }
  return copy
}

export function generateHorses(random = Math.random) {
  const colors = shuffled(SILKS, random)
  const entries = HORSE_NAMES.map((name, index) => ({ id: index + 1, name }))
  return shuffled(entries, random).map(({ id, name }, index) => {
    const [colorName, hex] = colors[index]
    return {
      id, name, colorName, hex,
      condition: 1 + Math.floor(random() * 100),
    }
  })
}
