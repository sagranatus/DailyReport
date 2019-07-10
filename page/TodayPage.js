// Home screen
import React, { Component } from 'react';
//import react in our code.
import { AsyncStorage, Text, View, FlatList,TouchableOpacity, StyleSheet, Keyboard, ScrollView } from 'react-native';
//import all the components we are going to use.
import {NavigationEvents} from 'react-navigation'
import { openDatabase } from 'react-native-sqlite-storage'
import CustomListview from '../etc/CustomListview'
var db = openDatabase({ name: 'TableDatabase.db' })
import RNPickerSelect from 'react-native-picker-select';
import CalendarStrip from 'react-native-calendar-strip';
import Icon from 'react-native-vector-icons/EvilIcons';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
const tableArray = new Array()
var arrays = new Array()
var arrays_removed = new Array()
var columns = new Array()
var values = new Array()
var RecordDates = new Array()
const placeholder = {
  label: 'Select a table',
  value: null,
  color: '#9EA0A4',
};
export default class TodayPage extends React.Component {
  constructor(props) {
    super(props);

    // table 생성
      // DB 테이블 생성
      db.transaction(function(txn) {
        txn.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='tableinfo'",
          [],
          function(tx, res) {
          //  txn.executeSql('DROP TABLE IF EXISTS tableinfo', []);
           // txn.executeSql('DROP TABLE IF EXISTS typeinfo', []);
          //  txn.executeSql('DROP TABLE IF EXISTS selectinfo', []);

            if (res.rows.length == 0) {
              
              console.log('no data', res.rows.length);
              txn.executeSql('DROP TABLE IF EXISTS tableinfo', []);
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS tableinfo(table_id INTEGER PRIMARY KEY AUTOINCREMENT, table_name TEXT NOT NULL, created_at TEXT NULL)',
                []
              );
              txn.executeSql(
                'CREATE TABLE IF NOT EXISTS typeinfo(reg_id INTEGER PRIMARY KEY AUTOINCREMENT, table_id INTEGER NOT NULL, column_name TEXT NULL, column_type TEXT NULL, column_order INTEGER NOT NULL)',
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
      dataExist : false,
      readonly: false,
      showUpdate:false,
      backColor: '#CEF6F5',
      tableArray: [{
        label: "add table",
        value: "add table"
      }]
    };   
    
    this.getTableDB = this.getTableDB.bind(this)
    this.getValues = this.getValues.bind(this)
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
    this.getTableName(result)  
        this.setState({table:result, today: today, today_show: today_show, selectedDate: today, thisMonth: month})    
        this.getTableDB(result)            
      }) 
  }

  
  getTableName(table){    
    const setState = (_var) => this.setState({tableArray:_var, table:table})
    db.transaction(tx => {
      tx.executeSql(
      'SELECT * FROM tableinfo',
      [],
      (tx, results) => {
        var len = results.rows.length;
      //  값이 있는 경우에 
        if (len > 0) {
          const tableArray = new Array() 
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
            } 
            if(i == results.rows.length-1){    
              tableArray.push({
                label: "add table",
                value: "add table"
              });              
            }
          }
          setState(tableArray)
           
        }else{
          console.log("no table _ app.js")
         /* if(tableArray.length == 0){
            tableArray.push({
              label: "add table",
              value: "add table"
            });  
            setState(true)
          } */
          
        }
      });
    });
  }

  getTableDB(table_name){
    console.log("thisMonth",this.state.thisMonth)
    const setColumn = (column) => this.setState({column: column})
    const getValue = (table_id) => this.getValues(table_id, this.state.selectedDate);
    const getSelects = (table_id, columns) => this.getSelects(table_id, columns)
    const setState = (_var) => this.setState({table_id: _var})
    const getAllPoints = (table_id) => this.getAllPoints(table_id, this.state.thisMonth);
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
              setState(table_id)
              tx.executeSql(
                'SELECT * FROM typeinfo where table_id = ? ORDER BY ABS(column_order)',
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
                      console.log("show Order",column+type)
                      if(type == "select"){
                        arrays.push({key: table_id+column, title:column, type: "select", select:[]})                         
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
                    getSelects(table_id, columns)          
                    getValue(table_id)   
                    getAllPoints(table_id)
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

  getSelects(table_id, columns){
    
    columns.map(( item, key ) =>
    {      
    if(item.type == "select"){   
    db.transaction(tx => {
      db.transaction(function(tx) { 
      tx.executeSql(
        'SELECT * FROM selectinfo where table_id = ? AND column_name=?',
        [table_id, item.column],
        (tx, results) => {
          
          var len = results.rows.length;
          var column, select_val
        //  값이 있는 경우에 
          if (len > 0) {                              
            var selects = new Array()
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
            const itemToFind = arrays.find(function(item) {return item.title === column}) 
               const idx = arrays.indexOf(itemToFind)           
               if(idx > -1){
                arrays[idx]["select"] = selects
                console.log(arrays)
               }  
          }
        }
      );
      });
    })
  }
  })
}
  getValues(table_id, date){ 
    //일단 제거한 뒤에 삽입할 것.
   for(var j=0; j<arrays.length; j++){
    arrays[j]["value"] = ""
   }
   
   arrays_removed.length = 0
   const setValue = (_var1, _var2) => this.setState({[_var1]: _var2})
   const setColor = (_var1) => this.setState({backColor: _var1})   
   const Exist = (_var) =>  this.setState({dataExist : _var})  
   const showUpdate = this.state.showUpdate
   var column_origin = this.state.column;
   var column_noval = this.state.column;
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

             setColor('#CEF6F5') 
             if(showUpdate){
               setValue('readonly', false)
             }else{
             setValue('readonly', true)
             }
             values.length = 0
          //   alert("there is!")
             for(var i=0; i<results.rows.length; i++){
           
               column = results.rows.item(i).column_name 
               value = results.rows.item(i).column_value
            
             //  setValue(column, value) // 수정때문에 필요하다.
               console.log("Val", column+value)
               const itemToFind = arrays.find(function(item) {return item.title === column}) 
               const idx = arrays.indexOf(itemToFind)           
               if(idx > -1){
                arrays[idx]["value"] = value
                console.log(arrays)
               }else{
                 console.log("removed column get", column + value)
                 // 삭제된 컬럽 값 가져오기
                 
                arrays_removed.push({
                  key: table_id+column, 
                  title:column,
                  type: "none",
                  value: value
                })
               }

               if(i == results.rows.length-1){
                var uniq = {}
                arrays_removed = arrays_removed.filter(obj => !uniq[obj.title] && (uniq[obj.title] = true));
             //   arrays_removed = this.getUniqueObjectArray(arrays_removed, title)
               }
               
               console.log("removed",  arrays_removed)
             } 
             
             Exist(true)
           }else{    
               setColor('#ECF8E0')       
               setValue('readonly', false)            
             /*
             console.log("column!",column_origin)
             column_origin.map(( item_, key ) =>
             {
               const itemToFind = arrays.find(function(item) {return item.title === item_.column}) 
               const idx = arrays.indexOf(itemToFind)           
               arrays[idx]["value"] = ""
             })  
             console.log(arrays) */
             Exist(false)
           }
         }
       )
     })
   });
 }

 getValuesForUpdate(table_id, date){    

  const setValue = (_var1, _var2) => this.setState({[_var1]: _var2})
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
              console.log("getValuesForupdate", column+value)
              setValue(column, value) // 수정때문에 필요하다
            } 
          }else{ 
          }
        }
      )
    })
  });
}

 
 
 getAllPoints(table_id, month){
  const setRecords = (_var) => this.setState({records: _var})
  RecordDates.length = 0
    // 날짜에 맞는 DB값 모두 가져오기   
      db.transaction(tx => {
       tx.executeSql(
        'SELECT * FROM valueinfo where table_id = ? and record_date LIKE ?',
        [table_id, '2019-'+month+'%'],
        (tx, results) => {
          var len = results.rows.length;
          if (len > 0) {     
              console.log("get data")    
              var date = results.rows.item(0).record_date;
              var date;
              var realDate;
              var y,m,d
              for(var i=0; i<results.rows.length; i++){
                date = results.rows.item(i).record_date;                  
                console.log("date", date)
                if(RecordDates.indexOf(date) < 0 ){
                  RecordDates.push(date)
                }
              }
              this.recordFunc(RecordDates)
              console.log('get data : ', RecordDates)
                          
          } else {                  
            console.log('get data : ', "no value")        
            setRecords([])
          }
        }
      );
    });  
  }
  
recordFunc = (RecordDates) => {
  console.log("recordFunc")
  // reduce -> 배열에서 중복되는 것을 빼준다.
  RecordDates = RecordDates.reduce(function(a,b){if(a.indexOf(b)<0)
    a.push({
    date:b,
    dots: [
        {
        color: "#01579b",
        selectedDotColor: "#01579b",
        }
    ],
 });return a;},[]);
 console.log(RecordDates)
 this.setState({records: RecordDates})
  }
  

  // insert 및 update function
  InsertValue(date){
    Keyboard.dismiss()
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
    Keyboard.dismiss()
    const table_id = this.state.table_id
    //  columns = this.state.column
      console.log("columns",this.state.column)
      if(this.state.column !== undefined){                 
      var arrays = new Array()
      var arrays2 = new Array()
        this.state.column.map(( item, key ) =>
       { 
          arrays.push({
            column : item.column,
            value :  this.state[item.column]
          })             

       })  
      const itemToFind = arrays.find(function(item) {return item.value === undefined}) 
      const idx = arrays.indexOf(itemToFind) 
  
      const itemToFind2 = arrays.find(function(item) {return item.value === ""}) 
      const idx2 = arrays.indexOf(itemToFind2) 
      console.log(arrays)
      if (idx > -1 || idx2 > -1){
        alert("please fill the column value")
      }else{
        this.UpdateValueToTable(this.state.table_id, date, arrays)
      } 
      } 
    }

    
  

  
  InsertValueToTable(table_id, date, array_column){
    const setReadOnly = (_var) => this.setState({readonly: _var})
    const setExist = (_var) => this.setState({dataExist: _var})    
    const setColor = (_var) => this.setState({backColor:_var})
    const getAllPoints = (_var) => this.getAllPoints(this.state.table_id, this.state.thisMonth)
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
            setReadOnly(true)
            setExist(true)
            setColor('#CEF6F5')
            getAllPoints(true)
          } else {
            console.log('value insert : ', "failed")
          }
        }
      )
    });  

  }

  UpdateValueToTable(table_id,date,array_column){    
    const setReadOnly = (_var) => this.setState({readonly: _var})
    const setUpdate = (_var) => this.setState({showUpdate: _var})
    var arrays = new Array()
    var add = ''
    array_column.map(( item ) =>
        {
          db.transaction(function(tx) {
            tx.executeSql(
              'SELECT * FROM valueinfo WHERE table_id =? and column_name=? and record_date =?',
              [table_id, item.column, date],
              (tx, results) => {                            
                var len = results.rows.length;
                //  값이 있는 경우에 
                  if (len > 0) {
                    tx.executeSql(
                      'UPDATE valueinfo SET column_value = ? WHERE table_id =? and column_name=? and record_date =?',
                      [item.value, table_id, item.column, date],
                      (tx, results) => {                            
                        if (results.rowsAffected > 0) {
                          console.log('value update : ', "success") 
                        } else {
                          console.log('value update : ', "failed")
                        }
                      }
                    )
                  }else{
                    tx.executeSql(
                      'INSERT INTO valueinfo (table_id, record_date, column_name, column_value) VALUES (?,?,?,?)',
                      [table_id, date, item.column, item.value],
                      (tx, results) => {                            
                        if (results.rowsAffected > 0) {
                          console.log('value insert : ', "success") 
                        } else {
                          console.log('value insert : ', "failed")
                        }
                      }
                    )
                  }
                });
              });
              this.setState({showUpdate:false, readonly:true})
        }  
    )
    //arrays.push(table_id, date)
    //console.log(arrays)
   // console.log(add)


    /*console.log("here", table_id + date)
    const setReadOnly = (_var) => this.setState({readonly: _var})
    const setUpdate = (_var) => this.setState({showUpdate: _var})
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

    var arrays2 = new Array()
    var add2 = ''
    array_column2.map(( item ) =>
        {
          arrays2.push(table_id, date, item.column, item.value )
          add2 = add2+"(?,?,?,?),"  
        }  
    )
  
    add2 = add2.substr(0, add2.length -1);
    console.log(arrays2)
    console.log(add2)

    db.transaction(function(tx) {
      tx.executeSql(
        'UPDATE valueinfo SET column_value = CASE column_name '+add+' ELSE column_value END WHERE table_id =? and record_date =?',
        arrays,
        (tx, results) => {                            
          if (results.rowsAffected > 0) {
            console.log('value update : ', "success") 
            alert("data updated")
            setUpdate(false)
            setReadOnly(true)
          } else {
            console.log('value update : ', "failed")
          }
        }
      )
    });  

    db.transaction(function(tx) {
      tx.executeSql(
        'INSERT INTO valueinfo (table_id, record_date, column_name, column_value) VALUES '+add2,
        arrays2,
        (tx, results) => {                            
          if (results.rowsAffected > 0) {
            console.log('value insert : ', "success") 
          } else {
            console.log('value insert : ', "failed")
          }
        }
      )
    });  

*/
    // 삭제된 값 수정
    if(arrays_removed.length !== 0){
      var columns_removed = new Array()
      console.log("remove1", arrays_removed)
      arrays_removed.map(( item ) =>
      {
        columns_removed.push(item.title)
      }  
      )
      console.log("remove2", columns_removed)
  
      var arrays_ = new Array()
      var add_ = ''
      columns_removed.map(( item, key ) =>
      {      
        arrays_.push(item, this.state[item] )
        add_ = add_+"WHEN ? THEN ? "        
      })
     
      arrays_.push(table_id, date)
      console.log("remove3", arrays_)
      console.log("remove4",add_)
      db.transaction(function(tx) {
        tx.executeSql(
          'UPDATE valueinfo SET column_value = CASE column_name '+add_+' ELSE column_value END WHERE table_id =? and record_date =?',
          arrays_,
          (tx, results) => {                            
            if (results.rowsAffected > 0) {
              console.log('value update : ', "success") 
             // alert("data updated")
              setUpdate(false)
              setReadOnly(true)
            } else {
              console.log('value update : ', "failed")
            }
          }
        )
      });  
      
    }
   
    
  }

  // table이름 변경시에
  Go(value){     
    if(value == "add table"){      
      this.props.navigation.navigate("AddtableScreen")
      }else{
        try {
          AsyncStorage.setItem('table', value);
          if(value !== undefined && value !== ""){
          this.setState({table: value})          
          this.getTableDB(value)
          }          
        } catch (error) {
          console.error('AsyncStorage error: ' + error.message);
        }
      }   
  }

  setChange(){ 
    // 테이블 add된 경우 add된 테이블을 가져옴
    const { params } = this.props.navigation.state;
    if(params != null){
      console.log("navigation params existed : ",params.otherParam)     
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
        this.getTableName(result)
          this.setState({table:result, today: today, today_show: today_show, selectedDate: today, thisMonth: month})    
          this.getTableDB(result)            
        }) 
      
      }
  }

  // listview row값에서 값 변경시 이벤트 - setState
  onChange(title,value){
    this.setState({[title]:value})
    console.log(this.state.title)
  }

  // 달력관련이벤트 
  onDateSelect(date){
    Keyboard.dismiss()
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

    //만약 이동한 날짜가 일요일이나 월요일인 경우에 월이 다르면 getAllPoints 가져옴
    if(date.getDay() == 0 || date.getDay() == 1){
      var month = date.getMonth()+1   
      if(month < 10){
          month = "0"+month;
      }
      if(month !== this.state.thisMonth){
        this.setState({thisMonth: month})
        this.getAllPoints(this.state.table_id, month)
      }    
    }
  }


  onWeekendSelect(date){
  //  var date = date.setDate(date.getDate() + 3)
    console.log(this.state.table_id)
    date.setDate(date.getDate() + 6)
    //alert(date.getMonth)
    var month = date.getMonth()+1   
    if(month < 10){
        month = "0"+month;
    }
    // 다른 월인 경우에 getAllPoints 다시 가져옴. thisMonth setting
    if(this.state.thisMonth !== month){
      this.setState({thisMonth: month})
      this.getAllPoints(this.state.table_id, month)
    }
  }

  // swipe event
  onSwipe(gestureName, gestureState) {
    var date = this.state.selectedDate
    var y = date.substr(0,4),
    m = date.substr(5,2) -1,
    d = date.substr(8,2);
    var D = new Date(y,m,d);
    console.log(date + D)
    const {SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT} = swipeDirections;
    this.setState({gestureName: gestureName});
    switch (gestureName) {
      case SWIPE_UP:
        this.setState({backgroundColor: 'red'});
        break;
      case SWIPE_DOWN:
        this.setState({backgroundColor: 'green'});
        break;
      case SWIPE_LEFT:
       D.setDate(D.getDate() + 1)
       if (this.calendar !== null) {
        this.calendar.setSelectedDate(D)	
        console.log(D.getDay())
       if(D.getDay() ==6){
          this.calendar.updateWeekView
        }
      //  
      }
        break;
      case SWIPE_RIGHT:
        D.setDate(D.getDate() - 1)
        if (this.calendar !== null) {
          this.calendar.setSelectedDate(D)	
           if(D.getDay() == 0){
            this.calendar.updateWeekView
          }
        }
        break;
    }
  }
    
  render() {
    return (        
      <GestureRecognizer
      onSwipe={(direction, state) => this.onSwipe(direction, state)}
      config={{
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80
      }}
      style={{
        flex: 1
      }}
      >   
      <ScrollView style={{ flex: 1}}>
        <NavigationEvents
      onWillFocus={payload => {console.log(payload),
        this.setChange();
      }} /> 
       
        <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', borderBottomColor:"gray", borderBottomWidth:0.5}}>
         <View style={{flexDirection: "column", flexWrap: 'wrap', width: '80%',  float:'left'}}>
           <RNPickerSelect
              placeholder={placeholder}
              items={this.state.tableArray}
              onValueChange={(value) => {
                value == null ? {} : this.Go(value)
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
          <View style={this.state.table == null ? {display:'none'} : {flexDirection: "column", flexWrap: 'wrap', width: '10%', float:'right'}}>
          <TouchableOpacity 
            activeOpacity = {0.9}
            onPress={() => {this.props.navigation.navigate("UpdatetableScreen", {otherParam: this.state.table_id, otherParam2: this.state.table})}} // insertComment
            >      
            <Icon name={'pencil'} size={30} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
            </TouchableOpacity>
          </View>
          <View style={this.state.table == null ? {display:'none'} : {flexDirection: "column", flexWrap: 'wrap', width: '10%', float:'right'}}>
          <TouchableOpacity 
            activeOpacity = {0.9}
            onPress={() => {this.props.navigation.navigate("AddtableScreen")}} // insertComment
            >      
            <Icon name={'chart'} size={30} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
            </TouchableOpacity>
          </View>
        </View>
        <CalendarStrip
        ref={(ref) => this.calendar = ref} 
        startingDate={this.state.selectedDate}
        selectedDate={this.state.selectedDate}
       // calendarAnimation={{type: 'sequence', duration:5}}
        daySelectionAnimation={{type: 'background', duration: 300, highlightColor: this.state.backColor}}
        onDateSelected={(date)=>this.onDateSelect(date._d)}
        markedDates={ this.state.records }
        markedDatesStyle={{position:'absolute'}}
        onWeekChanged={(date)=>this.onWeekendSelect(date._d)}
        style={{height:100, paddingTop: 0, paddingBottom: 10}}
      />
        <Text style={this.state.table == undefined ? {} : {display:'none'}}>Please add table</Text>
        <CustomListview
          tableName={this.state.table}
          itemList={arrays}
          date={this.state.selectedDate}
          readonly={this.state.readonly}
          onChange = {(title, value) => this.setState({[title]:value}) }         
        />
        <View  style={arrays_removed.length == 0 ? {display:'none'} : {borderTopColor:'#000', borderTopWidth:0.5, marginTop:10}}>   
        <Text>Removed column Data</Text>        
          <CustomListview         
          tableName={this.state.table}
          itemList={arrays_removed}
          date={this.state.selectedDate}
          readonly={this.state.readonly}
          onChange = {(title, value) => this.setState({[title]:value}) }         
        />
        </View>

         <TouchableOpacity 
        activeOpacity = {0.9}
        style={!this.state.dataExist ? [styles.Button, {backgroundColor: '#298A08'}] : {display:'none'}}
        onPress={()=> this.InsertValue(this.state.selectedDate)} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
          add today values
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
        activeOpacity = {0.9}        
        style={this.state.dataExist && !this.state.showUpdate ? styles.Button : {display:'none'}}
        onPress={()=> [this.setState({readonly: false, showUpdate: true}),  this.getValuesForUpdate(this.state.table_id, this.state.selectedDate)]} 
        >         
          <Text style={!this.state.showUpdate ? {color:"#fff", textAlign:'center'} : {display:'none'}}>
          edit values
          </Text>
          </TouchableOpacity>
          <TouchableOpacity 
          activeOpacity = {0.9}        
          style={this.state.dataExist ? [styles.Button, {backgroundColor:'#fff'}] : {display:'none'}}
          onPress={()=> [this.setState({readonly: false, showUpdate: true}),  this.getValuesForUpdate(this.state.table_id, this.state.selectedDate)]} 
          >   
          <Text style={this.state.showUpdate ? {color:"#01579b", textAlign:'center'} : {display:'none'}}>
          editing...
          </Text>
          </TouchableOpacity>

        <TouchableOpacity 
        activeOpacity = {0.9}        
        style={this.state.dataExist && this.state.showUpdate ? styles.Button : {display:'none'}}
        onPress={()=> this.UpdateValue(this.state.selectedDate)} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
          update today values
          </Text>
        </TouchableOpacity>
      </ScrollView>
      
      </GestureRecognizer>
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