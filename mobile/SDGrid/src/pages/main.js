import React from 'react';
import { View, Button, Alert, Text, TextInput, TouchableOpacity  } from 'react-native';
import io from 'socket.io-client';
import styles from '../config/styles';

class Main extends React.Component {

    navigationOptions = {
        title: 'Home',
    }

    state = {
        ip: '',
        port: '',
    }

    connect = () => {
        const socket = io(`http://${this.state.ip}:${this.state.port}`);
        Alert.alert('socket.id');
    }

    render(){
        return(
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

                <View style={styles.viewInput}>
                    <TextInput autoCapitalize='none' onChangeText={(ip)=>{this.setState({ip:ip})}} keyboardType='numeric' style={styles.input} placeholder="IP" />
                </View>

                <View style={styles.viewInput}>
                    <TextInput autoCapitalize='none' onChangeText={(port)=>{this.setState({port:port})}} keyboardType='numeric' style={styles.input} placeholder="Porta" />
                </View>

                <View style={{ alignItems: 'center', justifyContent: "center", width: '50%', marginTop: 25 }}>
                    <TouchableOpacity style={styles.button} activeOpacity={0.6} onPress={()=>{this.connect()}}>
                        <Text style={styles.text}>CONECTAR</Text>
                    </TouchableOpacity>
                </View>

        </View>
        );
    }
}

export default Main;