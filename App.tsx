import { StyleSheet, Text, View } from 'react-native';

import { ApolloProvider } from '@apollo/client';
import { StatusBar } from 'expo-status-bar';
import { UploadComponent } from './src/ImagePickerFunc';
import { useApollo } from './src/apollo.client';

export default function App() {
  const client = useApollo();

  return (
    <ApolloProvider client={client}>
      <UploadComponent />
      <View style={styles.container}>
        <Text>Open up App.tsx to start working on your app!</Text>
        <StatusBar style="auto" />
      </View>
    </ApolloProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
