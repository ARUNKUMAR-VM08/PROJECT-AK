import React, { useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import * as Haptics from 'react-native-haptic-feedback';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const route = useRoute();
  const { productId } = route.params;
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const prodRef = doc(db, 'products', productId);
        const prodSnap = await getDoc(prodRef);
        if (prodSnap.exists()) {
          setProduct({ id: prodSnap.id, ...prodSnap.data() });
        }
      } catch (e) {
        console.error('Error loading product', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      Haptics.trigger('impactLight');
    }
  };

  // Animation hook for the info card fade‑in
  const opacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
  }, []);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Product not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {product.imageUrls && product.imageUrls.map((uri, idx) => (
          <Image key={idx} source={{ uri }} style={styles.image} />
        ))}
      </ScrollView>
      <Animated.View style={animatedStyle}>
        <GlassCard style={styles.infoCard}>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.price}>${product.price?.toFixed(2)}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Add to Cart</Text>
        </TouchableOpacity>
          </GlassCard>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  carousel: { height: 300 },
  image: { width: 400, height: 300, resizeMode: 'cover' },
  infoCard: { padding: 16, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, margin: 12 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, color: '#fff' },
  price: { fontSize: 20, color: '#4da6ff', marginBottom: 12 },
  description: { fontSize: 16, marginBottom: 20, color: '#ddd' },
  button: { backgroundColor: '#6200ea', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Animation style (fade‑in)
  animatedContainer: { opacity: 0 }
});

export default ProductDetail;
