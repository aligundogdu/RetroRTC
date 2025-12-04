// Post-it notları için renkler
export const postItColors = [
    'bg-postit-yellow',
    'bg-postit-pink',
    'bg-postit-blue',
    'bg-postit-green',
    'bg-postit-orange',
    'bg-postit-purple',
    'bg-postit-teal',
    'bg-postit-lime',
]

// Katılımcılar için renk paleti
export const participantColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
    '#E63946', '#457B9D', '#F77F00', '#06FFA5', '#8338EC'
]

export function getParticipantColor(index: number): string {
    return participantColors[index % participantColors.length]
}

export function getRandomPostItColor(): string {
    return postItColors[Math.floor(Math.random() * postItColors.length)]
}
