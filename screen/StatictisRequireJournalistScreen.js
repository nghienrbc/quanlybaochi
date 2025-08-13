import React, { useRef, useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    ScrollView,
    Animated,
    FlatList,
    SafeAreaView,
} from 'react-native';

import {
    VictoryPie, VictoryAxis, VictoryBar, VictoryChart, VictoryGroup, VictoryLabel
} from 'victory-native';
import { Svg } from 'react-native-svg';
import { COLORS, FONTS, SIZES, colors } from '../constants'
import { statictis as statictisRepo, institute as instituteRepo } from "../repositories"

import { getMyStringValue } from "../utilies/LocalDataHandler"
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from 'react-native-date-picker'
import { convertDateTimeToDateString } from "../utilies/DateTime"
import Icon1 from 'react-native-vector-icons/MaterialIcons'
import Export from 'react-native-vector-icons/FontAwesome5'
import SectionedMultiSelect from 'react-native-sectioned-multi-select';

import { CallCustomAlert } from "../utilies";
import { ExportToExcel } from "../utilies"
import AppLoader from '../utilies/AppLoader';

function StatictisRequireJournalistScreen(props) {

    const { navigation, route } = props
    //functions of navigate to/back
    const { navigate, goBack } = navigation
    //data
    const confirmStatus = "CONFIRM"
    const pendingStatus = "PENDING"

    ///////////////// ASYGN STORAGE ///////////////////////
    const [showLoading, setShowLoading] = useState(false)
    const [tokenString, setTokenString] = useState('')
    const [userID, setUserID] = useState('')
    const [userTypeID, setUserTypeID] = useState('')
    const [instituteID, setInstituteID] = useState('')

    const [fromDate, setFromDate] = useState(null)
    const [toDate, setToDate] = useState(null)
    const [openToDate, setOpenToDate] = useState(false)
    const [openFromDate, setOpenFromDate] = useState(false)
    const [fromDateString, setFromDateString] = useState('')
    const [toDateString, setToDateString] = useState('')
 
    const [isJournalist, setIsJournalist] = useState(false)
    const [statictisTotal, setStatictisTotal] = useState([])
    const [statictisPressAgency, setStatictisPressAgency] = useState([])

    const categoryListHeightAnimationValue = useRef(new Animated.Value(115)).current;

    const [categories, setCategories] = useState([]);
    const [viewMode, setViewMode] = useState("chart");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showMoreToggle, setShowMoreToggle] = useState(false)

    const [institute, setInstitute] = useState([])
    const [jounalists, setJounalists] = useState([])
    const [selectedPressAgencyItems, setSelectedPressAgencyItems] = useState([])
    const [selectedJournalistItems, setSelectedJournalistItems] = useState([])
    const [searchText, setSearchText] = useState('');

    const [isFirstShowChart, setIsFirstShowChart] = useState(true)
    const [pressAgencyData, setPressAgencyData] = useState(null)

    getMyStringValue("userTypeID").then((value) => {
        const data = value;
        setUserTypeID(data)
        setIsJournalist(data == 7)
    })
    getMyStringValue("userID").then((value) => {
        const data = value;
        setUserID(data)
    })
    getMyStringValue("instituteID").then((value) => {
        const data = value;
        setInstituteID(data)
        getMyStringValue("token").then((value) => {
            const data = value;
            setTokenString(data)
        })
    })

    console.log('instituteID: ' + instituteID)
    const handleSearchTextChange = (text) => {
        setSearchText(text);
    };

    ////////////////// GET VALUE FROM NAVIGATION ////////////
    useEffect(() => {
        let statictisName = 'Thống kê đề nghị cung cấp thông tin'
        navigation.setOptions(
            {
                headerShown: true,
                headerTitle: statictisName,
                headerTitleStyle: { fontSize: 17, fontWeight: 'bold' },
                headerTitleAlign: 'center',
                headerStyle: {
                    backgroundColor: colors.newprimary
                },
                headerTintColor: 'white'

            })
    }, [])

    ///////////////// LẤY DỮ LIỆU BAN ĐẦU /////////////////////////////
    useEffect(() => {
        if (tokenString != '') {
            var curentDate = new Date()
            setToDate(new Date(curentDate.setMonth(curentDate.getMonth() + 12)))
            setFromDate(new Date(curentDate.setMonth(curentDate.getMonth() - 24)))

            setShowLoading(true)
            instituteRepo.getAllInstitute(tokenString)
                .then(
                    responseInstitute => {
                        setInstitute(responseInstitute)
                        setShowLoading(false)
                    }
                )
                .catch(
                    errorMessage => {
                        setShowLoading(false)
                        if (errorMessage != 'Not found') CallCustomAlert.showAlertWith(string.CANT_CONNECT_SERVER, "error", "OK")
                    }
                )
        }
    }, [tokenString])

    const instituteData = []
    if (institute.length > 0) {
        institute.forEach(element => {
            instituteData.push({
                "item": element.name,
                "label": element.name,
                "value": element.id,
                "id": element.id,
                'name': element.name,
                'parentId': element.parentId,
                'hierarchyLevel': element.hierarchyLevel,
                'address': element.address,
                'maED': element.maED
            })
            element.children && element.children.forEach(childElement1 => {
                instituteData.push({
                    "item": childElement1.name,
                    "label": childElement1.name,
                    "value": childElement1.id,
                    "id": childElement1.id,
                    'name': childElement1.name,
                    'parentId': childElement1.parentId,
                    'hierarchyLevel': childElement1.hierarchyLevel,
                    'address': childElement1.address,
                    'maED': childElement1.maED
                })
                childElement1.children && childElement1.children.forEach(childElement2 => {
                    instituteData.push({
                        "item": childElement2.name + ' - ' + childElement1.name,
                        "label": childElement2.name + ' - ' + childElement1.name,
                        "value": childElement2.id,
                        "id": childElement2.id,
                        'name': childElement2.name + ' - ' + childElement1.name,
                        'parentId': childElement2.parentId,
                        'hierarchyLevel': childElement2.hierarchyLevel,
                        'address': childElement2.address,
                        'maED': childElement2.maED
                    })
                    childElement2.children && childElement2.children.forEach(childElement3 => {
                        instituteData.push({
                            "item": childElement3.name,
                            "label": childElement3.name,
                            "value": childElement3.id,
                            "id": childElement3.id,
                            'name': childElement3.name,
                            'parentId': childElement3.parentId,
                            'hierarchyLevel': childElement3.hierarchyLevel,
                            'address': childElement3.address,
                            'maED': childElement3.maED
                        })
                    })
                })
            })
        })
    }

    const onSelectedItemsChange = (selectedPressAgencyItems) => {
        setSelectedPressAgencyItems(selectedPressAgencyItems)
    };
    const onSelectedJournalistItemsChange = (selectedPressAgencyItems) => {
        setSelectedJournalistItems(selectedPressAgencyItems)
    };

    useEffect(() => {
        if (toDate != null && fromDate != null) {
            setToDateString(convertDateTimeToDateString(toDate));
            setFromDateString(convertDateTimeToDateString(fromDate));
            if (isFirstShowChart == true) {
                setIsFirstShowChart(false)
                onShowChartTotal()
                onShowChartOfPressAgency()
            }
        }
    }, [toDate, fromDate])

    const onShowChartTotal = () => {
        if (!toDate || !fromDate || toDate <= fromDate) {
            CallCustomAlert.showAlertWith("Chọn thời gian thống kê chưa phù hợp", "error", "OK")
            return
        }
        setShowLoading(true)
        statictisRepo.getStatictisRequireFromJournalist(tokenString, new Date(fromDate).getTime(), new Date(toDate).getTime())
            .then(responseStatictis => {
                setStatictisTotal(responseStatictis)
                setShowLoading(false)
            })
            .catch(
                errorMessage => {
                    setShowLoading(false)
                    CallCustomAlert.showAlertWith(errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER, "error", "OK")
                }
            )
    }

    const onShowChartOfPressAgency = () => {
        if (!toDate || !fromDate || toDate <= fromDate) {
            CallCustomAlert.showAlertWith("Chọn thời gian thống kê chưa phù hợp", "error", "OK")
            return
        } 
        setPressAgencyData(null)
        setShowLoading(true)
        statictisRepo.getStatictisRequireWithInstituteFromJournalist(tokenString, new Date(fromDate).getTime(), new Date(toDate).getTime())
            .then(responseStatictis => {
                debugger
                setStatictisPressAgency(responseStatictis)
                setShowLoading(false)
            })
            .catch(
                errorMessage => {
                    setShowLoading(false)
                    CallCustomAlert.showAlertWith(errorMessage == 'Not found' ? string.NOT_FOUND : string.CANT_CONNECT_SERVER, "error", "OK")
                }
            )
    }

    useEffect(() => {
        setCategories(categoriesData)
        categoriesData[0].total = 0
        categoriesData[1].total = 0
        categoriesData[2].total = 0
        setStatictisTotal.length > 0 && statictisTotal.forEach(element => {
            // kiểm tra nếu session đó phóng viên đã join vào thì không đưa vào danh sách nữa  
            //debugger
            categoriesData[0].total += parseInt(element.awaitReply)
            categoriesData[1].total += parseInt(element.replied)
            categoriesData[2].total += parseInt(element.cancelReply)
        })
    }, [statictisTotal])

    let categoriesData = [
        {
            id: 1,
            name: "Chờ phản hồi",
            color: colors.waitConfirm,
            total: 0,
        },
        {
            id: 2,
            name: "Đã phản hồi",
            color: colors.workDone,
            total: 0,
        },
        {
            id: 3,
            name: "Hủy yêu cầu",
            color: colors.cancel,
            total: 0,
        }
    ]
    function processCategoryDataToDisplay() {
        // Filter expenses with "Confirmed" status
        let chartData = categories.map((item) => {
            //debugger
            var total = item.total
            return {
                name: item.name,
                y: total,
                color: item.color,
                id: item.id
            }
        })

        // filter out categories with no data/expenses
        let filterChartData = chartData.filter(a => a.y > 0)

        // Calculate the total expenses
        let totalExpense = filterChartData.reduce((a, b) => a + (b.y || 0), 0)

        // Calculate percentage and repopulate chart data
        let finalChartData = filterChartData.map((item) => {
            let percentage = (item.y / totalExpense * 100).toFixed(0)
            return {
                label: `${percentage}%`,
                y: Number(item.y),
                color: item.color,
                name: item.name,
                id: item.id
            }
        })
        return finalChartData
    }
    function setSelectCategoryByName(name) {
        let category = categories.filter(a => a.name == name)
        setSelectedCategory(category[0])
    }
    function renderChart() {
        let chartData = processCategoryDataToDisplay()
        let colorScales = chartData.map((item) => item.color)
        let totalExpenseCount = chartData.reduce((a, b) => a + (b.y || 0), 0)
        return (
            <View style={{
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'white', marginBottom: 10,
                borderRadius: 20
            }}>
                <Svg width={SIZES.width} height={SIZES.width} style={{ width: "100%", height: "auto" }}>
                    <VictoryPie
                        standalone={false} // Android workaround
                        data={chartData}
                        labels={(datum) => `${datum.y}`}
                        radius={({ datum }) => (selectedCategory && selectedCategory.name == datum.name)
                            ? SIZES.width * 0.4 : SIZES.width * 0.4 - 10}
                        innerRadius={70}
                        labelRadius={({ innerRadius }) => (SIZES.width * 0.4 + innerRadius) / 2.5}
                        style={{
                            labels: { fill: "white" },
                            parent: {
                                ...styles.shadow
                            },
                        }}
                        width={SIZES.width}
                        height={SIZES.width}
                        colorScale={colorScales}
                        events={[{
                            target: "data",
                            eventHandlers: {
                                onPress: () => {
                                    return [{
                                        target: "labels",
                                        mutation: (props) => {
                                            let categoryName = chartData[props.index].name
                                            setSelectCategoryByName(categoryName)
                                        }
                                    }]
                                }
                            }
                        }]}

                    />
                </Svg>
                <View style={{ position: 'absolute' }}>
                    <Text style={{
                        ...FONTS.h1,
                        textAlign: 'center'
                    }}>{totalExpenseCount}</Text>
                    <Text style={{
                        ...FONTS.body3,
                        textAlign: 'center'
                    }}>Đăng ký</Text>
                </View>
            </View>
        )
    }

    function renderExpenseSummary() {
        let data = processCategoryDataToDisplay()
        const renderItem = ({ item }) => {
            return (
                <TouchableOpacity style={{
                    flexDirection: 'row',
                    height: 40,
                    paddingHorizontal: SIZES.radius,
                    borderRadius: 1,
                    backgroundColor: (selectedCategory && selectedCategory.name == item.name)
                        ? item.color : COLORS.white
                }}
                    onPress={() => {
                        let categoryName = item.name
                        setSelectCategoryByName(categoryName)
                    }}
                >

                    {/* Name/Category */}
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                            width: 20,
                            height: 20,
                            backgroundColor: (selectedCategory && selectedCategory.name == item.name)
                                ? COLORS.white : item.color,
                            borderRadius: 5
                        }}>
                        </View>
                        <Text style={{
                            marginLeft: SIZES.base,
                            color: (selectedCategory && selectedCategory.name == item.name)
                                ? COLORS.white : COLORS.primary, ...FONTS.h3
                        }}>{item.name}</Text>
                    </View>
                    {/* Expenses */}
                    <View style={{ justifyContent: 'center' }}>
                        <Text style={{
                            color: (selectedCategory && selectedCategory.name == item.name)
                                ? COLORS.white : COLORS.primary, ...FONTS.h3
                        }}>{item.y}</Text>
                    </View>
                </TouchableOpacity>
            )
        }

        return (
            <ScrollView
                horizontal={true}
                contentContainerStyle={styles.scrollViewContainer}
            >
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={item => `${item.id}`}
                />
            </ScrollView>
        )
    }
    function empty() {
        return (
            <View style={{ marginTop: 20, height: 15, width: '100%', backgroundColor: 'white' }}></View>
        )
    }
    useEffect(() => {
        let repliedArray = []
        let awaitReplyArray = []
        let cancelReplyArray = []
        if (selectedPressAgencyItems.length == 0) {
            statictisPressAgency.length > 0 && statictisPressAgency.forEach(element => {
                repliedArray.push({ 'x': element.tocqnn, 'y': parseInt(element.replied) > 0 ? parseInt(element.replied) : null, 'label': parseInt(element.replied) > 0 ? element.replied : null })
                awaitReplyArray.push({ 'x': element.tocqnn, 'y': parseInt(element.awaitReply) > 0 ? parseInt(element.awaitReply) : null, 'label': parseInt(element.awaitReply) > 0 ? element.awaitReply : null })
                cancelReplyArray.push({ 'x': element.tocqnn, 'y': parseInt(element.cancelReply) > 0 ? parseInt(element.cancelReply) : null, 'label': parseInt(element.cancelReply) > 0 ? element.cancelReply : null })
            })
            statictisPressAgency.length > 0 && setPressAgencyData({ 'replied': repliedArray, 'awaitReply': awaitReplyArray, 'cancelReply': cancelReplyArray })
        }
        else {
            let hasResult = false
            selectedPressAgencyItems.forEach(element1 => {
                statictisPressAgency.length > 0 && statictisPressAgency.forEach(element => {
                    if (element1 == element.idcqnn) {
                        repliedArray.push({ 'x': element.tocqnn, 'y': parseInt(element.replied) > 0 ? parseInt(element.replied) : null, 'label': parseInt(element.replied) > 0 ? element.replied : null })
                        awaitReplyArray.push({ 'x': element.tocqnn, 'y': parseInt(element.awaitReply) > 0 ? parseInt(element.awaitReply) : null, 'label': parseInt(element.awaitReply) > 0 ? element.awaitReply : null })
                        cancelReplyArray.push({ 'x': element.tocqnn, 'y': parseInt(element.cancelReply) > 0 ? parseInt(element.cancelReply) : null, 'label': parseInt(element.cancelReply) > 0 ? element.cancelReply : null })
                        hasResult = true
                    }
                })
            })
            statictisPressAgency.length > 0 && hasResult && setPressAgencyData({ 'replied': repliedArray, 'awaitReply': awaitReplyArray, 'cancelReply': cancelReplyArray })
        }
    }, [statictisPressAgency])

    const StatisticColumn = () => {
        return <View style={{ backgroundColor: 'white' }}>
            <View style={{ flexDirection: 'row', marginHorizontal: 5, marginTop: 5, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ backgroundColor: colors.waitConfirm, width: 10, height: 10, borderRadius: 50, margin: 5 }} />
                <Text style={{ color: 'black', fontSize: 12 }}>Chờ phản hồi</Text>
                <View style={{ backgroundColor: colors.workDone, width: 10, height: 10, borderRadius: 50, margin: 5 }} />
                <Text style={{ color: 'black', fontSize: 12 }}>Đã phản hồi</Text>
                <View style={{ backgroundColor: colors.cancel, width: 10, height: 10, borderRadius: 50, margin: 5 }} />
                <Text style={{ color: 'black', fontSize: 12 }}>Hủy yêu cầu</Text>
            </View>

            <ScrollView horizontal={true}>
                <View style={{ width: pressAgencyData.replied.length * 160 > SIZES.width ? pressAgencyData.replied.length * 160 : SIZES.width - 40, borderRadius: 20 }}>
                    <VictoryChart
                        domainPadding={50}
                        width={pressAgencyData.replied.length * 160 > SIZES.width ? pressAgencyData.replied.length * 160 : SIZES.width - 40}
                        height={300}
                        style={{
                            parent: {
                                backgroundColor: "white",
                                padding: 0
                            },
                        }}
                    >
                        <VictoryAxis
                            tickLabelComponent={<VictoryLabel angle={5} />}
                            style={{
                                axisLabel: { fontSize: 16, fill: "red", padding: 30, x: 0 },
                                ticks: { stroke: "black", size: 5 },
                                tickLabels: { fontSize: 13, padding: 2 },
                                grid: { stroke: "lightgray" },
                            }}
                            tickCount={10}
                        />

                        <VictoryAxis
                            dependentAxis
                            style={{
                                axisLabel: { fontSize: 16, fill: "red", padding: 30 },
                                ticks: { stroke: "black", size: 5 },
                                tickLabels: { fontSize: 12, padding: 5 },
                                grid: { stroke: "lightgray" },
                            }}
                            tickCount={10}
                        />
                        <VictoryGroup
                            offset={pressAgencyData.replied.length > 1 ? 12 : 20}
                            style={{ marginLeft: 0 }}>
                            <VictoryBar data={pressAgencyData.replied}
                                style={{
                                    data: {
                                        fill: colors.workDone,
                                    },
                                }}
                            />
                            <VictoryBar data={pressAgencyData.awaitReply}
                                style={{
                                    data: {
                                        fill: colors.waitConfirm
                                    },
                                }}
                            />
                            <VictoryBar data={pressAgencyData.cancelReply}
                                style={{
                                    data: {
                                        fill: colors.cancel
                                    },
                                }}
                            />

                        </VictoryGroup>
                    </VictoryChart>
                </View>
            </ScrollView>
        </View>
    };

    //Tìm kiếm theo cụm
    const filterItems = (searchText, items, _selectedItems) => {
        const filteredItems = items.filter((item) => {
            const itemName = item.name.toLowerCase();
            const searchTerm = searchText.toLowerCase();
            const hasItemMatch = itemName.includes(searchTerm);
            const hasChildMatch =
                item.children &&
                item.children.some(
                    (child) => child.name.toLowerCase().indexOf(searchTerm) !== -1
                );
            return hasItemMatch || hasChildMatch;
        });

        return filteredItems;
    };

    return (
        <SafeAreaView style={styles.saveAreaViewContainer}>
            {showLoading ? <AppLoader /> : null}
            {fromDate && <DatePicker
                title="Chọn từ ngày"
                confirmText="Chọn"
                cancelText="Hủy"
                modal
                open={openFromDate}
                date={fromDate}
                onConfirm={(date) => {
                    setOpenFromDate(false)
                    setFromDate(date)
                }}
                onCancel={() => {
                    setOpenFromDate(false)
                }}
                mode="date"
                theme="auto"
            />}
            {toDate && <DatePicker
                title="Chọn đến ngày"
                confirmText="Chọn"
                cancelText="Hủy"
                modal
                open={openToDate}
                date={toDate}
                onConfirm={(date) => {
                    setOpenToDate(false)
                    setToDate(date)
                }}
                onCancel={() => {
                    setOpenToDate(false)
                }}
                mode="date"
                theme="auto"
            />}
            <StatusBar backgroundColor="#FFF" barStyle="dark-content" />
         
            <ScrollView contentContainerStyle={{ paddingBottom: 10, backgroundColor: COLORS.background }}>
                <View style={{
                    backgroundColor: 'white', padding: 20,
                    margin: 20, borderRadius: SIZES.radius,
                    ...styles.shadow
                }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={{ ...FONTS.h3, color: '#000', fontWeight: 'bold' }}>
                                Từ ngày: <Text style={{ ...FONTS.h3, color: '#000', }}>
                                    {fromDateString}
                                </Text>
                            </Text>
                        </View>

                        {/* // nếu PV đã join vào 1 session có săn thì không hẹn lại */}
                        <View style={{ justifyContent: 'center', marginEnd: -10 }}>
                            <TouchableOpacity style={[styles.touchOpacity, { margin: 0, marginBottom: 0 }]}
                                onPress={() => { 
                                    setOpenFromDate(true)
                                }
                                }>
                                <Ionicons name='calendar' style={{ color: 'white', fontSize: 20, marginRight: 10 }} />
                                <Text style={{ fontSize: 14, color: 'white', fontWeight: 'bold' }}>
                                    Chọn ngày
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', paddingTop: 15 }}>
                        <View style={{ flex: 1, justifyContent: 'center', }}>
                            <Text style={{ ...FONTS.h3, color: '#000', fontWeight: 'bold' }}>
                                Đến ngày: <Text style={{ ...FONTS.h3, color: '#000' }}>
                                    {toDateString}
                                </Text>
                            </Text>
                        </View>

                        {/* // nếu PV đã join vào 1 session có săn thì không hẹn lại */}
                        <View style={{ justifyContent: 'center', marginEnd: -10 }}>
                            <TouchableOpacity style={[styles.touchOpacity, { margin: 0, marginBottom: 0 }]}
                                onPress={() => { 
                                    setOpenToDate(true)
                                }
                                }>
                                <Ionicons name='calendar' style={{ color: 'white', fontSize: 20, marginRight: 10 }} />
                                <Text style={{ fontSize: 14, color: 'white', fontWeight: 'bold' }}>
                                    Chọn ngày
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={{ padding: 20 }}>
                    <Text style={styles.titleHeader}> Thống kê tổng thể </Text>
                    <TouchableOpacity
                        style={styles.touchOpacity}
                        onPress={() => onShowChartTotal()
                        }>
                        <Ionicons name='pie-chart' style={{ color: 'white', fontSize: 15, marginRight: 10 }} />
                        <Text style={{ fontSize: 13, color: 'white', fontWeight: 'bold' }}> Xem thống kê </Text>
                    </TouchableOpacity>
                    {renderChart()}
                    {renderExpenseSummary()}
                </View>

                {/* {empty()} */}
                <View style={{ padding: 20 }}>
                    <Text style={styles.titleHeader}> Thống kê theo đơn vị gửi yêu cầu </Text>
                    <View style={{
                        width: '100%',
                        backgroundColor: COLORS.white,
                        borderWidth: 1, paddingBottom: 5,
                        borderRadius: SIZES.radius, borderColor: COLORS.gray,
                        paddingHorizontal: 10, marginBottom: 10
                    }}>
                        <SectionedMultiSelect
                            items={instituteData}
                            IconRenderer={Icon1}
                            uniqueKey="id"
                            subKey="children"
                            selectText="Chọn đơn vị cần thống kê"
                            hideSearch={false}
                            onSelectedItemsChange={onSelectedItemsChange}
                            selectedItems={selectedPressAgencyItems}
                            selectedText="Đã chọn"
                            searchPlaceholderText="Tìm kiếm"
                            confirmText="Xác nhận chọn"
                            selectLabelNumberOfLines={2}
                            showCancelButton={true}
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
                    </View>
                      <View style={{ flexDirection: 'row', padding: 3 }}>
                        <TouchableOpacity 
                            style={[styles.touchOpacity, { width: '60%', marginEnd: 5 }]}
                            onPress={() => onShowChartOfPressAgency()
                            }>
                            <Ionicons name='pie-chart' style={{ color: 'white', fontSize: 15, marginRight: 10 }} />
                            <Text style={{ fontSize: 13, color: 'white', fontWeight: 'bold' }}> Xem thống kê </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.touchOpacity, { width: '40%' }]}
                            onPress={() => ExportToExcel.handleExportPress(pressAgencyData, ExportToExcel.ExportTypeEnum.CCTT, ExportToExcel.ExportRoleEnum.NN,'DS_DKLV')
                            }>
                            <Export name='file-export' style={{ color: 'white', fontSize: 15, marginRight: 10 }} />
                            <Text style={{ fontSize: 13, color: 'white', fontWeight: 'bold' }}> Xuất báo cáo</Text>
                        </TouchableOpacity>
                    </View>
                    {pressAgencyData != null ? StatisticColumn() : <Text style={styles.titleNoDataForStatictis}> Không có dữ liệu cho thống kê </Text>}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 10,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    headerTitle: { color: '#000', fontWeight: 'bold', fontSize: 16 },
    saveAreaViewContainer: { flex: 1, backgroundColor: COLORS.background },
    scrollViewContainer: {
        flexGrow: 1,
    },
    titleHeader: {
        ...FONTS.h3,
        fontWeight: 'bold',
        color: colors.newprimary,
        marginBottom: 10
    },
    titleNoDataForStatictis: {
        ...FONTS.h3,
        fontWeight: 'bold',
        marginBottom: 5, alignSelf: 'center'
    },
    touchOpacity: {
        backgroundColor: colors.newprimary,
        borderRadius: 10,
        alignContent: 'center',
        justifyContent: 'center',
        padding: 10,
        flexDirection: 'row',
        marginBottom: 10
    },
});

export default StatictisRequireJournalistScreen;
