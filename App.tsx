import React from 'react';
import AppNavigator from './src/AppNavigator';
import {StripeProvider} from '@stripe/stripe-react-native';
import CurrentLocationProvider from './src/components/CurrentLocationProvider';
import {registerTranslation, en} from 'react-native-paper-dates';

const App = () => {

  registerTranslation('en', en);
  return (
    <StripeProvider publishableKey="pk_test_51LjXTGDUAnVtYaoEreu5zq1DQ2LC8mSqawQnoBZS9u3xPhF0wBOTJgYqIpSemjzMFWJrtcgSr4G89q9rnqM72Ina00xlYfUt2q">
      <CurrentLocationProvider>
        <AppNavigator />
      </CurrentLocationProvider>
    </StripeProvider>
  );
};
export default App;
