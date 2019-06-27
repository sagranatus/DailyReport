import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';
import {
  createStackNavigator,
  createMaterialTopTabNavigator,
  createAppContainer,
} from 'react-navigation';
import App from './App';
import AddtablePage from './page/AddtablePage';
import RNPickerSelect from 'react-native-picker-select';


//making a StackNavigator to export as default
const Container = createAppContainer(
  createStackNavigator({
    TabScreen: {
      screen: App,
      navigationOptions: {
        header: null
      }  
    },
    AddtableScreen: {
      screen: AddtablePage
    },
    
    
  })
);

export default class AppAll extends React.Component {
  constructor(props) {
    super(props);
  }

  Go(){
    alert("dd")
  }

  render() {	
    return(
    <View style={{flex:1, backgroundColor: 'white'}}>
     <Container />
    </View>
    )
	}
}