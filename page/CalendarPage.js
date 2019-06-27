// Home screen
import React, { Component } from 'react';
//import react in our code.
import { AsyncStorage, Text, View } from 'react-native';
//import all the components we are going to use.
import {NavigationEvents} from 'react-navigation'
export default class CalendarPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      table: undefined
    }
  }

  componentWillMount(){
    AsyncStorage.getItem('table', (err, result) => {
        this.setState({table:result})        
      })
  }
  setChange(){    
  //  alert("Main1 setChange()")
    AsyncStorage.getItem('table', (err, result) => {
      this.setState({table:result})        
    })
  }
  render() {
    return (
     
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <NavigationEvents
      onWillFocus={payload => {console.log(payload),
        this.setChange();
      }} />  
        <Text>{this.state.table}</Text>
      </View>
    );
  }
}

