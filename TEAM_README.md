# 🏏 VNIT Inter-Department Games Sports App

**Complete MERN Stack Application for Sports Event Management**

[![CI/CD](https://github.com/Anshulkaocde123/finalig/actions/workflows/ci.yml/badge.svg)](https://github.com/Anshulkaocde123/finalig/actions/workflows/ci.yml)
[![Testing](https://img.shields.io/badge/testing-E2E%20%7C%20Unit%20%7C%20Load-green)](./qa/QA-STRATEGY-V2.md)
[![Deploy](https://img.shields.io/badge/deploy-Railway%20%7C%20Render%20%7C%20Vercel-blue)](./DEPLOYMENT_PLAN.md)

---

## 🚀 Quick Start for Team Members

### 1. **Clone & Setup (3 commands)**
```bash
git clone https://github.com/Anshulkaocde123/finalig.git
cd finalig
chmod +x setup-team.sh && ./setup-team.sh
```

### 2. **Start Development**
```bash
npm start
```

### 3. **Open App**
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:5000

### 4. **Admin Login**
| Field    | Value    |
|----------|----------|
| Username | `admin`  |
| Password | `admin123` |

---

## 📋 What's Included

### ✨ **Core Features**
- 🏆 **Live Scoring System** - Real-time match scoring with Socket.IO
- 🏅 **Department Leaderboards** - Dynamic rankings and point systems
- 📅 **Event Management** - Schedule matches, manage tournaments
- 👨‍💼 **Admin Dashboard** - Complete control panel for administrators
- 🏛️ **Student Council** - Member management and profiles
- 📱 **Mobile First** - Responsive design with PWA support
- 🎨 **Modern UI** - Clean design with Framer Motion animations
- 🔐 **Google OAuth** - Secure authentication system

### 🔧 **Development Setup**
- ⚡ **Automated Setup** - One-command team onboarding
- 📚 **Complete Documentation** - Guides for every component
- 🧪 **Testing Suite** - E2E, Unit, and Load testing ready
- 🔄 **CI/CD Pipeline** - GitHub Actions workflow configured
- 🐳 **Docker Support** - Containerized deployment ready
- ☁️ **Cloud Deploy** - Railway, Render, Vercel configurations

---

## 📁 Project Structure

```
finalig/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── api/            # API connection setup
│   │   └── context/        # React contexts
│   ├── public/             # Static assets
│   └── package.json
├── server/                 # Express Backend
│   ├── controllers/        # Business logic
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Custom middleware
│   └── package.json
├── e2e/                   # End-to-end tests
├── qa/                    # QA strategy & testing
├── ENVIRONMENT_VARIABLES_GUIDE.md
├── TEAM_SETUP_GUIDE.md
└── setup-team.sh          # Automated setup script
```

---

## 🛠️ Technology Stack

### **Frontend**
- ⚛️ **React 18** - Modern React with hooks
- ⚡ **Vite** - Fast build tool and dev server
- 🎨 **Tailwind CSS** - Utility-first styling
- ✨ **Framer Motion** - Smooth animations
- 🔌 **Socket.IO Client** - Real-time updates
- 📱 **PWA** - Progressive Web App support

### **Backend**
- 🚀 **Node.js + Express** - Server framework
- 🗄️ **MongoDB + Mongoose** - Database and ODM
- 🔐 **JWT + Passport** - Authentication & OAuth
- 🔌 **Socket.IO** - Real-time communication
- 🛡️ **Security Middleware** - CORS, Helmet, Rate limiting

### **Testing & DevOps**
- 🎭 **Playwright** - E2E testing framework
- 🃏 **Jest** - Unit testing
- ⚡ **Artillery** - Load testing
- 🔄 **GitHub Actions** - CI/CD pipeline
- 🐳 **Docker** - Containerization

---

## ⚙️ Environment Setup Details

### **Required Environment Variables**

#### Server (.env)
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
CORS_ORIGIN=http://localhost:5173
```

#### Client (.env.local)
```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

📘 **Complete Guide:** [Environment Variables Guide](./ENVIRONMENT_VARIABLES_GUIDE.md)

---

## 🧪 Testing

### **Run All Tests**
```bash
# E2E Tests
npm run test:e2e

# Backend Tests
npm run test:server

# Load Tests
npm run test:load
```

### **Testing Coverage**
- ✅ User authentication flows
- ✅ Scoring system validation
- ✅ Admin dashboard functionality
- ✅ Mobile responsiveness
- ✅ API endpoint testing
- ✅ Database operations
- ✅ Real-time socket connections

📘 **Complete Guide:** [QA Strategy](./qa/QA-STRATEGY-V2.md)

---

## 🚀 Deployment Options

### **Option 1: Railway** (Recommended)
```bash
# Deploy to Railway
railway login
railway link
railway up
```

### **Option 2: Render**
- Import from GitHub
- Use `render.yaml` configuration

### **Option 3: Vercel (Frontend) + Railway (Backend)**
- Frontend auto-deploys from GitHub
- Backend deploys to Railway

📘 **Complete Guide:** [Deployment Plan](./DEPLOYMENT_PLAN.md)

---

## 📚 Documentation & Guides

| Guide | Description | Location |
|-------|------------|----------|
| **Team Setup** | Complete onboarding guide | [TEAM_SETUP_GUIDE.md](./TEAM_SETUP_GUIDE.md) |
| **Environment** | All environment variables | [ENVIRONMENT_VARIABLES_GUIDE.md](./ENVIRONMENT_VARIABLES_GUIDE.md) |
| **Testing** | QA strategy and testing | [qa/QA-STRATEGY-V2.md](./qa/QA-STRATEGY-V2.md) |
| **Deployment** | Production deployment | [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) |
| **API Testing** | Postman & API guides | [server/TESTING-GUIDE.md](./server/TESTING-GUIDE.md) |

---

## 🎯 Development Workflow

### **For New Team Members**
1. **Setup:** Run `setup-team.sh`
2. **Development:** `npm start` to begin coding
3. **Testing:** `npm run test:e2e` before committing
4. **Commit:** Follow conventional commit format
5. **Deploy:** Push to main for auto-deployment

### **Adding New Features**
1. Create feature branch: `git checkout -b feature/your-feature`
2. Develop with live reload: `npm start`
3. Test thoroughly: `npm run test:all`
4. Create pull request to main
5. Review & merge

### **Available Scripts**
```bash
npm start          # Start both frontend and backend
npm run dev        # Development mode with hot reload
npm run build      # Build for production
npm run test:all   # Run all tests
npm run deploy     # Deploy to production
```

---

## 🔧 Troubleshooting

### **Common Issues**

#### 1. **MongoDB Connection Failed**
```bash
# Check if MONGODB_URI is set correctly
echo $MONGODB_URI

# Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
```

#### 2. **Port Already in Use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm start
```

#### 3. **Google OAuth Not Working**
```bash
# Verify Google Client ID matches in:
# - server/.env (GOOGLE_CLIENT_ID)
# - client/.env.local (VITE_GOOGLE_CLIENT_ID)
```

#### 4. **Frontend Not Connecting to Backend**
```bash
# Check API URL in client/.env.local
VITE_API_URL=http://localhost:5000/api
```

---

## 👥 Team Collaboration

### **Code Organization**
- 📁 **Components** - Reusable UI elements in `client/src/components/`
- 📄 **Pages** - Application screens in `client/src/pages/`
- 🔌 **API** - Backend endpoints in `server/routes/`
- 🗄️ **Database** - Models and schemas in `server/models/`

### **Git Workflow**
```bash
# Feature development
git checkout -b feature/scoring-system
git add .
git commit -m "feat: add live scoring with socket.io"
git push origin feature/scoring-system
```

### **Communication**
- 🐛 **Bug Reports** - Use GitHub Issues with bug template
- 💡 **Feature Requests** - Use GitHub Issues with feature template
- 📝 **Documentation** - Update relevant guides when adding features
- 🧪 **Testing** - Write tests for new features

---

## 📞 Support & Resources

### **Quick Help**
- 📖 **Documentation Issues** - Check [TEAM_SETUP_GUIDE.md](./TEAM_SETUP_GUIDE.md)
- 🔧 **Environment Problems** - See [ENVIRONMENT_VARIABLES_GUIDE.md](./ENVIRONMENT_VARIABLES_GUIDE.md)
- 🧪 **Testing Questions** - Read [qa/QA-STRATEGY-V2.md](./qa/QA-STRATEGY-V2.md) 
- 🚀 **Deployment Issues** - Check [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md)

### **Contact**
- **Project Lead** - Anshul Jain
- **GitHub** - [Anshulkaocde123](https://github.com/Anshulkaocde123)
- **Repository** - [finalig](https://github.com/Anshulkaocde123/finalig)

---

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

<div align="center">

**🏏 Built with ❤️ for VNIT Inter-Department Games**

[🚀 Get Started](./TEAM_SETUP_GUIDE.md) • [📚 Documentation](./ENVIRONMENT_VARIABLES_GUIDE.md) • [🧪 Testing](./qa/QA-STRATEGY-V2.md) • [🚀 Deploy](./DEPLOYMENT_PLAN.md)

</div>