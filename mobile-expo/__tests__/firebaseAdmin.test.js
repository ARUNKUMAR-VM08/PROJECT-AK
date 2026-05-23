// __tests__/firebaseAdmin.test.js
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../src/services/firebaseAdmin';
import { getDocs, addDoc, setDoc, deleteDoc } from 'firebase/firestore';

jest.mock('firebase/firestore', () => {
  return {
    collection: jest.fn(),
    doc: jest.fn(),
    getDocs: jest.fn(),
    addDoc: jest.fn(),
    setDoc: jest.fn(),
    deleteDoc: jest.fn(),
  };
});

jest.mock('../src/services/firebase', () => ({
  db: {},
}));

describe('firebaseAdmin services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchProducts', () => {
    it('fetches products successfully', async () => {
      const mockSnapshot = [
        { id: '1', data: () => ({ name: 'Product 1', price: 10 }) },
        { id: '2', data: () => ({ name: 'Product 2', price: 20 }) },
      ];
      getDocs.mockResolvedValueOnce(mockSnapshot);

      const products = await fetchProducts();
      expect(products).toHaveLength(2);
      expect(products[0]).toEqual({ id: '1', name: 'Product 1', price: 10 });
      expect(products[1]).toEqual({ id: '2', name: 'Product 2', price: 20 });
    });
  });

  describe('addProduct', () => {
    it('adds product successfully', async () => {
      const mockProduct = { name: 'New Product', price: 15 };
      addDoc.mockResolvedValueOnce({ id: 'new_id' });

      const result = await addProduct(mockProduct);
      expect(result).toEqual({ id: 'new_id', ...mockProduct });
      expect(addDoc).toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    it('updates product successfully', async () => {
      const mockProduct = { name: 'Updated Product', price: 25 };
      setDoc.mockResolvedValueOnce();

      await updateProduct('existing_id', mockProduct);
      expect(setDoc).toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('deletes product successfully', async () => {
      deleteDoc.mockResolvedValueOnce();

      await deleteProduct('existing_id');
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
