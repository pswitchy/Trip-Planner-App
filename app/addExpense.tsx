// app/addExpense.tsx

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import { Input, Button } from '@rneui/themed';
import { collection, addDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../src/api/firebase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Trip, ExpenseContributor } from '../src/types';
import { Picker } from '@react-native-picker/picker';
import CheckBox from '@react-native-community/checkbox'; // You may need to install this: npm install @react-native-community/checkbox
import 'react-native-get-random-values'; // Import for nanoid
import { nanoid } from 'nanoid/non-secure'; // Use non-secure for React Native

export default function AddExpenseScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();
  const currentUserEmail = auth.currentUser?.email;

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [tripMembers, setTripMembers] = useState<ExpenseContributor[]>([]);
  const [paidBy, setPaidBy] = useState<string | null>(currentUserEmail || null);
  const [splitBetween, setSplitBetween] = useState<{ [email: string]: boolean }>({});
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch trip members to populate pickers and checkboxes
  useEffect(() => {
    if (!tripId) return;

    const tripRef = doc(db, 'trips', tripId);
    const unsubscribe = onSnapshot(tripRef, (doc) => {
      if (doc.exists()) {
        const tripData = doc.data() as Trip;
        const membersAsContributors = tripData.members.map(email => ({ email }));
        setTripMembers(membersAsContributors);
        
        // By default, select all members to split the bill
        const initialSplit = tripData.members.reduce((acc, email) => {
            acc[email] = true;
            return acc;
        }, {} as { [email: string]: boolean });
        setSplitBetween(initialSplit);
      }
    });

    return () => unsubscribe();
  }, [tripId]);
  
  const handleSplitCheckbox = (email: string) => {
      setSplitBetween(prev => ({
          ...prev,
          [email]: !prev[email]
      }));
  };

  const handleAddExpense = async () => {
    // 2. Validate input
    const numericAmount = parseFloat(amount);
    if (!tripId || !description || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid description and amount.');
      return;
    }
    if (!paidBy) {
      Alert.alert('Invalid Input', 'Please select who paid for the expense.');
      return;
    }
    const finalSplitBetween = Object.keys(splitBetween).filter(email => splitBetween[email]).map(email => ({ email }));
    if (finalSplitBetween.length === 0) {
      Alert.alert('Invalid Input', 'Please select at least one person to split the expense with.');
      return;
    }
    
    setIsLoading(true);

    // 3. Create the new expense object
    const newExpense = {
        id: nanoid(),
        tripId,
        description,
        amount: numericAmount,
        paidBy: { email: paidBy },
        splitBetween: finalSplitBetween,
        createdAt: new Date().toISOString(),
    };

    // 4. Save to Firestore
    try {
        await addDoc(collection(db, `trips/${tripId}/expenses`), newExpense);
        router.back(); // Go back to the expenses screen
    } catch (error) {
        console.error("Error adding expense: ", error);
        Alert.alert('Error', 'Could not save the expense.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Input
        label="Description"
        placeholder="e.g., Dinner, Museum Tickets"
        value={description}
        onChangeText={setDescription}
      />
      <Input
        label="Amount"
        placeholder="0.00"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Paid By:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={paidBy} onValueChange={(itemValue) => setPaidBy(itemValue)}>
          {tripMembers.map(member => (
            <Picker.Item key={member.email} label={member.email} value={member.email} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Split Between:</Text>
      {tripMembers.map(member => (
        <View key={member.email} style={styles.checkboxContainer}>
          <CheckBox
            value={splitBetween[member.email] || false}
            onValueChange={() => handleSplitCheckbox(member.email)}
          />
          <Text style={styles.checkboxLabel}>{member.email}</Text>
        </View>
      ))}
      
      <Button 
        title="Add Expense" 
        onPress={handleAddExpense} 
        containerStyle={styles.addButton}
        loading={isLoading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#555', marginLeft: 10, marginTop: 15, marginBottom: 5 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginHorizontal: 10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 5, marginHorizontal: 10 },
  checkboxLabel: { marginLeft: 8, fontSize: 16 },
  addButton: { margin: 10, marginTop: 30 },
});