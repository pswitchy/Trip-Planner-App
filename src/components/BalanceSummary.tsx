// src/components/BalanceSummary.tsx

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Card, Icon } from '@rneui/themed';
import { Balance } from '../types';

interface BalanceSummaryProps {
  balances: Balance[];
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ balances }) => {
  if (balances.length === 0) {
    return (
        <Card containerStyle={styles.card}>
            <View style={styles.centerContent}>
                <Icon name="check-circle" type="material-community" color="green" size={24} />
                <Text style={styles.settledText}>All settled up!</Text>
            </View>
        </Card>
    );
  }

  return (
    <Card containerStyle={styles.card}>
      <Card.Title>Who Owes Whom</Card.Title>
      <Card.Divider />
      {balances.map((balance, index) => (
        <View key={index} style={styles.balanceRow}>
          <Text style={styles.personText}>{balance.whoOwes.split('@')[0]}</Text>
          <Icon name="arrow-right" type="material-community" color="#555" />
          <Text style={styles.personText}>{balance.whoIsOwed.split('@')[0]}</Text>
          <Text style={styles.amountText}>${balance.amount.toFixed(2)}</Text>
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 8 },
  centerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  settledText: { fontSize: 18, marginLeft: 10, color: 'green' },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  personText: {
    fontSize: 16,
    flex: 2,
    textAlign: 'center'
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1.5,
    textAlign: 'right'
  },
});

export default BalanceSummary;