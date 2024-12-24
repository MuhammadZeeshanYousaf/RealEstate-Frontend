import { useParams, useNavigate } from "react-router-dom";
import { useGetCustomerById } from "../../react-query/queries/customer.queries";
import Loader from "../../components/shared/Loader";
import { useGetPaymentsByCustomer } from "../../react-query/queries/payment.queries";
import { useUpdatePaymentMutation } from "../../react-query/mutations/payment.mutation";
import { formatDate } from "../../utilities/helpers";
import { Link } from "react-router-dom";

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, isPending } = useGetCustomerById(id);
  const { data: payments } = useGetPaymentsByCustomer(id);
  const updatePaymentMutation = useUpdatePaymentMutation();

  const getStatusStyles = (status) => {
    switch (status) {
      case "active":
        return {
          container: "bg-green-50 border border-green-200",
          badge: "bg-green-100 text-green-800",
        };
      case "cancelled":
        return {
          container: "bg-red-50 border border-red-200",
          badge: "bg-red-100 text-red-800",
        };
      case "pending":
        return {
          container: "bg-yellow-50 border border-yellow-200",
          badge: "bg-yellow-100 text-yellow-800",
        };
      default:
        return {
          container: "bg-gray-50 border border-gray-200",
          badge: "bg-gray-100 text-gray-800",
        };
    }
  };

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-1">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-slate-500 text-white rounded-lg text-sm me-4 font-medium"
          >
            &lt;&ensp;Back
          </button>
          Customer Details
        </h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-900">
                    {customer?.user?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold text-gray-900">
                    {customer?.user?.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">CNIC:</span>
                  <span className="font-semibold text-gray-900">
                    {customer?.cnic || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phone Number:</span>
                  <span className="font-semibold text-gray-900">
                    {customer?.phone_number || "N/A"}
                  </span>
                </div>
                {customer?.address && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-semibold text-gray-900">
                      {customer.address}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold mb-4">Agreements</h2>
              <div className="space-y-4">
                {customer?.agreements?.length > 0 ? (
                  customer.agreements.map((agreement) => {
                    const statusStyle = getStatusStyles(agreement.status);
                    return (
                      <div
                        key={agreement.id}
                        className={`p-3 rounded-md ${statusStyle.container}`}
                      >
                        <Link
                          to={`/admin/agreements/${agreement.id}`}
                          className="flex justify-between items-center"
                        >
                          <span className="font-bold underline text-blue-500">
                            Agreement # {agreement.id}
                          </span>
                        </Link>
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">
                              <span className="font-bold">Property:</span>{" "}
                              {agreement.property?.title || "N/A"}
                            </span>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-bold">Type:</span>{" "}
                              {agreement.property?.rent_or_buy?.toUpperCase() ||
                                "N/A"}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${statusStyle.badge}`}
                          >
                            {agreement.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Date:{" "}
                          {new Date(agreement.created_at).toLocaleDateString()}
                        </div>
                        {agreement.status === "active" && (
                          <button
                            onClick={() =>
                              navigate(`/admin/payments/create/${agreement.id}`)
                            }
                            className="px-3 py-1 mt-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Add Payment
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500">No agreements found</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Payments</h2>
              <div className="space-y-4">
                {payments?.results?.length === 0 && (
                  <p className="text-gray-500 py-2">No payments yet</p>
                )}
                {payments?.results?.map((payment) => (
                  <div
                    key={payment.id}
                    className={`p-4 rounded-lg border ${
                      payment.status === "completed"
                        ? "border-green-200 bg-green-50"
                        : payment.status === "failed"
                        ? "border-red-200 bg-red-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Rs. {payment.amount}</p>
                        <p className="text-sm text-gray-600">
                          Method: {payment.method}
                        </p>
                        {payment.status !== "pending" && payment.date && (
                          <p className="text-sm text-gray-600">
                            <span className="font-bold">
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}{" "}
                              on:
                            </span>{" "}
                            {formatDate(payment.date)}
                          </p>
                        )}
                        <hr className="my-2" />
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Created:</span>{" "}
                          {formatDate(payment.created_at)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">For:</span>{" "}
                          <Link
                            to={`/admin/agreements/${payment.agreement_details.id}`}
                            className="underline text-blue-600"
                          >
                            Agreement # {payment.agreement_details.id}
                          </Link>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {payment.status === "pending" ? (
                          <select
                            value={payment.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              if (newStatus !== "pending") {
                                updatePaymentMutation.mutate({
                                  id: payment.id,
                                  data: {
                                    status: newStatus,
                                    date: new Date().toISOString(),
                                  },
                                });
                              } else {
                                updatePaymentMutation.mutate({
                                  id: payment.id,
                                  data: { status: newStatus },
                                });
                              }
                            }}
                            className="rounded-md border-gray-300 text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded-full text-sm ${
                              payment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
