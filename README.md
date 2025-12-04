<p align="center">
  <h1 align="center">🎯 RetroRTC</h1>
  <p align="center">
    <strong>Serverless, Privacy-First Retrospective Tool</strong><br>
    <em>Sunucusuz, Gizlilik Odaklı Retrospektif Aracı</em>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-4.x-00DC82?style=flat-square&logo=nuxt.js" alt="Nuxt 4">
  <img src="https://img.shields.io/badge/Vue-3.x-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/WebRTC-P2P-FF6B6B?style=flat-square" alt="WebRTC">
  <img src="https://img.shields.io/badge/Backend-None!-success?style=flat-square" alt="No Backend">
</p>

---

## 🇬🇧 English

### 📜 Manifesto

> **"Your ideas are yours. Your data should be too."**

RetroRTC is designed to let teams run their retrospective meetings freely. A fully peer-to-peer (P2P) retrospective tool that doesn't need central servers, third-party services, or registration forms.

#### Why RetroRTC?

- 🔒 **Privacy First**: No data is sent to our servers. All data lives only in participants' browsers.
- 🎭 **Anonymous Participation**: Share your ideas freely with fun nicknames like "Cosmic Panda 42" or "Ninja Unicorn 7".
- ⚡ **Zero Setup**: No registration, no downloads, no configuration. Just share a link and start.
- 🌐 **P2P Architecture**: Host and participants communicate directly with each other. No server in between.
- 💾 **Full Control**: Retrospective data stays in your browser. Delete or export anytime you want.

---

### ✨ Features

| Feature | Description |
|---------|-------------|
| 🔄 **Real-time Sync** | Instant note sharing over WebRTC |
| 🎭 **Anonymous/Named Mode** | Choose participation mode based on team preference |
| 📝 **Customizable Columns** | Default or custom column names |
| 🎨 **Colorful Post-it Notes** | 8 different pastel color options |
| ❤️ **Like System** | Vote on notes to highlight important ideas |
| 🎬 **Presentation Mode** | Special view for presenting retro results |
| 📥 **Markdown Export** | Export results in `.md` format |
| 👥 **Participant Tracking** | View connected participants and their roles |

---

### 🎮 How It Works?

```
┌─────────────────────────────────────────────────────────────────┐
│                      RETROSPECTIVE FLOW                         │
└─────────────────────────────────────────────────────────────────┘

  1️⃣ CREATE                2️⃣ SHARE                3️⃣ JOIN
  ┌─────────┐              ┌─────────┐             ┌─────────┐
  │  Host   │    Link      │  Team   │   Click    │  Join   │
  │ Creates │ ──────────▶  │ Members │ ─────────▶ │   As    │
  │  Retro  │              │         │            │  Guest  │
  └─────────┘              └─────────┘             └─────────┘
       │                                                │
       │                                                │
       ▼                                                ▼
  ┌─────────────────────────────────────────────────────────┐
  │                  4️⃣ START THE RETRO!                     │
  │                                                         │
  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
  │  │ What     │  │ What Could   │  │ Action           │  │
  │  │ Went     │  │ Be           │  │ Items            │  │
  │  │ Well     │  │ Improved     │  │                  │  │
  │  │ 📝 Note 1│  │ 📝 Note 3    │  │ 📝 Note 5        │  │
  │  │ 📝 Note 2│  │ 📝 Note 4    │  │ 📝 Note 6        │  │
  │  └──────────┘  └──────────────┘  └──────────────────┘  │
  └─────────────────────────────────────────────────────────┘
                              │
                              ▼
                    5️⃣ EXPORT (Markdown)
```

#### Step by Step Usage

1. **Create a Retrospective**
   - Fill out the "Create New Retrospective" form on the home page
   - Enter a retrospective name (e.g., "Sprint 24 Retrospective")
   - Choose Anonymous or Named mode
   - Customize columns or use defaults

2. **Share the Link**
   - Share the unique generated link with team members
   - Everyone can join by clicking the same link

3. **Add Notes**
   - Add notes to relevant columns
   - Your notes sync instantly with all participants
   - You can edit or delete your own notes

4. **Like and Discuss**
   - Give ❤️ to notes you find important
   - Like counts help prioritize ideas

5. **Export Results**
   - Download in Markdown format with the Export button
   - Choose to include likes and author information

---

### 🛠 Tech Stack

| Technology | Version | Description |
|------------|---------|-------------|
| [Nuxt](https://nuxt.com) | 4.x | Vue meta-framework |
| [Vue](https://vuejs.org) | 3.x | Reactive UI framework |
| [PeerJS](https://peerjs.com) | 1.5.x | WebRTC abstraction layer |
| [TailwindCSS](https://tailwindcss.com) | 3.x | Utility-first CSS |

---

### 🚀 Installation & Running

#### Requirements
- Node.js 18+ 
- npm, pnpm, yarn, or bun

#### Development

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev
```

#### Production Build

```bash
# Create production build
npm run build

# Preview build
npm run preview
```

---

### 🏗 Technical Architecture

#### Host/Guest Model

```
┌─────────────────────────────────────────────────────────────┐
│                    WebRTC P2P ARCHITECTURE                  │
└─────────────────────────────────────────────────────────────┘

                        ┌──────────┐
                        │  PeerJS  │
                        │ Signaling│
                        │  Server  │
                        └────┬─────┘
                             │ (Connection setup only)
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │   HOST   │  │  GUEST   │  │  GUEST   │
        │  (Retro  │◀─│  (Team   │  │  (Team   │
        │  Owner)  │  │  Member) │  │  Member) │
        └──────────┘  └──────────┘  └──────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    Direct P2P Connection
                    (Data never hits a server)
```

- **Host**: The person who creates the retrospective. Registers with PeerJS using channel ID.
- **Guest**: Participants. Connect to the host's peer ID (channel ID).
- **Data Flow**: All messages are transmitted directly between browsers.

#### WebRTC Message Types

| Message Type | Direction | Description |
|--------------|-----------|-------------|
| `REQUEST_SYNC` | Guest → Host | Request current state |
| `SYNC_STATE` | Host → Guest | Send full channel data |
| `NOTE_ADDED` | Bidirectional | New note added |
| `NOTE_UPDATED` | Bidirectional | Note updated |
| `NOTE_DELETED` | Bidirectional | Note deleted |
| `NOTE_LIKED` | Bidirectional | Like added to note |
| `NOTE_UNLIKED` | Bidirectional | Like removed |
| `PARTICIPANT_JOINED` | Guest → Host → All | New participant |

#### localStorage Structure

```javascript
// Channel data
localStorage["retro_channel_{channelId}"] = {
  id: "abc123",
  name: "Sprint Retrospective",
  isAnonymous: true,
  columns: [...],
  notes: [...],
  participants: [...]
}

// Participant info
localStorage["retro_participant_{channelId}"] = {
  id: "user123",
  name: "Cosmic Panda 42",
  color: "#FF6B6B"
}
```

---

### 📁 Project Structure

```
RetroRtc/
├── app/
│   ├── app.vue                 # Main application component
│   ├── components/
│   │   ├── ConnectionStatus.vue    # WebRTC connection status
│   │   ├── ExportModal.vue         # Markdown export modal
│   │   ├── ParticipantJoin.vue     # Join form
│   │   ├── PostItNote.vue          # Post-it note component
│   │   ├── RetroBoard.vue          # Main retro board
│   │   └── RetroColumn.vue         # Column component
│   ├── composables/
│   │   ├── useRetroChannel.ts      # Channel management
│   │   └── useWebRTC.ts            # WebRTC operations
│   ├── pages/
│   │   ├── index.vue               # Home page (creation form)
│   │   └── retro/
│   │       └── [channelId].vue     # Retro room
│   └── utils/
│       ├── colors.ts               # Color palettes
│       └── nicknames.ts            # Nickname generator
├── nuxt.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🇹🇷 Türkçe

### 📜 Manifesto

> **"Fikirleriniz sizin. Verileriniz de sizin olmalı."**

RetroRTC, takımların retrospektif toplantılarını özgürce yapabilmesi için tasarlandı. Merkezi sunuculara, üçüncü taraf servislerine veya kayıt formlarına ihtiyaç duymadan, tamamen peer-to-peer (P2P) çalışan bir retrospektif aracı.

#### Neden RetroRTC?

- 🔒 **Gizlilik Öncelikli**: Hiçbir veri sunucularımıza gönderilmez. Tüm veriler yalnızca katılımcıların tarayıcılarında yaşar.
- 🎭 **Anonim Katılım**: "Kozmik Panda 42" veya "Ninja Unicorn 7" gibi eğlenceli takma isimlerle fikirlerinizi özgürce paylaşın.
- ⚡ **Sıfır Kurulum**: Kayıt yok, indirme yok, yapılandırma yok. Sadece link paylaşın ve başlayın.
- 🌐 **P2P Mimari**: Host ve katılımcılar doğrudan birbirleriyle iletişim kurar. Arada hiçbir sunucu yok.
- 💾 **Tam Kontrol**: Retrospektif verileri tarayıcınızda kalır. İstediğiniz zaman silin, dışa aktarın.

---

### ✨ Özellikler

| Özellik | Açıklama |
|---------|----------|
| 🔄 **Gerçek Zamanlı Senkronizasyon** | WebRTC üzerinden anlık not paylaşımı |
| 🎭 **Anonim/İsimli Mod** | Takım tercihine göre katılım modu seçimi |
| 📝 **Özelleştirilebilir Kolonlar** | Varsayılan veya özel kolon isimleri |
| 🎨 **Renkli Post-it Notları** | 8 farklı pastel renk seçeneği |
| ❤️ **Beğeni Sistemi** | Notlara oy vererek önemli fikirleri öne çıkarın |
| 🎬 **Sunum Modu** | Retrospektif sonuçlarını sunmak için özel görünüm |
| 📥 **Markdown Export** | Sonuçları `.md` formatında dışa aktarın |
| 👥 **Katılımcı Takibi** | Bağlı katılımcıları ve rolleri görüntüleyin |

---

### 🎮 Nasıl Çalışır?

```
┌─────────────────────────────────────────────────────────────────┐
│                        RETROSPEKTİF AKIŞI                       │
└─────────────────────────────────────────────────────────────────┘

  1️⃣ OLUŞTUR                2️⃣ PAYLAŞ               3️⃣ KATIL
  ┌─────────┐              ┌─────────┐             ┌─────────┐
  │  Host   │    Link      │ Takım   │   Tıkla    │  Guest  │
  │ Retro   │ ──────────▶  │ Üyeleri │ ─────────▶ │  Olarak │
  │ Oluştur │              │   İle   │            │  Katıl  │
  └─────────┘              └─────────┘             └─────────┘
       │                                                │
       │                                                │
       ▼                                                ▼
  ┌─────────────────────────────────────────────────────────┐
  │                   4️⃣ RETRO BAŞLASIN!                     │
  │                                                         │
  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
  │  │ İyi      │  │ Geliştirilmesi│  │ Aksiyon         │  │
  │  │ Gidenler │  │ Gerekenler    │  │ Maddeleri       │  │
  │  │          │  │               │  │                 │  │
  │  │ 📝 Not 1 │  │ 📝 Not 3      │  │ 📝 Not 5        │  │
  │  │ 📝 Not 2 │  │ 📝 Not 4      │  │ 📝 Not 6        │  │
  │  └──────────┘  └──────────────┘  └──────────────────┘  │
  └─────────────────────────────────────────────────────────┘
                              │
                              ▼
                    5️⃣ EXPORT AL (Markdown)
```

#### Adım Adım Kullanım

1. **Retrospektif Oluştur**
   - Ana sayfada "Yeni Retrospektif Oluştur" formunu doldurun
   - Retrospektif adı girin (örn: "Sprint 24 Retrospektifi")
   - Anonim veya İsimli mod seçin
   - Kolonları özelleştirin veya varsayılanları kullanın

2. **Linki Paylaş**
   - Oluşturulan benzersiz linki takım üyeleriyle paylaşın
   - Herkes aynı linke tıklayarak katılabilir

3. **Notlar Ekle**
   - İlgili kolona not ekleyin
   - Notlarınız anında tüm katılımcılarla senkronize olur
   - Kendi notlarınızı düzenleyebilir veya silebilirsiniz

4. **Beğen ve Tartış**
   - Önemli bulduğunuz notlara ❤️ verin
   - Beğeni sayısı fikirlerin önceliklendirilmesine yardımcı olur

5. **Sonuçları Dışa Aktar**
   - Export butonuyla Markdown formatında indirin
   - Beğeni ve yazar bilgilerini dahil edip etmemeyi seçin

---

### 🛠 Teknoloji Stack

| Teknoloji | Versiyon | Açıklama |
|-----------|----------|----------|
| [Nuxt](https://nuxt.com) | 4.x | Vue meta-framework |
| [Vue](https://vuejs.org) | 3.x | Reaktif UI framework |
| [PeerJS](https://peerjs.com) | 1.5.x | WebRTC soyutlama katmanı |
| [TailwindCSS](https://tailwindcss.com) | 3.x | Utility-first CSS |

---

### 🚀 Kurulum ve Çalıştırma

#### Gereksinimler
- Node.js 18+ 
- npm, pnpm, yarn veya bun

#### Geliştirme Ortamı

```bash
# Bağımlılıkları yükle
npm install

# Geliştirme sunucusunu başlat (http://localhost:3000)
npm run dev
```

#### Production Build

```bash
# Production build oluştur
npm run build

# Build'i önizle
npm run preview
```

---

### 🏗 Teknik Mimari

#### Host/Guest Modeli

```
┌─────────────────────────────────────────────────────────────┐
│                     WebRTC P2P MİMARİSİ                     │
└─────────────────────────────────────────────────────────────┘

                        ┌──────────┐
                        │  PeerJS  │
                        │ Signaling│
                        │  Server  │
                        └────┬─────┘
                             │ (Sadece bağlantı kurulumu)
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │  HOST    │  │  GUEST   │  │  GUEST   │
        │ (Retro   │◀─│ (Takım   │  │ (Takım   │
        │  Sahibi) │  │  Üyesi)  │  │  Üyesi)  │
        └──────────┘  └──────────┘  └──────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    Doğrudan P2P Bağlantı
                    (Veri sunucuya gitmez)
```

- **Host**: Retrospektifi oluşturan kişi. Kanal ID'si ile PeerJS'e kayıt olur.
- **Guest**: Katılımcılar. Host'un peer ID'sine (kanal ID) bağlanır.
- **Veri Akışı**: Tüm mesajlar doğrudan tarayıcılar arasında iletilir.

#### WebRTC Mesaj Tipleri

| Mesaj Tipi | Yön | Açıklama |
|------------|-----|----------|
| `REQUEST_SYNC` | Guest → Host | Mevcut state'i iste |
| `SYNC_STATE` | Host → Guest | Tam kanal verisini gönder |
| `NOTE_ADDED` | Çift yönlü | Yeni not eklendi |
| `NOTE_UPDATED` | Çift yönlü | Not güncellendi |
| `NOTE_DELETED` | Çift yönlü | Not silindi |
| `NOTE_LIKED` | Çift yönlü | Nota beğeni eklendi |
| `NOTE_UNLIKED` | Çift yönlü | Beğeni kaldırıldı |
| `PARTICIPANT_JOINED` | Guest → Host → All | Yeni katılımcı |

#### localStorage Yapısı

```javascript
// Kanal verisi
localStorage["retro_channel_{channelId}"] = {
  id: "abc123",
  name: "Sprint Retrospektifi",
  isAnonymous: true,
  columns: [...],
  notes: [...],
  participants: [...]
}

// Katılımcı bilgisi
localStorage["retro_participant_{channelId}"] = {
  id: "user123",
  name: "Kozmik Panda 42",
  color: "#FF6B6B"
}
```

---

### 📁 Proje Yapısı

```
RetroRtc/
├── app/
│   ├── app.vue                 # Ana uygulama bileşeni
│   ├── components/
│   │   ├── ConnectionStatus.vue    # WebRTC bağlantı durumu
│   │   ├── ExportModal.vue         # Markdown export modal
│   │   ├── ParticipantJoin.vue     # Katılım formu
│   │   ├── PostItNote.vue          # Post-it not bileşeni
│   │   ├── RetroBoard.vue          # Ana retro tahtası
│   │   └── RetroColumn.vue         # Kolon bileşeni
│   ├── composables/
│   │   ├── useRetroChannel.ts      # Kanal yönetimi
│   │   └── useWebRTC.ts            # WebRTC işlemleri
│   ├── pages/
│   │   ├── index.vue               # Ana sayfa (oluşturma formu)
│   │   └── retro/
│   │       └── [channelId].vue     # Retro odası
│   └── utils/
│       ├── colors.ts               # Renk paletleri
│       └── nicknames.ts            # Takma isim üreteci
├── nuxt.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🤝 Contributing / Katkıda Bulunma

Contributions are welcome! / Katkılarınızı bekliyoruz!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License / Lisans

This project is licensed under the MIT License.

Bu proje MIT lisansı altında lisanslanmıştır.

---

<p align="center">
  <strong>🎯 RetroRTC</strong><br>
  <em>Your data is yours, your ideas are free.</em><br>
  <em>Verileriniz sizin, fikirleriniz özgür.</em>
</p>
