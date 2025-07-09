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
      <body className="min-h-screen" suppressHydrationWarning={true}>
        <div className="min-h-screen flex flex-col">
          <header className="bg-gradient-to-r from-dnd-dark-900 via-dnd-dark-800 to-dnd-dark-900 text-white shadow-2xl border-b-4 border-dnd-orange-600">
            <div className="container mx-auto px-4 py-6 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dnd-orange-600/10 to-transparent"></div>
              <h1 className="text-4xl font-fantasy font-bold text-dnd-orange-400 drop-shadow-lg relative z-10">
                D&D Creature Sheet
              </h1>
              <p className="text-dnd-parchment-200 mt-2 text-sm font-medium tracking-wide relative z-10">
                Manage your D&D creatures with ease
              </p>
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
