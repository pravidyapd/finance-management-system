
import axios from "axios";

const API_URL = "http://localhost:8080/api/payments";

export interface Payment {
  id?: number;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  paidAmount: number;
  date: string;
  dueDate: string;
  paymentMethod: string;
  status: string;
}

export const getAllPayments = async (): Promise<Payment[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createPayment = async (
  payment: Payment
): Promise<Payment> => {
  const response = await axios.post(API_URL, payment);
  return response.data;
};

export const updatePayment = async (
  id: number,
  payment: Payment
): Promise<Payment> => {
  const response = await axios.put(`${API_URL}/${id}`, payment);
  return response.data;
};

export const deletePayment = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
