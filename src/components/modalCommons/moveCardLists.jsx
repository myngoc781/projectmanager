import { useState, useEffect } from 'react';
import { List, Avatar, Button, Modal } from 'antd';
import { collection, AddDoc, addDoc,deleteDoc, doc, getDoc, getDocs, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firbase";
import { useParams } from "react-router-dom";

const MoveCardList = ({ boardId, columnId, cardId, handleCloseModal, cardData }) => {
    const [columns, setColumns] = useState(null);
    const [AddModalVisible, setAddModalVisible] = useState(false);
    const [columnsToAdd, setColumnsToAdd] = useState(null);

    const handleAddClick = (columns) => {
        setColumnsToAdd(columns);
        setAddModalVisible(true);
    };

    const handleAddConfirm = async () => {
        try {
            const currentColumnRef = doc(db, `boards/${boardId}/columns/${columnId}/cards`, cardId);
            await deleteDoc(currentColumnRef);
        
            // Add the selected card to the target column
            const docRef = await addDoc(collection(db, 'boards', boardId, 'columns', columnsToAdd.id, 'cards'), cardData);
            console.log('Card created with ID: ', docRef.id);

            setAddModalVisible(false);
            handleCloseModal(false);
        } catch (e) {
            console.error("Error creating column: ", e);
        }
    };

    const handleAddCancel = () => {
        setColumnsToAdd(null);
        setAddModalVisible(false);
    };

    useEffect(() => {
        const columnsRef = collection(db, 'boards', boardId, 'columns');
        const columnsUnsubscribe = onSnapshot(columnsRef, (snapshot) => {
          const columnsData = snapshot.docs.map((doc) => ({
            id: doc.id,
            data: doc.data(),
          }));
          console.log(columnsData);
          setColumns(columnsData);
        }, (error) => {
          console.log('Error getting columns data: ', error);
        });

        // Lưu ý rằng unsubscribe sẽ được gọi khi component bị unmount hoặc effect được gọi lại
        return () => columnsUnsubscribe();
    }, [boardId]);

    return (
        <div>
            <hr />
            <List
                itemLayout="horizontal"
                dataSource={columns || []}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            title={<a href="https://ant.design">{item?.data?.name}</a>}
                        />
                        <Button style={{ backgroundColor: '#0077b6'}} type="primary" onClick={() => handleAddClick(item)}>Di chuyển</Button>
                    </List.Item>
                )}
            />
            <Modal
                title="Xác nhận thay đổi"
                visible={AddModalVisible}
                onOk={handleAddConfirm}
                onCancel={handleAddCancel}
            >
                Bạn có chắc chắn muốn thay đổi này không?
            </Modal>
        </div>
    );
};

export default MoveCardList;
