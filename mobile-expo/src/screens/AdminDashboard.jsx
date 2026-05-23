// AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Alert, ActivityIndicator } from 'react-native';
import { DataTable, Button, Text, IconButton } from 'react-native-paper';
import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../services/firebaseAdmin';
import ProductForm from '../components/ProductForm';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleAdd = async (product) => {
    try {
      await addProduct(product);
      closeModal();
      await loadProducts();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleUpdate = async (product) => {
    try {
      if (editingProduct && editingProduct.id) {
        await updateProduct(editingProduct.id, product);
      }
      closeModal();
      await loadProducts();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm', 'Delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(id);
            await loadProducts();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
      },
    ]);
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };
  const openEditModal = (product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  return (
    <View style={styles.container}>
      <Button mode="contained" onPress={openAddModal} style={styles.addButton}>
        Add Product
      </Button>
      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Name</DataTable.Title>
            <DataTable.Title numeric>Price</DataTable.Title>
            <DataTable.Title>Actions</DataTable.Title>
          </DataTable.Header>
          {products.map((p) => (
            <DataTable.Row key={p.id}>
              <DataTable.Cell>{p.name}</DataTable.Cell>
              <DataTable.Cell numeric>${p.price}</DataTable.Cell>
              <DataTable.Cell style={styles.actionsCell}>
                <IconButton icon="pencil" size={20} onPress={() => openEditModal(p)} />
                <IconButton icon="delete" size={20} onPress={() => handleDelete(p.id)} />
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      )}
      <ProductForm
        visible={modalVisible}
        onDismiss={closeModal}
        onSubmit={editingProduct ? handleUpdate : handleAdd}
        product={editingProduct}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#1a1a1a' },
  addButton: { marginBottom: 12, backgroundColor: 'hsl(220, 90%, 56%)' },
  actionsCell: { flexDirection: 'row' },
  loader: { marginTop: 20 },
});

export default AdminDashboard;
