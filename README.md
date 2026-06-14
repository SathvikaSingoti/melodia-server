# Melodia Server 🎵
> REST API backend for Melodia music streaming app

## 🌐 Live API
Deployed on Vercel — https://melodia-server.vercel.app

## 📡 API Overview
35+ REST endpoints across:
- Auth (JWT + Google OAuth)
- Songs (streaming, search, filters)
- Playlists (CRUD, AI generation)
- Users (likes, history, stats, profile)
- Artists (pages, follow)
- Albums
- AI (smart playlist, song radio)

Full API documentation: [Notion API Docs](https://www.notion.so)

## 🛠 Tech Stack
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + Bcrypt |
| AI | Google Gemini API |
| Music | Jamendo API |
| Deployment | Vercel Serverless |

## 📁 Project Structure
server/
├── controllers/   # Business logic
├── models/        # Mongoose schemas
├── routes/        # Express routers
├── middleware/    # JWT verification
├── scripts/       # DB seeding scripts
└── index.js       # Entry point

## 🚀 Getting Started

### Installation
```bash
git clone https://github.com/SathvikaSingoti/melodia-server
cd melodia-server
npm install
```

### Environment Variables
Create .env:
```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
GEMINI_API_KEY=your_key
JAMENDO_CLIENT_ID=your_id
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
```

### Run Development Server
```bash
node index.js
```
API available at http://localhost:5000

## 🔗 Related
- [Frontend Repo](https://github.com/SathvikaSingoti/melodia-client)
- [Project Documentation](https://www.notion.so)
- [Live App](https://project-nkv6d.vercel.app)

## 📄 License
MIT © Sathvika Singoti
Built as part of Xebia Vibecoding Internship 2026
