import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    try {
      const res = await axios.post(
        process.env.REACT_APP_BACKEND_URL + "auth/login",
        inputs,
        { withCredentials: true }
      );
      setCurrentUser(res.data);
    } catch (error) {
      console.error("Login Error:", error);
      // Handle login errors gracefully (e.g., display error messages to user)
    }
  };

  useEffect(() => {
    // Persist currentUser only on successful login
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  // Console log for debugging purposes (remove for production)
  console.log("Current User:", currentUser);
  console.log("currentId:", currentUser?.id);

  return (
    <AuthContext.Provider value={{ currentUser, login }}>
      {children}
    </AuthContext.Provider>
  );
};
