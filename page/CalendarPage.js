// Home screen
import React, { Component } from 'react';
//import react in our code.
import { AsyncStorage, Text, View, FlatList } from 'react-native';
//import all the components we are going to use.
import {NavigationEvents} from 'react-navigation'
import { openDatabase } from 'react-native-sqlite-storage'
import CustomListview from '../etc/CustomListview'
var db = openDatabase({ name: 'TableDatabase.db' })


var arrays = new Array()
export default class CalendarPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      table: undefined
    };
    AsyncStorage.getItem('table', (err, result) => {
      this.setState({table:result})    
    })
  
  }

  componentWillMount(){
    AsyncStorage.getItem('table', (err, result) => {
        this.setState({table:result})        
    
      })
    
  }

  getTableDB(table_name){
   
    db.transaction(tx => {
      db.transaction(function(tx) {
        tx.executeSql(
          'SELECT table_id FROM tableinfo where table_name = ?',
          [table_name],
          (tx, results) => {
            var len = results.rows.length;
          //  값이 있는 경우에 
            if (len > 0) {  
              var table_id = results.rows.item(0).table_id
              tx.executeSql(
                'SELECT * FROM typeinfo where table_id = ?',
                [table_id],
                (tx, results) => {
                  
                  arrays.length = 0
                  var len = results.rows.length;
                  var column, type
                //  값이 있는 경우에 
                  if (len > 0) {
                    for(var i=0; i<results.rows.length; i++){
                      column = results.rows.item(i).column_name
                      type = results.rows.item(i).column_type
                      console.log(column+type)
                      arrays.push({key: i+1, title:column, description: type})

                    } 
                    this.setState({reload:true})
                  }
                }
              );  
            }else{               
              alert('table is not exists!!')   
            }
          }
        );      
        
      }); 
    });
  }


  setChange(){    
  //  alert("Main1 setChange()")
    AsyncStorage.getItem('table', (err, result) => {
      this.setState({table:result})
      this.getTableDB(result)       
    })
  }
  render() {
    return (
     
      <View style={{ flex: 1 }}>

        <NavigationEvents
      onWillFocus={payload => {console.log(payload),
        this.setChange();
      }} />  
       
        <Text>{this.state.table}</Text>
        <CustomListview
          itemList={arrays}
        />
      </View>
    );
  }
}

