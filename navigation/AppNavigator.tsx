import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../src/api/firebase';
import { registerForPushNotificationsAsync } from '../src/api/notifications';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import TripDetailScreen from '../app/trip/[tripId]';
import AddPlaceScreen from '../screens/AddPlaceScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        registerForPushNotificationsAsync(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{title: "My Trips"}} />
            <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{title: "Trip Details"}} />
            <Stack.Screen name="AddPlace" component={AddPlaceScreen} options={{title: "Add a New Place"}} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{headerShown: false}} />
            <Stack.Screen name="SignUp" component={SignUpScreen} options={{headerShown: false}} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;