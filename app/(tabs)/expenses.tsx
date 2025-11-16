// app/(tabs)/expenses.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, FlatList, Text } from 'react-native';
import { Button, ListItem } from '@rneui/themed';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from '../../src/api/firebase';
import { Trip, Expense, Balance } from '../../src/types';
import BalanceSummary from '../../src/components/BalanceSummary';
import ExpenseCard from '../../src/components/ExpenseCard';
import { Link } from 'expo-router';
import { Picker } from '@react-native-picker/picker'; // You may need to install this: npx expo install @react-native-picker/picker

export default function ExpensesScreen() {
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<string[]>([]);

  // 1. Fetch all trips the current user is a member of
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    const tripsQuery = query(collection(db, 'trips'), where('members', 'array-contains', user.email));
    const unsubscribe = onSnapshot(tripsQuery, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
      setUserTrips(tripsData);
      // Automatically select the first trip if none is selected
      if (!selectedTripId && tripsData.length > 0) {
        setSelectedTripId(tripsData[0].id);
      }
    });
    return () => unsubscribe();
  }, [auth.currentUser]);

  // 2. Fetch expenses for the currently selected trip
  useEffect(() => {
    if (!selectedTripId) {
      setExpenses([]);
      setMembers([]);
      return;
    };

    // Also update members when trip changes
    const selectedTrip = userTrips.find(t => t.id === selectedTripId);
    setMembers(selectedTrip?.members || []);

    const expensesQuery = query(
      collection(db, `trips/${selectedTripId}/expenses`),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(expensesQuery, (snapshot) => {
      const expensesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(expensesData);
    });
    return () => unsubscribe();
  }, [selectedTripId, userTrips]);

  // 3. THE CORE LOGIC: Calculate balances whenever expenses or members change
  const balances: Balance[] = useMemo(() => {
    if (expenses.length === 0 || members.length < 2) return [];

    const memberBalances: { [email: string]: number } = {};
    members.forEach(member => memberBalances[member] = 0);

    // Calculate the net balance for each member
    expenses.forEach(expense => {
      const amount = expense.amount;
      const paidByEmail = expense.paidBy.email;
      const splitCount = expense.splitBetween.length;
      if (splitCount === 0) return; // Avoid division by zero
      const share = amount / splitCount;

      // The person who paid gets credited the full amount
      memberBalances[paidByEmail] += amount;

      // Each person in the split gets debited their share
      expense.splitBetween.forEach(memberToDebit => {
        memberBalances[memberToDebit.email] -= share;
      });
    });

    const debtors = Object.entries(memberBalances)
        .filter(([, balance]) => balance < 0)
        .map(([email, balance]) => ({ email, owes: -balance }));

    const creditors = Object.entries(memberBalances)
        .filter(([, balance]) => balance > 0)
        .map(([email, balance]) => ({ email, isOwed: balance }));

    const settledBalances: Balance[] = [];

    // Simple settlement algorithm
    while (debtors.length > 0 && creditors.length > 0) {
        const debtor = debtors[0];
        const creditor = creditors[0];
        const amountToSettle = Math.min(debtor.owes, creditor.isOwed);

        settledBalances.push({
            whoOwes: debtor.email,
            whoIsOwed: creditor.email,
            amount: amountToSettle,
        });

        debtor.owes -= amountToSettle;
        creditor.isOwed -= amountToSettle;

        if (debtor.owes < 0.01) debtors.shift();
        if (creditor.isOwed < 0.01) creditors.shift();
    }

    return settledBalances;
  }, [expenses, members]);

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedTripId}
          onValueChange={(itemValue) => setSelectedTripId(itemValue)}
        >
          {userTrips.map(trip => (
            <Picker.Item key={trip.id} label={trip.name} value={trip.id} />
          ))}
        </Picker>
      </View>

      {selectedTripId ? (
        <>
            <BalanceSummary balances={balances} />
            <Link href={{ pathname: '/addExpense', params: { tripId: selectedTripId } }} asChild>
                <Button title="Add New Expense" containerStyle={styles.addButton} />
            </Link>
            <FlatList
                data={expenses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ExpenseCard expense={item} />}
                ListEmptyComponent={<Text style={styles.emptyText}>No expenses logged for this trip yet.</Text>}
                contentContainerStyle={styles.flatListContent} 
            />
        </>
      ) : (
        <Text style={styles.emptyText}>Create or join a trip to track expenses.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', margin: 10, borderRadius: 5 },
  addButton: { marginHorizontal: 10, marginTop: 10 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
  flatListContent: {          
    paddingBottom: 80,
  }
});