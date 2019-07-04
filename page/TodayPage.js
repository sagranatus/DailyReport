// Home screen
import React, { Component } from 'react';
//import react in our code.
import { AsyncStorage, Text, View, FlatList,TouchableOpacity, StyleSheet  } from 'react-native';
//import all the components we are going to use.
import {NavigationEvents} from 'react-navigation'
import { openDatabase } from 'react-native-sqlite-storage'
import CustomListview from '../etc/CustomListview'
var db = openDatabase({ name: 'TableDatabase.db' })
import RNPickerSelect from 'react-native-picker-select';
import CalendarStrip from 'react-native-calendar-strip';
const tableArray = new Array()
var arrays = new Array()
var columns = new Array()
var values = new Array()

const placeholder = {
  label: 'Select a table',
  value: null,
  color: '#9EA0A4',
};
export default class TodayPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      table: undefined,
      dataExist : false
    };
    AsyncStorage.getItem('table', (err, result) => {
      this.setState({table:result})         
      this.getTableDB(result)       
    })

    this.getTableDB = this.getTableDB.bind(this)
    this.getValues = this.getValues.bind(this)
    this.getTableName()
    this.Go = this.Go.bind(this)
  }

  componentWillMount(){
    
    var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; 
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth()+1
    var day = date.getDate();
    if(month < 10){
        month = "0"+month;
    }
    if(day < 10){
        day = "0"+day;
    } 
    var today = year+"-"+month+"-"+day
    var today_show = year+"."+month+"."+day+". " + weekEngShortName[date.getDay()];

    AsyncStorage.getItem('table', (err, result) => {
        this.setState({table:result, today: today, today_show: today_show, selectedDate: today})            
      }) 
  }

  getTableDB(table_name){
    const setColumn = (column) => this.setState({column: column})
    const getValue = (table_id) => this.getValues(table_id, this.state.today);
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
                  columns.length = 0
                  var len = results.rows.length;
                  var column, type
                //  값이 있는 경우에 
                  if (len > 0) {
                    for(var i=0; i<results.rows.length; i++){
                      column = results.rows.item(i).column_name
                      type = results.rows.item(i).column_type
                      console.log(column+type)
                      if(type == "select"){
                        var selects = new Array()
                        tx.executeSql(
                          'SELECT * FROM selectinfo where table_id = ? AND column_name=?',
                          [table_id, column],
                          (tx, results) => {
                            
                            var len = results.rows.length;
                            var column, select_val
                          //  값이 있는 경우에 
                            if (len > 0) {
                              for(var i=0; i<results.rows.length; i++){
                                column = results.rows.item(i).column_name
                                select_val = results.rows.item(i).select_value
                                console.log(column+select_val)
                                selects.push({
                                     label: select_val,
                                     value: select_val
                                 })
                              } 
                              console.log("selects2",selects)
                              arrays.push({key: table_id+column, title:column, type: "select", select:selects})          
                            }
                          }
                        );
                      }else if(type == "check box"){                        
                       arrays.push({key: table_id+column, title:column, type: type})                       
                      }else{                        
                        arrays.push({key: table_id+column, title:column, type: type})
                       }
                       //   columns.length = 0
                       columns.push({column, type})                        
                    } 
                    console.log("columns", columns)
                    console.log("info!!", arrays)
                    setColumn(columns)            
                    getValue(table_id)   
                  }
                }
              )
            }else{               
              //alert('table is not exists!!')   
            }
          }
        );           
      }); 
    });
  }

  InsertValue(date){
  //  columns = this.state.column
    console.log("columns",this.state.column)
    if(this.state.column !== undefined){    
    var arrays = new Array()
      this.state.column.map(( item, key ) =>
    {      
      console.log(item.column + this.state[item.column])  
      if(item.type == "check box"){
        arrays.push({
          column : item.column,
          value :  this.state[item.column] == undefined ? false :  this.state[item.column]
        })
      }else{
        arrays.push({
          column : item.column,
          value :  this.state[item.column]
        })
      }    
     
    })  
    const itemToFind = arrays.find(function(item) {return item.value === undefined}) 
    const idx = arrays.indexOf(itemToFind) 

    const itemToFind2 = arrays.find(function(item) {return item.value === ""}) 
    const idx2 = arrays.indexOf(itemToFind2) 
    if (idx > -1 || idx2 > -1){
      alert("please fill the column value")
    }else{
      this.InsertValueToTable(this.state.table_id, date, arrays)
    } 
    } 
  }

  UpdateValue(date){
    //  columns = this.state.column
      console.log("columns",this.state.column)
      if(this.state.column !== undefined){    
      var arrays = new Array()
        this.state.column.map(( item, key ) =>
      {      
        console.log(item.column + this.state[item.column])      
        arrays.push({
          column : item.column,
          value :  this.state[item.column]
        })
      })  
      const itemToFind = arrays.find(function(item) {return item.value === undefined}) 
      const idx = arrays.indexOf(itemToFind) 
  
      const itemToFind2 = arrays.find(function(item) {return item.value === ""}) 
      const idx2 = arrays.indexOf(itemToFind2) 
      if (idx > -1 || idx2 > -1){
        alert("please fill the column value")
      }else{
        this.UpdateValueToTable(this.state.table_id, date, arrays)
      } 
      } 
    }

    UpdateValueToTable(table_id,date,array_column){
    console.log("here", table_id + date)
    const setState = (_var) => this.setState({reload:_var})
    var arrays = new Array()
    var add = ''
    array_column.map(( item ) =>
        {
          arrays.push(item.column, item.value )
          add = add+"WHEN ? THEN ? "  
        }  
    )
    arrays.push(table_id, date)
    console.log(arrays)
    console.log(add)
    db.transaction(function(tx) {
      tx.executeSql(

        'UPDATE valueinfo SET column_value = CASE column_name '+add+' ELSE column_value END WHERE table_id =? and record_date =?',
        arrays,
        (tx, results) => {                            
          if (results.rowsAffected > 0) {
            console.log('value update : ', "success") 
            alert("data updated")
          } else {
            console.log('value update : ', "failed")
          }
        }
      )
    });  

  }

  getValues(table_id, date){    
   // alert(this.state.today)
  //  alert(this.state.column)

  const setValue = (_var1, _var2) => this.setState({[_var1]: _var2})
  const setState = (_var) => this.setState({table_id: _var})
  const Exist = (_var) =>  this.setState({dataExist : _var})  
  var column_origin = this.state.column;
  db.transaction(tx => {
      db.transaction(function(tx) {
      tx.executeSql(
        'SELECT * FROM valueinfo where record_date = ? AND table_id = ? ',
        [date, table_id],
        (tx, results) => {
          var len = results.rows.length;
        //  값이 있는 경우에 
        var column, value
          if (len > 0) { 
            values.length = 0
           // alert("there is!")
            for(var i=0; i<results.rows.length; i++){
              column = results.rows.item(i).column_name
              value = results.rows.item(i).column_value
              setValue(column, value)
              console.log(column+value)
              const itemToFind = arrays.find(function(item) {return item.title === column}) 
              const idx = arrays.indexOf(itemToFind)           
              arrays[idx]["value"] = value
              console.log(arrays)
            } 
            setState(table_id)
            Exist(true)
          }else{
            console.log("column!",column_origin)
            column_origin.map(( item_, key ) =>
            {
              const itemToFind = arrays.find(function(item) {return item.title === item_.column}) 
              const idx = arrays.indexOf(itemToFind)           
              arrays[idx]["value"] = ""
            })  
            setState(table_id)
            console.log(arrays)
            Exist(false)
          }
        }
      )
    })
  });
}

  
  InsertValueToTable(table_id, date, array_column){
    const setState = (_var) => this.setState({reload:_var})
    console.log(table_id + date + arrays);
    console.log("here", array_column)
    var arrays = new Array()
    var add = ''
    array_column.map(( item ) =>
        {
          arrays.push(table_id, date, item.column, item.value )
          add = add+"(?,?,?,?),"  
        }  
    )
  
    add = add.substr(0, add.length -1);
    console.log(arrays)
    console.log(add)
    db.transaction(function(tx) {
      tx.executeSql(
        'INSERT INTO valueinfo (table_id, record_date, column_name, column_value) VALUES '+add,
        arrays,
        (tx, results) => {                            
          if (results.rowsAffected > 0) {
            console.log('value insert : ', "success") 
            alert("data inserted")
            setState(true)
          } else {
            console.log('value insert : ', "failed")
          }
        }
      )
    });  

  }

  
  Go(value){    
    this.getTableDB(value)    
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

  getTableName(){
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
          console.log("no table _ app.js")
          tableArray.push({
            label: "add table",
            value: "add table"
          });  
          this.setState({reload:true})
        }
      });
    });
  }


  setChange(){    
  //  alert("Main1 setChange()")
    AsyncStorage.getItem('table', (err, result) => {
      this.setState({table:result})
    //  this.getTableDB(result)    
    })
    
  }

  onChange(title,value){
    this.setState({[title]:value})
    console.log(this.state.title)
  }

  onDateSelect(date){
    var year = date.getFullYear();
    var month = date.getMonth()+1
    var day = date.getDate();
    if(month < 10){
        month = "0"+month;
    }
    if(day < 10){
        day = "0"+day;
    } 
    var selectedDate = year+"-"+month+"-"+day
    console.log(selectedDate)
    this.setState({selectedDate: selectedDate})
    this.getValues(this.state.table_id, selectedDate)
  }
  render() {
    return (     
      <View style={{ flex: 1 }}>
        <NavigationEvents
      onWillFocus={payload => {console.log(payload),
        this.setChange();
      }} />  
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
        <CalendarStrip
       // calendarAnimation={{type: 'sequence', duration:5}}
        daySelectionAnimation={{type: 'background', duration: 300, highlightColor: '#9265DC'}}
        onDateSelected={(date)=>this.onDateSelect(date._d)}
        style={{height:100, paddingTop: 0, paddingBottom: 10}}
      />
        <Text>{this.state.table}</Text>
        <Text>{this.state.today_show}</Text>
        <CustomListview
          tableName={this.state.table}
          itemList={arrays}
          date={this.state.selectedDate}
          onChange = {(title, value) => this.setState({[title]:value}) }         
        />
         <TouchableOpacity 
        activeOpacity = {0.9}
        style={!this.state.dataExist ? styles.Button : {display:'none'}}
        onPress={()=> this.InsertValue(this.state.selectedDate)} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
          add today values
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
        activeOpacity = {0.9}        
        style={this.state.dataExist ? styles.Button : {display:'none'}}
        onPress={()=> this.UpdateValue(this.state.selectedDate)} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
          update today values
          </Text>
        </TouchableOpacity>
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
      width:'100%',
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