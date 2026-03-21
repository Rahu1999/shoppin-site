import { apiGet, apiPatch, apiPost, apiDelete } from './apiClient';

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  status: string;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

export const getProfile = () => apiGet<UserProfile>('/users/me');

export const updateProfile = (data: Partial<UserProfile>) => 
  apiPatch<UserProfile>('/users/me', data);

export const getAddresses = () => apiGet<Address[]>('/users/addresses');

export const addAddress = (data: Omit<Address, 'id'>) => 
  apiPost<Address>('/users/addresses', data);

export const updateAddress = (id: string, data: Partial<Address>) => 
  apiPatch<Address>(`/users/addresses/${id}`, data);

export const deleteAddress = (id: string) => 
  apiDelete(`/users/addresses/${id}`);
