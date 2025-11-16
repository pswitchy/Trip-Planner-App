import { View, StyleSheet } from 'react-native';
import { Button, Text } from '@rneui/themed';
import { auth } from '../../src/api/firebase';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text h4>Profile</Text>
            <Text style={styles.emailText}>
                Logged in as: {auth.currentUser?.email}
            </Text>
            <Button 
                title="Logout" 
                onPress={() => auth.signOut()} 
                buttonStyle={styles.logoutButton} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    emailText: {
        fontSize: 16,
        marginVertical: 20,
        color: 'gray',
    },
    logoutButton: {
        backgroundColor: 'red',
        width: 200,
    }
});