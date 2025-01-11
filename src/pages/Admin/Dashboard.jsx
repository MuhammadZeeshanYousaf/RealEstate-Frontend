import { useGetDashboardStats } from "../../react-query/queries/dashboard.queries";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Loader from "../../components/shared/Loader";

const Dashboard = () => {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) return <Loader />;

  const {
    total_properties,
    sold_properties,
    on_rent,
    on_hold,
    pending_requests
  } = stats || {};

  const statCards = [
    {
      title: "Total Properties",
      value: total_properties,
      color: "#1d4ed8",
      bgColor: "#e0f2fe"
    },
    {
      title: "Sold Properties",
      value: sold_properties,
      color: "#16a34a",
      bgColor: "#e5f8e7"
    },
    {
      title: "On Rent",
      value: on_rent,
      color: "#eab308",
      bgColor: "#fef9c3"
    },
    {
      title: "On Hold",
      value: on_hold,
      color: "#dc2626",
      bgColor: "#fee2e2"
    },
    {
      title: "Pending Requests",
      value: pending_requests,
      color: "#9333ea",
      bgColor: "#f3e8ff"
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="w-32 h-32 mx-auto">
              <CircularProgressbar
                value={(stat.value / total_properties) * 100 || 0}
                text={`${stat.value}`}
                styles={buildStyles({
                  textSize: "16px",
                  pathColor: stat.color,
                  textColor: stat.color,
                  trailColor: stat.bgColor,
                })}
              />
            </div>
            <p className="text-lg mt-4 text-center font-medium">{stat.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 