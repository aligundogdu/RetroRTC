export const messages = {
    tr: {
        home: {
            title: 'RetroRTC',
            subtitle: 'Takımınız için anonim retrospektif aracı',
            import_backup: 'Yedekten Yükle (JSON)',
            form: {
                title: 'Yeni Retrospektif Oluştur',
                name_label: 'Retrospektif Adı',
                name_placeholder: 'Örn: Sprint 24 Retrospektifi',
                mode_label: 'Katılımcı Modu',
                mode_anonymous: 'Anonim',
                mode_anonymous_desc: 'Rastgele takma isimler',
                mode_named: 'İsimli',
                mode_named_desc: 'Gerçek isimler görünsün',
                columns_label: 'Kolonlar',
                column_placeholder: 'Kolon adı',
                add_column: '+ Kolon Ekle',
                connection_label: 'Bağlantı Yöntemi',
                submit: 'Retrospektif Oluştur 🚀',
                footer: 'Backend gerektirmez • Tüm veriler tarayıcınızda saklanır'
            },
            supabase: {
                title: '⚡ Supabase Ayarları',
                subtitle: '(Kendi projenizi kullanın)',
                url_label: 'Project URL',
                key_label: 'Anon Key',
                warning: '⚠️ Bu bilgiler kanal URL\'si içinde şifreli olarak paylaşılacaktır. Sadece \'Anon Public\' key kullanın.'
            }
        },
        retro: {
            loading: 'Kanal verileri yükleniyor...',
            connecting: 'Host ile bağlantı kuruluyor',
            not_found_title: 'Kanal bulunamadı',
            not_found_desc: 'Bu retrospektif henüz oluşturulmamış veya host çevrimdışı olabilir.',
            home_button: 'Ana Sayfaya Dön',
            presentation_mode: '👁️ Sunum Modu',
            normal_mode: '🎭 Normal Mod',
            share_link: '🔗 Linki Paylaş',
            copied: '✓ Kopyalandı',
            export: '📥 Export',
            participants: 'Katılımcılar:',
            anonymous_mod: '🎭 Anonim Mod',
            named_mod: '👤 İsimli Mod',
            notes: 'not',
            add_note: '+ Not Ekle',
            add_note_placeholder: 'Notunuzu yazın...',
            add: 'Ekle',
            cancel: 'İptal',
            join_modal: {
                title: 'Retrospektife Katıl',
                welcome: 'Retrospektife Hoş Geldiniz!',
                name_label: 'Adınız Soyadınız',
                name_placeholder: 'Örn: Ahmet Yılmaz',
                your_nickname: 'Sizin takma isminiz:',
                join: 'Katıl 🚀'
            },
            export_modal: {
                title: 'Export Al',
                include_likes: 'Beğenileri Dahil Et',
                include_authors: 'Yazarları Dahil Et',
                no_notes: '_Henüz not eklenmemiş_',
                copy: 'Kopyala',
                copied: 'Kopyalandı',
                download: 'İndir',
                download_json: 'JSON Yedeği İndir',
                json_backup_title: 'Teknik Yedek (Geri Yükleme İçin)',
                close: 'Kapat'
            }
        },
        providers: {
            peerjs: {
                name: 'PeerJS',
                description: 'WebRTC + PeerJS Signaling'
            },
            trystero: {
                name: 'Trystero',
                description: 'BitTorrent/IPFS üzerinden P2P'
            },
            gun: {
                name: 'Gun.js',
                description: 'Decentralized database sync'
            },
            supabase: {
                name: 'Supabase',
                description: 'Realtime WebSocket'
            }
        }
    },
    en: {
        home: {
            title: 'RetroRTC',
            subtitle: 'Anonymous retrospective tool for your team',
            import_backup: 'Import from Backup (JSON)',
            form: {
                title: 'Create New Retrospective',
                name_label: 'Retrospective Name',
                name_placeholder: 'Ex: Sprint 24 Retrospective',
                mode_label: 'Participant Mode',
                mode_anonymous: 'Anonymous',
                mode_anonymous_desc: 'Random nicknames',
                mode_named: 'Named',
                mode_named_desc: 'Real names shown',
                columns_label: 'Columns',
                column_placeholder: 'Column name',
                add_column: '+ Add Column',
                connection_label: 'Connection Method',
                submit: 'Create Retrospective 🚀',
                footer: 'No backend required • All data stored in browser'
            },
            supabase: {
                title: '⚡ Supabase Settings',
                subtitle: '(Use your own project)',
                url_label: 'Project URL',
                key_label: 'Anon Key',
                warning: '⚠️ These credentials will be encrypted in the channel URL. Use only \'Anon Public\' keys.'
            }
        },
        retro: {
            loading: 'Loading channel data...',
            connecting: 'Connecting to host',
            not_found_title: 'Channel not found',
            not_found_desc: 'This retrospective has not been created yet or the host is offline.',
            home_button: 'Return to Home',
            presentation_mode: '👁️ Presentation Mode',
            normal_mode: '🎭 Normal Mode',
            share_link: '🔗 Share Link',
            copied: '✓ Copied',
            export: '📥 Export',
            participants: 'Participants:',
            anonymous_mod: '🎭 Anonymous Mode',
            named_mod: '👤 Named Mode',
            notes: 'notes',
            add_note: '+ Add Note',
            add_note_placeholder: 'Write your note...',
            add: 'Add',
            cancel: 'Cancel',
            join_modal: {
                title: 'Join Retrospective',
                welcome: 'Welcome to Retrospective!',
                name_label: 'Your Name',
                name_placeholder: 'Ex: John Doe',
                your_nickname: 'Your nickname:',
                join: 'Join 🚀'
            },
            export_modal: {
                title: 'Export',
                include_likes: 'Include Likes',
                include_authors: 'Include Authors',
                no_notes: '_No notes yet_',
                copy: 'Copy',
                copied: 'Copied',
                download: 'Download',
                download_json: 'Download JSON Backup',
                json_backup_title: 'Technical Backup (For Restore)',
                close: 'Close'
            }
        },
        providers: {
            peerjs: {
                name: 'PeerJS',
                description: 'WebRTC + PeerJS Signaling'
            },
            trystero: {
                name: 'Trystero',
                description: 'P2P via BitTorrent/IPFS'
            },
            gun: {
                name: 'Gun.js',
                description: 'Decentralized database sync'
            },
            supabase: {
                name: 'Supabase',
                description: 'Realtime WebSocket'
            }
        }
    }
}

export type Locale = keyof typeof messages
export type TranslationKey = string // Simplified for now, recursive types can be complex
