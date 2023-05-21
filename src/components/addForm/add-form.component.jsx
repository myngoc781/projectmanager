import React, { useState } from 'react';
import { db } from '../../firbase';
import { getDatabase, ref, push } from "firebase/database";

const AddForm = ({ boardId, columnId, type }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (type === 'column') {
      const newColumnRef = db.ref(`boards/${boardId}/columns`).push();
      const newColumnId = newColumnRef.key;
      const newColumn = {
        id: newColumnId,
        title: title,
        cards: []
      };
      newColumnRef.set(newColumn);
    } else if (type === 'card') {
      const newCardRef = db.ref(`boards/${boardId}/columns/${columnId}/cards`).push();
      const newCardId = newCardRef.key;
      const newCard = {
        id: newCardId,
        title: title,
        description: description
      };
      newCardRef.set(newCard);
    }
    setTitle('');
    setDescription('');
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      {type === 'column' && <input type="text" value={title} onChange={handleTitleChange} placeholder="Add a column" />}
      {type === 'card' && (
        <>
          <input type="text" value={title} onChange={handleTitleChange} placeholder="Add a card title" />
          <textarea value={description} onChange={handleDescriptionChange} placeholder="Add a card description"></textarea>
        </>
      )}
      <button type="submit">Add</button>
    </form>
  );
};

export default AddForm;