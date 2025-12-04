// Eğlenceli ve yaratıcı takma isimler
const adjectives = [
    'Kozmik', 'Ninja', 'Kuantum', 'Epik', 'Gizemli', 'Süper', 'Mega', 'Ultra',
    'Galaktik', 'Sihirli', 'Elektrik', 'Neon', 'Turbo', 'Hiper', 'Mistik',
    'Fantastik', 'Karizmatik', 'Efsane', 'Parlak', 'Gökkuşağı', 'Yıldız',
    'Şimşek', 'Gök Gürültüsü', 'Rüzgar', 'Ateş', 'Buz', 'Kristal', 'Altın',
    'Gümüş', 'Bronz', 'Elmas', 'Zümrüt', 'Yakut', 'Safir'
]

const nouns = [
    'Panda', 'Kaplumbağa', 'Muz', 'Unicorn', 'Ejderha', 'Feniks', 'Kaplan',
    'Aslan', 'Kartal', 'Şahin', 'Yunus', 'Köpekbalığı', 'Penguen', 'Koala',
    'Kedi', 'Köpek', 'Tilki', 'Kurt', 'Ayı', 'Tavşan', 'Sincap', 'Rakun',
    'Panter', 'Jaguar', 'Çita', 'Leopar', 'Gorilla', 'Orangutan', 'Şempanze',
    'Fil', 'Gergedan', 'Zürafa', 'Zebra', 'Hipopotam', 'Timsah', 'Piton',
    'Kobra', 'Atmaca', 'Baykuş', 'Papağan', 'Flamingo', 'Pelikan'
]

export function generateRandomNickname(): string {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    const number = Math.floor(Math.random() * 99) + 1

    return `${adjective} ${noun} ${number}`
}

export function generateNicknames(count: number): string[] {
    const nicknames = new Set<string>()

    while (nicknames.size < count) {
        nicknames.add(generateRandomNickname())
    }

    return Array.from(nicknames)
}
