
import React, { useState, Component, useEffect  } from "react";
import "./detailProject.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import Datatable from "../../components/datatable/Datatable"
import { doc, getDocFromCache } from "firebase/firestore";
import DetailsProjectComponent from "../../components/detailProject/detail-project.component";

const DetailProject = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <DetailsProjectComponent/>
      </div>
    </div>
  )
}

export default DetailProject