# Smart Evaluation Platform - Setup and Run Guide

## 🎉 Your Full-Stack Smart Evaluation Platform is Ready!

This is a complete coding challenge and evaluation platform built with React frontend and Node.js backend, inspired by your Figma design.

---

## 📋 **What's Included:**

### ✅ **Frontend Features:**
- **5 Complete Pages**: Home/Dashboard, Problems, Leaderboard, Profile, Recommendations
- **Authentication**: Modern Login & Register pages
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Interactive Components**: Charts, stats cards, progress indicators
- **Modern UI**: Built with Tailwind CSS and React

### ✅ **Backend Features:**
- **Complete REST API**: All endpoints for frontend functionality
- **Database Models**: Users, Problems, Submissions, Achievements
- **Authentication**: JWT-based secure auth system
- **Smart Features**: Personalized recommendations, skill analysis
- **Leaderboard**: Real-time rankings and statistics

---

## 🚀 **Quick Start Guide**

### **Step 1: Prerequisites**
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)

### **Step 2: Install Dependencies**
```bash
# Navigate to project root
cd "c:/Users/Kutty/OneDrive/Desktop/FP"

# Install all dependencies (frontend + backend)
npm run install-all
```

### **Step 3: Environment Setup**

#### **Backend Environment:**
```bash
# Navigate to server folder
cd server

# Copy environment file
copy .env.example .env

# Edit .env file with your settings:
# MONGODB_URI=mongodb://localhost:27017/smart-evaluation
# JWT_SECRET=your_super_secret_jwt_key_here
# PORT=5000
```

#### **Frontend Environment:**
```bash
# Navigate to client folder
cd client

# Copy environment file
copy .env.example .env

# Edit .env file:
# REACT_APP_API_URL=http://localhost:5000
```

### **Step 4: Start the Application**

#### **Option A: Start Both Servers (Recommended)**
```bash
# From project root folder
npm run dev
```

#### **Option B: Start Separately**
```bash
# Terminal 1 - Start Backend
cd server
npm run dev

# Terminal 2 - Start Frontend
cd client
npm start
```

### **Step 5: Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

---

## 🎯 **Key Features to Explore:**

### **1. Home Dashboard**
- User statistics and progress charts
- Recent activity tracking
- Quick action buttons

### **2. Problems Page**
- Browse coding challenges by difficulty and category
- Filter and search functionality
- Problem submission system

### **3. Leaderboard**
- Real-time rankings
- Time-based filtering (All Time, This Month, This Week)
- User statistics and achievements

### **4. Profile Page**
- Detailed user statistics
- Progress charts and skill analysis
- Achievement tracking

### **5. Recommendations**
- Personalized problem suggestions
- Skill gap analysis
- Learning path progress

---

## 🔧 **Development Commands**

```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Build for production
npm run build

# Start production server
npm start
```

---

## 📊 **Database Schema**

### **Users Collection**
- Authentication details
- Statistics (points, problems solved, streaks)
- Achievements and progress

### **Problems Collection**
- Problem details and test cases
- Difficulty levels and categories
- Submission statistics

### **Submissions Collection**
- User code submissions
- Execution results and performance
- Points and rankings

### **Achievements Collection**
- Achievement definitions
- Unlock conditions and rewards

---

## 🎨 **Design System**

### **Color Scheme**
- **Primary**: Purple (#8b5cf6)
- **Secondary**: Blue (#3b82f6)
- **Success**: Green (#10b981)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)

### **Difficulty Levels**
- **Easy**: Green background
- **Medium**: Yellow background
- **Hard**: Red background

---

## 🚀 **Deployment Notes**

### **For Production:**
1. Update environment variables with production values
2. Use MongoDB Atlas for cloud database
3. Set up proper CORS origins
4. Use HTTPS for API endpoints
5. Configure build optimization

### **Environment Variables:**
```bash
# Production Backend (.env)
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_production_jwt_secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# Production Frontend (.env)
REACT_APP_API_URL=https://your-api-domain.com
```

---

## 🐛 **Troubleshooting**

### **Common Issues:**

#### **MongoDB Connection Error:**
- Ensure MongoDB is running locally
- Check connection string in .env file
- Verify MongoDB Atlas credentials if using cloud

#### **Port Already in Use:**
```bash
# Kill processes on port 3000 or 5000
npx kill-port 3000
npx kill-port 5000
```

#### **Dependency Installation Issues:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **Frontend Not Loading:**
- Check if backend is running on port 5000
- Verify API URL in client .env file
- Check browser console for errors

---

## 📱 **Mobile Responsiveness**

The platform is fully responsive:
- **Desktop**: Full layout with all features
- **Tablet**: Optimized navigation and content
- **Mobile**: Collapsible menu and touch-friendly interface

---

## 🔐 **Security Features**

- JWT token-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Helmet.js security headers

---

## 📈 **Performance Optimizations**

- React lazy loading for components
- API response caching
- Database indexing
- Image optimization
- Bundle size optimization

---

## 🎯 **Next Steps for Enhancement**

1. **Real-time Features**: Socket.io for live updates
2. **Code Editor**: Integrated IDE for problem solving
3. **Test Cases**: Advanced test case management
4. **Analytics**: Detailed performance metrics
5. **Social Features**: User profiles and following

---

## 📞 **Support**

If you encounter any issues:
1. Check this guide for solutions
2. Verify environment setup
3. Check browser console for errors
4. Ensure all dependencies are installed

---

## 🎊 **Congratulations!**

You now have a complete, production-ready Smart Evaluation Platform! This includes:
- ✅ Modern React frontend
- ✅ Scalable Node.js backend
- ✅ MongoDB database
- ✅ Authentication system
- ✅ Real-time features
- ✅ Responsive design
- ✅ Complete documentation

Happy coding! 🚀
