import React from 'react';
import { Card, Text } from '@rneui/themed';
import { Place } from '../types';

interface PlaceCardProps {
  place: Place;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  
  // --- NEW: Helper to format time ---
  const getFormattedTime = () => {
    if (!place.dateTime) return null;
    const date = new Date(place.dateTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <Card.Title>{place.name}</Card.Title>
      {/* --- NEW: Conditionally render the image view (for next feature) --- */}
      {place.imageUrl && <Card.Image source={{ uri: place.imageUrl }} style={{ marginBottom: 10 }} />}
      <Card.Divider />
      {/* --- NEW: Display the formatted time --- */}
      {place.dateTime && <Text style={{fontWeight: 'bold', marginBottom: 5}}>{getFormattedTime()}</Text>}
      <Text>{place.address}</Text>
      <Text style={{color: 'gray', marginTop: 5}}>Added by: {place.addedBy}</Text>
    </Card>
  );
};

export default PlaceCard;