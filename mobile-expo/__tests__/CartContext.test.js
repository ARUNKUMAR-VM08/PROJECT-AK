// __tests__/CartContext.test.js
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { CartProvider, CartContext } from '../src/context/CartContext';
import { AsyncStorage } from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

describe('CartContext', () => {
  it('adds items to cart', async () => {
    const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => React.useContext(CartContext), { wrapper });
    act(() => {
      result.current.addToCart({ id: '1', name: 'Test', price: 10 });
    });
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].name).toBe('Test');
  });
});
