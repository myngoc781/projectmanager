import React, { createContext, useEffect, useReducer, Component } from "react";
import AuthReducer from "./AuthReducer";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firbase";

const INITIAL_STATE = {
  currentUser: JSON.parse(localStorage.getItem("user")) || null,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(async () => {
    localStorage.setItem("user", JSON.stringify(state.currentUser));
    const userRef = doc(collection(db, "users"), state.currentUser.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      localStorage.setItem("user2", JSON.stringify(userDoc.data()));
    } else {
      // Trả về null nếu tài liệu không tồn tại
      return null;
    }
  }, [state.currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser: state.currentUser, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};