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
- Fully implemented desktop-friendly top navbar
- Light blue styling consistent across pages
- Icons + labels change appearance based on active route
- Appears on all pages except Login
- Global spacing and layout adjustments added (`pt-16`)

---

### 4. Routing Structure
All major app routes are created and functional:

| Route        | Status               |
|--------------|----------------------|
| `/`          | Scaffolded (Home)    |
| `/search`    | Scaffolded           |
| `/upload`    | Scaffolded           |
| `/gymbuddy`  | Scaffolded           |
| `/profile`   | Scaffolded           |
| `/login`     | Fully implemented    |

---

## Page Frameworks
Each page includes:
- A functional layout wrapper  
- Navbar spacing  
- A clear TODO comment block  
- Placeholder UI  

Pages left to be implemented:
- **Home**
- **Search**
- **GymBuddy**
- **Profile**
- **Upload**

---

## 2. To-Dos

### Home Page
- Fetch video feed from Firestore (`videos` collection)
- Render `<VideoCard />` list
- Implement infinite scrolling
- Add tag filter functionality
- Implement Settings button actions
- Replace placeholder content

---

### Search Page
- Build search bar UI
- Add filter chips (machines / body parts)
- Render results list (machines or videos)
- Debounced search logic
- Possible integration with Firestore

---

### GymBuddy Page
- Build weekly availability grid UI
- Save availability to Firestore
- Implement matching algorithm
- Show matched buddies list

---

### Profile Page
- Display user info (name, avatar, stats)
- Edit profile UI
- Display user’s uploaded videos
- Add logout button

---

### Upload Page
- Build upload form
- Upload videos to Firebase Storage
- Save metadata (title, tags, timestamp) to Firestore
- Implement progress bar
- Tag selection UI (machine categories)

---

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
We are using the same Firebase project that I have set up. Create a .env.local file in the project's root directory and copy/paste the credentails that I sent via email.

### 4. Start the development server
```bash
npm start
```
