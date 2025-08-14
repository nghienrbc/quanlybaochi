// Background message handler cho React Native Firebase
import messaging from '@react-native-firebase/messaging';

// Đăng ký background message handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('🔔 Background message received:', remoteMessage);
  // Xử lý notification khi app ở background/killed
  // Không thể hiển thị alert ở background, chỉ log
});

console.log('🔥 Background message handler đã được đăng ký');
