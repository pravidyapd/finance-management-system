
import axios from "axios";

const API_URL = "http://localhost:8080/api/clients";

export interface Client {
  id?: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: string;
}

export const getAllClients = async (): Promise<Client[]> => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const createClient = async (client: Client): Promise<Client> => {
  const response = await axios.post(API_URL, client);
  return response.data;
};

export const updateClient = async (
  id: number,
  client: Client
): Promise<Client> => {
  const response = await axios.put(`${API_URL}/${id}`, client);
  return response.data;
};

export const deleteClient = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
