import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';

import RNPickerSelect from 'react-native-picker-select';

const placeholder = {
  label: 'Select a table',
  value: null,
  color: '#9EA0A4',
};

export default function Top({ tables, onValueChange, value, selctQuestion }) {    

    return (
    <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', borderBottomColor:"gray", borderBottomWidth:0.5}}>
    <View style={{flexDirection: "column", flexWrap: 'wrap', width: '80%',  float:'left'}}>
     <RNPickerSelect
         placeholder={placeholder}
         items={tables}
         onValueChange={ onValueChange }/*
         onUpArrow={() => {
             this.inputRefs.firstTextInput.focus();
         }}
         onDownArrow={() => {
             this.inputRefs.favSport1.togglePicker();
         }} */
         style={pickerSelectStyles}
         value={value}
       //  ref={(el) => {
         //   this.inputRefs.favSport0 = el;
       // }}
     />    
   </View>
   <View style={{flexDirection: "column", flexWrap: 'wrap', width: '20%', float:'right'}}>
   <TouchableOpacity 
     activeOpacity = {0.9}
     onPress={() => {selctQuestion}} // insertComment
     >      
     <Icon name={'question'} size={30} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
     </TouchableOpacity>
   </View>
  </View>
    )

}



const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    width:200,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: 'red',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
      fontSize: 15,
      width:170,
      height:40,
      paddingHorizontal: 10,
      paddingVertical: 1,
      borderWidth: 0.5,
      borderColor: 'red',
      borderRadius: 8,
      color: 'black',
      paddingRight: 30, // to ensure the text is never behind the icon
  },
});