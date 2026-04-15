export const gradientPresets = [
  {
    name: 'Ocean Blue',
    start: '#0066cc',
    end: '#00ccff',
    angle: '135deg',
  },
  {
    name: 'Azure Green',
    start: '#0066cc',
    end: '#00b386',
    angle: '135deg',
  },
  {
    name: 'Ocean Green',
    start: '#0052a3',
    end: '#00c853',
    angle: '135deg',
  },
  {
    name: 'Sunset',
    start: '#ff6b35',
    end: '#f7931e',
    angle: '135deg',
  },
  {
    name: 'Forest',
    start: '#134e5e',
    end: '#71b280',
    angle: '90deg',
  },
  {
    name: 'Purple Dream',
    start: '#667eea',
    end: '#764ba2',
    angle: '180deg',
  },
  {
    name: 'Coral Fire',
    start: '#ff6a88',
    end: '#ff8c42',
    angle: '45deg',
  },
  {
    name: 'Berry Mix',
    start: '#ee0979',
    end: '#ff6a00',
    angle: '90deg',
  },
]

export function createGradientStyle(start: string, end: string, angle: string = '45deg') {
  return `linear-gradient(${angle}, ${start}, ${end})`
}

export function getGradientPreset(name: string) {
  return gradientPresets.find((p) => p.name === name)
}
