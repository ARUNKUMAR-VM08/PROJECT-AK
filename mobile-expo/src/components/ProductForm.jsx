import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Dialog, Button, TextInput } from 'react-native-paper';

const ProductForm = ({ visible, onDismiss, onSubmit, product }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setPrice(String(product.price || ''));
      setDescription(product.description || '');
    } else {
      setName('');
      setPrice('');
      setDescription('');
    }
  }, [product]);

  const handleSave = () => {
    const parsedPrice = parseFloat(price);
    const payload = {
      name,
      price: isNaN(parsedPrice) ? 0 : parsedPrice,
      description,
    };
    onSubmit(payload);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title style={styles.title}>{product ? 'Edit Product' : 'Add Product'}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            activeOutlineColor="hsl(220, 90%, 56%)"
            textColor="#fff"
            theme={{ colors: { background: '#333', text: '#fff', placeholder: '#aaa', primary: 'hsl(220, 90%, 56%)', outline: '#444' } }}
            accessibilityLabel="Product Name Input"
            accessibilityHint="Enter the name of the product"
          />
          <TextInput
            label="Price"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
            activeOutlineColor="hsl(220, 90%, 56%)"
            textColor="#fff"
            theme={{ colors: { background: '#333', text: '#fff', placeholder: '#aaa', primary: 'hsl(220, 90%, 56%)', outline: '#444' } }}
            accessibilityLabel="Product Price Input"
            accessibilityHint="Enter the price of the product"
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={styles.input}
            mode="outlined"
            activeOutlineColor="hsl(220, 90%, 56%)"
            textColor="#fff"
            theme={{ colors: { background: '#333', text: '#fff', placeholder: '#aaa', primary: 'hsl(220, 90%, 56%)', outline: '#444' } }}
            accessibilityLabel="Product Description Input"
            accessibilityHint="Enter a detailed description of the product"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} textColor="#aaa">Cancel</Button>
          <Button onPress={handleSave} textColor="hsl(220, 90%, 56%)" mode="contained-tonal" style={styles.saveBtn}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#222',
    borderRadius: 12,
  },
  title: {
    color: '#fff',
  },
  input: {
    marginBottom: 12,
  },
  saveBtn: {
    marginLeft: 10,
    backgroundColor: 'rgba(77, 166, 255, 0.15)',
  },
});

export default ProductForm;
