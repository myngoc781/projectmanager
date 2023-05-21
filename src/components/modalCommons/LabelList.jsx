import { useState, useEffect } from 'react';
import { List, Avatar, Button, Modal } from 'antd';
import { collection, AddDoc, addDoc, doc, getDoc, getDocs, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firbase";
import { useParams } from "react-router-dom";

const LabelList = ({ boardId, columnId, cardId, handleCardData }) => {
    const labelCurrent = [
        {
            id: 1,
            name: 'Design',
            color: "magenta"
        },
        {
            id: 2,
            name: 'Marketing',
            color: "red"
        },
        {
            id: 3,
            name: 'Sell',
            color: "volcano"
        },
        {
            id: 4,
            name: 'Test',
            color: "orange"
        },
        {
            id: 5,
            name: 'CSKH',
            color: "gold"
        },
        {
            id: 6,
            name: 'Production',
            color: "lime"
        }
    ];
    const [label, setLabels] = useState(null);
    const [AddModalVisible, setAddModalVisible] = useState(false);
    const [labelToAdd, setLabelToAdd] = useState(null);

    const handleAddClick = (label) => {
        setLabelToAdd(label);
        setAddModalVisible(true);
    };

    const handleAddConfirm = async () => {
        try {
            // Thêm cột mới vào Firestore
            const cardsRef = doc(db, `boards/${boardId}/columns/${columnId}/cards/${cardId}`);
            console.log(cardsRef)
            await updateDoc(cardsRef, {
                label: labelToAdd.name,
                color: labelToAdd.color
            });
            setAddModalVisible(false);
        } catch (e) {
            console.error("Error creating column: ", e);
        }
    };

    const handleAddCancel = () => {
        setLabelToAdd(null);
        setAddModalVisible(false);
    };

    useEffect(() => {
        const cardsRef = doc(db, `boards/${boardId}/columns/${columnId}/cards/${cardId}`);
        const unsubscribe = onSnapshot(cardsRef, (docSnapshot) => {
            setLabels(labelCurrent);
            if (docSnapshot.exists()) {
                const cardData = docSnapshot.data();
                handleCardData(cardData)
                console.log("Card data:", cardData);
                // Sử dụng cardData để hiển thị thông tin của card
            } else {
                console.log("No such document!");
            }
        });

        // Lưu ý rằng unsubscribe sẽ được gọi khi component bị unmount hoặc effect được gọi lại
        return () => unsubscribe();
    }, [boardId, columnId, cardId]);

    return (
        <div>
            <hr />
            <List
                itemLayout="horizontal"
                dataSource={label || []}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            title={<a href="https://ant.design">{item.name}</a>}
                        />
                        <Button type="primary" onClick={() => handleAddClick(item)}>Thêm</Button>
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

export default LabelList;
