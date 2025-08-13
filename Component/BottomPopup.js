//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { colors, COLORS, FONTS } from "../constants";

const DEVICEHEIGHT = Dimensions.get("window").height
// create a component
class BottomPopup extends Component {
    constructor(props){
        super(props)
        this.state = {
            show:false,
            reasonString:''
        }
    }  

    showPopup = () => {
        this.setState({show : true})
    }
    closePopup = () => {
        this.setState({show : false})
    }
    renderTitle = (title) => { 
        return (
            <View style={{alignItems:'center'}}>
                <Text style={{ color: '#F22424', fontSize: 18, fontWeight: 'bold',marginVertical:6,textDecorationLine:'underline'}}>
                    {title}
                </Text>
                <Text style={{color:'black',...FONTS.h3,fontWeight: 'bold'}}>(Thao tác này không thể hoàn tác)</Text>
            </View>
        )
    }
    renderContent = (onTouchOKButton, onTouchCancelButton) => { 
        return (
            <View>
                <TextInput
                    style={[styles.input, { height: 100, borderWidth: 1, borderBottomWidth: 1 }]}
                    onChangeText={(value) => this.setState({reasonString:(value)})}
                    multiline={true}
                    value={this.state.reasonString}
                    placeholder="Lý do hủy làm việc"
                    underlineColorAndroid='transparent'
                    placeholderTextColor={'#20202088'}
                    editable={true}
                />  
                <View style={{
                    flexDirection: 'row', justifyContent: 'space-between',
                    paddingHorizontal: 10, paddingBottom: 10,
                }}>
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.cancel }]}
                        onPress={() => onTouchOKButton()}
                    >
                        <Text style={{ fontSize: 16, color: 'white',fontWeight:'bold' }}>
                            Đồng ý
                        </Text>
                    </TouchableOpacity >
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.waitConfirm }]}
                        onPress={() => {
                            onTouchCancelButton()
                            //this.setState({reasonString:''})
                        }}
                    >
                        <Text style={{ fontSize: 16, color: 'white',fontWeight:'bold' }}>
                            Không hủy
                        </Text>
                    </TouchableOpacity >

                </View>
            </View>
        )
    }

    render() {
        let { show } = this.state
        const { onTouchOutside, title, onTouchOKButton, onTouchCancelButton} = this.props
        return (
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={show}
                onRequestClose={this.close}
            >
                <View style={{ flex: 1, backgroundColor: '#000000AA', justifyContent: 'flex-end' }}>
                    <Pressable
                        onPress={() => {
                           onTouchOutside() 
                        }}
                        style={{ flex: 1 }}> 
                    </Pressable>
                    <View style={{
                        backgroundColor: '#FFFFFF', width: '100%',
                        borderTopRightRadius: 10, borderTopLeftRadius: 10,
                        paddingHorizontal: 10,
                        maxHeight: DEVICEHEIGHT * 0.4
                    }}>
                    {this.renderTitle(title)} 
                    {this.renderContent(onTouchOKButton, onTouchCancelButton)} 
                    </View>
                </View>

            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    input: {
        height: 100,
        maxHeight:200,
        width: '100%', 
        borderColor: COLORS.gray,
        borderWidth: 1,
        padding: 10,
        borderRadius: 10, 
        fontSize:16,
        color: '#757575',
        marginVertical:10,
        textAlignVertical:'top'
    },
    touchOpacity:{
        backgroundColor: colors.newprimary,
        borderRadius: 10,
        alignContent: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,  
        flexDirection: 'row'
      },
});

export default BottomPopup;
