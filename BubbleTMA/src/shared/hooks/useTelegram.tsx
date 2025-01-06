
interface TelegramUser {
    id: number
    username: string
    first_name: string
}

interface TelegramData {
    user: TelegramUser | null
}

type TelegramHapticFeedback = {
    impactOccurred: (
        style: "light" | "medium" | "rigid" | "heavy" | "soft",
    ) => void
    notificationOccurred: (type: "error" | "success" | "warning") => void
}

interface TelegramWebApp {
    initDataUnsafe?: TelegramData
    close: () => void
    platform?: string
    BackButton?: {
        show: () => void
        hide: () => void
        onClick: (callback: () => void) => void
        offClick: (callback: () => void) => void
    }
    disableVerticalSwipes: () => void
    HapticFeedback: TelegramHapticFeedback
    shareToStory: (mediaUrl: string, params: { type: 'image' | 'video'; caption?: string }) => Promise<void>
}

const tg: TelegramWebApp = (window as any).Telegram.WebApp

export function useTelegram() {

    const onClose = () => {
        tg.close()
    }

    const shareToStory = (mediaUrl: string, type: 'image' | 'video', caption: string) => {
        if (tg.shareToStory) {
            tg.shareToStory(mediaUrl, { type, caption })
                .then(() => {
                    console.log('Story shared successfully!')
                })
                .catch((error: any) => {
                    console.error('Error sharing story:', error)
                })
        } else {
            console.warn('Story sharing is not supported in this version.')
        }
    }

    const telegramId = tg.initDataUnsafe?.user?.id || null
    const user = tg.initDataUnsafe?.user?.username || null
    const name = tg.initDataUnsafe?.user?.first_name || null

    return {
        onClose,
        shareToStory,
        tg,
        telegramId,
        user,
        name,
    }
}
