import React from 'react'
import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  )
}
