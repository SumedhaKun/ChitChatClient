'use client'

import Link from 'next/link'

interface HeaderProps {
  userAvatar: string
}

export default function Header({ userAvatar }: HeaderProps) {
  return (
    <header className="bg-blue-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-wide">ChitChat</h1>
      </div>
      <Link href="/profile">
        <img
          src={userAvatar}
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform"
        />
      </Link>
    </header>
  )
}