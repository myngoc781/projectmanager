import { useContext, useState, useEffect } from "react";
import "./login.scss";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firbase";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import * as React from "react";
import Calendar from "../../components/calendar/calendar";
import logo from "../../assets/images/logo.png";
import { Spin, Alert, Button, Form, Modal } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";

const Login = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);


  // const handleLogout = async () => {
  //   try {
  //     await auth.signOut();
  //     dispatch({ type: "LOGOUT" });
  //     navigate("/login");
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem("user2"));
      console.log(user.position);
      setUserData(user.position);
    };
    fetchUserData();
  }, []);
  const countDown = () => {
    let secondsToGo = 3;
    const instance = modal.error({
      title: 'Đăng nhập thất bại!',
      content: `Thông tin đăng nhập không đúng. Đóng sau ( ${secondsToGo} ) s`,
      okText: <p>Đóng</p>,
    });
    const timer = setInterval(() => {
      secondsToGo -= 1;
      instance.update({
        content: `Thông tin đăng nhập không đúng. Đóng sau ( ${secondsToGo} ) s`,
      });
    }, 1000);
    setTimeout(() => {
      clearInterval(timer);
      instance.destroy();
    }, secondsToGo * 1000);
  };
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        dispatch({ type: "LOGIN", payload: user });
        const user2 = JSON.parse(localStorage.getItem("user2"));
        navigate("/");
        if(user2.position === "Admin"){
          navigate("/");
        }else{
          navigate("/projects");
        }
      })
      .catch((error) => {
        setError(true);
        countDown();
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const inputType = showPassword ? "text" : "password";
  return (
    <div className="box">
    <div className="box-form">
      <div className="right">
        <div className="title">
          <img src={logo} alt="logo" />
          <div className="hash">
            <h1>ĐĂNG NHẬP</h1>
            <h5>Sổ quản lý công việc UNICLO</h5>
          </div>
        </div>
        <Form className="login-form" onSubmitCapture={handleLogin}>
          <p></p>
          <div className="inputs">
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập Email!",
                },
              ]}
            >
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Email"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu!",
                },
              ]}
            >
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Mật khẩu"
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone onClick={() => setShowPassword(false)} />
                  ) : (
                    <EyeInvisibleOutlined
                      onClick={() => setShowPassword(true)}
                    />
                  )
                }
                visibilityToggle={true}
                type={inputType}
              />
            </Form.Item>
          </div>
          <br />
          <Form.Item
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button type="primary" htmlType="submit" className="button">
              Đăng nhập 
            </Button> 
            {error && 
              contextHolder
              }
          </Form.Item>
        </Form>
      </div>
    </div>
    </div>
  );
};

export default Login;
