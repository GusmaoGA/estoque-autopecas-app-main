import { StyleSheet } from 'react-native';
export const style = StyleSheet.create({

    caixaPadrao:{
        
        backgroundColor:'#fff',
        padding:8,
        borderRadius:8, 
        marginTop:6,
    },

    pickerWrap:{
    backgroundColor: '#fff',
    borderRadius: 8, 
    marginTop: 6, 
    borderWidth: Platform.OS === 'android' ? 1 : 0, 
    borderColor: '#ffd000ff'
    }

})
