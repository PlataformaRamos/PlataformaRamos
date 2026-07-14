import React from 'react'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="border-b bg-white py-4 px-6 flex justify-between items-center shadow-sm">
        <span className="text-xl font-extrabold tracking-tight text-slate-900">PLATAFORMA RAMOS</span>
      </header>
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  )
}
