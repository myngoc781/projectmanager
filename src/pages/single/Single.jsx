import { useState } from "react";
import "./single.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import Chart from "../../components/chart/Chart";
import List from "../../components/table/Table";
import { useEffect } from "react";
import { collection, doc, getDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firbase";

const Single = () => {
  const [userData, setUserData] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    const fetchUserData = async () => {
      const userRef = doc(collection(db, "users"), userId);
      const userDoc = await getDoc(userRef);
      console.log(userDoc.data());
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        console.log("No user data found");
      }
    };
    fetchUserData();
  });

  return (
    <div>
      <Sidebar />
      <div className="singleContainer">
      <Navbar /> 
        <div className="left">
          <h1 className="title">Thông tin người dùng</h1>
          <div className="item">
            <img src={userData?.img} alt="" className="itemImg" />
            <div className="details">
              <h1 className="itemTitle">{userData?.name}</h1>
              <div className="detailItem">
                <span className="itemKey">Tên:</span>
                <span className="itemValue">{userData?.displayName}</span>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Single;
