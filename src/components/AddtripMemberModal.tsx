import React, { useState } from 'react';
import { Modal, View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Input, Button, Text, ListItem } from '@rneui/themed';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../api/firebase';

interface AddTripMemberModalProps {
  visible: boolean;
  onClose: () => void;
  tripId: string;
  currentMembers: string[];
}

const AddTripMemberModal: React.FC<AddTripMemberModalProps> = ({ visible, onClose, tripId, currentMembers }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddMember = async () => {
    if (email.trim() === '') {
      setError('Email cannot be empty.');
      return;
    }
    // Simple email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
    }
    if (currentMembers.includes(email.toLowerCase())) {
        setError('This user is already a member of the trip.');
        return;
    }

    setLoading(true);
    setError('');
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        members: arrayUnion(email.toLowerCase()),
      });
      setEmail(''); // Clear input on success
      Alert.alert('Success', `${email} has been added to the trip.`);
    } catch (err) {
      setError('Failed to add member. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text h4 style={styles.modalTitle}>Manage Members</Text>
          
          <Text style={styles.listHeader}>Current Members:</Text>
          {currentMembers.map((member, index) => (
             <ListItem key={index} bottomDivider containerStyle={styles.listItem}>
                <ListItem.Content>
                    <ListItem.Title>{member}</ListItem.Title>
                </ListItem.Content>
             </ListItem>
          ))}

          <Input
            placeholder="new.member@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            containerStyle={{ marginTop: 20 }}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <Button title="Add Member" onPress={handleAddMember} />
          )}

          <Button type="clear" title="Close" onPress={onClose} containerStyle={{ marginTop: 10 }}/>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    marginBottom: 15,
  },
  listHeader: {
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 5,
  },
  listItem: {
    width: '100%',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default AddTripMemberModal;