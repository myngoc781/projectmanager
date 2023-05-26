import React from "react";
import "./projectComponent.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns, userRows } from "../../datatablesource";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { db, storage } from "../../firbase";
import { collection, deleteDoc, addDoc, getDoc, where, getDocs, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import {
  Col, Row, Typography, Spin, Button, PageHeader, Card, Badge, Empty, Input,
  Form, Pagination, Modal, Popconfirm, notification, BackTop, Tag, Upload, Select, Popover, Avatar, DatePicker, Tooltip
} from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined, PlusOutlined, UploadOutlined, EyeOutlined, DeleteOutlined, PlusCircleFilled } from '@ant-design/icons';
import { boardsRef } from "../../api/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import moment from 'moment';

const { Meta } = Card;
const { Option } = Select;
const { TextArea } = Input;

const ProjectComponent = () => {

  const [data, setData] = useState([]);
  const [form] = Form.useForm();
  const [boards, setBoards] = useState([]);
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState();
  const [selectedBoardId, setSelectedBoardId] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  const showModal = () => {
    setOpenModalCreate(true);
  };

  const handleDetailView = (board) => {
    navigate("/projects/" + board.id)
  }

  const [valueUpdate, setValueUpdate] = useState(null);

  function handleOptionsClick(e, board) {
    e.preventDefault();
    console.log(board);
    setValueUpdate(board);
    // form.setFieldsValue({
    //   name: board.name,
    //   description: board.description,
    // });
    setSelectedBoard(board);
    setOpenModalUpdate(true);
  }

  const handleOkUser = async (values) => {
    console.log(values);
    setLoading(true);
    const board = {
      name: values.name,
      description: values.description,
      image: image,
      createdAt: new Date(),
      columns: [],
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD'),
      status: values.status
    };
    try {
      const docRef = await addDoc(boardsRef, board);
      console.log("Board created successfully with ID: ", docRef.id);
      setOpenModalCreate(false);
      notification.success({
        message: "Tạo dự án mới thành công!",
      });
    } catch (error) {
      console.error("Error creating board: ", error);
      notification.error({
        message: "Tạo dự án mới thất bại!",
      });
      setImage(null);
    }
    setLoading(false);
  };


  const handleChangeImage = (e) => {
    const file = e.target.files[0];
    const name = new Date().getTime() + file.name;
    const storageRef = ref(storage, name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
          default:
            break;
        }
      },
      (error) => {
        console.log(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          notification.success({
            message: "Upload ảnh thành công!",
          });
          setImage(downloadURL)
        });
      }
    );
    e.target.files = null;
  };

  const handleCancel = (type) => {
    if (type === "create") {
      setOpenModalCreate(false);
    } else {
      setOpenModalUpdate(false)
    }
    console.log('Clicked cancel button');
  };

  useEffect(() => {
    const user2 = JSON.parse(localStorage.getItem("user2"));
    const user = JSON.parse(localStorage.getItem("user"));
    setUserData(user2.position);

    const unsub = onSnapshot(
      query(collection(db, "boards"),
        orderBy("name")
      ),
      (snapshot) => {
        let boardList = [];

        // Nếu người dùng là admin, lấy toàn bộ data board
        if (user2.position === "Admin") {
          snapshot.docs.forEach((doc) => {
            boardList.push({ id: doc.id, ...doc.data() });
          });
        } else {
          // Ngược lại, lấy data board dựa vào list member trong board mà user đó được add
          snapshot.docs.forEach((doc) => {
            const boardData = doc.data();
            if (boardData?.member?.find((member) => member.id === user.uid)) {
              boardList.push({ id: doc.id, ...boardData });
            }
          });
        }

        boardList = boardList.filter((board) => {
          return board.name.toLowerCase().includes(searchText.toLowerCase()) ||
            board.description.toLowerCase().includes(searchText.toLowerCase());
        });

        console.log(boardList);
        setBoards(boardList);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
    };
  }, [searchText]);

  const handleOkUpdate = async (values) => {
    console.log(values);
    setLoading(true);
    const boardRef = doc(db, "boards", selectedBoard.id);
    const board = {
      name: values.name,
      description: values.description,
      image: image || selectedBoard.image,
      startDate: values.startDate.format('YYYY-MM-DD'),
      endDate: values.endDate.format('YYYY-MM-DD'),
      status: values.status,
    };
    console.log(board);
    try {
      await updateDoc(boardRef, board);
      console.log("Board updated successfully with ID: ", selectedBoard.id);
      setOpenModalUpdate(false);
      notification.success({
        message: "Cập nhật dự án thành công!",
      });
    } catch (error) {
      console.error("Error updating board: ", error);
      notification.error({
        message: "Cập nhật dự án thất bại!",
      });
    }
    setLoading(false);
  };

  // Hàm xử lý khi chọn một lựa chọn từ select box
  async function deleteBoard(boardId) {
    try {
      const boardRef = doc(db, "boards", boardId);
      await deleteDoc(boardRef);
      notification.success({
        message: "Xóa dự án thành công!",
      });
      setData(data.filter((item) => item.id !== boardId));
    } catch (error) {
      notification.error({
        message: "Xóa dự án thất bại!",
        description: error.message,
      });
      console.error("Xóa dự án thất bại: ", error);
    }
  }


  return (

    <div className="datatable">
      <Spin spinning={loading}>
        <div className="datatableTitle">
          Danh sách dự án
          <Input.Search
          placeholder="Tìm kiếm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300, marginBottom: 16, marginTop: 20}}
        />
          {userData === "Admin" ?
            <Button  style={{
              fontWeight: "bold",
              fontSize: "15px",
              color: "white",
              backgroundColor: "#0096c7",
              display: "inline-block",
              textDecoration: "none",
              borderRadius: 20,
              alignItems: "center",
            }} type="primary" icon={<PlusCircleFilled />} onClick={showModal}>
              Thêm mới dự án
            </Button> : ""}
        </div>
        
        <Row className="row" gutter={16}>
          {boards.map((board) => (
            <Col span={5} key={board.id} className="list-board">
              <Card
               className="cart"
                cover={
                  <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "5px",
                  }}
                >
                  <img
                    alt="example"
                    src={board.image}
                    style={{  width: "95%",
                    height: 170,
                    boxShadow: "2px 4px 10px 1px rgba(201, 201, 201, 0.47)" }}
                  />
        
                </div>}
                actions={[
                  <Tooltip  title="Xem chi tiết" >
                    <EyeOutlined
                      style={{ color: "#219ebc" }}
                      key="view"
                      onClick={() => handleDetailView(board)}
                    />
                  </Tooltip>,
                  <Tooltip title="Chỉnh sửa dự án">
                  <EditOutlined
                    style={{ color: "#008000" }}
                    key="edit"
                    onClick={(e) => handleOptionsClick(e, board)}
                  />
                  </Tooltip>,
                  <Popover
                    content={
                      <div className="group-button">
                        <p>Xóa dự án này?</p>
                        <Button
                          type="ghost"
                          style={{
                            marginTop: 6,
                            color: "white",
                            backgroundColor: "#ef233c",
                          }}
                          onClick={() => {
                            deleteBoard(selectedBoardId);
                            setSelectedBoardId(null);
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    }
                    open={selectedBoardId === board.id}
                    onOpenChange={(visible) =>
                      setSelectedBoardId(visible ? board.id : null)
                    }
                  >
                    <DeleteOutlined style={{ color: "#f07167" }} key="delete" />
                  </Popover>,
                ]}
              >
                <Meta
                  title={board.name}
                  description={board.description}
                  status={board.status}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Modal
          title="Tạo dự án mới"
          visible={openModalCreate}
          style={{ top: 100 }}
          onOk={() => {
            form
              .validateFields()
              .then((values) => {
                form.resetFields();
                handleOkUser(values);
              })
              .catch((info) => {
                console.log('Validate Failed:', info);
              });
          }}
          onCancel={() => handleCancel("create")}
          okText="Hoàn thành"
          cancelText="Hủy"
          width={600}
        >
          <Form
            form={form}
            name="eventCreate"
            layout="vertical"
            initialValues={{
              residence: ['zhejiang', 'hangzhou', 'xihu'],
              prefix: '86',
            }}
            scrollToFirstError
          >
            <Form.Item
              name="name"
              label="Tên"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên!',
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Tên" />
            </Form.Item>
            <Form.Item
              name="description"
              label="Mô tả"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập mô tả!',
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Input placeholder="Mô tả" />
            </Form.Item>
            <Form.Item
              name="startDate"
              label="Ngày bắt đầu"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn ngày bắt đầu!',
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Ngày kết thúc"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn ngày kết thúc!',
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <DatePicker style={{ width: '100%' }}

              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn trạng thái!',
                },
              ]}
              style={{ marginBottom: 10 }}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="completed">Hoàn thành</Option>
                <Option value="inProgress">Đang triển khai</Option>
                <Option value="onHold">Tạm dừng</Option>
              </Select>
            </Form.Item>
            <Form.Item name="image">
              <input type="file" onChange={handleChangeImage} id="avatar" name="file" accept="image/png, image/jpeg" />
            </Form.Item>
          </Form>
        </Modal>

        {userData === "Admin" || userData === "Manager" ?
          <Modal
            title="Chỉnh sửa dự án"
            visible={openModalUpdate}
            style={{ top: 100 }}
            onOk={() => {
              form
                .validateFields()
                .then((values) => {
                  form.resetFields();
                  handleOkUpdate(values);
                })
                .catch((info) => {
                  console.log('Validate Failed:', info);
                });
            }}
            onCancel={() => handleCancel("update")}
            okText="Hoàn thành"
            cancelText="Hủy"
            width={600}
          >
            <Form
              form={form}
              name="eventUpdate"
              layout="vertical"
              initialValues={{
                name: valueUpdate?.name,
                description: valueUpdate?.description,
                startDate: moment(valueUpdate?.startDate),
                endDate: moment(valueUpdate?.endDate),
                status: valueUpdate?.status
              }}
              scrollToFirstError
            >
              <Form.Item
                name="name"
                label="Tên"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập tên!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Tên" />
              </Form.Item>
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng nhập mô tả!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Input placeholder="Mô tả" />
              </Form.Item>

              <Form.Item
                name="startDate"
                label="Ngày bắt đầu"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn ngày bắt đầu!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn ngày kết thúc!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }}

                />
              </Form.Item>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn trạng thái!',
                  },
                ]}
                style={{ marginBottom: 10 }}
              >
                <Select placeholder="Chọn trạng thái">
                  <Option value="completed">Hoàn thành</Option>
                  <Option value="inProgress">Đang triển khai</Option>
                  <Option value="onHold">Tạm dừng</Option>
                </Select>
              </Form.Item>

              <Form.Item name="image">
                <input type="file" onChange={handleChangeImage}
                  id="avatar" name="file"
                  accept="image/png, image/jpeg" />
              </Form.Item>
            </Form>
          </Modal>
          : ""}


      </Spin>
    </div >
  );
};

export default ProjectComponent;