import { useState, useEffect } from 'react';
import { List, Avatar, Button, Modal, DatePicker, DatePickerProps } from 'antd';
import { collection, AddDoc, addDoc, doc, getDoc, getDocs, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firbase";
import { useParams } from "react-router-dom";
import moment from 'moment';

const DateList = ({ boardId, columnId, cardId, handleCardData }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [AddModalVisible, setAddModalVisible] = useState(false);
    const [dateToAdd, setDateToAdd] = useState(null);

    const handleAddClick = (date) => {
        setDateToAdd(date);
        setAddModalVisible(true);
    };

    const handleAddConfirm = async () => {
        try {
            // Thêm cột mới vào Firestore
            const cardsRef = doc(db, `boards/${boardId}/columns/${columnId}/cards/${cardId}`);
            console.log(cardsRef)
            await updateDoc(cardsRef, {
                dateEnd: selectedDate,
            });
            setAddModalVisible(false);
        } catch (e) {
            console.error("Error creating column: ", e);
        }
    };

    const handleAddCancel = () => {
        setDateToAdd(null);
        setAddModalVisible(false);
    };

    const onChange = (date, dateString) => {
        console.log(dateString);
        setSelectedDate(dateString);
    }

    useEffect(() => {
        const cardsRef = doc(db, `boards/${boardId}/columns/${columnId}/cards/${cardId}`);
        const unsubscribe = onSnapshot(cardsRef, (docSnapshot) => {
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
            <div style={{ marginTop: 15 }}>
                <DatePicker
                    onChange={onChange}
                    format="DD/MM/YYYY"
                />
                <Button style={{ marginLeft: 15 }} type="primary" onClick={() => handleAddClick()}>Thêm</Button>
            </div>
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

export default DateList;
