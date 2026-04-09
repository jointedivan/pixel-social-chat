type StartPageProps = {
  onStart: () => void
}

export function StartPage({ onStart }: StartPageProps) {
  return (
    <main className="start-screen">
      <h1 className="title">Pixel Social Chat</h1>
      <button className="start-button" type="button" onClick={onStart}>
        Начать переписку
      </button>
    </main>
  )
}
