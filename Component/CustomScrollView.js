import React from 'react';
import { ScrollView, TextInput } from 'react-native';

const CustomScrollView = (props) => {
  const {
    value,
    onChangeText,
    placeholder,
    editable,
    style
  } = props;

  return (
    <ScrollView
      horizontal={true}
      alwaysBounceHorizontal={false}
      contentContainerStyle={{
        width: '100%',
        height: "auto",
        maxHeight: 300,
        borderRadius: 15,
        paddingVertical: 5,
      }}
    >
      <ScrollView
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        contentContainerStyle={{
          width: '100%',
          height: "auto",
          borderRadius: 15,
        }}
      >
        <TextInput
          scrollEnabled={true}
          style ={style}
          multiline={true}
          onChangeText={onChangeText}
          value={value}
          placeholder={placeholder}
          underlineColorAndroid='transparent'
          editable={editable}
        />
      </ScrollView>
    </ScrollView>
  );
};
export default CustomScrollView;
