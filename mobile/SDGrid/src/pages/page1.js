import React from 'react';
import { View, Button, Alert, Text, TextInput, TouchableOpacity  } from 'react-native';
import styles from '../config/styles';

class Page1 extends React.Component{

    state = {
        socket: null,
    }


    memory = () => {
    
        DeviceInfo.getTotalMemory().then(totalMemory => {
            // 1995018240
        });
        
        DeviceInfo.getUsedMemory().then(usedMemory => {
            // 23452345
        });

    }
    
    desconnect = () => {
        const { navigation } = this.props
        const socket = navigation.getParam('socket', 'null')
        socket.disconnect()
        this.props.navigation.goBack(null)
    }

    render(){
    
        return(
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <View style={{ alignItems: 'center', justifyContent: "center", width: '100%', marginTop: 25 }}>
                    <TouchableOpacity style={styles.button_desconectar} activeOpacity={0.6} onPress={()=>{this.desconnect()}}>
                        <Text style={styles.text}>DESCONECTAR</Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }
}

export default Page1;