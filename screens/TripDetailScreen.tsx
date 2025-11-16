// import React, { useEffect, useState, useMemo } from 'react';
// import { View, StyleSheet, SectionList, Text } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import { Button } from '@rneui/themed';
// import { doc, onSnapshot, collection, QuerySnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
// import { db } from '../src/api/firebase';
// import { Trip, Place } from '../src/types';
// // import AddTripMemberModal from '../components/AddtripMemberModal'; // FIX: Corrected casing
// // import PlaceCard from '../components/PlaceCard';

// interface ItinerarySection {
//     title: string;
//     data: Place[];
// }

// const TripDetailScreen = ({ route, navigation }: any) => {
//   const { tripId } = route.params;
//   const [tripData, setTripData] = useState<Trip | null>(null);
//   const [places, setPlaces] = useState<Place[]>([]);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [region, setRegion] = useState({
//     latitude: 37.78825,
//     longitude: -122.4324,
//     latitudeDelta: 0.0922,
//     longitudeDelta: 0.0421,
//   });

//   useEffect(() => {
//     const tripUnsubscribe = onSnapshot(doc(db, 'trips', tripId), (doc) => {
//       if (doc.exists()) {
//         setTripData({ id: doc.id, ...doc.data() } as Trip);
//       }
//     });

//     const placesUnsubscribe = onSnapshot(collection(db, `trips/${tripId}/places`), (snapshot: QuerySnapshot<DocumentData>) => {
//         const placesData: Place[] = [];
//         snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
//             placesData.push({ id: doc.id, ...doc.data() } as Place);
//         });
//         setPlaces(placesData);

//         if (placesData.length > 0) {
//             setRegion(prevRegion => ({
//                 ...prevRegion,
//                 latitude: placesData[0].latitude,
//                 longitude: placesData[0].longitude,
//             }));
//         }
//     });

//     return () => {
//         tripUnsubscribe();
//         placesUnsubscribe();
//     };
//   }, [tripId]);

//    // --- NEW: Memoized function to process places into sections ---
//   const itinerarySections: ItinerarySection[] = useMemo(() => {
//     // 1. Sort all places by date
//     const sortedPlaces = [...places].sort((a, b) => {
//       if (!a.dateTime) return 1;
//       if (!b.dateTime) return -1;
//       return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
//     });

//     // 2. Group places by day
//     const grouped = sortedPlaces.reduce((acc, place) => {
//       if (!place.dateTime) {
//         (acc['Unscheduled'] = acc['Unscheduled'] || []).push(place);
//         return acc;
//       }
//       const dateKey = new Date(place.dateTime).toLocaleDateString([], {
//         weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
//       });
//       (acc[dateKey] = acc[dateKey] || []).push(place);
//       return acc;
//     }, {} as Record<string, Place[]>);
    
//     // 3. Format for SectionList
//     return Object.keys(grouped).map(dateKey => ({
//       title: dateKey,
//       data: grouped[dateKey]
//     }));
//   }, [places]);

//   return (
//     <View style={styles.container}>
//       {tripData && (
//         <AddTripMemberModal
//           visible={modalVisible}
//           onClose={() => setModalVisible(false)}
//           tripId={tripId}
//           currentMembers={tripData.members}
//         />
//       )}
//       <MapView style={styles.map} region={region}>
//         {places.map(place => (
//           <Marker
//             key={place.id}
//             coordinate={{ latitude: place.latitude, longitude: place.longitude }}
//             title={place.name}
//           />
//         ))}
//       </MapView>
//       {/* --- NEW: Replace FlatList with SectionList --- */}
//       <SectionList
//         sections={itinerarySections}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => <PlaceCard place={item} />}
//         renderSectionHeader={({ section: { title } }) => (
//           <Text style={styles.sectionHeader}>{title}</Text>
//         )}
//         style={styles.list}
//         ListEmptyComponent={<Text style={styles.emptyText}>No places added yet. Start planning!</Text>}
//       />
      
//       <View style={styles.buttonContainer}>
//         <Button
//           title="Manage Members"
//           onPress={() => setModalVisible(true)}
//           icon={{ name: 'group', color: 'white' }}
//           containerStyle={styles.button}
//         />
//         <Button
//           title="Add Place"
//           onPress={() => navigation.navigate('AddPlace', { tripId })}
//           icon={{ name: 'add-location', color: 'white' }}
//           containerStyle={styles.button}
//         />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1 },
//     map: { flex: 0.8 }, // Adjusted map size
//     list: { flex: 1 },
//     sectionHeader: {
//         fontSize: 18,
//         fontWeight: 'bold',
//         backgroundColor: '#f0f0f0',
//         padding: 10,
//     },
//     emptyText: {
//         textAlign: 'center',
//         marginTop: 20,
//         fontSize: 16,
//         color: 'gray',
//     },
//     buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 10, backgroundColor: '#f8f8f8' },
//     button: { flex: 1, marginHorizontal: 5 }
// });

// export default TripDetailScreen;