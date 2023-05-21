import { useState, useEffect } from 'react';
import { List, Avatar, Button, Modal } from 'antd';
import { collection, deleteDoc, addDoc, doc, getDoc, getDocs, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../../firbase";
import { useParams } from "react-router-dom";

const MemberList = ({ boardId, handleMemberData }) => {
    const [members, setMembers] = useState(null);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    const handleDeleteClick = (member) => {
        setMemberToDelete(member);
        setDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        // Remove the member from the list
        const updatedMembers = members.filter((member) => member.id !== memberToDelete.id);
        console.log(updatedMembers);

        // Update the 'member' field in the board document
        const boardDocRef = doc(db, "boards", boardId);
        await updateDoc(boardDocRef, { member: updatedMembers });

        setMemberToDelete(null);
        setDeleteModalVisible(false);
    };

    const handleDeleteCancel = () => {
        setMemberToDelete(null);
        setDeleteModalVisible(false);
    };

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, "boards", boardId), (doc) => {
            const data = doc.data();
            setMembers(data?.member);
            handleMemberData(data);

            const hasManager = data?.member?.some((member) => member.position === 'manager');
            if (!hasManager) {
                console.log('Dự án này chưa có người quản lý');
            }
        });
        return () => unsubscribe();
    }, [boardId]);

    return (
        <div>
            <div className="modal-name">TỔNG: {members?.length} THÀNH VIÊN</div>
            <hr />
            {members && members.length > 0 && !members.some((member) => member.position === 'manager') && (
                <div>Dự án này chưa có người quản lý.</div>
            )}
            <List
                itemLayout="horizontal"
                dataSource={members || []}
                renderItem={(item, index) => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<Avatar src={item.img} />}
                            title={<a href="https://ant.design">{item.displayName}</a>}
                            description={item.position}
                        />
                        <Button onClick={() => handleDeleteClick(item)}>Xóa</Button>
                    </List.Item>
                )}
            />
            <Modal
                title="Xác nhận xóa thành viên"
                visible={deleteModalVisible}
                onOk={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            >
                Bạn có chắc chắn muốn xóa thành viên này không?
            </Modal>
        </div>
    );
};

export default MemberList;
