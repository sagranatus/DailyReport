// Home screen
import React, { Component } from 'react';
import { Text, View, FlatList,TouchableOpacity, StyleSheet, Keyboard, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
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
var arrays = new Array() // 현재 있는 컬럼 배열
var arrays_removed = new Array() // 삭제된 컬럼 배열
var columns = new Array() // column 정보
var values = new Array() // ?? 없는값?
var RecordDates = new Array() // getallpoints 모든 값
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
            //txn.executeSql('DROP TABLE IF EXISTS tableinfo', []);
            //txn.executeSql('DROP TABLE IF EXISTS typeinfo', []);
            //txn.executeSql('DROP TABLE IF EXISTS selectinfo', []);
            //txn.executeSql('DROP TABLE IF EXISTS valueinfo', []);

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
                'CREATE TABLE IF NOT EXISTS valueinfo(reg_id INTEGER PRIMARY KEY AUTOINCREMENT, table_id INTEGER NOT NULL, record_date TIMESTAMP NULL, column_name TEXT NULL, column_value TEXT NULL)',
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
      }],
      blacklist: [{ 
        start: new Date().setDate(new Date().getDate() +1),
        end: new Date().setDate(new Date().getDate() +1000)
      }],
      initialLoading:true
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

    // table가져와서 table에 setState, today날짜, today_show, selectedDate today로 setState, thisMonth setState
    // getTableName로 모든 테이블명 가져와서 세팅
    // getTableDB로 
    AsyncStorage.getItem('table', (err, result) => {      
    this.getTableName(result)  
        this.setState({table:result, today: today, today_show: today_show, selectedDate: today, thisMonth: month})    
        this.getTableDB(result)            
      }) 
  }

  // table이름 모두 가져와서 보이기
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
         
          for(var i=0; i<results.rows.length; i++){
          const table_name = results.rows.item(i).table_name   
          if(tableArray.indexOf(table_name) < 0 ){
          //  console.log(table_name)
            tableArray.push({
              label: table_name,
              value: table_name,
            });
           // console.log(tableArray)
            } 
            if(i == results.rows.length-1){    
              tableArray.push({
                label: "add table",
                value: "add table"
              });              
            }
          }
          //tableArray에 값 삽입해서 setState
          console.log("tables exist - getTableName", tableArray)
          setState(tableArray)
           
        }else{
          console.log("no table - getTableName")
                  
        }
      });
    });
  }

  //선택된 table에 대해서 tableDB 가져옴
  getTableDB(table_name){
    this.setState({initialLoading:true})
    console.log("thisMonth - getTableDB",this.state.thisMonth)
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
              // table_id setState세팅
              setState(table_id)
              tx.executeSql(
                'SELECT * FROM typeinfo where table_id = ? ORDER BY ABS(column_order)',
                [table_id],
                (tx, results) => {    
                  // table_id로 column 및 type정보 가져옴              
                  arrays.length = 0
                  columns.length = 0
                  var len = results.rows.length;
                  var column, type
                //  값이 있는 경우에 
                  if (len > 0) {
                    for(var i=0; i<results.rows.length; i++){
                      column = results.rows.item(i).column_name
                      type = results.rows.item(i).column_type
                      console.log("column, type - getTableDB",column+"|"+type)
                      // select인 경우에는 arrays에 select 정보 삽입할 수 있도록 함
                      if(type == "select"){
                        arrays.push({key: table_id+column, title:column, type: "select", select:[]})                         
                      }else{                        
                        arrays.push({key: table_id+column, title:column, type: type})
                       }                     
                       columns.push({column, type})          
                       if(i == results.rows.length-1){                        
                        console.log("columns - getTableDB", columns)
                        console.log("arrays info - getTableDB", arrays)
                        // setState columns에 삽입
                        setColumn(columns)  
                        // selects 정보 가져오기
                        getSelects(table_id, columns)                               
                        // 이번달에 대해서 값있는 경우 points 찍도록 함   
                        getAllPoints(table_id)   
                        // value 가져오기
                        getValue(table_id)
                       }              
                    } 
                  }
                }
              )
            }else{               
              console.log("no exist - getTableDB")
            }
          }
        );           
      }); 
    });
  }

  // select 정보 가져옴
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
              selects.push({
                  label: select_val,
                  value: select_val
              })
            }             
            console.log("selects info - getSelects",column+selects)
            const itemToFind = arrays.find(function(item) {return item.title === column}) 
               const idx = arrays.indexOf(itemToFind)           
               if(idx > -1){
                arrays[idx]["select"] = selects
                console.log("arrays after selects정보 삽입 - getSelects", arrays)
               }  
          }
        }
      );
      });
    })
  }
  })
}

//값 가져오기
  getValues(table_id, date){ 
    // 값이 없는 경우는 비우기 위해서 먼서 값 비움
    this.state.column.map(( item, key ) =>
    {      
      console.log("column, value(this.state.column) check - getValues", item.column +"|"+ this.state[item.column])  
      // checkbox인 경우에 undefined인 경우 false를 삽입한다.
        this.setState({[item.column]:undefined})
      })
             

    //일단 모든 값 제거
   for(var j=0; j<arrays.length; j++){
    arrays[j]["value"] = ""
   }
   
   //삭제된 컬럼 배열 비우기
   arrays_removed.length = 0 
   const initialLoading = this.state.initialLoading
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
         //  값이 있는 경우에 색상과 readonly setState
         var column, value
           if (len > 0) { 
             setColor('#CEF6F5') 
             if(showUpdate){
               setValue('readonly', false)
             }else{
             setValue('readonly', true)
             }
             for(var i=0; i<results.rows.length; i++){
           
               column = results.rows.item(i).column_name 
               value = results.rows.item(i).column_value
            
             //  setValue(column, value) // 수정때문에 필요하다.
               console.log("column, value - getValues", column+"|"+value)
               
               // arrays의 컬럼이름에 해당하는 것이 value값 삽입
               const itemToFind = arrays.find(function(item) {return item.title === column}) 
               const idx = arrays.indexOf(itemToFind)           
               if(idx > -1){
                arrays[idx]["value"] = value
                console.log("arrays after value값 삽입 - getValues", arrays)
               }else{
                 // 컬럼이 없는 경우, 즉 삭제된 경우에는 따로 arrays_removed에 값을 삽입해서 보여주도록 함.
                 console.log("removed column get - getValues", column +"|"+ value)
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
                // 만약 arrays_removed 배열에 중복값이 있는 경우 중복 제거
                arrays_removed = arrays_removed.filter(obj => !uniq[obj.title] && (uniq[obj.title] = true));            
               }
               
               console.log("arrays_removed 결과값 - getValues",  arrays_removed)
             } 
             // 모두 가져온 뒤에 dataExist setState()
             Exist(true)
             if(initialLoading ){
              setValue("initialLoading", false)
             }
             
           }else{  
              // 값이 없는 경우에는 색상, readonly, dataExist setState()
               setColor('#ECF8E0')       
               setValue('readonly', false)    
               Exist(false)
               if(initialLoading ){
                setValue("initialLoading", false)
               }
           }
         }
       )
     })
   });
 }

 
 
 // 해당 월에 해당되는 points 모두 가져오기
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
              console.log('get all RecordDates - getAllPoints', RecordDates)
                          
          } else {                  
            console.log('no value - getAllPoints')        
            // records setState() 비우기
            setRecords([])
          }
        }
      );
    });  
  }

// getAllPoints 에서 값 있는 경우
recordFunc = (RecordDates) => {
  console.log("recordFunc")
  // reduce -> 배열에서 중복되는 것을 빼준후에 값을 변경해서 삽입해준다. date -> date, dots
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
 console.log("recordsDates변형 - recordFunc",RecordDates)
 //records setState()함
 this.setState({records: RecordDates})
  }


  // **************************** 이벤트 ************************************
  // table이름 변경시에
  Go(value){     
    if(value == "add table"){      
      this.props.navigation.navigate("AddtableScreen")
      }else{
        try {
          // asynstorage에서 세팅하고 다시 getTableDB
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
  
  // 새로 로딩되는 경우에
  setChange(){ 
    // 테이블 add된 경우 add된 테이블에 대한 정보를 가져옴
    const { params } = this.props.navigation.state;
    if(params != null){
      console.log("navigation params existed : ",params.otherParam)    
      if(params.otherParam == "fromAddtable" || params.otherParam == "fromUpdatetable" ){
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
  }

  

  // insertValue 이벤트
  InsertValue(date){
    Keyboard.dismiss()
    console.log("columns - InsertValue",this.state.column)
    if(this.state.column !== undefined){    
    var arrays = new Array()
      this.state.column.map(( item, key ) =>
    {      
      console.log("column, value(this.state.column) check - InsertValue", item.column +"|"+ this.state[item.column])  
      // checkbox인 경우에 undefined인 경우 false를 삽입한다.
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
    // 값이 undefined이거나 비어있는 경우에는 채우라는 표시를 넣는다.
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

  // 테이블에 값을 삽입
  InsertValueToTable(table_id, date, array_column){
    const setReadOnly = (_var) => this.setState({readonly: _var})
    const setExist = (_var) => this.setState({dataExist: _var})    
    const setColor = (_var) => this.setState({backColor:_var})
    const setPoints = (_var) => this.setState({records:_var})
    console.log("id, date - InsertValueToTable", table_id +"|"+ date);
    console.log("column - InsertValueToTable", array_column)
    
    var data = this.state.records

    var arrays = new Array()
    var add = ''
    // 컬럼을 하나씩 꺼내서 value 값을 가져와서 삽입
    array_column.map(( item ) =>
        {
          arrays.push(table_id, date, item.column, item.value )
          add = add+"(?,?,?,?),"  
        }  
    )
  
    add = add.substr(0, add.length -1);
    console.log("삽입 arrays - InsertValueToTable",arrays)
    console.log("삽입 add - InsertValueToTable",add)
    db.transaction(function(tx) {
      tx.executeSql(
        'INSERT INTO valueinfo (table_id, record_date, column_name, column_value) VALUES '+add,
        arrays,
        (tx, results) => {                            
          if (results.rowsAffected > 0) {
            console.log('value insert : ', "success") 
            alert("data inserted")
            // 데이터 삽입후에 readonly, dataExist, color 변경, 그리고 getAllpoints로 삽입한 값도 점보이게
            setReadOnly(true)
            setExist(true)
            setColor('#CEF6F5')
           // 오늘날짜 삽입
            data.push({
              date:date,
              dots: [
                  {
                  color: "#01579b",
                  selectedDotColor: "#01579b",
                  }
              ],
           })
           console.log("data - InsertValueToTable", data)
           setPoints(data)
          } else {
            console.log('value insert : ', "failed")
          }
        }
      )
    });  

  }

  
  // edit value 누르면 values 가져오는 이벤트 - 각 column value setState() 를 위해서 필요 // 그냥 값을 가져올때는 setState할 필요없게 하기 위해
 getValuesForUpdate(table_id, date){ 

  var y = date.substr(0,4),
  m = date.substr(5,2)-1,
  d = date.substr(8,2);
  var selected = new Date(y,m,d);
 // alert(selected)
  this.setState({blacklist:[{ 
    start: new Date().setDate(selected.getDate()-1000),
    end: new Date().setDate(selected.getDate() -1)
  }, { 
    start: new Date().setDate(selected.getDate()+1),
    end: new Date().setDate(selected.getDate() +1000)
  }]})

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
            for(var i=0; i<results.rows.length; i++){
              column = results.rows.item(i).column_name
              value = results.rows.item(i).column_value
              console.log("column, value - getValuesForupdate", column+"|"+value)
              setValue(column, value) // 수정때문에 필요하다
            } 
          }else{ 
          }
        }
      )
    })
  });
}

// update할때 이벤트
  UpdateValue(date){
    Keyboard.dismiss()
    const table_id = this.state.table_id
    //  columns = this.state.column
     // console.log("columns",this.state.column)
      if(this.state.column !== undefined){                 
      var arrays = new Array()
        this.state.column.map(( item, key ) =>
       { 
          arrays.push({
            column : item.column,
            value :  this.state[item.column]
          })             

       })  
       
      console.log("updated arrays - UpdateValue", arrays)
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

  // 테이블 값 업데이트하기
  UpdateValueToTable(table_id,date,array_column){    
    const setReadOnly = (_var) => this.setState({readonly: _var})
    const setUpdate = (_var) => this.setState({showUpdate: _var})
  
    // 컬럼하나씩 꺼내서 값을 삽입 혹은 수정
    array_column.map(( item ) =>
        {
          db.transaction(function(tx) {
            tx.executeSql(
              'SELECT * FROM valueinfo WHERE table_id =? and column_name=? and record_date =?',
              [table_id, item.column, date],
              (tx, results) => {                            
                var len = results.rows.length;
                //  값이 있는 경우에는 update, 없는 경우에는 insert - 새로 컬럼을 만드는 경우에 insert가 필요하다.
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

    // 삭제된컬럼 값 수정
    if(arrays_removed.length !== 0){
      var columns_removed = new Array()
      console.log("arrays_removed - UpdateValueToTable", arrays_removed)
      arrays_removed.map(( item ) =>
      {
        columns_removed.push(item.title)
      }  
      )
      // 컬럼만으로 배열 다시 만든다
      console.log("removed column array - UpdateValueToTable", columns_removed)
  
      var arrays_ = new Array()
      var add_ = ''
      //삭제된 컬럼을 하나씩 꺼내서 값을 수정한다.
      columns_removed.map(( item, key ) =>
      {      
        arrays_.push(item, this.state[item] )
        add_ = add_+"WHEN ? THEN ? "        
      })
     
      arrays_.push(table_id, date)
      console.log("removed_array 값수정 arrays - UpdateValueToTable", arrays_)
      console.log("removed_array 값수정 add - UpdateValueToTable", add_)
      db.transaction(function(tx) {
        tx.executeSql(
          'UPDATE valueinfo SET column_value = CASE column_name '+add_+' ELSE column_value END WHERE table_id =? and record_date =?',
          arrays_,
          (tx, results) => {                            
            if (results.rowsAffected > 0) {
              console.log('value update : ', "success") 
             // alert("data updated")
             // 수정이 성공하면 showUpdate, readonly setState함.
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


  // 달력관련이벤트 - 날짜선택시 getvalues
  onDateSelect(date){
    Keyboard.dismiss()
    if(this.state.showUpdate) {
      alert("please update values!")
    }else{
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
    
  }

// 달력관련이벤트 - 화살표 전후 선택시
  onWeekendSelect(date){
    if(this.state.showUpdate) {
      alert("please update values!")
    }else{
    //  var date = date.setDate(date.getDate() + 3)
      console.log("selected - onWeekendSelect")
      date.setDate(date.getDate() + 6)
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
  }

  // swipe event
  onSwipe(gestureName, gestureState) {
    var date = this.state.selectedDate
    // 선택된 날짜를 가져옴.
    var y = date.substr(0,4),
    m = date.substr(5,2) -1,
    d = date.substr(8,2);
    var D = new Date(y,m,d);
    console.log("date 형식변경 - onSwipe",  D)
    const {SWIPE_UP, SWIPE_DOWN, SWIPE_LEFT, SWIPE_RIGHT} = swipeDirections;
    this.setState({gestureName: gestureName});
    switch (gestureName) {
      case SWIPE_UP:
       // this.setState({backgroundColor: 'red'});
        break;
      case SWIPE_DOWN:
       // this.setState({backgroundColor: 'green'});
        break;
      case SWIPE_LEFT:
        // 왼쪽으로 움직일경우 날짜 하루더한 뒤에 그날짜 선택이벤트, 일요일인 경우에 updateWeekView
        if(this.state.showUpdate) {
         // alert("please update values!")
        }else{
          D.setDate(D.getDate() + 1)
          if(new Date() < D){
            // 오늘날짜 이후일경우는 움직이지 않게!
          }else{
            if (this.calendar !== null) {
              this.calendar.setSelectedDate(D)	
            //  console.log(D.getDay())
            if(D.getDay() ==6){
                this.calendar.updateWeekView
              }
            }
          }
          
      //  
      }
        break;
      case SWIPE_RIGHT:
        // 오른쪽으로 움직일경우 날짜 하루 뺀 뒤에 그날짜 선택이벤트, 월요일인 경우에 updateWeekView
        if(this.state.showUpdate) {
        //  alert("please update values!")
        }else{
          D.setDate(D.getDate() - 1)
          if (this.calendar !== null) {
            this.calendar.setSelectedDate(D)	
            if(D.getDay() == 0){
              this.calendar.updateWeekView
            }
          }
        }
        break;
    }
  }
    
  render() {
    return (
      <View style={{flex:1}}>
      <View style={this.state.initialLoading ? styles.loadingContainer : {display:'none'}}>
      <ActivityIndicator
        animating
        size="large"
        color="#C8C8C8"
        {...this.props}
      />      
    </View>
      
      <GestureRecognizer
      onSwipe={(direction, state) => this.onSwipe(direction, state)}
      config={{
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80
      }}
      style={!this.state.initialLoading ? {flex:1} : {display:'none'}}> 
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
              }}
              style={pickerSelectStyles}
              value={this.state.table}
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
            onPress={() => {this.props.navigation.navigate("StatisticsScreen", {otherParam: this.state.table_id})}} // insertComment
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
        onDateSelected={this.state.showUpdate ? null : (date)=>this.onDateSelect(date._d)}
        markedDates={ this.state.records }
        datesBlacklist={this.state.blacklist}
        markedDatesStyle={{position:'absolute'}}
        onWeekChanged={this.state.showUpdate ? null : (date)=>this.onWeekendSelect(date._d)}
        style={{height:100, paddingTop: 0, paddingBottom: 10}}
      //  style={!this.state.dataExist ? {height:100, paddingTop: 0, paddingBottom: 10, backgroundColor:"#298A08"} : this.state.showUpdate ? {height:100, paddingTop: 0, paddingBottom: 10, backgroundColor:"#01579b"}: {height:100, paddingTop: 0, paddingBottom: 10} }
      />
        <Text style={this.state.table == undefined ? {} : {display:'none'}}>Please add table</Text>
        <View style={!this.state.dataExist ? {flex:1, borderWidth:10, borderColor:"#298A08"} : this.state.showUpdate ? {flex:1, borderWidth:10, borderColor:"#01579b"}: {flex:1} }>
        <CustomListview
          tableName={this.state.table}
          itemList={arrays}
          date={this.state.selectedDate}
          readonly={this.state.readonly}
          showUpdate={this.state.showUpdate}
          onChange = {(title, value) => this.setState({[title]:value}) }         
        />
        </View>
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
          add values
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
        activeOpacity = {0.9}        
        style={this.state.dataExist && !this.state.showUpdate ? [styles.Button, {marginTop:30}] : {display:'none'}}
        onPress={()=> [this.setState({readonly: false, showUpdate: true}),  this.getValuesForUpdate(this.state.table_id, this.state.selectedDate)]} 
        >         
          <Text style={!this.state.showUpdate ? {color:"#fff", textAlign:'center'} : {display:'none'}}>
          edit values
          </Text>
          </TouchableOpacity>

        <TouchableOpacity 
        activeOpacity = {0.9}        
        style={this.state.dataExist && this.state.showUpdate ? styles.Button : {display:'none'}}
        onPress={()=> [this.UpdateValue(this.state.selectedDate), this.setState({blacklist:[{ 
          start: new Date().setDate(new Date().getDate() +1),
          end: new Date().setDate(new Date().getDate() +1000)
        }]})]} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
          update values
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
      </ScrollView>
      
      </GestureRecognizer>
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
  alignItems:'center',
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
  width:'100%'
},
loadingContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  flex: 1,
  marginTop: 0,
  paddingTop: 20,
  marginBottom: 0,
  marginHorizontal: 0,
  paddingHorizontal: 10
}
 
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