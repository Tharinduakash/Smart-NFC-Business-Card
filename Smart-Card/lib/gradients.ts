export const gradientPresets = [
  {
    name: 'Ocean',
    start: '#0066cc',
    end: '#00ccff',
    angle: '45deg',
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
    name: 'Mint Green',
    start: '#00d2d3',
    end: '#54a0ff',
    angle: '135deg',
  },
  {
    name: 'Berry Mix',
    start: '#ee0979',
    end: '#ff6a00',
    angle: '90deg',
  },
  {
    name: 'Sky Gradient',
    start: '#667eea',
    end: '#764ba2',
    angle: '45deg',
  },
]

export function createGradientStyle(start: string, end: string, angle: string = '45deg') {
  return `linear-gradient(${angle}, ${start}, ${end})`
}

export function getGradientPreset(name: string) {
  return gradientPresets.find((p) => p.name === name)
}
