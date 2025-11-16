import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, SectionList, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Button } from '@rneui/themed';
import { doc, onSnapshot, collection, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../../src/api/firebase';
import { Trip, Place } from '../../src/types';
import AddTripMemberModal from '../../src/components/AddtripMemberModal';
import PlaceCard from '../../src/components/PlaceCard';
import { Link, useLocalSearchParams, Stack } from 'expo-router';

interface ItinerarySection {
    title: string;
    data: Place[];
}

export default function TripDetailScreen() {
  // --- EXPO ROUTER HOOKS ---
  const { tripId } = useLocalSearchParams<{ tripId: string }>();

  // --- STATE MANAGEMENT ---
  const [tripData, setTripData] = useState<Trip | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!tripId) return; // Don't run effect if tripId is not available yet
    
    // Subscribe to the trip document itself
    const tripUnsubscribe = onSnapshot(doc(db, 'trips', tripId), (doc) => {
      if (doc.exists()) {
        setTripData({ id: doc.id, ...doc.data() } as Trip);
      }
    });

    // Subscribe to the 'places' sub-collection
    const placesUnsubscribe = onSnapshot(collection(db, `trips/${tripId}/places`), (snapshot: QuerySnapshot<DocumentData>) => {
        const placesData: Place[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Place));
        setPlaces(placesData);

        // If there are places, center the map on the first one
        if (placesData.length > 0) {
            setRegion(prevRegion => ({
                ...prevRegion,
                latitude: placesData[0].latitude,
                longitude: placesData[0].longitude,
            }));
        }
    });

    // Cleanup subscriptions on unmount
    return () => {
        tripUnsubscribe();
        placesUnsubscribe();
    };
  }, [tripId]);

  // --- DATA PROCESSING FOR SECTION LIST ---
  const itinerarySections: ItinerarySection[] = useMemo(() => {
    const sortedPlaces = [...places].sort((a, b) => {
      if (!a.dateTime) return 1; // Unscheduled items go to the end
      if (!b.dateTime) return -1;
      return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
    });

    const grouped = sortedPlaces.reduce((acc, place) => {
      const dateKey = place.dateTime ? new Date(place.dateTime).toLocaleDateString([], {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }) : 'Unscheduled';
      (acc[dateKey] = acc[dateKey] || []).push(place);
      return acc;
    }, {} as Record<string, Place[]>);
    
    return Object.keys(grouped).map(dateKey => ({
      title: dateKey,
      data: grouped[dateKey]
    }));
  }, [places]);

  if (!tripId) {
    return <View><Text>Loading trip...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Set the screen's header title dynamically */}
      <Stack.Screen options={{ title: tripData?.name || 'Trip Details' }} />

      {tripData && (
        <AddTripMemberModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          tripId={tripId}
          currentMembers={tripData.members}
        />
      )}

      <MapView style={styles.map} region={region}>
        {places.map(place => (
          <Marker
            key={place.id}
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            title={place.name}
          />
        ))}
      </MapView>
      
      <SectionList
        sections={itinerarySections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlaceCard place={item} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No places added yet. Start planning!</Text>}
      />
      
      <View style={styles.buttonContainer}>
        <Button
          title="Manage Members"
          onPress={() => setModalVisible(true)}
          icon={{ name: 'group', color: 'white' }}
          containerStyle={styles.button}
        />
        {/* Use the Link component for navigation */}
        <Link href={{ pathname: "/addPlace", params: { tripId } }} asChild>
            <Button
              title="Add Place"
              icon={{ name: 'add-location', color: 'white' }}
              containerStyle={styles.button}
            />
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 0.8 },
    list: { flex: 1 },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: '#f0f0f0',
        padding: 10,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'gray',
    },
    buttonContainer: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        padding: 10, 
        backgroundColor: '#f8f8f8' 
    },
    button: { 
        flex: 1, 
        marginHorizontal: 5 
    }
});