import "./sidebar.scss";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import StoreIcon from "@mui/icons-material/Store";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import { Link } from "react-router-dom";
import React, { useContext, useEffect, useState } from "react";
import { auth } from "../../firbase";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CreateProject from "../../pages/createproject/CreateProject";
import logo from "../../assets/images/logotasks.png"
import { CalendarMonth } from "@mui/icons-material";

const Sidebar = () => {
  const { dispatch } = useContext(AuthContext);
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await auth.signOut();
      dispatch({ type: "LOGOUT" });
      navigate("/login");
      localStorage.clear();
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem("user2"));
      console.log(user.position);
      setUserData(user.position);
    };
    fetchUserData();
  }, []);

  return (
    <div className="sidebar">
      <div className="top">
        <Link to="/" style={{ textDecoration: "none" }}>
          <img src={logo} className="logo" />
        </Link>
      </div>
      <hr />
      <div className="center">
        {userData === "Admin" ? (
          <ul>
            <p className="title">TRANG CHỦ</p>

            <Link to="/" style={{ textDecoration: "none" }}>
              <li >
                <DashboardIcon className="icon" />
                <span>Thống kê</span>
              </li>
            </Link>
            <p className="title">DANH MỤC</p>
            <Link to="/users" style={{ textDecoration: "none" }}>
              <li>
                <PersonOutlineIcon className="icon" />
                <span>Người dùng</span>
              </li>
            </Link>
            <Link to="/projects" style={{ textDecoration: "none" }}>
              <li>
                <StoreIcon className="icon" />
                <span>Dự án</span>
              </li>
            </Link>
            {/* <Link to="/projects" style={{ textDecoration: "none" }}>
              <li>
                <CalendarMonth className="icon" />
                <span>Lịch trình</span>
              </li>
            </Link> */}

            <p className="title">NGƯỜI DÙNG</p>
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <li>
                <AccountCircleOutlinedIcon className="icon" />
                <span>Thông tin cá nhân</span>
              </li>
            </Link>
            <li onClick={handleLogout}>
              <ExitToAppIcon className="icon" />
              <span>Đăng xuất</span>
            </li>
          </ul>
        ) : (
          <ul>
            <p className="title">DANH MỤC</p>
            <Link to="/projects" style={{ textDecoration: "none" }}>
              <li>
                <StoreIcon className="icon" />
                <span>Dự án</span>
              </li>
            </Link>

            <p className="title">NGƯỜI DÙNG</p>
            <Link to="/profile" style={{ textDecoration: "none" }}>
              <li>
                <AccountCircleOutlinedIcon className="icon" />
                <span>Thông tin cá nhân</span>
              </li>
            </Link>
            <li onClick={handleLogout}>
              <ExitToAppIcon className="icon" />
              <span>Đăng xuất</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
