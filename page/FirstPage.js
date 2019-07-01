// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Button  } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage'
var db = openDatabase({ name: 'TableDatabase.db' })

export default class FirstPage extends React.Component {

componentWillMount(){
    const navi = this.props.navigation
    setTimeout(function() {
        navi.navigate("TabScreen", {otherParam: "saea2"})
      }, 500);            
     
 
}


  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center'}}>
        <Text>DIY Daily Report</Text>  
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MainContainer_internet :{     
    backgroundColor:"#01579b",
    justifyContent: 'center',
    alignItems: 'center',
    flex:1,
    margin: 0,
    color:"#fff"
    },    
MainContainer :{
  backgroundColor:'#fff', 
  justifyContent: 'center',
  flex:1,
  flexDirection: 'row',
  flexWrap: 'wrap',
  margin: 0
  }, 
TextInputStyleClass: {
  textAlign: 'center',
  marginBottom: 7,
  margin:1,
  height: 40,
  borderWidth: 1,
  borderColor: '#2196F3', 
  borderRadius: 5
  },
Button:{
  backgroundColor: '#01579b', 
  padding: 10, 
  marginBottom:5, 
  width:'100%'} 
 
});