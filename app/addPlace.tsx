import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from '@rneui/themed';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../src/api/firebase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

// --- IMPORTANT: PASTE YOUR GOOGLE PLACES API KEY HERE ---
const GOOGLE_PLACES_API_KEY = 'AIzaSyCjqTW4rFmpbflfTwqZHQ1L5c4Ichx6Iw4'; 

// TypeScript interfaces for the data we get from Google Places API
interface PlaceDetails {
    name: string;
    formatted_address: string;
    geometry: {
        location: {
            lat: number;
            lng: number;
        };
    };
}

export default function AddPlaceScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const router = useRouter();

  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Function to handle image selection from the device's library
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, // Compress image for faster uploads
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Function to handle date confirmation from the date picker modal
  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    setDatePickerVisibility(false);
  };

  // Main function to add the place to Firestore
  const handleAddPlace = async () => {
    if (!tripId) {
        Alert.alert('Error', 'Trip ID is missing. Cannot add place.');
        return;
    }
    if (!selectedPlace) {
      Alert.alert('Validation Error', 'Please select a place from the search results before adding.');
      return;
    }
    
    setIsUploading(true);
    try {
      // Step 1: Add the document to Firestore with data from Google Places
      const docRef = await addDoc(collection(db, `trips/${tripId}/places`), {
        name: selectedPlace.name,
        address: selectedPlace.formatted_address,
        latitude: selectedPlace.geometry.location.lat,
        longitude: selectedPlace.geometry.location.lng,
        addedBy: auth.currentUser?.email,
        dateTime: selectedDate ? selectedDate.toISOString() : null,
        imageUrl: null, // Initial placeholder for the image URL
      });

      // Step 2: If an image was chosen, upload it to Firebase Storage
      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        const imageRef = ref(getStorage(), `tripImages/${tripId}/${docRef.id}`);
        
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);

        // Step 3: Update the Firestore document with the final image URL
        await updateDoc(doc(db, `trips/${tripId}/places`, docRef.id), { imageUrl: downloadURL });
      }

      // Navigate back to the previous screen (trip details)
      router.back();

    } catch (error) {
      console.error("Error adding place:", error);
      Alert.alert('Upload Failed', 'Could not add the new place. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
    >
        {/* Use ScrollView to ensure content doesn't get hidden by the keyboard */}
        <ScrollView style={styles.container} keyboardShouldPersistTaps='handled'>
            <Text style={styles.label}>Search for a Place:</Text>
            <GooglePlacesAutocomplete
                placeholder='Search for restaurants, museums, landmarks...'
                onPress={(data, details: PlaceDetails | null = null) => {
                    if (details) {
                        setSelectedPlace(details);
                    }
                }}
                query={{
                    key: GOOGLE_PLACES_API_KEY,
                    language: 'en',
                }}
                fetchDetails={true} // This is crucial to get full place details
                styles={{
                    textInput: styles.textInput,
                    container: styles.autocompleteContainer,
                    listView: styles.listView,
                }}
            />
            
            <View style={styles.pickerContainer}>
                <Text style={styles.pickerText}>{selectedDate ? selectedDate.toLocaleString() : 'No date & time selected'}</Text>
                <Button title="Schedule Date & Time" onPress={() => setDatePickerVisibility(true)} />
            </View>
            <DateTimePickerModal 
                isVisible={isDatePickerVisible} 
                mode="datetime" 
                onConfirm={handleConfirmDate} 
                onCancel={() => setDatePickerVisibility(false)} 
            />
            
            <View style={styles.pickerContainer}>
                <Button title="Pick a Custom Image" onPress={pickImage} />
                {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
            </View>
            
            <Button 
                title="Add Place to Trip" 
                onPress={handleAddPlace} 
                containerStyle={{marginTop: 20, marginBottom: 40}} 
                loading={isUploading}
                disabled={!selectedPlace} // Button is disabled until a place is chosen
            />
        </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16 
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#555', 
    marginBottom: 5,
    marginLeft: 5,
  },
  autocompleteContainer: {
    marginBottom: 20,
    zIndex: 1, // Ensure dropdown appears over other content
  },
  textInput: {
    height: 44,
    color: '#5d5d5d',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  listView: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: 'white'
  },
  pickerContainer: { 
    alignItems: 'center', 
    marginVertical: 10, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 10, 
    borderRadius: 5 
  },
  pickerText: { 
    marginBottom: 10, 
    textAlign: 'center', 
    fontSize: 16 
  },
  imagePreview: { 
    width: 200, 
    height: 150, 
    marginTop: 10, 
    borderRadius: 5 
  }
});