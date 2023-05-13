import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  Button,
  TouchableOpacity,
} from 'react-native';
import firebase from '@react-native-firebase/app';
// import 'firebase/database';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

// import firebase config
import { firebaseConfig } from './config';

const TOPIC = 'MyNews';
const BASE_URL =  "https://vomoz.up.railway.app/api/v1"

// // Your web app's Firebase configuration
const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  console.log('Authorization status:', authStatus);

  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
};

const subscribeToTopic = () => {
  messaging()
    .subscribeToTopic(TOPIC)
    .then(() => {
      console.log(`Topic '${TOPIC}' subscribed`);
    });
};

const handleInitialNotification = remoteMessage => {
  if (remoteMessage) {
    console.log(
      'Notification caused app to open from quit state',
      remoteMessage,
    );
    alert('Notification caused app to open from quit state');
  }
};

const handleNotificationOpenedApp = remoteMessage => {
  if (remoteMessage) {
    console.log(
      'Notification caused app to open from background state',
      remoteMessage,
    );
    alert('Notification caused app to open from background state');
  }
};

const handleBackgroundMessage = remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
};

const handleNewMessage = remoteMessage => {
  console.log('A new FCM message arrived!', remoteMessage);
  alert('A new FCM message arrived!');
};

const users = [
  {
    name: 'Jackson Kasi',
    user_id: '530709cf-d57d-47ed-ba9a-79212bc9df87',
  },
  {
    name: 'EmonDas',
    user_id: '9e74e2a1-b4f4-444c-9646-cd8c020eb8d4',
  },
];

const App = () => {
  const [fcmToken, setFcmToken] = useState('');
  // selected user
  const [user, setUser] = useState(users[0]);

  useEffect(() => {
    const initMessaging = async () => {
      if (!firebase.apps.length) {
        await firebase.initializeApp(firebaseConfig);
      }

      const hasPermission = await requestUserPermission();

      if (hasPermission) {
        messaging()
          .getToken()
          .then(fcmToken => {
            console.log('FCM Token:', fcmToken);
            setFcmToken(fcmToken);
          });

        messaging().onNotificationOpenedApp(handleNotificationOpenedApp);

        messaging().setBackgroundMessageHandler(handleBackgroundMessage);

        messaging().onMessage(handleNewMessage);

        messaging().getInitialNotification().then(handleInitialNotification);

        subscribeToTopic();
      } else {
        console.error('No permission to receive notifications');
      }
    };
    initMessaging();
  }, []);

  // handle Change User
  const handleChangeUser = user_id => {
    const newUser = users.find(user => user.user_id === user_id);
    setUser(newUser);
  };

  // handle register token
  const registerToken = async () => {
    try {
      const {data} = await axios.post(`${BASE_URL}/test-store/fcm-token`, {
        user_id: user.user_id,
        token: fcmToken,
      });

      console.log(data);
      console.log(data);
      if (data.success) {
        alert(data.message);
      } else {
        console.warn(data);
      }
    } catch (error) {
      console.log('error');
      console.log(JSON.stringify(error));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.titleText}>
          Send Notification to React Native App
        </Text>
        <Text style={styles.textStyle}>using Firebase Cloud Messaging</Text>

        {/* buttons for select users */}
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.textStyle}>Selected User:</Text>
          <Text style={styles.textStyle}>{user.name}</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={styles.textStyle}>Selected User ID:</Text>
          <Text style={styles.textStyle}>{user.user_id}</Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            marginTop: 20,
            marginBottom: 20,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 20,
          }}>
          {users.map(user => (
            <TouchableOpacity
              key={user.user_id}
              style={styles.button}
              onPress={() => handleChangeUser(user.user_id)}>
              <Text style={styles.buttonText}>{user.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={{
            marginTop: 20,
            marginBottom: 20,
          }}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => registerToken()}>
            <Text style={styles.buttonText}>Register Token</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  textStyle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#2196F3',
    color: 'white',
    padding: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default App;
