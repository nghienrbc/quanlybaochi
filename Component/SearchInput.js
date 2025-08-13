import React from 'react';
import { TextInput, TouchableOpacity } from 'react-native';
import { colors } from "../constants";
import Icon from 'react-native-vector-icons/FontAwesome'

const SearchInput = (props) => {
  const {
    placeholder,
    placeholderTextColor,
    onChangeText,
    value,
  } = props;
  return (
    <>
      <TextInput
        autoCorrect={false}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        onChangeText={onChangeText}
        value={value}
        style={{
          flex: 1,
          height: 40,
          borderRadius: 30,
          paddingStart: 30,
          borderWidth: 1,
          backgroundColor: 'white',
          borderColor: colors.newprimary,
          color: colors.newprimary,
        }}
      />
      <Icon
        name="search"
        size={16}
        color={colors.newprimary}
        style={{
          position: 'absolute',
          left: 12,
        }}
      />
      {value.length > 0 && (
        <TouchableOpacity style={{ backgroundColor: 'red' }}
          onPress={() => onChangeText('')}>
          <Icon
            name="close"
            size={18}
            color={colors.newprimary}
            style={{
              position: 'absolute',
              right: 12,
              top: -10,
            }}
          />
        </TouchableOpacity>
      )}
    </>
  );
};

export default SearchInput;
