// Jest setup for React Native & Expo

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  return {
    MaterialCommunityIcons: (props) => <View {...props} testID={props.testID || 'icon-mock'} />,
    Ionicons: (props) => <View {...props} testID={props.testID || 'icon-mock'} />,
    Feather: (props) => <View {...props} testID={props.testID || 'icon-mock'} />,
  };
});
