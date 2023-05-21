import React, { useContext, useEffect,useState } from "react";
import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import New from "./pages/new/New";
import ListProject from "./pages/project/ListProject";
import DetailProject from "./pages/detailProject/detailProject";
import Profile from "./pages/profile/Profile";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import {  projectInputs, userInputs } from "./formSource";
import "./style/dark.scss";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { darkMode } = useContext(DarkModeContext);

  const {currentUser} = useContext(AuthContext)
  const [userData, setUserData] = useState(null);

  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem("user2"));
      console.log(user?.position);
      setUserData(user?.position);
    };
    fetchUserData();
  }, []);


  return (
    <div className={darkMode ? "app dark" : "app"}>
      {userData === "Admin" ?
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="login" element={<Login />} />
            <Route
              index
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route path="users">
              <Route
                index
                element={
                  <RequireAuth>
                    <List />
                  </RequireAuth>
                }
              />
              <Route
                path=":userId"
                element={
                  <RequireAuth>
                    <Single />
                  </RequireAuth>
                }
              />
              <Route
                path="new"
                element={
                  <RequireAuth>
                    <New inputs={userInputs} title="Tạo mới người dùng" />
                  </RequireAuth>
                }
              />
            </Route>
            <Route path="projects">
              <Route
                index
                element={
                  <RequireAuth>
                    <ListProject />
                  </RequireAuth>
                }
              />
              <Route
                path=":id"
                element={
                  <RequireAuth>
                    <DetailProject />
                  </RequireAuth>
                }
              />
              <Route
                path="new"
                element={
                  <RequireAuth>
                    <New inputs={projectInputs} title="Danh sách dự án" />
                  </RequireAuth>
                }
              />
            </Route>
            <Route path="profile">
              <Route
                index
                element={
                  <RequireAuth>
                    <Profile />
                  </RequireAuth>
                }
              />
            
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>  : 
       <BrowserRouter>
       <Routes>
         <Route path="/">
           <Route path="login" element={<Login />} />
           <Route path="projects">
             <Route
               index
               element={
                 <RequireAuth>
                   <ListProject />
                 </RequireAuth>
               }
             />
             <Route
               path=":id"
               element={
                 <RequireAuth>
                   <DetailProject />
                 </RequireAuth>
               }
             />
             <Route
               path="new"
               element={
                 <RequireAuth>
                   <New inputs={projectInputs} title="Danh sách dự án" />
                 </RequireAuth>
               }
             />
           </Route>
           <Route path="profile">
             <Route
               index
               element={
                 <RequireAuth>
                   <Profile />
                 </RequireAuth>
               }
             />
           
           </Route>
         </Route>
       </Routes>
     </BrowserRouter> 
      }
    </div>
  );
}

export default App;