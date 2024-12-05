import firestore from '@react-native-firebase/firestore';

export const sendMessage = async (chatId: string, message: string, userId: string) => {
  try {
    await firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .add({
        message,
        userId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const subscribeToMessages = (chatId: string, callback: (messages: any) => void) => {
  return firestore()
    .collection('chats')
    .doc(chatId)
    .collection('messages')
    .orderBy('createdAt', 'asc')
    .onSnapshot(snapshot => {
      const messages = snapshot.docs.map(doc => doc.data());
      callback(messages);
    });
};