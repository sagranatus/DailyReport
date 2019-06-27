/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
// git test
import React, {Component} from 'react';
import {AsyncStorage, Platform, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';
import {
  NavigationEvents,
  createStackNavigator,
  createMaterialTopTabNavigator,
  createAppContainer,
} from 'react-navigation';

import CalendarPage from './page/CalendarPage';
import TodayPage from './page/TodayPage';
import AnalysisPage from './page/AnalysisPage';
import AddtablePage from './page/AddtablePage';
import RNPickerSelect from 'react-native-picker-select';
const tables = [
    {
        label: 'Table1',
        value: 'Table1',
    },
    {
        label: 'Table2',
        value: 'Table2',
    },
    {
      label: 'Table3',
      value: 'Table3',
  },
  {
    label: 'add table',
    value: 'add table',
},
];
const placeholder = {
    label: 'Select a table',
    value: null,
    color: '#9EA0A4',
};
const TabScreen = createMaterialTopTabNavigator(
  {
    Calendar: { 
      screen: CalendarPage,
      navigationOptions: {
      //  tabBarLabel:"Home",
        tabBarIcon: ({ tintColor }) => (
          <Icon name="calendar" size={30} color={tintColor} />
        )
      }
     },
    Today: { 
      screen: TodayPage,
      navigationOptions: {
      //  tabBarLabel:"Home",
        tabBarIcon: ({ tintColor }) => (
          <Icon name="plus" size={29} color={tintColor} />
        )
      }// plus-circle-outline  table-plus 
     },
    Analysis: { 
      screen: AnalysisPage,
      navigationOptions: {
      //  tabBarLabel:"Home",
        tabBarIcon: ({ tintColor }) => (
          <Icon name="chart" size={30} color={tintColor} />
        )
      } 
    }
  },
  {
  //  order: ['HomePage', 'ProfilePage'],
    tabBarPosition: 'top',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarOptions: {
      showIcon: true,
      showLabel: false,
      activeTintColor: '#01579b',
			inactiveTintColor: 'gray',
      style: {
        backgroundColor: '#633689',
        shadowColor: 'transparent',
        shadowRadius: 0,
        elevation: 0,
        borderBottomWidth: 0.5,
        shadowOpacity: 0,      
        shadowColor: 'transparent',
        backgroundColor: '#fff',
        shadowOffset: {
          height: 0,
        }
      },
      labelStyle: {
        textAlign: 'center',
      },
      indicatorStyle: {
        opacity: 0,
        borderBottomColor: '#01579b',
        borderBottomWidth: 2,
      },
    },
  }
);


//making a StackNavigator to export as default
const Container = createAppContainer(TabScreen);
const Container2 = createAppContainer(TabScreen);
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      table: undefined,
      reload: true
    }
  }

  setChange(){    
    //  alert("Main1 setChange()")
      AsyncStorage.getItem('table', (err, result) => {
        this.setState({table:result})        
      })
    }


  Go(value){    
    this.setState({
      table: value,
  },() => {
   // alert(this.state.table)
    if(this.state.table == "add table"){      
      this.props.navigation.navigate("AddtableScreen")
      }else{
        try {
          AsyncStorage.setItem('table', this.state.table);
          this.setState({reload: !this.state.reload})
        } catch (error) {
          console.error('AsyncStorage error: ' + error.message);
        }
      }
    })
  }


  componentWillMount(){
    AsyncStorage.getItem('table', (err, result) => {
        this.setState({table:result})        
      })
  }

  render() {	
    return this.state.reload ?       
    <View style={{flex:1, backgroundColor: 'white'}}>
       <NavigationEvents
      onWillFocus={payload => {console.log(payload),
        this.setChange();
      }} />  
      <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', borderBottomColor:"gray", borderBottomWidth:0.5}}>
       <View style={{flexDirection: "column", flexWrap: 'wrap', width: '80%',  float:'left'}}>
        <RNPickerSelect
            placeholder={placeholder}
            items={tables}
            onValueChange={(value) => {
               this.Go(value)
            }}/*
            onUpArrow={() => {
                this.inputRefs.firstTextInput.focus();
            }}
            onDownArrow={() => {
                this.inputRefs.favSport1.togglePicker();
            }} */
            style={pickerSelectStyles}
            value={this.state.table}
          //  ref={(el) => {
            //   this.inputRefs.favSport0 = el;
          // }}
        />    
      </View>
      <View style={{flexDirection: "column", flexWrap: 'wrap', width: '20%', float:'right'}}>
      <TouchableOpacity 
        activeOpacity = {0.9}
        onPress={() => {this.props.navigation.navigate("AddtableScreen")}} // insertComment
        >      
        <Icon name={'question'} size={30} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
        </TouchableOpacity>
      </View>
     </View>
     <Container />
    </View>
    
    : 
    
    <View style={{flex:1, backgroundColor: 'white'}}>
       <NavigationEvents
      onWillFocus={payload => {console.log(payload),
        this.setChange();
      }} />  
      <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', borderBottomColor:"gray", borderBottomWidth:0.5}}>
       <View style={{flexDirection: "column", flexWrap: 'wrap', width: '80%',  float:'left'}}>
        <RNPickerSelect
            placeholder={placeholder}
            items={tables}
            onValueChange={(value) => {
               this.Go(value)
            }}/*
            onUpArrow={() => {
                this.inputRefs.firstTextInput.focus();
            }}
            onDownArrow={() => {
                this.inputRefs.favSport1.togglePicker();
            }} */
            style={pickerSelectStyles}
            value={this.state.table}
          //  ref={(el) => {
            //   this.inputRefs.favSport0 = el;
          // }}
        />    
      </View>
      <View style={{flexDirection: "column", flexWrap: 'wrap', width: '20%', float:'right'}}>
      <TouchableOpacity 
        activeOpacity = {0.9}
        onPress={() => {this.props.navigation.navigate("AddtableScreen")}} // insertComment
        >      
        <Icon name={'question'} size={30} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
        </TouchableOpacity>
      </View>
     </View>
     <Container2 />
    </View>
    
	}
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