import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import NewPostForm from './NewPostForm';

const CreatePostWrapper: React.FC = () => {
  const { categoryKey } = useParams();
  const navigate = useNavigate();

  const handlePostCreated = () => {
    navigate('/feed');
  };

  const handleCancel = () => {
    navigate('/feed');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <NewPostForm
        categoryKey={categoryKey || 'board'}
        onPostCreated={handlePostCreated}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default CreatePostWrapper;
