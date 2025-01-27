import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaPlus, FaEdit, FaBookOpen } from "react-icons/fa";
import toast from "react-hot-toast";
import { getAccounts, createAccount, updateAccount } from "../../apis/account.api";
import Modal from "../../components/shared/Modal";
import Loader from "../../components/shared/Loader";
import PageHeader from "../../components/shared/PageHeader";

const gradients = [
  "from-blue-500 to-purple-500",
  "from-green-400 to-blue-500",
  "from-purple-500 to-pink-500",
  "from-yellow-400 to-red-500",
  "from-green-500 to-teal-500",
  "from-indigo-500 to-purple-600",
];

const AccountCard = ({ account, index, onEdit, onViewLedgers }) => {
  const gradient = gradients[index % gradients.length];

  return (
    <div className={`bg-gradient-to-r ${gradient} p-6 rounded-lg shadow-lg text-white`}>
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-bold mb-2">{account.name}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(account)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onViewLedgers(account.id)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <FaBookOpen />
          </button>
        </div>
      </div>
      <p className="text-sm opacity-80">Created: {new Date(account.created_at).toLocaleDateString()}</p>
    </div>
  );
};

const AccountForm = ({ account, onSubmit, onClose }) => {
  const [name, setName] = useState(account?.name || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Account Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          {account ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

const Accounts = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
  });

  const createMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(["accounts"]);
      toast.success("Account created successfully");
      setIsModalOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create account");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAccount,
    onSuccess: () => {
      queryClient.invalidateQueries(["accounts"]);
      toast.success("Account updated successfully");
      setIsModalOpen(false);
      setSelectedAccount(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update account");
    },
  });

  const handleSubmit = (data) => {
    if (selectedAccount) {
      updateMutation.mutate({ id: selectedAccount.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setSelectedAccount(null);
  };

  const handleViewLedgers = (accountId) => {
    navigate(`/admin/accounts/${accountId}/ledgers`);
  };

  if (isLoading) return <Loader />;

  return (
    <div>
      <PageHeader title="Accounts">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FaPlus className="mr-2" />
          Create Account
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts?.map((account, index) => (
          <AccountCard
            key={account.id}
            account={account}
            index={index}
            onEdit={handleEdit}
            onViewLedgers={handleViewLedgers}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={selectedAccount ? "Edit Account" : "Create Account"}
      >
        <AccountForm
          account={selectedAccount}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      </Modal>
    </div>
  );
};

export default Accounts; 