import { Table, Button, Modal, Input } from "antd";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../../firbase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { EyeFilled, DeleteFilled, PlusCircleFilled } from "@ant-design/icons";
import "./datatable.scss";
const Datatable = () => {
  const [data, setData] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsub = onSnapshot(
      q,
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ key: doc.id, ...doc.data() });
        });
        list = list.filter((user) => {
          return user.email.toLowerCase().includes(searchText.toLowerCase());
        });
        console.log(list);
        setData(list);
      },
      (error) => {
        console.log(error);
      }
    );
    return () => {
      unsub();
    };
  }, [searchText]);

  const handleDelete = (id) => {
    setDeleteModalId(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    const docRef = doc(db, "users", deleteModalId);
    deleteDoc(docRef)
      .then(() => {
        console.log("Document successfully deleted!");
        setData(data.filter((item) => item.key !== deleteModalId));
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
    setDeleteModalVisible(false);
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
  };

  const columns = [
    {
      title: "Tên người dùng",
      dataIndex: "user",
      key: "user",
      render: (text, record) => (
        <div className="cellWithImg">
          <img className="cellImg" src={record.img} alt="avatar" />
          {record?.userName}
        </div>
      ),
    },
    {
      title: "Họ Tên",
      dataIndex: "displayName",
      key: "displayName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Vị trí làm việc",
      dataIndex: "position",
      key: "position",
      render: (text, record) => (
        <div className={`cellWithPosition ${record.position}`}>
          {record.position}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <div className="cellAction">
          <Link to={"/users/" + record.key} style={{ textDecoration: "none" }}>
            <EyeFilled />
          </Link>
          <DeleteFilled
            style={{ color: "red" }}
            type="danger"
            onClick={() => handleDelete(record.key)}
          ></DeleteFilled>
        </div>
      ),
    },
  ];

  return (
    <div className="datatable">
      <div className="datatableTitle">
        Danh sách người dùng
        <Input.Search
          placeholder="Tìm kiếm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300, marginBottom: 16, marginTop: 20 }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginLeft:50,marginBottom: 20 }}>
        <Link
          to="/users/new"
          style={{
            fontWeight: "bold",
            fontSize: "15px",
            color: "white",
            backgroundColor: "#0096c7",
            display: "inline-block",
            padding: "6px 20px",
            textDecoration: "none",
            borderRadius: 20,
            alignItems: "center",
          }}
        >
          {" "}
          <PlusCircleFilled style={{ marginRight: 10 }} />
          Thêm mới người dùng
        </Link>
      </div>
      <Table
        className="datagrid"
        dataSource={data}
        columns={columns}
        pagination={{ position: ["bottomCenter"] }}
      />
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      >
        <p>Bạn có chắc chắn muốn xóa?</p>
      </Modal>
    </div>
  );
};

export default Datatable;
