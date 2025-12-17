import { messages, type Locale } from '~/utils/locales'

const currentLocale = ref<Locale>('tr')

export function useTranslation() {

    // Initialize locale from localStorage or browser preference
    if (import.meta.client && !('locale_initialized' in (window as any))) {
        (window as any).locale_initialized = true
        const saved = localStorage.getItem('retro_locale') as Locale
        if (saved && (saved === 'tr' || saved === 'en')) {
            currentLocale.value = saved
        } else {
            const browserLang = navigator.language.split('-')[0]
            if (browserLang === 'en') {
                currentLocale.value = 'en'
            }
        }
    }

    const setLocale = (locale: Locale) => {
        currentLocale.value = locale
        if (import.meta.client) {
            localStorage.setItem('retro_locale', locale)
        }
    }

    const t = (key: string): string => {
        const keys = key.split('.')
        let current: any = messages[currentLocale.value]

        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k]
            } else {
                // Fallback to key if not found
                console.warn(`Translation missing for key: ${key}`)
                return key
            }
        }

        return current as string
    }

    return {
        t,
        locale: currentLocale,
        setLocale
    }
}
