// __tests__/AdminDashboard.test.js
import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import AdminDashboard from '../src/screens/AdminDashboard';
import { fetchProducts } from '../src/services/firebaseAdmin';

jest.mock('../src/services/firebaseAdmin', () => ({
  fetchProducts: jest.fn(),
  addProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));

jest.mock('../src/components/ProductForm', () => {
  const { Text } = require('react-native');
  return () => <Text>Mock ProductForm</Text>;
});

describe('AdminDashboard Screen', () => {
  beforeEach(() => {
    fetchProducts.mockResolvedValue([
      { id: '1', name: 'Product A', price: 99.99 },
      { id: '2', name: 'Product B', price: 199.99 },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders products fetched from firebaseAdmin service', async () => {
    const { getByText } = render(<AdminDashboard />);
    
    await waitFor(() => {
      expect(getByText('Product A')).toBeTruthy();
      expect(getByText('Product B')).toBeTruthy();
      expect(getByText('$99.99')).toBeTruthy();
      expect(getByText('$199.99')).toBeTruthy();
    });
  });
});
