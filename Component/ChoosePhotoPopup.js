//import liraries
import React, { Component } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import { colors } from "../constants";

const DEVICEHEIGHT = Dimensions.get("window").height
// create a component
class ChoosePhotoPopup extends Component {
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
            <View>
                <Text style={{ color: '#182E44', fontSize: 16, fontWeight: 'bold', margin: 12,alignSelf:'center'}}>{title}</Text>
            </View>
        )
    }
    renderContent = (onTouchCameraButton, onTouchLibraryButton) => { 
        return (
            <View>                 
                <View style={{
                    justifyContent: 'space-between',
                    paddingHorizontal: 8, paddingVertical: 8,
                }}>
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.newprimary }]}
                        onPress={() => {
                            onTouchLibraryButton()
                            //this.setState({reasonString:''})
                        }}
                    >
                        <Text style={{ fontSize: 14, color: 'white',fontWeight:'bold'}}>
                            Chọn ảnh từ bộ sưu tập ảnh
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.touchOpacity, { backgroundColor: colors.newprimary,marginTop:10 }]}
                        onPress={() => onTouchCameraButton()}
                    >
                        <Text style={{ fontSize: 14, color: 'white',fontWeight:'bold'}}>
                            Chụp hình
                        </Text>
                    </TouchableOpacity >
                </View>
            </View>
        )
    }

    render() {
        let { show } = this.state
        const { onTouchOutside, title, onTouchCameraButton, onTouchLibraryButton} = this.props
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
                    {this.renderContent(onTouchCameraButton, onTouchLibraryButton)} 
                    </View>
                </View>

            </Modal>
        );
    }
}

const styles = StyleSheet.create({
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

export default ChoosePhotoPopup;
