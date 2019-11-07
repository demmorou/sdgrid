import {StyleSheet, Platform, StatusBar} from 'react-native';
import colors from './colors';

const styles = StyleSheet.create({
    viewInput: {
        borderRadius: 3,
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: "center", 
        marginTop: 20,
        padding: 3,
        borderTopWidth: 0,
        borderStartWidth: 0,
        borderEndWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: colors.black,
        backgroundColor: '#f0f0f0',
        fontSize: 16
    },
    
    input: {
        width: '95%',
        height: 49,
        paddingStart: 13,
        backgroundColor: '#f0f0f0',
        marginBottom: 3,
        fontSize: 18
      },
      
    button: {
        width: '80%',
        height: 49,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        backgroundColor: colors.blue,
        marginTop: 20,
    },

    button_desconectar: {
        width: '80%',
        height: 49,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        backgroundColor: colors.red,
        marginTop: 20,
    },

    text: {
        fontSize: 18,
        color: colors.white,
      },

});

export default styles;