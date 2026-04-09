import { useEffect, useState } from 'react'
import { StartPage } from './pages/StartPage'
import { ChatPage } from './pages/ChatPage'

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    if (!isChatOpen) {
      return
    }

    const handleEscClose = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsChatOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscClose)
    return () => window.removeEventListener('keydown', handleEscClose)
  }, [isChatOpen])

  if (isChatOpen) {
    return <ChatPage onBack={() => setIsChatOpen(false)} />
  }

  return <StartPage onStart={() => setIsChatOpen(true)} />
}
