'use client'

import Link from 'next/link'
import BugReport from '@/components/BugReport'

interface HeaderProps {
  userAvatar: string
}

export default function Header({ userAvatar }: HeaderProps) {
  return (
    <header className="bg-gray-900 text-white px-6 py-4 shadow-md border-b border-gray-800 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-wide">ChitChat</h1>
      </div>
      <div className="flex items-center gap-2">
        <BugReport />
        <Link href="/profile">
          <img
            src={userAvatar}
            alt="Profile"
            className="w-10 h-10 rounded-full border-2 border-gray-600 cursor-pointer hover:scale-110 transition-transform"
          />
        </Link>
      </div>
    </header>
  )
}