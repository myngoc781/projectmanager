import React, { useState, Component  } from "react";
import "./listProject.scss"
import Sidebar from "../../components/sidebar/Sidebar"
import Navbar from "../../components/navbar/Navbar"
import Datatable from "../../components/datatable/Datatable"
import { doc, getDocFromCache } from "firebase/firestore";
import ProjectComponent from "../../components/project/projectComponent";

const ListProject = () => {
  return (
    <div className="list">
      <Sidebar/>
      <div className="listContainer">
        <Navbar/>
        <ProjectComponent/>
      </div>
    </div>
  )
}

export default ListProject