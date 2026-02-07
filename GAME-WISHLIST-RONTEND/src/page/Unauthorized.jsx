import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Unauthorized Access</h1>
      <p className="mb-4">You do not have permission to view this page.</p>
      <button
        onClick={() => navigate(-1)}
        className="bg-black text-white p-2 rounded"
      >
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;
