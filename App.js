/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {AsyncStorage, Platform, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/EvilIcons';
import {
  NavigationEvents,
  createStackNavigator,
  createMaterialTopTabNavigator,
  createAppContainer,
} from 'react-navigation';
import { openDatabase } from 'react-native-sqlite-storage'
var db = openDatabase({ name: 'TableDatabase.db' })

import CalendarPage from './page/CalendarPage';
import TodayPage from './page/TodayPage';
import AnalysisPage from './page/AnalysisPage';
import AddtablePage from './page/AddtablePage';
import RNPickerSelect from 'react-native-picker-select';
const tableArray = new Array()
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

      // DB 테이블 생성
      db.transaction(function(txn) {
        txn.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='tableinfo'",
          [],
          function(tx, res) {
           // txn.executeSql('DROP TABLE IF EXISTS tableinfo', []);
           // txn.executeSql('DROP TABLE IF EXISTS typeinfo', []);
           // txn.executeSql('DROP TABLE IF EXISTS selectinfo', []);

            if (res.rows.length == 0) {
              
              console.log('no data', res.rows.length);
              txn.executeSql('DROP TABLE IF EXISTS tableinfo', []);
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS tableinfo(table_id INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT NOT NULL, created_at TEXT NULL)',
                []
              );
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS typeinfo(reg_id INTEGER PRIMARY KEY AUTOINCREMENT, table_id INTEGER NOT NULL, column_name TEXT NULL, column_type TEXT NULL)',
                []
              );
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS valueinfo(reg_id INTEGER PRIMARY KEY AUTOINCREMENT, table_id INTEGER NOT NULL, record_date TEXT NULL, column_name TEXT NULL, column_value TEXT NULL)',
                []
              );
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS selectinfo(reg_id INTEGER PRIMARY KEY AUTOINCREMENT, table_id INTEGER NOT NULL, column_name TEXT NULL, select_value TEXT NULL)',
                []
              );
            }
          }
        );
      });
   
    this.state = {
      table: undefined,
      reload: true
    }
    this.Go = this.Go.bind(this)

  }

 
  Go(value){    
    this.setState({
      table: value,
  },() => {
   // alert(this.state.table)
    if(this.state.table == "add table"){      
      this.props.navigation.navigate("AddtableScreen")
      AsyncStorage.getItem('table', (err, result) => {
        this.setState({table:result})        
      })
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
    db.transaction(tx => {
      tx.executeSql(
      'SELECT * FROM tableinfo',
      [],
      (tx, results) => {
        var len = results.rows.length;
      //  값이 있는 경우에 
        if (len > 0) {
          tableArray.length = 0       
          console.log("tables exist")
          for(var i=0; i<results.rows.length; i++){
          const table_name = results.rows.item(i).table_name   
          if(tableArray.indexOf(table_name) < 0 ){
            console.log(table_name)
            tableArray.push({
              label: table_name,
              value: table_name,
            });
            console.log(tableArray)
          //  this.setState({reload: !this.state.reload})
            } 
            if(i == results.rows.length-1){    
              tableArray.push({
                label: "add table",
                value: "add table"
              });  
              AsyncStorage.getItem('table', (err, result) => {
                this.setState({table:result})        
              })    
            }
          }
        }else{
          console.log("no table")
        }
      });
    });

  }

  render() {	
    return this.state.reload ?   
    <View style={{flex:1, backgroundColor: 'white'}}>
      <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', borderBottomColor:"gray", borderBottomWidth:0.5}}>
       <View style={{flexDirection: "column", flexWrap: 'wrap', width: '80%',  float:'left'}}>
        <RNPickerSelect
            placeholder={placeholder}
            items={tableArray}
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
  <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', borderBottomColor:"gray", borderBottomWidth:0.5}}>
   <View style={{flexDirection: "column", flexWrap: 'wrap', width: '80%',  float:'left'}}>
    <RNPickerSelect
        placeholder={placeholder}
        items={tableArray}
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