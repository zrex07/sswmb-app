import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

// Load offline users (for testing or local login)
const users = require("../assets/data/users.json");

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  //  Load saved user on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const saved = await AsyncStorage.getItem("LOCAL_USER_v1");
        if (saved) {
          setUser(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  //  Login function (offline check)
  const login = async (email, password) => {
    try {
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase() &&
          u.password === password
      );

      if (!found) {
        return { error: new Error("Invalid email or password") };
      }

      setUser(found);
      await AsyncStorage.setItem("LOCAL_USER_v1", JSON.stringify(found));
      setIsVerified(false); // Reset verification on new login
      return { data: found };
    } catch (err) {
      console.error("Login error:", err);
      return { error: err };
    }
  };

  //  Logout function
  const logout = async () => {
    try {
      setUser(null);
      setIsVerified(false);
      await AsyncStorage.removeItem("LOCAL_USER_v1");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  //  Change password function
  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return { error: "No user logged in" };

    if (user.password !== currentPassword) {
      return { error: "Current password is incorrect" };
    }

    const updatedUser = { ...user, password: newPassword };
    setUser(updatedUser);

    try {
      // Update AsyncStorage
      await AsyncStorage.setItem("LOCAL_USER_v1", JSON.stringify(updatedUser));

      // Also update offline users.json (in-memory only)
      const idx = users.findIndex((u) => u.email === user.email);
      if (idx !== -1) users[idx].password = newPassword;

      return { data: updatedUser };
    } catch (err) {
      console.error("Password change error:", err);
      return { error: err };
    }
  };

  const updatePasswordOffline = async (email, newPassword) => {
    try {
      const updatedUsers = users.map(u =>
        u.email === email ? { ...u, password: newPassword } : u
      );
      await AsyncStorage.setItem("users", JSON.stringify(updatedUsers));
      setUser({ ...user, password: newPassword });
      return true;
    } catch (err) {
      console.error("Error updating password:", err);
      return false;
    }
  };

  // Mark user as verified after facial recognition
  const markAsVerified = () => {
    setIsVerified(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        changePassword,
        updatePasswordOffline,
        isAuthenticated: !!user,
        isVerified,
        markAsVerified,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easier usage
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};