# 🦁 LionGains — Web App (React + Firebase + TailwindCSS)

LionGains is a fitness-focused web application built as a collaborative team project.  
Our goal is to help Columbia students safely learn gym equipment, discover workouts, and find gym buddies.

This repository contains the initial project setup, authentication system, routing structure, and a fully functional global navbar.  
Feature pages are scaffolded with TODO instructions for teammates to implement next.

---

## 1. Current Features Implemented

### 1. Project Initialization
- Created using **Create React App**
- Installed and configured:
  - **Firebase** (Authentication, Firestore, Storage)
  - **React Router v6**
  - **TailwindCSS v3**
  - **Heroicons v2**
  - GitHub repository setup & push

---

### 2. Authentication
- Firebase Authentication initialized
- Login page implemented
- Protected route system using `<ProtectedRoute />`
- Redirect logic between `/login` and `/`

---

### 3. Global Navigation Bar
- Fully implemented desktop-friendly bottom navbar
- Light blue styling consistent across pages
- Icons + labels change appearance based on active route
- Appears on all pages except Login
- Global spacing and layout adjustments added (`pt-16`)

---

### 4. Routing Structure
All major app routes are created and functional:

| Route        |
|--------------|
| `/`          |
| `/search`    |
| `/upload`    |
| `/chats`     |
| `/gymbuddy`  |
| `/profile`   |
| `/login`     |

---

## Page Frameworks
Each page includes:
- A functional layout wrapper  
- Navbar spacing   

## 🚀 Getting Started (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/NancyCLY/liongains.git
cd liongains
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your .env.local file
All of the firebase api key and login information is located in the .env.local file. If the file does not exist, rename the env.local file to .env.local. The file MUST be called .env.local in order for the app to be connected to the backend Firebase.

### 4. Start the development server
```bash
npm start
```

### 5. Where/how to use app
Even though we use React to create the app, this app was designed to be used on mobile. After npm start, you should see the following message:

You can now view liongains in the browser.

Local:            http://localhost:3000
On Your Network:  http://192.xxx.x.x:3000

Once the app is running, please view the app on a phone by typing the "On Your Network" link into your browser on the phone. You should be on the same Wifi as your laptop which is running the app.

### 6. Testing users
Since we do not have signup as a part of our functionality, all of our test users are created through login and manually inputting into the Firebase backend. You will not be able to see pages like Profile and buddy matching unless you are logged in. 

Some example test user logins and passwords to try:

username: 123456@gmail.com
password: 123456

username: user4@gmail.com
password: liongainspassword

username: user6@gmail.com
password: liongainspassword