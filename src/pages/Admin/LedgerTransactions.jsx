import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaPlus, FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import DataTable from "react-data-table-component";
import {
  getLedgerTransactions,
  createTransaction,
  updateTransaction,
} from "../../apis/account.api";
import Modal from "../../components/shared/Modal";
import Loader from "../../components/shared/Loader";
import PageHeader from "../../components/shared/PageHeader";

const TransactionForm = ({ transaction, ledgerId, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    detail: transaction?.detail || "",
    amount: transaction?.amount || "",
    type: transaction?.type || "debit",
    date: transaction?.date || new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, ledger: ledgerId });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Detail</label>
        <input
          type="text"
          name="detail"
          value={formData.detail}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          step="0.01"
          min="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {transaction ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

const LedgerTransactions = () => {
  const { ledgerId } = useParams();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const columns = [
    {
      name: "Date",
      selector: row => new Date(row.date).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Detail",
      selector: row => row.detail,
      sortable: true,
    },
    {
      name: "Type",
      selector: row => row.type,
      sortable: true,
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
        </span>
      ),
    },
    {
      name: "Amount",
      selector: row => row.amount,
      sortable: true,
      cell: row => (
        <span className={row.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
          ${parseFloat(row.amount).toFixed(2)}
        </span>
      ),
    },
    {
      name: "Balance",
      selector: row => row.balance,
      sortable: true,
      cell: row => (
        <span className={row.balance >= 0 ? 'text-red-600' : 'text-green-600'}>
          {row.balance >= 0 ? '-' : '+'} ${Math.abs(row.balance).toFixed(2)}
        </span>
      ),
    },
    {
      name: "Actions",
      cell: row => (
        <button
          onClick={() => handleEdit(row)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        >
          <FaEdit />
        </button>
      ),
    },
  ];

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", ledgerId],
    queryFn: () => getLedgerTransactions(ledgerId),
    enabled: !!ledgerId,
  });

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions", ledgerId]);
      toast.success("Transaction created successfully");
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries(["transactions", ledgerId]);
      toast.success("Transaction updated successfully");
      setIsModalOpen(false);
      setSelectedTransaction(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update transaction");
    },
  });

  const handleSubmit = (data) => {
    if (selectedTransaction) {
      updateMutation.mutate({ id: selectedTransaction.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <PageHeader title="Ledger Transactions">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FaPlus className="mr-2" />
          Add Transaction
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={transactions || []}
        pagination
        highlightOnHover
        responsive
        striped
        progressPending={isLoading}
        progressComponent={<Loader />}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={selectedTransaction ? "Edit Transaction" : "Create Transaction"}
      >
        <TransactionForm
          transaction={selectedTransaction}
          ledgerId={ledgerId}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      </Modal>
    </div>
  );
};

export default LedgerTransactions; 