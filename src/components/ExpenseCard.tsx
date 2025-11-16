// src/components/ExpenseCard.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Divider } from '@rneui/themed';
import { Expense } from '../types';

interface ExpenseCardProps {
  expense: Expense;
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({ expense }) => {
  const formattedDate = new Date(expense.createdAt).toLocaleDateString();

  return (
    <Card containerStyle={styles.card}>
      <View style={styles.header}>
        <Text style={styles.description}>{expense.description}</Text>
        <Text style={styles.amount}>${expense.amount.toFixed(2)}</Text>
      </View>
      <Text style={styles.paidBy}>Paid by {expense.paidBy.email} on {formattedDate}</Text>
      <Divider style={styles.divider} />
      <Text style={styles.splitTitle}>Split between:</Text>
      <View style={styles.splitContainer}>
        {expense.splitBetween.map(member => (
            <Text key={member.email} style={styles.splitMember}>- {member.email}</Text>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  description: { fontSize: 18, fontWeight: 'bold' },
  amount: { fontSize: 18, fontWeight: 'bold', color: 'green' },
  paidBy: { fontSize: 12, color: 'gray', fontStyle: 'italic', marginBottom: 10 },
  divider: { marginVertical: 10 },
  splitTitle: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
  splitContainer: { marginLeft: 10 },
  splitMember: { fontSize: 14 },
});

export default ExpenseCard;