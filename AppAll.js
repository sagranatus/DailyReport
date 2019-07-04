import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';
import {
  HeaderBackButton,
  createStackNavigator,
  createMaterialTopTabNavigator,
  createAppContainer,
  createSwitchNavigator
} from 'react-navigation';
import { YellowBox } from 'react-native';
import App from './App';
import AddtablePage from './page/AddtablePage';
import TodayPage from './page/TodayPage';
import RNPickerSelect from 'react-native-picker-select';

YellowBox.ignoreWarnings(['ViewPagerAndroid']);
//making a StackNavigator to export as default
const Container = createAppContainer(
  createStackNavigator({   
    TodayScreen: {
      screen: TodayPage,
      navigationOptions: {
        header: null
      }  
    },
    AddtableScreen: {
      screen: AddtablePage,
      navigationOptions: {
        header: null
      }  
  
    }    
    
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