import _ from "lodash";
import api from ".";

export const createUser = async (userData) => {
  try {
    const response = await api.post(`/register`, userData);
    return response.data;
  } catch (err) {
    if (err.response.status == 400) {
      const errorData = await err.response.data;
      const firstErrorMessage = _.chain(errorData)
        .get("errors")
        .values()
        .flatten()
        .head()
        .value();
      throw new Error(
        errorData.message || firstErrorMessage || "Registration failed"
      );
    } else throw new Error(err);
  }
};

export const loginUser = async (userData) => {
  try {
    const response = await api.post(`/login`, userData);
    return response.data;
  } catch (err) {
    if (err.response.status == 400) {
      const errorData = await err.response.data;
      const firstErrorMessage = _.chain(errorData)
        .get("errors")
        .values()
        .flatten()
        .head()
        .value();
      throw new Error(errorData.message || firstErrorMessage || "Login failed");
    } else throw new Error(err);
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put(`/update-profile`, profileData);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 400) {
      const errorData = await err.response.data;
      const firstErrorMessage = _.chain(errorData)
        .get("errors")
        .values()
        .flatten()
        .head()
        .value();
      throw new Error(
        errorData.message || firstErrorMessage || "Profile update failed"
      );
    } else throw new Error(err);
  }
};

export const changePassword = async (passwordData) => {
  try {
    const response = await api.post(`/change-password`, passwordData);
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 400) {
      const errorData = await err.response.data;
      const firstErrorMessage = _.chain(errorData)
        .get("errors")
        .values()
        .flatten()
        .head()
        .value();
      throw new Error(
        errorData.message || firstErrorMessage || "Password change failed"
      );
    } else throw new Error(err);
  }
};

export const getAccounts = async () => {
  const { data } = await api.get("/accounts/");
  return data;
};

export const createAccount = async (accountData) => {
  const { data } = await api.post("/accounts/", accountData);
  return data;
};

export const updateAccount = async ({ id, ...accountData }) => {
  const { data } = await api.put(`/accounts/${id}/`, accountData);
  return data;
};

export const getAccountLedgers = async (accountId) => {
  const { data } = await api.get(`/ledgers/?account=${accountId}`);
  return data;
};

export const createLedger = async (ledgerData) => {
  const { data } = await api.post("/ledgers/", ledgerData);
  return data;
};

export const updateLedger = async ({ id, ...ledgerData }) => {
  const { data } = await api.put(`/ledgers/${id}/`, ledgerData);
  return data;
};

export const deleteLedger = async (id) => {
  const { data } = await api.delete(`/ledgers/${id}/`);
  return data;
};

export const getLedgerTransactions = async (ledgerId) => {
  const { data } = await api.get(`/transactions/?ledger=${ledgerId}`);
  return data;
};

export const createTransaction = async (transactionData) => {
  const { data } = await api.post("/transactions/", transactionData);
  return data;
};

export const updateTransaction = async ({ id, ...transactionData }) => {
  const { data } = await api.put(`/transactions/${id}/`, transactionData);
  return data;
};
