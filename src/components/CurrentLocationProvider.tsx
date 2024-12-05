import {useEffect} from 'react';
import {Platform} from 'react-native';
import {PERMISSIONS, request} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import {useAtom} from 'jotai';
import {currentLocationAtom} from '../store';

const CurrentLocationProvider = ({children}) => {
  const [_, setLocation] = useAtom(currentLocationAtom);
  const requestLocationPermission = async () => {
    try {
      const granted = await request(
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      );
      return granted === 'granted';
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const getLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation(position.coords);
      },
      error => {
        console.log(error.code, error.message);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  useEffect(() => {
    requestLocationPermission().then(granted => {
      if (granted) {
        getLocation();
      } else {
        console.log('Location permission denied');
      }
    });
  }, []);

  return children;
};

export default CurrentLocationProvider;
