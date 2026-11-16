
import axios from "axios";

const API_URL = "http://localhost:8080/api/incomes";

export interface Income {
  id?: number;
  source: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: "Received" | "Pending";
}

export const getAllIncomes = async (): Promise<Income[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createIncome = async (income: Income): Promise<Income> => {
  const response = await axios.post(API_URL, income);
  return response.data;
};

export const updateIncome = async (
  id: number,
  income: Income
): Promise<Income> => {
  const response = await axios.put(`${API_URL}/${id}`, income);
  return response.data;
};

export const deleteIncome = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
