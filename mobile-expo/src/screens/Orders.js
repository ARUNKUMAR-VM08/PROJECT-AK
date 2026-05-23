// mobile-expo/src/screens/Orders.js
import React, { useEffect, useState, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function OrdersScreen() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setOrders(data);
    } catch (e) {
      console.error('Failed to load orders', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="#fff" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.title}>Order #{item.id}</Text>
            <Text>Status: {item.status || 'Pending'}</Text>
            <Text>Total: ${item.total?.toFixed(2) || '0.00'}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No orders found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 10 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  item: { backgroundColor: '#333', padding: 12, marginVertical: 6, borderRadius: 6 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  empty: { textAlign: 'center', color: '#ccc', marginTop: 20 },
});
