import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaPlus, FaEdit, FaTrash, FaList } from "react-icons/fa";
import toast from "react-hot-toast";
import {
  getAccountLedgers,
  createLedger,
  updateLedger,
  deleteLedger,
} from "../../apis/account.api";
import Modal from "../../components/shared/Modal";
import Loader from "../../components/shared/Loader";

const LedgerCard = ({ ledger, onEdit, onDelete, onViewTransactions }) => {
  const isPositive = ledger.balance >= 0;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold mb-2">{ledger.title}</h3>
          <p className="text-gray-600 mb-4">Account: {ledger.account_name}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(ledger)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(ledger.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <FaTrash />
          </button>
          <button
            onClick={() => onViewTransactions(ledger.id)}
            className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
          >
            <FaList />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">Debit Total</p>
          <p className="text-lg font-semibold text-green-600">
            ${ledger.debit_total}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Credit Total</p>
          <p className="text-lg font-semibold text-red-600">
            ${ledger.credit_total}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Balance</p>
          <p className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(ledger.balance)}
          </p>
        </div>
      </div>
    </div>
  );
};

const LedgerForm = ({ ledger, accountId, onSubmit, onClose }) => {
  const [title, setTitle] = useState(ledger?.title || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, account: accountId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Ledger Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
          {ledger ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

const AccountLedgers = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLedger, setSelectedLedger] = useState(null);

  const { data: ledgers, isLoading } = useQuery({
    queryKey: ["ledgers", accountId],
    queryFn: () => getAccountLedgers(accountId),
  });

  const createMutation = useMutation({
    mutationFn: createLedger,
    onSuccess: () => {
      queryClient.invalidateQueries(["ledgers", accountId]);
      toast.success("Ledger created successfully");
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create ledger");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateLedger,
    onSuccess: () => {
      queryClient.invalidateQueries(["ledgers", accountId]);
      toast.success("Ledger updated successfully");
      setIsModalOpen(false);
      setSelectedLedger(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update ledger");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLedger,
    onSuccess: () => {
      queryClient.invalidateQueries(["ledgers", accountId]);
      toast.success("Ledger deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete ledger");
    },
  });

  const handleSubmit = (data) => {
    if (selectedLedger) {
      updateMutation.mutate({ id: selectedLedger.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (ledger) => {
    setSelectedLedger(ledger);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ledger?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedLedger(null);
  };

  const handleViewTransactions = (ledgerId) => {
    navigate(`/admin/accounts/${accountId}/ledgers/${ledgerId}/transactions`);
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Account Ledgers</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FaPlus className="mr-2" />
          Create Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ledgers?.map((ledger) => (
          <LedgerCard
            key={ledger.id}
            ledger={ledger}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewTransactions={handleViewTransactions}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={selectedLedger ? "Edit Ledger" : "Create Ledger"}
      >
        <LedgerForm
          ledger={selectedLedger}
          accountId={accountId}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      </Modal>
    </div>
  );
};

export default AccountLedgers; 