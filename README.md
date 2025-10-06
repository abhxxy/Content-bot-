# WhatsApp Content Management Bot

A WhatsApp bot built with whatsapp-web.js that allows users to manage website content through WhatsApp.

## Features

- **Modify Content**: Update existing content on any page
- **Add Content**: Add new blog posts or job openings
- **Delete Content**: Remove unwanted content

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

Scan the QR code with WhatsApp to connect the bot.

## Bot Commands

The bot uses a conversational flow:

1. **Start**: Send any message to receive the welcome menu
2. **Choose Action**: Reply with 1, 2, or 3 to select:
   - 1: Modify existing content
   - 2: Add new content
   - 3: Delete content
3. **Follow Prompts**: The bot will guide you through each step

## API Integration

Update the submit functions in `whatsapp-bot.js` to connect with your backend:

- `submitModifyRequest()` - Line 264
- `submitAddRequest()` - Line 274  
- `submitDeleteRequest()` - Line 279

## Session Management

The bot maintains user sessions to track conversation state. Sessions are stored in memory and reset after successful submissions.

## Error Handling

The bot includes error handling for:
- Authentication failures
- Connection issues
- Invalid user inputs