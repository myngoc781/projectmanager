import React, { useState, Component, useEffect, useRef } from "react";
import "./detail-project.component.scss";
import { DataGrid } from "@mui/x-data-grid";
import { userColumns, userRows } from "../../datatablesource";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firbase";
import {
  collection,
  deleteDoc,
  addDoc,
  arrayRemove,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  QuerySnapshot,
} from "firebase/firestore";
import {
  Col,
  Row,
  Table,
  Spin,
  Button,
  List,
  Card,
  Popover,
  DatePicker,
  Input,
  Space,
  Form,
  Progress,
  Modal,
  Tooltip,
  Popconfirm,
  notification,
  Statistic,
  Tag,
  Breadcrumb,
  Select,
  Avatar,
  Checkbox,
  message,
  Badge,
} from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  DashOutlined,
  ArrowRightOutlined,
  AlignLeftOutlined,
  TagOutlined,
  PlusOutlined,
  ScheduleOutlined,
  TeamOutlined,
  StockOutlined,
  CheckSquareOutlined,
  FieldTimeOutlined,
  UserAddOutlined,
  CommentOutlined,
  SendOutlined,
  DeleteFilled,
  PlusCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { boardsRef } from "../../api/firebase";
import AddForm from "../addForm/add-form.component";
import { async } from "@firebase/util";
import MemberList from "../../components/modalCommons/MemberList";
import LabelList from "../../components/modalCommons/LabelList";
import DateList from "../../components/modalCommons/dateList";
import MoveCardList from "../../components/modalCommons/moveCardLists";
import moment from "moment";
import { Face } from "@mui/icons-material";

const { Meta } = Card;
const { Column } = Table;
const { TextArea } = Input;

const DetailsProjectComponent = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [form] = Form.useForm();
  const [form2] = Form.useForm();
  const [commentForm3] = Form.useForm();
  const [desForm3] = Form.useForm();
  const [taskForm3] = Form.useForm();
  const [titleForm3] = Form.useForm();
  const [editTaskForm] = Form.useForm();
  const [editCommentForm] = Form.useForm();
  const [openModalCreate, setOpenModalCreate] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [columnName, setColumnName] = useState("");
  const [columnsData, setColumnData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardInputs, setCardInputs] = useState({});
  const [showAddCard, setShowAddCard] = useState(null);
  const [showAdd, setShowAdd] = useState(true);
  const [newCardName, setNewCardName] = useState("");
  const [cardUnsubscribes, setCardUnsubscribes] = useState("");
  const [showModal2, setShowModal2] = useState(false);
  const [addTask, setAddTask] = useState(false);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [onSearch, setOnSearch] = useState(false);
  const [numberCardDone, SetNumberCardDone] = useState(null);

  const [columnId, setColumnsId] = useState(null);
  const [cardId, setCardId] = useState(null);
  const [dataCard, setDataCard] = useState(null);

  // Define a state to track the card name
  const [cardName, setCardName] = useState("");
  const { id } = useParams();

  //Visible funcation
  const [visibleDes, setVisibleDes] = useState(false);
  const [visibleTask, setVisibleTask] = useState(false);
  const [visibleComment, setVisibleComment] = useState(false);
  const [visibleTitle, setVisibleTitle] = useState(false);
  const [visibleLabel, setVisibleLabel] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [editTaskId, setEditTaskId] = useState(null); // ID của task đang được chỉnh sửa
  const [deleteTaskId, setDeleteTaskId] = useState(null); // ID của task đang được xóa
  const [currentTask, setCurrentTask] = useState(null); // Task hiện tại đang được chỉnh sửa
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);

  //Set value
  const [boardData, setBoardData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showModal1, setShowModal1] = useState(false);
  const [role, setRole] = useState(false);

  const showModal = () => {
    setIsVisible(true);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const handleColumnNameChange = (e) => {
    setColumnName(e.target.value);
  };

  const handleAddCard = (columnId) => {
    console.log(columnId);
    setShowAddCard(columnId);
    setShowAdd(false);
  };

  const handleCreateCard = async (columnId) => {
    if (!newCardName) {
      return notification.error({
        message: "Vui lòng nhập tên columns!",
      });
    }
    try {
      const docRef = await addDoc(
        collection(db, "boards", id, "columns", columnId, "cards"),
        { name: newCardName }
      );
      console.log("Card created with ID: ", docRef.id);
      handleAddNotification("Thêm card mới", "Thành viên vừa thêm card mới");

      setShowAddCard(null);
      setNewCardName("");
    } catch (error) {
      console.error("Error creating card: ", error);
    }
  };

  const handleCloseCard = () => {
    setShowAddCard("");
  };

  const handleOk = async () => {
    if (columnName) {
      try {
        // Thêm cột mới vào Firestore
        const docRef = await addDoc(collection(db, `boards/${id}/columns/`), {
          name: columnName,
          createdAt: serverTimestamp(),
        });
        setColumnName(null);
        form.resetFields();
        console.log("Column created with ID: ", docRef.id);
        setIsVisible(false);
      } catch (e) {
        console.error("Error creating column: ", e);
      }
    }
  };

  const handleAddComment = async () => {
    console.log(id);
    setLoading(true);
    commentForm3
      .validateFields()
      .then(async (values) => {
        const commentData = values.comment; // Lấy data từ form
        // Thực hiện xử lý logic của bạn với commentData
        if (commentData) {
          try {
            // Thêm cột mới vào Firestore
            const user = JSON.parse(localStorage.getItem("user2"));
            const cardsRef = doc(
              db,
              `boards/${id}/columns/${columnId}/cards/${cardId}`
            );
            const currentTime = new Date();

            await updateDoc(cardsRef, {
              comments: arrayUnion({
                text: commentData,
                displayName: user.displayName,
                img: user.img,
                time: currentTime.toString(),
              }),
            });
            handleAddNotification(
              "Thêm comment mới",
              "Thành viên vừa thêm comment mới"
            );

            setIsVisible(false);
            setLoading(false);
            setVisibleComment(false);
          } catch (e) {
            console.error("Error creating column: ", e);
          }
        }
        console.log(commentData);
        commentForm3.resetFields(); // Reset form
        handleListModal();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleAddDescription = async () => {
    console.log(id);
    desForm3
      .validateFields()
      .then(async (values) => {
        const descriptionData = values.description; // Lấy data từ form
        // Thực hiện xử lý logic của bạn với commentData
        if (descriptionData) {
          try {
            // Thêm cột mới vào Firestore
            const cardsRef = doc(
              db,
              `boards/${id}/columns/${columnId}/cards/${cardId}`
            );
            await updateDoc(cardsRef, {
              description: descriptionData,
            });
            handleAddNotification(
              "Thêm mô tả",
              "Thành viên vừa thêm mô tả mới"
            );

            setIsVisible(false);
            setVisibleDes(false);
          } catch (e) {
            console.error("Error creating column: ", e);
          }
        }
        console.log(descriptionData);
        desForm3.resetFields(); // Reset form
        handleListModal();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleAddTitle = async () => {
    console.log(id);
    titleForm3
      .validateFields()
      .then(async (values) => {
        const titleData = values.title; // Lấy data từ form
        // Thực hiện xử lý logic của bạn với commentData
        if (titleData) {
          try {
            // Thêm cột mới vào Firestore
            const cardsRef = doc(
              db,
              `boards/${id}/columns/${columnId}/cards/${cardId}`
            );
            await updateDoc(cardsRef, {
              name: titleData,
            });
            setIsVisible(false);
            setVisibleTitle(false);
            handleAddNotification(
              "Thêm card mới",
              "Thành viên vừa thêm card mới"
            );
          } catch (e) {
            console.error("Error creating column: ", e);
          }
        }
        console.log(titleData);
        titleForm3.resetFields(); // Reset form
        handleListModal();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleSave = async () => {};

  const handleAddTask = async () => {
    setAddTask(false);
    console.log(id);
    taskForm3
      .validateFields()
      .then(async (values) => {
        const taskData = values.nameTask; // Lấy data từ form
        const dateData = values.dateEnd.format("YYYY-MM-DD"); // Lấy data từ form
        const member = values.member;
        const link = values.linkEnd;
        console.log(taskData);
        console.log(dateData);
        // Thực hiện xử lý logic của bạn với commentData
        if (taskData) {
          try {
            // Thêm cột mới vào Firestore
            const user = JSON.parse(localStorage.getItem("user2"));
            const cardsRef = doc(
              db,
              `boards/${id}/columns/${columnId}/cards/${cardId}`
            );
            console.log(cardsRef);
            await updateDoc(cardsRef, {
              tasks: arrayUnion({
                name: taskData,
                dateEnd: dateData,
                done: false,
                member: member,
                linkEnd: link,
              }),
            });
            await handleListCard();
            handleAddNotification(
              "Thêm task mới",
              "Thành viên vừa thêm task mới"
            );

            setIsVisible(false);
            setVisibleTask(false);
          } catch (e) {
            console.error("Error creating column: ", e);
          }
        }
        console.log(taskData);
        taskForm3.resetFields(); // Reset form
        handleListModal();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleAddLabel = async (name) => {
    try {
      // Thêm cột mới vào Firestore
      const cardsRef = doc(
        db,
        `boards/${id}/columns/${columnId}/cards/${cardId}`
      );
      console.log(cardsRef);
      await updateDoc(cardsRef, {
        label: name,
      });
      handleListModal();
      setIsVisible(false);
    } catch (e) {
      console.error("Error creating column: ", e);
    }
  };

  const handleCloseTask = async () => {
    setAddTask(false);
  };

  useEffect(() => {
    setLoading(true);
    const user2 = JSON.parse(localStorage.getItem("user2"));
    setUserData(user2.position);

    const boardRef = doc(db, "boards", id);

    // Define state variables

    // Subscribe to changes in the "columns" collection of the board
    const columnsUnsubscribe = onSnapshot(
      collection(db, "boards", id, "columns"),
      (snapshot) => {
        const columnsData = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            data: doc.data(),
            cards: [], // add an empty array to store cards for each column
          }))
          .sort((a, b) => a.data.createdAt - b.data.createdAt);

        // Subscribe to changes in the "cards" collection of each column
        columnsData.forEach((columnData) => {
          const columnId = columnData.id;
          const cardsUnsubscribe = onSnapshot(
            collection(db, "boards", id, "columns", columnId, "cards"),
            (snapshot) => {
              const cardsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                data: doc.data(),
              }));

              setColumnData((prevColumnsData) => {
                const updatedColumnsData = prevColumnsData.map(
                  (prevColumnData) => {
                    if (prevColumnData.id === columnId) {
                      return {
                        ...prevColumnData,
                        cards: cardsData,
                      };
                    } else {
                      return prevColumnData;
                    }
                  }
                );

                return updatedColumnsData;
              });
            },
            (error) => {
              console.log("Error getting cards data: ", error);
            }
          );

          // Store the unsubscribe function for the cards collection in a state variable
          setCardUnsubscribes((prevCardUnsubscribes) => ({
            ...prevCardUnsubscribes,
            [columnId]: cardsUnsubscribe,
          }));
        });

        setColumnData(columnsData);
        setLoading(false);
      },
      (error) => {
        console.log("Error getting columns data: ", error);
        setLoading(false);
      }
    );

    // Get the initial data for the board
    const fetchBoardData = async () => {
      const boardDoc = await getDoc(boardRef);
      const boardData = boardDoc.data();
      console.log(boardData);
      setBoardData(boardData);
    };

    const fetchUsers = async () => {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      await fetchBoardData();
      setUsers(usersData);
    };

    fetchUsers();

    // Return the unsubscribe function to clean up the listeners
    return () => {
      columnsUnsubscribe();
      Object.values(cardUnsubscribes).forEach((cardUnsubscribe) =>
        cardUnsubscribe()
      );
    };
  }, [db, id]);

  const handleDelete = (id) => {
    const docRef = addDoc(db, "users", id);
    deleteDoc(docRef)
      .then(() => {
        console.log("Document successfully deleted!");
        setData(data.filter((item) => item.id !== id));
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
  };

  // Define a function to handle the click event on the card name
  const handleCardClick = async (card, column) => {
    try {
      const cardsRef = doc(
        db,
        `boards/${id}/columns/${column.id}/cards/${card.id}`
      );
      const cardSnapshot = await getDoc(cardsRef);
      if (cardSnapshot.exists()) {
        const cardData = cardSnapshot.data();
        setDataCard(cardData);
        console.log("Card data:", cardData);

        if (cardData?.tasks?.length > 0) {
          const totalTasks = cardData.tasks.length;
          const doneTasks = cardData.tasks.filter((task) => task.done).length;
          const percentComplete = (doneTasks / totalTasks) * 100;
          SetNumberCardDone(percentComplete);
          console.log("Number of tasks done:", percentComplete);
        } else {
          const percentComplete = 0;
          SetNumberCardDone(null);
          console.log("Number of tasks done:", percentComplete);
        }
        // Sử dụng cardData để hiển thị thông tin của card
      } else {
        console.log("No such document!");
      }
      console.log(cardsRef);
      setIsVisible(false);
    } catch (e) {
      console.error("Error creating column: ", e);
    }
    console.log(dataCard);
    setColumnsId(column.id);
    setCardId(card.id);
    setCardName(card.data.name);
    setShowModal2(true);
  };

  const handleDeleteCard = async (cardId, columnId) => {
    try {
      // Xóa thẻ trong Firestore ở đây
      await deleteDoc(
        doc(db, `boards/${id}/columns/${columnId}/cards/${cardId}`)
      );
      handleAddNotification("Xóa card", "Thành viên vừa xóa card");

      console.log("Card deleted successfully!");
    } catch (e) {
      console.error("Error deleting card: ", e);
    }
  };

  const handleDeleteColumn = async (columnId) => {
    try {
      // Xóa cột khỏi Firestore
      await deleteDoc(doc(db, `boards/${id}/columns/`, columnId));
      console.log("Column deleted successfully");
    } catch (e) {
      console.error("Error deleting column: ", e);
    }
  };

  const handleShowComment = () => {
    setVisibleComment(!visibleComment);
  };

  const handleShowTask = () => {
    setVisibleTask(!visibleTask);
  };

  const handleShowDes = () => {
    setVisibleDes(!visibleDes);
  };

  const handleListModal = async () => {
    try {
      const cardsRef = doc(
        db,
        `boards/${id}/columns/${columnId}/cards/${cardId}`
      );
      const cardSnapshot = await getDoc(cardsRef);
      if (cardSnapshot.exists()) {
        const cardData = cardSnapshot.data();
        setDataCard(cardData);
        console.log("Card data:", cardData);
        // Sử dụng cardData để hiển thị thông tin của card
      } else {
        console.log("No such document!");
      }
      console.log(cardsRef);
      setIsVisible(false);
    } catch (e) {
      console.error("Error creating column: ", e);
    }
  };

  // Define a function to handle the close event on the modal
  const handleCloseModal = () => {
    setShowModal2(false);
  };

  const handleSelectChange = async (value) => {
    setSelectedValue(value);
    try {
      const cardsRef = doc(db, `boards/${id}`);
      const userRef = doc(collection(db, "users"), value);
      const userDoc = await getDoc(userRef);
      const user = userDoc.data();
      await updateDoc(cardsRef, {
        member: arrayUnion({
          id: value,
          displayName: user.displayName,
          img: user.img,
          position: user.position,
          email: user.email,
        }),
      });
      const boardDoc = await getDoc(doc(db, "boards", id));
      const updatedBoardData = boardDoc.data();
      setBoardData(updatedBoardData);

      setIsVisible(false);
      setVisibleTask(false);
    } catch (e) {
      console.error("Error creating column: ", e);
    }
  };

  const onChangeCheckbox = async (event) => {
    const taskIndex = event.target.value;
    const newTasks = [...dataCard.tasks];
    newTasks[taskIndex].done = event.target.checked;
    const cardsRef = doc(
      db,
      `boards/${id}/columns/${columnId}/cards/${cardId}`
    );
    await updateDoc(cardsRef, { tasks: newTasks });
    handleAddNotification(
      "Cập nhật trạng thái task",
      "Thành viên vừa cập nhật trạng thái task"
    );

    await handleListCard();
  };

  const handleListCard = async () => {
    const cardsRef2 = doc(
      db,
      `boards/${id}/columns/${columnId}/cards/${cardId}`
    );
    const cardSnapshot = await getDoc(cardsRef2);
    if (cardSnapshot.exists()) {
      const cardData = cardSnapshot.data();
      setDataCard(cardData);
      console.log("Card data:", cardData);

      if (cardData?.tasks?.length > 0) {
        const totalTasks = cardData.tasks.length;
        const doneTasks = cardData.tasks.filter((task) => task.done).length;
        const percentComplete = (doneTasks / totalTasks) * 100;
        SetNumberCardDone(percentComplete);
        console.log("Number of tasks done:", percentComplete);
      } else {
        const percentComplete = 0;
        SetNumberCardDone(null);
        console.log("Number of tasks done:", percentComplete);
      }
      // Sử dụng cardData để hiển thị thông tin của card
    } else {
      console.log("No such document!");
    }
  };

  const [cardTitle, setCardTitle] = useState("");
  const { listKey, creatingCard, handleCreatingCard } = "props";

  const handleOnSubmit = (event) => {
    event.preventDefault();
    if (cardTitle !== "") {
      handleCreateCard({ cardTitle, listKey });
      setCardTitle("");
      handleCreatingCard(false);
    }
  };

  const handleModalVisible = () => {
    setModalVisible(!modalVisible);
  };

  const filteredUsers = users.filter((user) =>
    user?.displayName?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleMemberData = (data) => {
    console.log(data);
    setBoardData(data);
  };

  const handleCardData = (data) => {
    console.log(data);
    setDataCard(data);
  };

  const [showModalLabel2, setShowModalLabel2] = useState(false);
  const [showModalDate, setShowModalDate] = useState(false);
  const [showModalMoveCard, setShowModalMoveCard] = useState(false);

  const showModalLabel = () => {
    setShowModalLabel2(!showModalLabel2);
  };

  const closeModalLabel = () => {
    setShowModalLabel2(!showModalLabel2);
  };

  const handleShowModalDate = () => {
    setShowModalDate(!showModalDate);
  };

  const handleCloseModalDate = () => {
    setShowModalDate(!showModalDate);
  };

  const handleShowModalMoveCard = () => {
    setShowModalMoveCard(!showModalMoveCard);
  };

  const handleCloseModalMoveCard = () => {
    setShowModalMoveCard(!showModalMoveCard);
  };

  const handleCloseModalAll = () => {
    setShowModalMoveCard(!showModalMoveCard);
    setShowModal2(!showModal2);
  };

  const statusOptions = {
    completed: "Hoàn thành",
    inProgress: "Đang triển khai",
    onHold: "Tạm dừng",
  };

  const handleDeleteTask = async (task) => {
    try {
      // Xóa task khỏi Firestore
      const cardsRef = doc(
        db,
        `boards/${id}/columns/${columnId}/cards/${cardId}`
      );
      await updateDoc(cardsRef, {
        tasks: dataCard?.tasks.filter((item) => item !== task),
      });
      handleListModal();
      handleAddNotification("Xóa task", "Thành viên vừa xóa task" + task.name);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = (task) => {
    // Lưu task hiện tại cần chỉnh sửa vào state hoặc biến tạm thời
    setCurrentTask(task);
    // Hiển thị modal hoặc form chỉnh sửa task và cung cấp giá trị ban đầu của task
    setShowEditModal(true);
  };

  // Function xử lý khi người dùng hoàn thành việc chỉnh sửa task
  const handleEditTaskSubmit = async (values) => {
    try {
      // Lấy dữ liệu từ form chỉnh sửa task
      const { name, dateEnd, linkEnd } = values;
      // Cập nhật task trong Firestore
      const cardsRef = doc(
        db,
        `boards/${id}/columns/${columnId}/cards/${cardId}`
      );
      await updateDoc(cardsRef, {
        tasks: arrayUnion({ ...currentTask, name, dateEnd, linkEnd }),
      });
      // Thực hiện các bước xử lý khác (nếu cần)
      // ...
      // Đóng modal hoặc form chỉnh sửa task
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setShowEditCommentModal(true);
  };

  const handleDeleteComment = async (comment) => {
    try {
      // Xóa comment khỏi Firestore
      const cardsRef = doc(
        db,
        `boards/${id}/columns/${columnId}/cards/${cardId}`
      );
      await updateDoc(cardsRef, {
        comments: arrayRemove(comment),
      });
      handleListModal();
      handleAddNotification(
        "Xóa comment",
        "Thành viên vừa xóa comment" + comment
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleUpdateComment = async () => {
    editCommentForm
      .validateFields()
      .then(async (values) => {
        const updatedComment = { ...editingComment, text: values.comment };
        const updatedComments = dataCard.comments.map((comment) =>
          comment === editingComment ? updatedComment : comment
        );

        try {
          // Cập nhật mảng comments trong Firestore
          const cardsRef = doc(
            db,
            `boards/${id}/columns/${columnId}/cards/${cardId}`
          );
          await updateDoc(cardsRef, {
            comments: updatedComments,
          });
          handleListModal();
          setShowEditCommentModal(false);

          handleAddNotification(
            "Cập nhật Comment",
            "Thành viên vừa cập nhật comment"
          );
        } catch (error) {
          console.error("Error updating comment:", error);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleEditTask2 = (task) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  const handleUpdateTask = () => {
    editTaskForm
      .validateFields()
      .then(async (values) => {
        const updatedTask = {
          ...selectedTask,
          name: values.name,
          dateEnd: values.dateEnd.format("YYYY-MM-DD"),
          member: values.member,
          linkEnd: values.linkEnd,
        };

        try {
          // Xóa task cũ khỏi Firestore
          const cardsRef = doc(
            db,
            `boards/${id}/columns/${columnId}/cards/${cardId}`
          );
          await updateDoc(cardsRef, {
            tasks: arrayRemove(selectedTask),
          });

          // Thêm task đã chỉnh sửa vào Firestore
          await updateDoc(cardsRef, {
            tasks: arrayUnion(updatedTask),
          });

          handleAddNotification(
            "Cập nhật Task",
            "Thành viên vừa cập nhật task"
          );

          handleListModal();
          setShowEditTaskModal(false);
        } catch (error) {
          console.error("Error updating task:", error);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const getUserInfo = (userId) => {
    // Tìm người dùng trong collections users dựa trên userId
    const user = users.find((user) => user.id === userId);

    // Trả về thông tin người dùng (ví dụ: displayName, avatar, v.v.)
    return user ? user.displayName : "";
  };

  const handleAddNotification = async (title, message) => {
    const user = JSON.parse(localStorage.getItem("user2"));

    try {
      const currentTime = new Date();

      // Tạo một thông báo mới
      const newNotification = {
        avatar: user.img,
        displayName: user.displayName, // Thay displayName bằng giá trị nhập từ biểu mẫu
        email: user.email, // Thay email bằng giá trị nhập từ biểu mẫu
        title: title, // Thay title bằng giá trị nhập từ biểu mẫu
        message: message, // Thay message bằng giá trị nhập từ biểu mẫu
        time: currentTime.toString(), // Thay message bằng giá trị nhập từ biểu mẫu
      };

      console.log(newNotification);

      // Lấy tham chiếu tới bảng board
      const boardRef = doc(db, "boards", id);

      // Đọc dữ liệu hiện tại của danh sách thông báo
      const boardDoc = await getDoc(boardRef);
      const boardData = boardDoc.data();

      // Kiểm tra xem danh sách thông báo đã tồn tại hay chưa
      const notifications = boardData?.notifications || [];

      // Thêm thông báo mới vào danh sách
      notifications.push(newNotification);

      handleListModal();

      // Cập nhật danh sách thông báo trong bảng board
      await updateDoc(boardRef, { notifications });

      // Hiển thị thông báo hoặc thực hiện các hành động khác sau khi thêm thông báo thành công
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  return (
    <div className="datatables">
      <Spin spinning={loading}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            backgroundColor: "#457b9d",
            color: "#fff",
            alignItems: "center",
            boxShadow: "2px 4px 10px 1px rgba(201, 201, 201, 0.47)",
          }}
        >
          <div>
            <table className="tablett">
              <tr>
                <td style={{ fontSize: 15, fontWeight: "bold" }}>Dự án:</td>
                <td style={{ fontSize: 21, fontWeight: 600 }}>
                  {boardData?.name}
                </td>
              </tr>
              <tr>
                <td style={{ fontSize: 15, fontWeight: "bold" }}>
                  Mô tả dự án:
                </td>
                <td>{boardData?.description}</td>
              </tr>
              <tr>
                <td style={{ fontSize: 15, fontWeight: "bold" }}>
                  Thời gian dự án:
                </td>
                <td>
                  Từ {boardData?.startDate} Đến {boardData?.endDate}
                </td>
              </tr>
              <tr>
                <td style={{ fontSize: 15, fontWeight: "bold" }}>
                  Trạng thái dự án:
                </td>
                <td>{statusOptions[boardData?.status]}</td>
              </tr>
            </table>
            <div className="groupUser">
              <Avatar.Group>
                {boardData?.member?.map((user, index) => (
                  <Tooltip title={user.displayName} key={index}>
                    <Avatar src={user.img} />
                  </Tooltip>
                ))}
              </Avatar.Group>
              {userData === "Admin" || userData === "Manager" ? (
                <Button
                  style={{
                    marginTop: 8,
                    marginLeft: 10,
                    color: "#0077b6",
                    backgroundColor: "#fff",
                  }}
                  type="primary"
                  onClick={handleModalVisible}
                >
                  <UserAddOutlined />
                  Quản lý thành viên
                </Button>
              ) : (
                ""
              )}
            </div>
          </div>
          <Button
            style={{
              margin: "30px",
              marginRight: "60px",
              display: "flex",
              alignItems: "center",
              color: "#e63946",
            }}
            onClick={() => setShowModal1(true)}
          >
            <BellOutlined />
            Thông báo
            <Badge
              style={{ marginLeft: "5px" }}
              count={boardData?.notifications?.length || 0}
            ></Badge>
          </Button>
        </div>
        <hr style={{ marginBottom: 10 }}></hr>
        <div className="datatableTitle">
          <div></div>
        </div>
        <div className="board">
          {columnsData.map((column, index) => (
            <div key={index} className="column">
              <div
                style={{
                  display: "flex",
                  flex: "row",
                  justifyContent: "space-between",
                }}
              >
                <h2>{column.data.name}</h2>
                {userData !== "Admin" ? (
                  <Popover
                    content={
                      <Button
                        type="primary"
                        onClick={() => handleDeleteColumn(column.id)}
                      >
                        Xóa column
                      </Button>
                    }
                    trigger="hover"
                  >
                    <span className="delete-icon">
                      <DashOutlined />
                    </span>
                  </Popover>
                ) : (
                  ""
                )}
              </div>
              <div className="cards">
                {column.cards.map((card, cardIndex) => (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        flex: "row",
                        justifyContent: "space-between",
                        marginTop: 10,
                      }}
                      key={cardIndex}
                      className="card-column"
                    >
                      <div onClick={() => handleCardClick(card, column)}>
                        <p>{card.data.name}</p>
                        {card?.data?.label ? (
                          <>
                            <Tag
                              color={card?.data?.color}
                              style={{ marginTop: 10 }}
                            >
                              {card?.data?.label}
                            </Tag>
                          </>
                        ) : (
                          ""
                        )}
                      </div>
                      <div style={{ marginRight: 8 }}>
                        {userData !== "Admin" ? (
                          <Popover
                            content={
                              <Button
                                type="primary"
                                onClick={() =>
                                  handleDeleteCard(card.id, column.id)
                                }
                              >
                                Xóa card
                              </Button>
                            }
                            trigger="hover"
                          >
                            <span className="delete-icon">
                              <DashOutlined />
                            </span>
                          </Popover>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div
                onClick={() => {
                  console.log(userData);
                  if (userData === "Admin") {
                    return message.warning(
                      "Bạn không được phép sử dụng chức năng này"
                    );
                  }
                }}
              >
                <div
                  style={{
                    pointerEvents: userData === "Admin" ? "none" : "auto",
                  }}
                >
                  {showAddCard !== column.id ? (
                    <a
                      className="add-card"
                      style={{ marginTop: 15, borderRadius:10 }}
                      type="primary"
                      onClick={() => handleAddCard(column.id)}
                    >
                      + Thêm thẻ
                    </a>
                  ) : (
                    ""
                  )}
                </div>
              </div>

              {showAddCard === column.id && (
                <div style={{ marginTop: 15 }}>
                  <TextArea
                    placeholder="Nhập tiêu đề cho thẻ này ..."
                    rows={2}
                    type="text"
                    value={newCardName}
                    onChange={(e) => setNewCardName(e.target.value)}
                  />
                  <Button
                    style={{ marginTop: 8 }}
                    type="primary"
                    onClick={() => handleCreateCard(column.id)}
                  >
                    Thêm thẻ
                  </Button>
                  <Button
                    type="primary"
                    shape="circle"
                    style={{
                      fontWeight: 500,
                      color: "#3f4c6b",
                      backgroundColor: "#fff",
                      boxShadow: "none",
                      border: "1px solid #3f4c6b",
                      marginLeft: 8,
                    }}
                    onClick={() => handleCloseCard(column.id)}
                  >
                    X
                  </Button>
                </div>
              )}
            </div>
          ))}
          <Button
            className="create-board-card"
            type="primary"
            icon={<PlusOutlined />}
            onClick={showModal}
          >
            Thêm mới
          </Button>
        </div>

        <Modal
          title="Thêm cột mới"
          visible={isVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okButtonProps={{ disabled: !columnName }}
        >
          <Input
            placeholder="Vui lòng nhập tên cột"
            value={columnName}
            onChange={handleColumnNameChange}
          />
        </Modal>

        <Modal
          visible={showModal2}
          style={{ top: 100 }}
          onOk={() => {
            form
              .validateFields()
              .then((values) => {
                form.resetFields();
                handleSave(values);
              })
              .catch((info) => {
                console.log("Validate Failed:", info);
              });
          }}
          onCancel={handleCloseModal}
          okText="Hoàn thành"
          cancelText="Hủy"
          width={800}
          footer={[]}
        >
          <div
            onClick={() => {
              console.log(userData);
              if (userData === "Admin") {
                return message.warning(
                  "Bạn không được phép sử dụng chức năng này"
                );
              }
            }}
          >
            <div
              style={{
                pointerEvents: userData === "Admin" ? "none" : "auto",
              }}
            >
              <Row style={{ maxHeight: "700px", overflowY: "auto" }}>
                <Col span={16}>
                  <div style={{ marginTop: 15, marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#0077b6",
                      }}
                    >
                      <ScheduleOutlined style={{ marginRight: 5 }} />
                      <span> Tên thẻ công việc </span>
                      {!visibleTitle ? (
                        <EditOutlined
                          style={{ marginLeft: 5 }}
                          type="text"
                          onClick={() => setVisibleTitle(true)}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                    <div style={{ fontSize: "16px", marginLeft: "10px" }}>
                      {dataCard?.name}
                    </div>
                    {visibleTitle ? (
                      <Form
                        form={titleForm3}
                        name="eventUpdate"
                        layout="vertical"
                        scrollToFirstError
                      >
                        <Form.Item
                          name="title"
                          rules={[
                            {
                              required: true,
                              message: "Tên thẻ trống!",
                            },
                          ]}
                        >
                          <Input.TextArea
                            rows={1}
                            placeholder="Nhập tên thẻ..."
                          />
                        </Form.Item>
                        <Button
                          style={{}}
                          type="link"
                          onClick={() => handleAddTitle()}
                        >
                          Lưu
                        </Button>
                        <Button
                          style={{ color: "gray" }}
                          type="link"
                          onClick={() => setVisibleTitle(!visibleTitle)}
                        >
                          Hủy
                        </Button>
                      </Form>
                    ) : (
                      ""
                    )}
                  </div>
                  <div style={{ marginTop: 10, marginBottom: 5 }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#5e548e",
                      }}
                    >
                      <TagOutlined style={{ marginRight: 5 }} />
                      <span> Nhãn công việc</span>
                    </div>
                  </div>
                  <div style={{ marginTop: 5 }}>
                    {dataCard?.label ? (
                      <>
                        <Tag
                          icon={<CheckCircleOutlined />}
                          color={dataCard?.color}
                          style={{ marginTop: 10 }}
                        >
                          {dataCard?.label}
                        </Tag>
                      </>
                    ) : (
                      ""
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#d62828",
                      }}
                    >
                      <CalendarOutlined
                        style={{ marginRight: 5, marginTop: 15 }}
                      />
                      <span>Ngày đến hạn</span>
                    </div>
                    {dataCard?.dateEnd ? (
                      <Statistic value={dataCard?.dateEnd} />
                    ) : (
                      ""
                    )}
                  </div>
                  <div style={{ marginTop: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#3c6997",
                      }}
                    >
                      <AlignLeftOutlined style={{ marginRight: 5 }} />
                      <span> Mô tả thẻ công việc</span>
                      {!visibleDes ? (
                        <EditOutlined
                          style={{ marginTop: 10, marginLeft: 5 }}
                          type="primary"
                          onClick={() => handleShowDes()}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                  <div>{dataCard?.description}</div>
                  {visibleDes ? (
                    <Form
                      form={desForm3}
                      name="eventUpdate"
                      layout="vertical"
                      scrollToFirstError
                    >
                      <Form.Item
                        name="description"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập mô tả!",
                          },
                        ]}
                        style={{ marginBottom: 5 }}
                      >
                        <Input.TextArea
                          rows={2}
                          placeholder="Nhập mô tả công việc..."
                        />
                      </Form.Item>
                      <Button
                        style={{ marginTop: 10 }}
                        type="link"
                        onClick={() => handleAddDescription()}
                      >
                        Lưu
                      </Button>
                      <Button
                        style={{ marginTop: 10, marginLeft: 10, color: "gray" }}
                        type="link"
                        onClick={() => setVisibleDes(!visibleDes)}
                      >
                        Hủy
                      </Button>
                    </Form>
                  ) : (
                    ""
                  )}

                  <div style={{ marginTop: 10 }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#ff7900",
                      }}
                    >
                      <CheckSquareOutlined
                        style={{ marginRight: 5, marginBottom: 10 }}
                      />{" "}
                      <span> Việc cần làm</span>
                      {!visibleTask ? (
                        <PlusCircleOutlined
                          style={{ marginTop: 10, marginLeft: 10 }}
                          type="primary"
                          onClick={() => handleShowTask()}
                        />
                      ) : (
                        ""
                      )}
                    </div>
                  </div>

                  <div>
                    <Progress
                      percent={numberCardDone}
                      format={(percent) => `${percent.toFixed(2)}%`}
                    />
                  </div>
                  {dataCard?.tasks ? (
                    <List
                      style={{ marginBottom: 10 }}
                      itemLayout="horizontal"
                      dataSource={dataCard?.tasks}
                      renderItem={(item, index) => (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: 10,
                          }}
                        >
                          <div>
                            <Checkbox
                              value={index}
                              onChange={onChangeCheckbox}
                              checked={item.done}
                            >
                              <div>
                                <span style={{fontWeight:'bold'}}>Assign:</span> {getUserInfo(item?.member)}
                              </div>
                              <div>
                                <span style={{fontWeight:'bold'}}>Nội dung: </span>
                                {item?.name}
                              </div>

                              <div>
                                <span style={{fontWeight:'bold'}}>Hạn: </span>
                                {item?.dateEnd}
                              </div>
                              <div>
                              {item.linkEnd && <span style={{fontWeight:'bold'}}>Kết quả: </span>} {item?.linkEnd}
                              </div>
                            </Checkbox>
                          </div>
                          <div style={{ marginRight: "10px" }}>
                            <EditOutlined
                              style={{ marginRight: 10, color: "#0077b6" }}
                              icon={<EditOutlined />}
                              onClick={() => handleEditTask2(item)}
                            />
                            <DeleteOutlined
                              style={{ color: "#e63946" }}
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteTask(item)}
                            />
                          </div>
                        </div>
                      )}
                    />
                  ) : (
                    ""
                  )}
                  {visibleTask ? (
                    <Form
                      form={taskForm3}
                      name="eventUpdate"
                      layout="vertical"
                      scrollToFirstError
                    >
                      <Form.Item
                        name="nameTask"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên task!",
                          },
                        ]}
                        style={{ marginBottom: 5 }}
                      >
                        <Input placeholder="Tên task" />
                      </Form.Item>
                      <Form.Item
                        name="linkEnd"
                        rules={[
                          // {
                          //   required: true,
                          //   message: "Gắn link sản phẩm",
                          // },
                          {
                            type: "url",
                            message: "Vui lòng nhập đúng định dạng URL!",
                          },
                        ]}
                        style={{ marginBottom: 5 }}
                      >
                        <Input placeholder="Link đính kèm" />
                      </Form.Item>
                      <Form.Item name="dateEnd" style={{ marginBottom: 5 }}>
                        <DatePicker />
                      </Form.Item>
                      <Form.Item name="member" style={{ marginBottom: 5 }}>
                        <Select
                          style={{ width: "100%" }}
                          placeholder="Giao cho..."
                          itemLayout="horizontal"
                        >
                          {boardData.member?.map((item, index) => (
                            <Select.Option key={index} value={item.id}>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                }}
                              >
                                <Avatar src={item.img} />
                                <div style={{ marginLeft: 10 }}>
                                  <div style={{ fontWeight: "bold" }}>
                                    {item.displayName}
                                  </div>
                                  <div>{item.position}</div>
                                </div>
                              </div>
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Button
                        style={{ marginTop: 10 }}
                        type="primary"
                        onClick={() => handleAddTask()}
                      >
                        Thêm
                      </Button>
                      <Button
                        style={{ marginTop: 10, marginLeft: 10 }}
                        type="default"
                        onClick={() => setVisibleTask(!visibleTask)}
                      >
                        Hủy
                      </Button>
                    </Form>
                  ) : (
                    ""
                  )}

                  <div style={{ marginTop: 15, marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        color: "#008000",
                      }}
                    >
                      <CommentOutlined style={{ marginRight: 5 }} /> Hoạt động
                    </div>
                  </div>
                  {dataCard?.comments ? (
                    <List
                      style={{ marginTop: 15, marginBottom: 15 }}
                      itemLayout="horizontal"
                      dataSource={dataCard?.comments}
                      renderItem={(item, index) => (
                        <List.Item
                          style={{
                            borderRadius: "10px",
                            boxShadow:
                              "2px 4px 10px 1px rgba(201, 201, 201, 0.6)",
                          }}
                          actions={[
                            <DeleteOutlined
                              style={{ color: "#e5383b", marginRight: "10px" }}
                              type="link"
                              onClick={() => handleDeleteComment(item)}
                            />,
                          ]}
                        >
                          <List.Item.Meta
                            style={{ marginLeft: "10px" }}
                            avatar={<Avatar src={item.img} />}
                            title={item?.displayName}
                            description={item?.text}
                          />
                          <div
                            style={{
                              color: "#adb5bd",
                              fontSize: "12px",
                              marginTop: "25px",
                            }}
                          >
                            {item.time
                              ? moment(item.time).format("DD/MM/YYYY HH:mm")
                              : ""}
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    ""
                  )}
                  <Form
                    form={commentForm3}
                    name="eventUpdate"
                    layout="vertical"
                    scrollToFirstError
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Form.Item
                      name="comment"
                      rules={[
                        {
                          required: true,
                          message: "Nội dung trống!",
                        },
                      ]}
                      style={{ marginBottom: 5, width: "90%" }}
                    >
                      <Input.TextArea
                        rows={2}
                        placeholder="Viết bình luận..."
                      />
                    </Form.Item>
                    <SendOutlined
                      style={{ fontSize: "20px", color: "#219ebc" }}
                      type="primary"
                      onClick={() => handleAddComment()}
                    />
                  </Form>
                </Col>
                <Col span={7} style={{ marginLeft: 20, marginTop: 15 }}>
                  <div style={{ marginTop: 15, marginBottom: 10 }}>
                    <div
                      className="group-button-task"
                      onClick={() => showModalLabel()}
                      style={{ backgroundColor: "#0077b6", color: "#fff" }}
                    >
                      <TagOutlined style={{ marginRight: 5 }} /> Cập nhật nhãn
                    </div>
                    <div
                      className="group-button-task"
                      style={{ backgroundColor: "#29bf12", color: "#fff" }}
                    >
                      <StockOutlined style={{ marginRight: 5 }} /> Tiến độ đạt{" "}
                      {numberCardDone}%
                    </div>
                    {userData === "Manager" || userData === "Admin" ? (
                      <div
                        className="group-button-task"
                        onClick={() => handleShowModalDate()}
                        style={{ backgroundColor: "#f79d65", color: "#fff" }}
                      >
                        <FieldTimeOutlined style={{ marginRight: 5 }} /> Cập
                        nhật thời gian
                      </div>
                    ) : (
                      ""
                    )}
                    {userData === "Manager" || userData === "Admin" ? (
                      <div
                        className="group-button-task"
                        onClick={() => handleShowModalMoveCard()}
                        style={{ backgroundColor: "#ed6a5a", color: "#fff" }}
                      >
                        <ArrowRightOutlined style={{ marginRight: 5 }} /> Di
                        chuyển
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </Col>
              </Row>
            </div>
          </div>
        </Modal>

        <Modal
          title="Quản lý thành viên"
          visible={modalVisible}
          onCancel={handleModalVisible}
          footer={null}
        >
          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Nhập email thành viên"
            optionFilterProp="children"
            onChange={handleSelectChange}
            filterOption={false}
          >
            {filteredUsers.map((item, index) => (
              <Select.Option key={index} value={item.id}>
                <div className="modal-group">
                  <List.Item.Meta
                    className="modal-member"
                    avatar={<Avatar src={item.img} className="member-avatar" />}
                    title={item.email}
                  />
                  <div>
                    <UserAddOutlined />
                  </div>
                </div>
              </Select.Option>
            ))}
          </Select>
          <div>
            <MemberList
              boardData={boardData}
              boardId={id}
              handleMemberData={handleMemberData}
            />
          </div>
        </Modal>

        <Modal
          title="Thêm nhãn"
          visible={showModalLabel2}
          onCancel={closeModalLabel}
          footer={null}
        >
          <div>
            <LabelList
              boardData={boardData}
              boardId={id}
              columnId={columnId}
              cardId={cardId}
              handleCardData={handleCardData}
            />
          </div>
        </Modal>

        <Modal
          title="Thêm ngày"
          visible={showModalDate}
          onCancel={handleCloseModalDate}
          footer={null}
        >
          <div>
            <DateList
              boardData={boardData}
              boardId={id}
              columnId={columnId}
              cardId={cardId}
              handleCardData={handleCardData}
            />
          </div>
        </Modal>

        <Modal
          title="Di chuyển sang cột"
          visible={showModalMoveCard}
          onCancel={handleCloseModalMoveCard}
          footer={null}
        >
          <div>
            <MoveCardList
              boardData={boardData}
              boardId={id}
              columnId={columnId}
              cardId={cardId}
              cardData={dataCard}
              handleCardData={handleCardData}
              handleCloseModal={handleCloseModalAll}
            />
          </div>
        </Modal>

        <Modal
          title="Chỉnh sửa comment"
          visible={showEditCommentModal}
          onOk={handleUpdateComment}
          onCancel={() => setShowEditCommentModal(false)}
          okText="Lưu"
          cancelText="Hủy"
        >
          <Form
            form={editCommentForm}
            name="editCommentForm"
            layout="vertical"
            initialValues={{
              comment: editingComment?.text,
            }}
            scrollToFirstError
          >
            <Form.Item
              name="comment"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mô tả!",
                },
              ]}
              style={{ marginBottom: 5 }}
            >
              <Input.TextArea rows={2} placeholder="Mô tả" />
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Sửa Task"
          visible={showEditTaskModal}
          onCancel={() => setShowEditTaskModal(false)}
          footer={[
            <Button key="cancel" onClick={() => setShowEditTaskModal(false)}>
              Hủy
            </Button>,
            <Button key="save" type="primary" onClick={handleUpdateTask}>
              Lưu
            </Button>,
          ]}
        >
          <Form
            form={editTaskForm}
            layout="vertical"
            initialValues={{
              name: selectedTask?.name || "",
              dateEnd: moment(selectedTask?.dateEnd),
              member: selectedTask?.member,
              linkEnd: selectedTask?.linkEnd,
            }}
          >
            <Form.Item
              name="name"
              label="Tên Task"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên Task",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="linkEnd"
              label="Link đính kèm:"
              rules={[
                {
                  required: true,
                  message: "Gắn link sản phẩm",
                },
                {
                  type: "url",
                  message: "Vui lòng nhập đúng định dạng URL!",
                },
              ]}
            >
              <Input format="link" />
            </Form.Item>
            <Form.Item
              name="dateEnd"
              label="Ngày kết thúc"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày kết thúc",
                },
              ]}
            >
              <DatePicker format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item name="member" style={{ marginBottom: 5 }}>
              <Select
                style={{ width: "100%" }}
                placeholder="Chọn thành viên"
                itemLayout="horizontal"
              >
                {boardData.member?.map((item, index) => (
                  <Select.Option key={index} value={item.id}>
                    <div style={{ display: "flex", flexDirection: "row" }}>
                      <Avatar src={item.img} />
                      <div style={{ marginLeft: 10 }}>
                        <div style={{ fontWeight: "bold" }}>
                          {item.displayName}
                        </div>
                        <div>{item.position}</div>
                      </div>
                    </div>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Thông báo"
          open={showModal1}
          onCancel={() => setShowModal1(false)}
          footer={null}
        >
          <List
  style={{ maxHeight: "500px", overflowY: "auto" }}
  itemLayout="horizontal"
  dataSource={(boardData?.notifications || []).sort((a, b) => {
    const timeA = a.time || -9999;
    const timeB = b.time || -9999;
    return timeB - timeA;
  }).reverse()} // Sắp xếp và đảo ngược mảng
  renderItem={(notification, index) => (
    <List.Item>
      <List.Item.Meta
        title={notification.displayName}
        description={notification.title}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "right",
          alignItems: "flex-end",
          flexDirection: "column",
        }}
      >
        <div>{notification.message}</div>
        <div>
          {notification.time
            ? moment(notification.time).format("DD/MM/YYYY HH:mm")
            : ""}
        </div>
      </div>
    </List.Item>
  )}
/>

        </Modal>
      </Spin>
    </div>
  );
};

export default DetailsProjectComponent;
