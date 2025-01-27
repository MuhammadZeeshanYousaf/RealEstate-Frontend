import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const PageHeader = ({ title, children }) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default PageHeader; 