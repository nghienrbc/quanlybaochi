import React from 'react';
import { Text, View, Image,} from 'react-native';
import { colors } from "../constants";
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
const DropdownMultiSelect = (props) => {
 const {
    items,
    selectText,
    onSelectedItemsChange,
    selectedItems,
    searchText,
    IconRenderer,
    filterItems,
    onSearchTextChange
 } = props;
  return (
    <>
      <SectionedMultiSelect
        items={items}
        IconRenderer={IconRenderer}
        uniqueKey="id"
        subKey="children"
        readOnlyHeadings={true}
        selectText={selectText}
        showDropDowns={true}
        onSelectedItemsChange={onSelectedItemsChange}
        selectedItems={selectedItems}
        searchPlaceholderText="Tìm kiếm"
        selectedText="Đã chọn"
        confirmText="Xác nhận chọn"
        selectLabelNumberOfLines={2}
        showCancelButton={true}
        searchText={searchText}
        filterItems={filterItems}
        onSearchTextChange={onSearchTextChange}
        styles={{
            chipContainer: { //Container chính của chíp
                backgroundColor: '#F3F3F3',
                borderRadius: 20,
                margin: 5,
                padding: 5,
            },
            chipIcon: {
                color: colors.newprimary,// màu dấu x khi render ra chip
            },
            chipText: {
                color: 'black',// màu name user khi render ra chip
            },
            selectedSubItemText: {
                color: colors.workDone,// màu cho mỗi mục con đã chọn.
            },
            cancelButton: {
                backgroundColor: colors.cancel,
            },
            button: {
                backgroundColor: '#3479C8',// màu confirm button
                padding: 10,
            },
        }}
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
        />
    </>
  );
};

export default DropdownMultiSelect;
