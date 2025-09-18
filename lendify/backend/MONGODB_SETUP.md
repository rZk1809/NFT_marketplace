# 🚀 Quick MongoDB Atlas Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended) ⚡

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free"
3. Sign up with email or Google/GitHub

### Step 2: Create a Free Cluster
1. Choose "Build a Database"
2. Select "M0 Sandbox" (FREE)
3. Choose a cloud provider and region (any is fine)
4. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `lendify-user`
5. Generate secure password (save it!)
6. Database User Privileges: "Built-in Role" > "Read and write to any database"
7. Click "Add User"

### Step 4: Setup Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address" 
3. Click "Allow Access from Anywhere" (for development)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Databases" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Select "Node.js" and latest version
5. Copy the connection string
6. Replace `<password>` with your database user password

### Step 6: Update Environment File
Replace the MONGODB_URI in your `.env` file:

```env
MONGODB_URI=mongodb+srv://lendify-user:<password>@cluster0.xxxxx.mongodb.net/lendify?retryWrites=true&w=majority
```

**Example:**
```env
MONGODB_URI=mongodb+srv://lendify-user:MySecurePass123@cluster0.abcde.mongodb.net/lendify?retryWrites=true&w=majority
```

---

## Option 2: Local MongoDB (Windows) 🏠

### Method A: Start as Service (Requires Admin)
```powershell
# Run PowerShell as Administrator
Start-Service -Name "MongoDB"

# Or using net command
net start MongoDB
```

### Method B: Manual Start
```bash
# Create directories
mkdir C:\data\db
mkdir C:\data\log

# Start MongoDB manually
mongod --dbpath "C:\data\db" --logpath "C:\data\log\mongodb.log"
```

### Method C: Windows Service Manager
1. Press `Win + R`, type `services.msc`
2. Find "MongoDB Server (MongoDB)"
3. Right-click > Start

---

## 🧪 Testing Database Connection

### Method 1: Using Test Server
```bash
node test-server.js
```
Then visit: http://localhost:3001/api/db/test

### Method 2: Using Seed Script
```bash
node seed-database.js
```

### Method 3: Using MongoDB Shell
```bash
# Connect to Atlas
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/lendify" --apiVersion 1 --username lendify-user

# Connect to Local
mongosh "mongodb://localhost:27017/lendify-test"
```

---

## ✅ Verification Steps

1. **Connection Test**: `node test-server.js` should show "MongoDB Connected"
2. **Database Seeding**: `node seed-database.js` should create sample data
3. **Data Verification**: Use MongoDB Compass or mongosh to verify data

---

## 🔧 Troubleshooting

### Atlas Connection Issues
- ✅ Check IP whitelist (allow 0.0.0.0/0 for development)
- ✅ Verify username/password in connection string
- ✅ Ensure database user has proper permissions
- ✅ Check connection string format

### Local MongoDB Issues
- ✅ Ensure MongoDB service is running
- ✅ Check if port 27017 is available
- ✅ Verify data directory exists and has permissions
- ✅ Check firewall settings

### Common Error Solutions

#### "MongoNetworkError: connect ECONNREFUSED"
- MongoDB is not running or wrong connection string
- Solution: Start MongoDB service or fix connection string

#### "MongoServerError: bad auth Authentication failed"
- Wrong username/password
- Solution: Check database user credentials

#### "MongoNetworkTimeoutError"
- Network/firewall issues
- Solution: Check network access in Atlas or local firewall

---

## 🚀 **Recommended: Use MongoDB Atlas**

**Why Atlas?**
- ✅ **No setup required** - works immediately
- ✅ **Free tier available** - perfect for development
- ✅ **Cloud reliability** - no local dependencies
- ✅ **Automatic backups** - data safety
- ✅ **Global availability** - accessible anywhere
- ✅ **Built-in monitoring** - performance insights

**Time to Setup:**
- ⏱️ **Atlas**: 5-10 minutes
- ⏱️ **Local**: 15-30 minutes (with potential issues)

---

## 🎯 **Next Step After Database Setup**

Once your database is connected:

```bash
# 1. Seed the database
node seed-database.js

# 2. Fix TypeScript issues 
npm run build

# 3. Start the full server
npm run dev
```

**Ready to set up your database?** I recommend MongoDB Atlas for the quickest setup!