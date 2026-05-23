// src/screens/Cart.js
import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { CartContext } from '../context/CartContext';

export default function CartScreen() {
  const { cart, removeFromCart, clearCart } = useContext(CartContext);

  const total = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  const handleRemove = (id) => {
    removeFromCart(id);
  };

  const handleClear = () => {
    Alert.alert('Clear Cart', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: clearCart },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.price}>${item.price?.toFixed(2)}</Text>
      <Button title="Remove" onPress={() => handleRemove(item.id)} />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Your cart is empty.</Text>}
      />
      <View style={styles.summary}>
        <Text style={styles.total}>Total: ${total.toFixed(2)}</Text>
        <Button title="Clear Cart" onPress={handleClear} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 10 },
  item: { backgroundColor: '#333', padding: 12, marginVertical: 6, borderRadius: 6 },
  title: { color: '#fff', fontSize: 16, marginBottom: 4 },
  price: { color: '#4da6ff', marginBottom: 8 },
  empty: { color: '#ccc', textAlign: 'center', marginTop: 20 },
  summary: { padding: 12, borderTopWidth: 1, borderTopColor: '#444' },
  total: { color: '#fff', fontSize: 18, marginBottom: 8 },
});
