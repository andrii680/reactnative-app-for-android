import React, { createContext, useContext, useState } from 'react';

// Define the shape of the context
interface AuthContextType {
  phoneNumber: string;
  setPhoneNumber: (number: string) => void;
  countryPhoneCode: string;
  setCountryPhonecode: (code: string) => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [countryPhoneCode, setCountryPhonecode] = useState<string>('');

  return (
    <AuthContext.Provider value={{ phoneNumber, setPhoneNumber, countryPhoneCode, setCountryPhonecode }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
