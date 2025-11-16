import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { ListItem, Button, Input } from '@rneui/themed';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../src/api/firebase';
import { Trip } from '../src/types';

const HomeScreen = ({ navigation }: any) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [newTripName, setNewTripName] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'trips'), where('members', 'array-contains', user.email));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tripsData: Trip[] = [];
        querySnapshot.forEach((doc) => {
          tripsData.push({ id: doc.id, ...doc.data() } as Trip);
        });
        setTrips(tripsData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleCreateTrip = async () => {
    if (newTripName.trim() === '' || !user) return;
    try {
      await addDoc(collection(db, 'trips'), {
        name: newTripName,
        ownerId: user.uid,
        members: [user.email],
      });
      setNewTripName('');
    } catch (error) {
      Alert.alert('Error', 'Could not create trip.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Input placeholder="New Trip Name" value={newTripName} onChangeText={setNewTripName} />
        <Button title="Create Trip" onPress={handleCreateTrip} />
      </View>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ListItem bottomDivider onPress={() => navigation.navigate('TripDetail', { tripId: item.id })}>
            <ListItem.Content>
              <ListItem.Title>{item.name}</ListItem.Title>
            </ListItem.Content>
            <ListItem.Chevron />
          </ListItem>
        )}
      />
       <Button title="Logout" onPress={() => auth.signOut()} buttonStyle={{backgroundColor: 'red', margin: 10}} />
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    inputContainer: { padding: 16, borderBottomWidth: 1, borderColor: '#ddd' },
});

export default HomeScreen;