import axios from "axios";

const API_URL = "http://localhost:8080/api/expenses";

export interface Expense {
  id?: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: string;
}

export const getAllExpenses = async (): Promise<Expense[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createExpense = async (expense: Expense): Promise<Expense> => {
  const response = await axios.post(API_URL, expense);
  return response.data;
};

export const updateExpense = async (
  id: number,
  expense: Expense
): Promise<Expense> => {
  const response = await axios.put(`${API_URL}/${id}`, expense);
  return response.data;
};

export const deleteExpense = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};