import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert, Pressable, Text } from 'react-native';
import { ListItem, Button, Input } from '@rneui/themed';
import { collection, addDoc, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../src/api/firebase';
import { Trip } from '../../src/types';
import { Link } from 'expo-router';

export default function MyTripsScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [newTripName, setNewTripName] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    // Only run the query if the user and user.email are available
    if (user && user.email) {
      const q = query(collection(db, 'trips'), where('members', 'array-contains', user.email));
      
      // onSnapshot returns an unsubscribe function
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tripsData: Trip[] = [];
        querySnapshot.forEach((doc) => {
          tripsData.push({ id: doc.id, ...doc.data() } as Trip);
        });
        setTrips(tripsData);
      });

      // Cleanup subscription on component unmount
      return () => unsubscribe();
    }
  }, [user]);

  const handleCreateTrip = async () => {
    if (newTripName.trim() === '' || !user || !user.email) {
      Alert.alert("Invalid Input", "Please enter a name for your trip.");
      return;
    }
    try {
      await addDoc(collection(db, 'trips'), {
        name: newTripName,
        ownerId: user.uid,
        members: [user.email],
      });
      setNewTripName('');
    } catch (error) {
      console.error("Error creating trip: ", error);
      Alert.alert('Error', 'Could not create the trip.');
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
          // Use the Link component to navigate to the dynamic trip detail page
          <Link href={`/trip/${item.id}`} asChild>
            <Pressable key={item.id}>
              <ListItem bottomDivider>
                <ListItem.Content>
                  <ListItem.Title>{item.name}</ListItem.Title>
                </ListItem.Content>
                <ListItem.Chevron />
              </ListItem>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>You have no trips yet. Create one to get started!</Text>}
        contentContainerStyle={styles.flatListContent}  
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  inputContainer: { 
    padding: 16, 
    borderBottomWidth: 1, 
    borderColor: '#ddd' 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray'
  },
  flatListContent: {        
    paddingBottom: 80,
  }
});