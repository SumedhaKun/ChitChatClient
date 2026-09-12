# ChitChat Client

A modern, responsive messaging application built with Next.js, React, and Tailwind CSS.

## Features

- 💬 Real-time messaging interface
- 👥 Contact management with online/offline status
- 🔍 Search bar to filter contacts
- 🌓 Dark mode support
- 📱 Fully responsive design
- ⚡ Built with Next.js 14, React 18, TypeScript, and Tailwind CSS

## Quick Start

### Prerequisites
- Node.js 18.17+ and npm/yarn

### Installation

```bash
git clone https://github.com/SumedhaKun/ChitChatClient.git
cd ChitChatClient
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ChitChatClient/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Top navigation
│   ├── Sidebar.tsx         # Contact list with search
│   ├── ChatWindow.tsx      # Chat interface
│   └── MessageBubble.tsx   # Message display
├── types/
│   └── index.ts            # TypeScript types
└── package.json
```

## Components

| Component | Purpose |
|-----------|---------|
| **Header** | App title and user profile |
| **Sidebar** | Contact list with search and status indicators |
| **ChatWindow** | Message display, input, and send functionality |
| **MessageBubble** | Individual message styling |

## Key Features

**Messaging**
- Chronological message display with timestamps
- Auto-scroll to latest message
- Enter to send, Shift+Enter for new line

**Contacts**
- Search/filter contacts by name
- Online/offline status indicators
- Click to select and view conversation

**Dark Mode**
- Toggle dark/light themes
- Persistent theme preference

**Search**
- Real-time contact filtering
- Case-insensitive search

## Tech Stack

- **Framework**: Next.js 14
- **UI**: React 18 + Tailwind CSS
- **Language**: TypeScript
- **Styling**: Dark mode support with Tailwind

## Future Enhancements

- Backend API integration
- User authentication
- File/image sharing
- Typing indicators & read receipts
- Group conversations

## License

MIT License - feel free to use this project!

## Author

Sumedha Kundurthi
