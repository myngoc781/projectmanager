import React, { useState, Component } from "react";
import "./profile.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import List from "../../components/table/Table";
import { useEffect } from "react";
import { collection, doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, getAuth } from "firebase/auth";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firbase";
import { Form, Input, Button, Divider, Alert, Modal, notification } from "antd";
import { values } from "lodash";
import { EditOutlined, KeyOutlined } from "@ant-design/icons";

const Single = () => {
  const [userData, setUserData] = useState(null);
  const [isVisibleModal, setVisibleModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { password, currentPassword } = values;
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      if (auth.currentUser) {
        await updatePassword(user, password);
        notification.success({
          message: "Thay đổi mật khẩu thành công",
          description: "Mật khẩu đã được thay đổi thành công.",
        });
        form.resetFields();
      } else {
        console.log("User is not authenticated.");
      }
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        // Show message to user to log in again
        notification.error({
          message: "Lỗi thay đổi mật khẩu",
          description:
            "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại trước khi thay đổi mật khẩu.",
        });
      } else {
        console.log(error);
        notification.error({
          message: "Lỗi thay đổi mật khẩu",
          description: error.message,
        });
      }
    }
  };

  const handleUpdateAccount = async (values) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userRef = doc(collection(db, "users"), user.uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      setUserData(userDoc.data());
      setVisibleModal(true);
    } else {
      console.log("No user data found");
    }
  };

  const handleFormSubmit = async (values) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userRef = doc(collection(db, "users"), user.uid);
    const { userName, displayName, email, phoneNumber, address, position } =
      values;
    try {
      await updateDoc(userRef, {
        userName: userName,
        displayName: displayName,
        email: email,
        phoneNumber: phoneNumber,
        address: address,
      });
      notification.success({
        message: "Cập nhật thành công!",
        description: "",
      });
      setVisibleModal(false);
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Cập nhật thất bại",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = JSON.parse(localStorage.getItem("user"));
      console.log(user.uid);
      const userRef = doc(collection(db, "users"), user.uid);
      const userDoc = await getDoc(userRef);
      console.log(userDoc.data());
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        console.log("No user data found");
      }
    };
    fetchUserData();
  }, []);

  return (
    <div>
      <Sidebar />
      <div className="singleContainer">
        <Navbar />
        <div
          className="hi"
          style={{
            boxShadow: "2px 4px 10px 1px rgba(201, 201, 201, 0.47)",
            width: "calc(100% - 650px)",
            margin: "50px",
            height: "60px",
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0077b6",
            color: "#fff",
          }}
        >
          <h1 style={{ fontSize: "25px" }}>Thông tin cá nhân</h1>
        </div>

        <div className="left">
          <div className="item">
            <img src={userData?.img} alt="" className="itemImg" />
            <div className="details">
              <h1 className="itemTitle">{userData?.name}</h1>
              <div className="detailItem">
                <span className="itemKey">Họ và tên:</span>
                <span className="itemValue">{userData?.displayName}</span>
              </div>
              <div className="detailItem">
                <span className="itemKey">Tên người dùng:</span>
                <span className="itemValue">{userData?.userName}</span>
              </div>
              <div className="detailItem">
                <span className="itemKey">Email:</span>
                <span className="itemValue">{userData?.email}</span>
              </div>
              <div className="detailItem">
                <span className="itemKey">Số điện thoại:</span>
                <span className="itemValue">{userData?.phoneNumber}</span>
              </div>
              <div className="detailItem">
                <span className="itemKey">Địa chỉ:</span>
                <span className="itemValue">{userData?.address}</span>
              </div>
              <div className="detailItem">
                <span className="itemKey">Vị trí:</span>
                <span className="itemValue">{userData?.position}</span>
              </div>
              <div className="detailItem">
                <span className="itemKey">Ngày bắt đầu làm việc:</span>
                <span className="itemValue">{userData?.startDate}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", justifyContent: "flex-end" }}>
            <div
              style={{
                color: "#fff",
                width: "190px",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#0077b6",
              }}
              onClick={() => handleUpdateAccount()}
            >
              <EditOutlined />
              <span style={{ marginLeft: "5px" }}> Chỉnh sửa thông tin</span>
            </div>
            <div
              style={{
                color: "#fff",
                width: "190px",
                borderRadius: "10px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#0077b6",
                marginTop: "10px",
              }}
              onClick={() => setIsModalVisible(true)}
            >
              <KeyOutlined />
              <span style={{ marginLeft: "5px" }}> Đổi mật khẩu</span>
            </div>
          </div>
        </div>

        <div>
          <Modal
            title="Cập nhật thông tin cá nhân"
            visible={isVisibleModal}
            onCancel={() => setVisibleModal(false)}
            footer={null}
          >
            <Form
              initialValues={{
                userName: userData?.userName,
                displayName: userData?.displayName,
                email: userData?.email,
                phoneNumber: userData?.phoneNumber,
                address: userData?.address,
                position: userData?.position,
              }}
              onFinish={handleFormSubmit}
            >
              <Form.Item
                label="Tên"
                name="userName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Tên hiển thị"
                name="displayName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên hiển thị!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Số điện thoại"
                name="phoneNumber"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập địa chỉ!",
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button type="primary" htmlType="submit">
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Modal>
          <Modal
          style={{width:"fit-content"}}
            title="Đổi mật khẩu"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
           
          >
            <div className="changePassword">
              <Form
                style={{
                  display: "grid",
                  justifyContent: "center",
                }}
                name="normal_login"
                form={form}
                className="loginform"
                initialValues={{
                  remember: true,
                }}
                onFinish={onFinish}
              >
                <Form.Item style={{ width: "300px" }}>
                  {/* <Divider
                    style={{
                      marginBottom: 5,
                      fontSize: 19,
                      fontWeight: "bold",
                    }}
                    orientation="center"
                  >
                    Đổi mật khẩu
                  </Divider> */}
                </Form.Item>
                <Form.Item
                  name="currentPassword"
                  style={{ width: "300px" }}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu cũ!",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="Mật khẩu cũ" />
                </Form.Item>

                <Form.Item
                  style={{ width: "300px" }}
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu mới!",
                    },
                  ]}
                  hasFeedback
                >
                  <Input.Password placeholder="Mật khẩu" />
                </Form.Item>

                <Form.Item
                  name="confirm"
                  style={{ width: "300px" }}
                  dependencies={["password"]}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: "Nhập lại mật khẩu mới!",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          new Error(
                            "Hai mật khẩu bạn nhập vào không trùng nhau!"
                          )
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Xác minh mật khẩu" />
                </Form.Item>

                <Form.Item
                  style={{
                    marginTop: 20,
                    justifyContent: "flex-end",
                    display: "flex",
                  }}
                >
                  <Button
                    className="button"
                    type="primary"
                    htmlType="submit"
                    style={{ width: "fit-content" }}
                  >
                    Hoàn Thành
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Modal>
          </div>
        </div>
      </div>
  );
};

export default Single;
