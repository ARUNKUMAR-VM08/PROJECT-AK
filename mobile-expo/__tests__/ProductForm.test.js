// __tests__/ProductForm.test.js
import React from 'react';
import { render } from '@testing-library/react-native';
import ProductForm from '../src/components/ProductForm';
import { Provider as PaperProvider } from 'react-native-paper';

describe('ProductForm Component', () => {
  it('renders correctly with default state', () => {
    const { getByText } = render(
      <PaperProvider>
        <ProductForm visible={true} onDismiss={jest.fn()} onSubmit={jest.fn()} />
      </PaperProvider>
    );
    expect(getByText('Add Product')).toBeTruthy();
  });

  it('renders edit mode title when product prop is supplied', () => {
    const product = { name: 'Sample Product', price: 100, description: 'Description' };
    const { getByText } = render(
      <PaperProvider>
        <ProductForm visible={true} onDismiss={jest.fn()} onSubmit={jest.fn()} product={product} />
      </PaperProvider>
    );
    expect(getByText('Edit Product')).toBeTruthy();
  });
});
