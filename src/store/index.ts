import { atom } from "jotai";

export const userAtom = atom({
  _id: '',
  name: '',
  email: '',
  phoneNumber: '',
  country: '',
});

export const isLoggedInAtom = atom(false);
export const currentLocationAtom = atom({
  latitude: 0,
  longitude: 0,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
});