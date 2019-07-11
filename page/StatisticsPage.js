// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Button, Dimensions  } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage'
import DatePicker from 'react-native-datepicker'
import {
    LineChart,
    BarChart,
    PieChart,
    ProgressChart,
    ContributionGraph,
    StackedBarChart
  } from 'react-native-chart-kit'
var db = openDatabase({ name: 'TableDatabase.db' })


export default class StatisticsPage extends React.Component {

constructor(props){
    super(props);
    this.state = {startdate:"", enddate: "", numberdata: {
        labels: ["1"],
        datasets: [{
          data: [0] ,
          color: (opacity = 1) => `rgba(7, 82, 33, ${opacity})`, // optional
          strokeWidth: 2 // optional
        }]
      }, 
    chartdata: {
        labels: ['Test1'],
        legend: ['L1', 'L2', 'L3'],
        data: [
          [60, 60, 60]
        ],
        barColors: ['#dfe4ea', '#ced6e0', '#a4b0be'],
       }
    }
}
componentWillMount(){
    const { params } = this.props.navigation.state;
    if(params != null){
      console.log("navigation params existed : ",params.otherParam)     
    // alert(params.otherParam)
      this.setState({table_id: params.otherParam})

      const getSelects = (table_id, columns) => this.getSelects(table_id, columns)
      const setState = (_var1, _var2) => this.setState({[_var1]: _var2})
      db.transaction(tx => {
        tx.executeSql(
        'SELECT * FROM typeinfo where table_id = ? ORDER BY ABS(column_order)',
        [params.otherParam],
        (tx, results) => {
          var len = results.rows.length;
        //  값이 있는 경우에 
          if (len > 0) {
            const tableArray = new Array() 
            var column_name, column_type;
            this.index = results.rows.length
            for(var i=0; i<results.rows.length; i++){
            column_name = results.rows.item(i).column_name   
            column_type = results.rows.item(i).column_type
            if(column_type === "select"){
                tableArray.push({column: column_name, type: column_type, info: new Array(), select:[]})
            }else{
                tableArray.push({column: column_name, type: column_type, info: new Array()})
            } 
            getSelects(params.otherParam, tableArray)         
            
            }
            console.log(tableArray)
            setState("tableArray", tableArray)
          }
        })
        })
    }
}

getSelects(table_id, tableArray){
    const setState = (_var1, _var2) => this.setState({[_var1]: _var2})
    tableArray.map(( item, key ) =>
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
              selects.push({name:select_val, count: 0})
            } 
            console.log("getselects",selects)
            const itemToFind = tableArray.find(function(item) {return item.column === column}) 
               const idx = tableArray.indexOf(itemToFind)           
               if(idx > -1){
                tableArray[idx]["select"] = selects
                console.log(tableArray)
               }
               setState("tableArray", tableArray )

            
          }
        }
      );
      });
    })
  }
  })
}

getValues(table_id, startdate, enddate){
   
    var tableArray = new Array()
    tableArray = this.state.tableArray
    for(var j=0; j<tableArray.length; j++){
        tableArray[j]["info"] = []
       }
  //  alert(startdate + enddate)
  const getStatistics = (_var) => this.getStatistics(_var)
    db.transaction(function(tx) {
        tx.executeSql(
          'SELECT * FROM valueinfo WHERE table_id =? AND record_date between ? and ? order by datetime(record_date) asc',
          [table_id, startdate, enddate],
          (tx, results) => {                            
            var len = results.rows.length;
            var column_name;
            var column_value;
            var column_date;
            //  값이 있는 경우에 
              if (len > 0) {
                for(var i=0; i<results.rows.length; i++){
                column_name = results.rows.item(i).column_name   
                column_value = results.rows.item(i).column_value     
                column_date = results.rows.item(i).record_date  
                console.log(column_name + "|" + column_value +"|"+ column_date)           
                const itemToFind = tableArray.find(function(item) {return item.column === column_name}) 
                const idx =  tableArray.indexOf(itemToFind)           
                    if(idx > -1){
                    var array = tableArray[idx]["info"]
                    array.push({date: column_date, value: column_value})
                    }              
                }
                getStatistics(tableArray)
              }else{
              }
            });
          });
}


getStatistics(tableArray){
    console.log("get", tableArray)
    //숫자부터 가져와 보자.
    tableArray.map(( item, key ) =>
    {        
        if(item.type == "number"){
            console.log(item.column)
            console.log(item.info)
            var info = item.info
            
            
            var labels = new Array()
            var datas = new Array()
            info.map(( item, key ) =>
            {   
                labels.push(item.date)
                datas.push(item.value)
            })
            var data = {
                labels: labels,
                datasets: [{
                  data: datas ,
                  color: (opacity = 1) => `rgba(7, 82, 33, ${opacity})`, // optional
                  strokeWidth: 2 // optional
                }]
              }
            this.setState({numberdata:data})
            console.log(data)
        }else if(item.type == "select"){
            console.log("selects", item.select)
            console.log("item.info",item.info)

            item.info.map(( item_, key ) =>
            { 
                console.log(item_.value) 
                const itemToFind = item.select.find(function(item) {return item.name === item_.value}) 
                const idx = item.select.indexOf(itemToFind)           
                    if(idx > -1){
                        console.log("!!!!!!")
                        item.select[idx]["count"] = item.select[idx]["count"] + 1
                    }              
                               
            })
            console.log("result", item.select)
            
            var selects = new Array()
            var values = new Array()
            item.select.map(( item_, key ) =>
            { 
                selects.push(item_.name)          
                values.push(item_.count)
                               
            })
            console.log(selects)
            console.log(values)
            var data = {
                labels: [item.column],
                legend: selects,
                data: [
                    values
                ],
                barColors: ['#dfe4ea', '#ced6e0', '#a4b0be'],
               }
               this.setState({chartdata:data})
               console.log(data) 
        }
    })       
}

  render() {
    const chartConfig = {
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#dfe4ea',
        color: (opacity = 1) => `rgba(3, 105, 56, ${opacity})`,
        strokeWidth: 2, // optional, default 3
        style: {
            color:"#000",
            textSize:17
          }
      }
    const screenWidth = Dimensions.get('window').width
   
    return (
        <View style={{ flex: 1}}>
        <TouchableOpacity
              activeOpacity = {0.9}
              style={{backgroundColor: '#01579b', padding: 10}}
              onPress={() =>  this.props.navigation.navigate("TodayScreen")} 
              >
              <Text style={{color:"#FFF", textAlign:'left'}}>
                  {"<"} BACK
              </Text>
          </TouchableOpacity>  
        <Text>DIY Daily Report</Text>  
        <DatePicker
        style={{width: 200}}
        date={this.state.startdate}
        mode="date"
        placeholder="select date"
        format="YYYY-MM-DD"
       // minDate="2016-05-01"
      //  maxDate="2016-06-01"
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        customStyles={{
          dateIcon: {
            position: 'absolute',
            left: 0,
            top: 4,
            marginLeft: 0
          },
          dateInput: {
            marginLeft: 36
          }
          // ... You can check the source to find the other keys.
        }}
        onDateChange={(date) => {this.setState({startdate: date})}}
      />
        <DatePicker
        style={{width: 200}}
        date={this.state.enddate}
        mode="date"
        placeholder="select date"
        format="YYYY-MM-DD"
        //minDate="2016-05-01"
      //  maxDate="2016-06-01"
        confirmBtnText="Confirm"
        cancelBtnText="Cancel"
        customStyles={{
          dateIcon: {
            position: 'absolute',
            left: 0,
            top: 4,
            marginLeft: 0
          },
          dateInput: {
            marginLeft: 36
          }
          // ... You can check the source to find the other keys.
        }}
        onDateChange={(date) => {this.setState({enddate: date})}}
      />
        <View style={{width:'100%', marginTop:-10, marginBottom: 15, padding:10}}>                
        <TouchableOpacity 
        activeOpacity = {0.9}
        style={styles.Button}
        onPress={()=> this.getValues(this.state.table_id, this.state.startdate, this.state.enddate)} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
            get Statistics
          </Text>
        </TouchableOpacity>
      </View>
      <LineChart
        data={this.state.numberdata}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        bezier
      />

        <StackedBarChart
        style={{color:"#000"}}
        data={this.state.chartdata}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        />
                
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