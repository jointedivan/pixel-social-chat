import { useState } from 'react'
import { StartPage } from './pages/StartPage'
import { ChatPage } from './pages/ChatPage'
import { isAuthenticated } from './authStorage'

export default function App() {
  const [isChatOpen, setIsChatOpen] = useState(() => isAuthenticated())

  if (isChatOpen) {
    return (
      <ChatPage 
        onLogout={() => {
          setIsChatOpen(false)
          // Перезагружаем страницу чтобы сбросить состояние
          window.location.reload()
        }}
      />
    )
  }

  return <StartPage onAuthSuccess={() => setIsChatOpen(true)} />
}
