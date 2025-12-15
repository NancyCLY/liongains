import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import GymBuddy from "./pages/GymBuddy";
import Upload from "./pages/Upload";
import Login from "./pages/Login";
import FoundBuddies from "./pages/FoundBuddies";
import Chats from "./pages/Chats";

import Navbar from "./components/Navbar";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Top nav bar */}
        <Navbar />

        {/* Page content */}
        <div className="pt-16 min-h-screen">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />

            {/* Protected routes */}
            <Route
              path="/gymbuddy"
              element={
                <ProtectedRoute>
                  <GymBuddy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/foundbuddies"
              element={
                <ProtectedRoute>
                  <FoundBuddies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chats"
              element={
                <ProtectedRoute>
                  <Chats />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
