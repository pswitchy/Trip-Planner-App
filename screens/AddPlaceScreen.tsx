import React, { useState } from 'react';
import { View, StyleSheet, Alert, Platform, Text } from 'react-native';
import { Input, Button } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../src/api/firebase';
import DateTimePickerModal from "react-native-modal-datetime-picker";

const AddPlaceScreen = ({ route, navigation }: any) => {
  const { tripId } = route.params;
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // --- NEW STATE FOR DATE PICKER ---
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = (date: Date) => {
    setSelectedDate(date);
    hideDatePicker();
  };
  // --- END NEW STATE ---

  const pickImage = async () => {
        // Ask for permission
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5, // Compress image
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

  const handleAddPlace = async () => {
    if (!name || !latitude || !longitude) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    setIsUploading(true);
    try {
      const docRef = await addDoc(collection(db, `trips/${tripId}/places`), {
                name,
                address,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                addedBy: auth.currentUser?.email,
                dateTime: selectedDate ? selectedDate.toISOString() : null,
                imageUrl: null, // Placeholder
            });

            // Step 2: If an image was selected, upload it
            if (imageUri) {
                const storage = getStorage();
                const response = await fetch(imageUri);
                const blob = await response.blob();
                const imageRef = ref(storage, `tripImages/${tripId}/${docRef.id}`);

                await uploadBytes(imageRef, blob);

                const downloadURL = await getDownloadURL(imageRef);

                // Step 3: Update the document with the image URL
                await updateDoc(doc(db, `trips/${tripId}/places`, docRef.id), {
                    imageUrl: downloadURL
                });
            }

            navigation.goBack();
        } catch (error) {
            console.error("Error adding place:", error);
            Alert.alert('Error', 'Could not add place.');
        } finally {
            setIsUploading(false); // Stop loading
        }
    };


  return (
    <View style={styles.container}>
      <Input placeholder="Place Name" value={name} onChangeText={setName} />
      <Input placeholder="Address" value={address} onChangeText={setAddress} />
      <Input placeholder="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numeric" />
      <Input placeholder="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numeric" />

      {/* --- NEW UI FOR DATE PICKER --- */}
      <View style={styles.datePickerContainer}>
          <Text style={styles.dateText}>
            {selectedDate ? selectedDate.toLocaleString() : 'No date/time selected'}
          </Text>
          <Button title="Select Date & Time" onPress={showDatePicker} />
      </View>
      
      {/* --- NEW UI FOR IMAGE PICKER --- */}
            <View style={styles.imagePickerContainer}>
                <Button title="Pick an image" onPress={pickImage} />
                {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
            </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
      />
      {/* --- END NEW UI --- */}

      <Button title="Add Place" onPress={handleAddPlace} containerStyle={{marginTop: 20}} loading={isUploading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  datePickerContainer: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  dateText: {
    marginBottom: 10,
    textAlign: 'center',
    fontSize: 16
  },
   imagePickerContainer: { alignItems: 'center', marginVertical: 10 },
    imagePreview: { width: 200, height: 150, marginTop: 10, borderRadius: 5 }
});

export default AddPlaceScreen;