import auth from '@react-native-firebase/auth';

export const signInWithPhoneNumber = async (phoneNumber: string) => {
  try {
    const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
    return confirmation; // Return confirmation object for OTP verification
  } catch (error) {
    throw new Error(error.message);
  }
};

export const verifyOTP = async (confirmation: any, otp: string) => {
  try {
    await confirmation.confirm(otp); // Confirm the OTP
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = () => {
  return auth().currentUser;
};