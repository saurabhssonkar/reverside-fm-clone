
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Automatically navigate to the video call page
    navigate('/sfu/room');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-riverside-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-white">Loading Video Conference...</h1>
        <p className="text-xl text-gray-400">Please wait</p>
      </div>
    </div>
  );
};

export default Index;
