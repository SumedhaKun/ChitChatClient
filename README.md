# ChitChat Client

A modern, responsive messaging application built with Next.js, React, and Tailwind CSS.

## Features

- 💬 Real-time messaging interface
- 👥 Contact management with online/offline status
- 📱 Responsive design that works on all devices
- ⚡ Built with Next.js 14 and React 18
- 🎨 Styled with Tailwind CSS
- 🚀 TypeScript support for type safety

## Tech Stack

- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Package Manager**: npm or yarn

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SumedhaKun/ChitChatClient.git
cd ChitChatClient
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
ChitChatClient/
├── app/
│   ├── layout.tsx          # Root layout component
│   ├── page.tsx            # Main page
│   └── globals.css         # Global styles
├── components/
│   ├── Header.tsx          # Header component
│   ├── Sidebar.tsx         # Contacts sidebar
│   ├── ChatWindow.tsx      # Main chat interface
│   └── MessageBubble.tsx   # Individual message bubble
├── types/
│   └── index.ts            # TypeScript type definitions
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Project dependencies
```

## Components

### Header
Displays the application title and user profile avatar with a link to the profile page.

### Sidebar
Shows a list of all contacts with:
- Contact avatar
- Contact name
- Online/offline status indicator
- Selection highlighting

### ChatWindow
The main messaging interface featuring:
- Chat header with contact info
- Message history with timestamps
- Message input area
- Send button
- Keyboard support (Enter to send, Shift+Enter for new line)

### MessageBubble
Individual message bubble component with styling based on message sender.

## Features in Detail

### Message Handling
- Messages are displayed in chronological order
- User's messages appear on the right with blue background
- Other messages appear on the left with gray background
- Timestamps are displayed for each message
- Auto-scroll to newest message

### Contact Selection
- Click on any contact in the sidebar to view their conversation
- Selected contact is highlighted
- Contact status (online/offline) is shown in both sidebar and chat header

### Input Handling
- Multi-line text input with resizable textarea
- Press Enter to send message
- Press Shift+Enter for new line
- Input clears after sending

## Customization

### Colors
Modify the color scheme in `tailwind.config.js` and component files:
- Primary color: Blue-600 (`bg-blue-600`)
- Secondary color: Gray-300 (`bg-gray-300`)

### Fonts
Default system fonts are used. To use custom fonts, import them in `app/globals.css`.

## Future Enhancements

- Backend API integration for real message storage
- User authentication and authorization
- Message search functionality
- File/image sharing
- Typing indicators
- Read receipts
- Group conversations
- Dark mode support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

Sumedha Kundurthi

## Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.