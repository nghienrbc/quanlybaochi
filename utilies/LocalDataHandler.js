import AsyncStorage from "@react-native-async-storage/async-storage";
  const setStringValue = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value)
    } catch(e) {
      // save error
    }
  
    console.log('Done.')
  }
  const setObjectValue = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('key', jsonValue)
    } catch(e) {
      // save error
    }
  
    console.log('Done.')
  }

  const getMyStringValue = async (key) => {
    try {
      return await AsyncStorage.getItem(key)
    } catch(e) {
      // read error
    } 
    console.log('Done.')
  }
  const getMyObject = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(key)
      return jsonValue != null ? JSON.parse(jsonValue) : null
    } catch(e) {
      // read error
    } 
    console.log('Done.')
  } 
  export {
    setStringValue, setObjectValue, getMyStringValue, getMyObject
  }

