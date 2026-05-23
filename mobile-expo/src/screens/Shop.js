// mobile-expo/src/screens/Shop.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';

export default function ShopScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'products'));
        const items = [];
        querySnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });
        setProducts(items);
      } catch (e) {
        console.error('Failed to load products', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const renderItem = ({ item }) => (
    <Text style={styles.item} onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}>
      {item.name}
    </Text>
  );

  if (loading) {
    return <ActivityIndicator style={styles.loader} size="large" color="#fff" />;
  }

  return (
    <View style={styles.container}>
      <FlatList data={products} renderItem={renderItem} keyExtractor={(item) => item.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', padding: 10 },
  item: { padding: 12, marginVertical: 8, backgroundColor: '#333', color: '#fff', borderRadius: 6 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
