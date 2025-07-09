import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'D&D Creature Sheet',
  description: 'A modern D&D monster and creature sheet manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-dnd-parchment">
        <div className="min-h-screen flex flex-col">
          <header className="bg-dnd-dark text-white shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-3xl font-fantasy font-bold text-dnd-gold">
                D&D Creature Sheet
              </h1>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
