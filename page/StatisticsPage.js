// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Button, Dimensions,ScrollView  } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage'
import DatePicker from 'react-native-datepicker'
import Icon from 'react-native-vector-icons/Entypo';
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
    var date_mon = new Date();
    var day = date_mon.getDay(),
        diff = date_mon.getDate() - day + 1
    var monday = new Date(date_mon.setDate(diff));
    monday = this.getDateFormat(monday)
    this.state = {startdate:"", enddate: "", numberArray: [], 
    chartArray: [], duration:"이번주", thisMonday: monday 
    }
}
componentWillMount(){
    const { params } = this.props.navigation.state;
    if(params != null){
      console.log("navigation params existed : ",params.otherParam)     
    // alert(params.otherParam)
    
   
      this.setState({table_id: params.otherParam})
      const getDateFormat = (_var) => this.getDateFormat(_var)
      const getValuesafterSet = (_var1, _var2, _var3) =>  this.getValuesafterSet(_var1, _var2, _var3)  
      const getSelects = (_var1, _var2, _var3) => this.getSelects(_var1, _var2, _var3)
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
                  getSelects(params.otherParam, tableArray, column_name)      
              }else if(column_type === "good/bad"){
                  tableArray.push({column: column_name, type: column_type, info: new Array(), goodCount:0, badCount:0})
              }else if(column_type === "check box"){
                tableArray.push({column: column_name, type: column_type, info: new Array(), checkCount:0, uncheckCount:0})
              }else{
                tableArray.push({column: column_name, type: column_type, info: new Array()})
              }    
              if(i == results.rows.length -1 ){
                setState("tableArray", tableArray)      
              }
            }
            console.log(tableArray)
           
            
        
          }
        })
        })
    }
}

getDateFormat(date){
  month = '' + (date.getMonth() + 1);
  day = '' + date.getDate();
  year = date.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  
  return  [year, month, day].join('-') 
}
getSelects(table_id, tableArray, column_name){
    const getToday = (_var1) =>  this.getToday();
    db.transaction(tx => {
      db.transaction(function(tx) { 
      tx.executeSql(
        'SELECT * FROM selectinfo where table_id = ? AND column_name=?',
        [table_id, column_name],
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
              if(i == results.rows.length -1){
                console.log("getselects",selects)
                const itemToFind = tableArray.find(function(item) {return item.column === column}) 
                const idx = tableArray.indexOf(itemToFind)           
                if(idx > -1){
                 tableArray[idx]["select"] = selects
                 console.log(tableArray)
                 getToday("")
                } 
              }
            }       
          }        
        }
      );
      });
    })
  
  



}

getToday(){
  console.log("getToday", this.state.tableArray )
    // 이번주 값을 기본으로 가져옴
    //월요일, 일요일 찾기
    var date_mon = new Date();
    var day = date_mon.getDay(),
        diff = date_mon.getDate() - day + 1// + (day == 0 ? -7:0); // adjust when day is sunday
    
    // 이번주 월요일 찾아서 일주일 계산
    var monday = new Date(date_mon.setDate(diff));
    var sunday = new Date()
    sunday.setDate(monday.getDate() +6); 
    monday = this.getDateFormat(monday)
    sunday = this.getDateFormat(sunday)
    console.log(monday + sunday)
    this.setState({startdate_: monday, enddate_: sunday, startdate: monday, enddate: sunday})
    this.getValues(this.state.table_id, monday , sunday)
}

getValuesPreviousWeek(table_id, startdate, enddate){
 
  var y = startdate.substr(0,4),
  m = startdate.substr(5,2)-1,
  d = startdate.substr(8,2);
  var start = new Date(y,m,d);

  var y_ = enddate.substr(0,4),
  m_ = enddate.substr(5,2)-1,
  d_ = enddate.substr(8,2);
  var end = new Date(y_,m_,d_);
  start.setDate(start.getDate() -7); 
  end.setDate(end.getDate() -7); 

  start = this.getDateFormat(start)
  end = this.getDateFormat(end)

  if(this.state.thisMonday == start){
    this.setState({startdate_: start, enddate_: end, startdate: start, enddate: end, duration:"이번주"})
  }else{
    this.setState({startdate_: start, enddate_: end, startdate: start, enddate: end, duration:start+"~"+end})
  }
  

  console.log("previous", start + end)
  this.getValues(table_id, start, end)
}
getValuesNextWeek(table_id, startdate, enddate){

  var y = startdate.substr(0,4),
  m = startdate.substr(5,2)-1,
  d = startdate.substr(8,2);
  var start = new Date(y,m,d);

  var y_ = enddate.substr(0,4),
  m_ = enddate.substr(5,2)-1,
  d_ = enddate.substr(8,2);
  var end = new Date(y_,m_,d_);
  start.setDate(start.getDate() +7); 
  end.setDate(end.getDate() +7); 

  start = this.getDateFormat(start)
  end = this.getDateFormat(end)

  if(this.state.thisMonday == start){
    this.setState({startdate_: start, enddate_: end, startdate: start, enddate: end, duration:"이번주"})
  }else{
    this.setState({startdate_: start, enddate_: end, startdate: start, enddate: end, duration:start+"~"+end})
  }
  this.getValues(table_id, start, end)
}


getValues(table_id, startdate, enddate){   
    var tableArray = new Array()
    tableArray = this.state.tableArray
    console.log("getValues = tableArray", tableArray)
    for(var j=0; j<tableArray.length; j++){
        tableArray[j]["info"] = []
     //   tableArray[j]["select"]["count"] = []
     if( tableArray[j].type == "good/bad"){
        tableArray[j]["goodCount"] = 0
        tableArray[j]["badCount"] = 0
      }else if(tableArray[j].type == "check box"){
        tableArray[j]["checkCount"] = 0
        tableArray[j]["uncheckCount"] = 0
      }else if( tableArray[j].type == "select"){
          for(var i=0; i<tableArray[j]["select"].length; i++){
              tableArray[j]["select"][i]["count"] = 0
          }
        }
       }
       console.log("selecttable",tableArray[0]["select"])
  //  alert(startdate + enddate)
  const getStatistics = (_var) => this.getStatistics(_var)
  const setState = (_var1, _var2) => this.setState({[_var1]: _var2})
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
                setState("numberArray", []) 
                setState("chartArray", [])
              }
            });
          });
}


getStatistics(tableArray){
    console.log("get", tableArray)
    //숫자부터 가져와 보자.
    var numberArray = new Array()
    var numberTitle = new Array()
    var chartArray = new Array()
    tableArray.map(( item, key ) =>
    {        
        if(item.type == "number"){
            console.log(item.column)
            console.log(item.info)
            var info = item.info
            
            // 사이에 모든 날짜 가져오기
         /*   var dateArray = new Array();
            var y = this.state.startdate.substr(0,4),
            m = this.state.startdate.substr(5,2)-1,
            d = this.state.startdate.substr(8,2);
            var start = new Date(y,m,d);
            var y_ = this.state.enddate.substr(0,4),
            m_ = this.state.enddate.substr(5,2)-1,
            d_ = this.state.enddate.substr(8,2);
            var end = new Date(y_,m_,d_);
            var date, month, day, year;
            while (start <= end) {
              date = new Date (start);
              month = '' + (date.getMonth() + 1);
              day = '' + date.getDate();
              year = date.getFullYear();

              if (month.length < 2) month = '0' + month;
              if (day.length < 2) day = '0' + day;
              
                dateArray.push( [year, month, day].join('-') )
                console.log(start)
                start.setDate(start.getDate() +1); 
            }
            console.log("@@@date@@@", dateArray)
            
            var labels = new Array()
            var datas = new Array()
            info.map(( item, key ) =>
            {   
               // labels.push(item.date)
               if(dateArray.indexOf(item.date) == -1){
        
               }else{
                datas.push(item.value)
               }
                
            }) */
            var labels = new Array()
            var datas = new Array()
            info.map(( item, key ) =>
            {   
                labels.push(item.date.substr(8,2))
                datas.push(item.value)       
                
            })
            if(labels.length  > 1){
              var data = {
                labels: labels,
                datasets: [{
                  data: datas ,
                  color: (opacity = 1) => `rgba(0,0,0, ${opacity})`, // optional
                  strokeWidth: 2 // optional
                }]
              }              
            numberTitle.push(item.column)       
            numberArray.push(data)
            console.log(data)
            }
           

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
            var sum =0
            values.map(( item_, key ) =>
            { 
              sum = sum + item_
            })
            if(sum  > 1){
              var data = {
                labels: [item.column],
                legend: selects,
                data: [
                    values
                ],
                barColors: ['#dfe4ea', '#ced6e0', '#a4b0be'],
               }
               chartArray.push(data)
               console.log(data) 
            }
            
        }else if(item.type == "good/bad"){
          
          item.info.map(( item_, key ) =>
          { 
              console.log(item_.value) 
              if(item_.value == "good"){
                item.goodCount = item.goodCount + 1
              }else if(item_.value == "bad"){
                item.badCount = item.badCount + 1
              }         
                             
          })
          console.log("result", item.goodCount)
          if(item.goodCount + item.badCount  > 1){
            var data = {
                labels: [item.column],
                legend: ["good", "bad"],
                data: [[item.goodCount, item.badCount]],
                barColors: ['#dfe4ea', '#ced6e0'],
              }
              chartArray.push(data)
              console.log(data) 
          }
      }else if(item.type == "check box"){
          
        item.info.map(( item_, key ) =>
        { 
            console.log(item_.value) 
            if(item_.value == "1"){
              item.checkCount = item.checkCount + 1
            }else if(item_.value == "0"){
              item.uncheckCount = item.uncheckCount + 1
            }         
                           
        })
        console.log("result", item.checkCount)
        if(item.checkCount + item.uncheckCount  > 1){
          var data = {
              labels: [item.column],
              legend: ["checked", "unchecked"],
              data: [[item.checkCount, item.uncheckCount]],
              barColors: ['#dfe4ea', '#ced6e0'],
            }
            chartArray.push(data)
            console.log(data) 
        }
    }
    })      
    
    this.setState({numberArray:numberArray, chartArray: chartArray, numberTitle: numberTitle}) 
}

  render() {


    const chartConfig = {
        //backgroundColor: "#fff"
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: (opacity = 0.5) => `rgba(0,0,0, ${opacity})`,
        fontColor: "#000",
        strokeWidth: 2, // optional, default 3
        style: {
            color:"#000",
            textSize:17,
            fontColor: "#000",
            textColor:"#000"
          }
      }
    const screenWidth = Dimensions.get('window').width
    let numArray;
    if(this.state.numberArray.length !== 0){ 
    numArray = this.state.numberArray.map(( item, key ) =>
    { 
          return (
          <View style={{color:"#000"}}>         
          <LineChart
          key={key}
          data={item}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
        />
         <Text style={{textAlign:"center", fontSize:16}}>[ {this.state.numberTitle[key]} ]</Text>
        </View>)
        
    })
  }

  let chrtArray;
    if(this.state.chartArray.length !== 0){ 
      console.log(this.state.chartArray)
    chrtArray = this.state.chartArray.map(( item, key ) =>
    { 
      return (
        <StackedBarChart
         key={key}
        style={{color:"#000"}}
        data={item}
        width={screenWidth}
        height={220}
        chartConfig={chartConfig}
        />)
    
    })
  }
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
        <ScrollView style={{ flex: 1}}>
      
      <View style={{flexDirection: "row", flex:1, flexWrap: 'wrap'}}>
      <View style={{flexDirection: "column", flexWrap: 'wrap', width: '10%', float:'left'}}>
        <TouchableOpacity 
          activeOpacity = {0.9}
          onPress={()=> this.getValuesPreviousWeek(this.state.table_id, this.state.startdate, this.state.enddate)} // insertComment
          >      
          <Icon name={'chevron-thin-left'} size={30} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
          </TouchableOpacity>
      </View>
      <View style={{flexDirection: "column", flexWrap: 'wrap', width: '80%', float:'center'}}>
        <Text style={{textAlign:"center", fontSize:17, marginTop:10}}>{this.state.duration}</Text>
      </View>
      <View style={{flexDirection: "column", flexWrap: 'wrap', width: '10%', float:'right'}}>
        <TouchableOpacity 
          activeOpacity = {0.9}
          onPress={()=> this.getValuesNextWeek(this.state.table_id, this.state.startdate, this.state.enddate)} // insertComment
          >      
          <Icon name={'chevron-thin-right'} size={30} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
          </TouchableOpacity>
      </View>
      </View>
      <View style={{flexDirection: "row", flex:1, flexWrap: 'wrap'}}>
      <View style={{flexDirection: "column", flexWrap: 'wrap', width: '40%', float:'left'}}>
      <DatePicker
    //    style={{width: 200}}
        date={this.state.startdate_}
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
        onDateChange={(date) => {this.setState({startdate_: date})}}
      />
      </View>
      <View style={{flexDirection: "column", flexWrap: 'wrap', width: '40%', float:'left'}}>
        <DatePicker
        //style={{width: 200}}
        date={this.state.enddate_}
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
        onDateChange={(date) => {this.setState({enddate_: date})}}
      />
      </View>
        <View style={{flexDirection: "column", flexWrap: 'wrap', width: '20%', float:'left'}}>                
        <TouchableOpacity 
        activeOpacity = {0.9}
        style={styles.Button}
        onPress={()=> this.getValues(this.state.table_id, this.state.startdate_, this.state.enddate_)} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
            get
          </Text>
        </TouchableOpacity>
      </View>
      </View>
      
      {
       numArray
       }
      {
       chrtArray
       }
      <Text style={this.state.numberArray.length == 0 && this.state.chartArray.length == 0 ? {} : {display:"none"}}>data is empty or one</Text>
       </ScrollView>      
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