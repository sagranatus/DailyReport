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
import AddtablePage from './page/AddtablePage';
import UpdatetablePage from './page/UpdatetablePage'
import TodayPage from './page/TodayPage';
import StatisticsPage from './page/StatisticsPage'
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
    },
    UpdatetableScreen: {
      screen: UpdatetablePage,
      navigationOptions: {
        header: null
      }  
    },
    StatisticsScreen: {
      screen: StatisticsPage,
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

  render() {	
    return(
    <View style={{flex:1, backgroundColor: 'white'}}>
     <Container />
    </View>
    )
	}
}