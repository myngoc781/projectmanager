
import React, { useState, Component, useEffect  } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import "./home.scss";
import Widget from "../../components/widget/Widget";
// import Featured from "../../components/featured/Featured";
import Chart from "../../components/chart/Chart";
import Table from "../../components/table/Table";
import { db } from '../../firbase';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';

const Home = () => {
  const [countUser, setCountUser] = useState(0);
  const [countProject, setCountProject] = useState(0);

  useEffect(async () => {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    const collectionLength = snapshot.size;
    setCountUser(collectionLength);
    console.log(`Chiều dài của collection "users": ${collectionLength}`);

    const q2 = query(collection(db, 'boards'));
    const snapshot2 = await getDocs(q2);
    const collectionLength2 = snapshot2.size;
    setCountProject(collectionLength2);
    console.log(`Chiều dài của collection "users": ${collectionLength2}`);
  }, []);

  return (
    <div className="home">
      <Sidebar />
      <div className="homeContainer">
        <Navbar />
        <div className="widgets">
          <Widget type="user" amount={countUser}/>
          <Widget type="project" amount={countProject}/>
        </div>
        <div className="charts">
          <Chart title="DỰ ÁN CÁC THÁNG TRONG NĂM" aspect={2 / 1} />
        </div>
        {/* <div className="listContainer">
          <div className="listTitle">DỰ ÁN</div>
          <Table />
        </div> */}
      </div>
    </div>
  );
};

export default Home;
