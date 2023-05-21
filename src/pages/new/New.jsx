import React from "react";
import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, storage } from "../../firbase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { Autocomplete, Select, TextField } from "@mui/material";
import ReactSelect from "react-select";
import { notification } from "antd";
import bcrypt from "bcryptjs";
import { CloudUploadOutlined } from "@mui/icons-material";

const positions = [
  { value: "development", label: "Development" },
  { value: "design", label: "Design" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
];
const New = ({ inputs, title }) => {
  const [file, setFile] = useState("");
  const [data, setData] = useState({});
  const [position, setPosition] = useState("");
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name;

      console.log(name);
      const storageRef = ref(storage, file.name);
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
            setData((prev) => ({ ...prev, img: downloadURL }));
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);
  console.log(data);
  const handleInput = (e) => {
    const id = e.target.id;
    const value = e.target.value;

    setData({
      ...data,
      [id]: value,
    });
  };

  // const handleAdd = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await createUserWithEmailAndPassword(
  //       auth,
  //       data.email,
  //       data.password,
  //     );
  //     await setDoc(doc(db, "users", res.user.uid), {
  //       ...data,
  //       timeStamp: serverTimestamp(),
  //     });
  //     navigate(-1);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };
  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const res = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const newData = {
        ...data,
        password: hashedPassword,
        position: selectedPosition.label,
        timeStamp: serverTimestamp(),
      };
      await setDoc(doc(db, "users", res.user.uid), newData);
      navigate(-1);
      notification.success({
        message: "Thông báo",
        description: "Tạo tài khoản thành công",
      });
    } catch (err) {
      console.log(err);
      notification.error({
        message: "Lỗi",
        description: "Tạo tài khoản không thành công",
      });
    }
  };
  
  const handlePositionChange = (selectedOption) => {
    setSelectedPosition(selectedOption);
  };
  return (
    <div className="box" >
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
            />
           <div className="formInput">
              <label htmlFor="file">
                  Tải ảnh lên:{" "}
                  <CloudUploadOutlined className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>
          </div>
          <div className="right">
            <form onSubmit={handleAdd}>
              

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  {input.id === "position" ? (
                    <ReactSelect
                      options={input.options}
                      value={selectedPosition}
                      onChange={handlePositionChange}
                    />
                  ) : (
                    <input
                      id={input.id}
                      type={input.type}
                      placeholder={input.placeholder}
                      onChange={handleInput}
                    />
                  )}
                </div>
              ))}
              <button type="submit">Tạo mới</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;
