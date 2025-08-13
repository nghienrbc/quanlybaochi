import React from 'react';
import { Text, View, Image,} from 'react-native';
import { colors } from "../constants";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
const DropdownSingleSelect = (props) => {
 const {
    items,
    displayKey,
    selectText,
    onSelectedItemsChange,
    selectedItems,
    IconRenderer,
    filterItems,
    disabled,
    iconKey,
    noResultsComponent,
 } = props;
  return (
    <>
      <SectionedMultiSelect
        items={items}
        IconRenderer={IconRenderer}
        uniqueKey="id"
        multiline={true}
        displayKey={displayKey}
        selectText={selectText}
        single={true}
        hideSearch={false}
        onSelectedItemsChange={onSelectedItemsChange}
        selectedItems={selectedItems}
        selectedText="Đã chọn"
        searchPlaceholderText="Tìm kiếm"
        confirmText="Xác nhận chọn"
        selectLabelNumberOfLines={2}
        showCancelButton={true}
        modalWithTouchable={true}
        disabled={disabled}
        iconKey={iconKey}
        styles={{
        cancelButton: {
            backgroundColor: colors.cancel,
        },
        button: {
            backgroundColor: '#3479C8',// màu confirm button
            padding: 10,
        },
        }}
        filterItems={filterItems}
        noResultsComponent={
        <View style={{
            marginTop: 30,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Image style={{ height: 100, width: 100 }}
            resizeMode="cover"
            source={require("../assets/images/nothingFound.png")} />
            <Text style={{
            color: 'black',
            fontWeight: 'bold',
            fontSize: 16
            }}>Không tìm thấy kết quả phù hợp
            </Text>
            <Text style={{
            color: '#858181',
            fontSize: 16
            }}>Bạn thử tìm từ khóa khác nhé.
            </Text>
        </View>}
        noItemsComponent={noResultsComponent}
    />
    </>
  );
};

export default DropdownSingleSelect;
