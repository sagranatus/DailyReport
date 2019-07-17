// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Button,KeyboardAvoidingView,Animated, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { openDatabase } from 'react-native-sqlite-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icon from 'react-native-vector-icons/EvilIcons';
import RNPickerSelect from 'react-native-picker-select';
import DraggableFlatList from 'react-native-draggable-flatlist'
var db = openDatabase({ name: 'TableDatabase.db' })

var array = new Array()
const select = [
  {
      label: 'check box',
      value: 'check box'
  },
  {
      label: 'text',
      value: 'text'
  },
  {
    label: 'description',
    value: 'description'
},
{
  label: 'select',
  value: 'select'
},
{
  label: 'number',
  value: 'number'
},
];
const placeholder = {
  label: 'Select Types',
  value: null,
  color: '#9EA0A4',
};

export default class AddtablePage extends React.Component {

constructor(props) {
    super(props);
    this.state={ table: undefined,
                 table_name: undefined
                }
    this.state = { valueArray: [], data:[], disabled: false ,  scrollOffset: 0 }

    this.index = 0;

    this.animatedValue = new Animated.Value(0);

    this.InsertTable = this.InsertTable.bind(this);
    this.InsertTypes = this.InsertTypes.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.AddColumn = this.AddColumn.bind(this)
}

componentWillMount(){
 
}

// type을 select로 선택하는 경우에 select하는 부분 보이기
onSelect(_type, selected, index){
 // alert(selected+_type)
 this.setState({[_type]: selected})
  if(selected == 'select'){
    this.setState({['select'+index]:true})
  }else{
    this.setState({['select'+index]:false})
  }
}

// addcolumn 이벤트
AddColumn = (index) =>
{  
   // this.state.valueArray와 this.state.data를 수정함.
  this.animatedValue.setValue(0);

  let newlyAddedValue = { index: this.index }
  var tableArray = [ ...this.state.valueArray, newlyAddedValue ]
  var data = this.state.data
   data.push({
    key: `item-${this.index}`,
    label:this.index,
    backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${index * 5}, ${132})`,
  })
  console.log("data - AddColumn", data)

  this.setState({ disabled: true, valueArray: tableArray, data: data }, () =>
  {
      Animated.timing(
          this.animatedValue,
          {
              toValue: 1,
              duration: 500,
              useNativeDriver: true
          }
      ).start(() =>
      {
          this.index = this.index + 1;
          this.setState({ disabled: false });
      }); 
  });       
}

// 컬럼삭제시 이벤트
RemoveColumn = (index) =>
{
  // this.state.valueArray와 this.state.data를 수정함.
  console.log("Index - RemoveColumn",index)
  //alert(this.state.valueArray)  
  var array = new Array()
  array = this.state.data
   

  const itemToFind = array.find(function(item) {return item.label === index}) 
  const idx = array.indexOf(itemToFind) 
  if (idx > -1) {
    array.splice(idx, 1)    
    
   // let select_all = 'selectall'+idx+'_val'
   // let _name =  'column'+idx+'_name'
   // let _type = 'column'+idx+'_type' 
  //  this.setState({[select_all]:[], [_name]:"", [_type]:""})
    console.log("data - RemoveColumn", idx +"|"+ array.length)
  }

  var array_ = new Array()
  array_ = this.state.valueArray
  const itemToFind_ = array_.find(function(item) {return item.index === index}) 
  const idx_ = array_.indexOf(itemToFind_) 
  if (idx_ > -1) {
    array_.splice(idx_, 1) 
  }
  console.log("valueArray - RemoveColumn",array_)
  this.setState({ valueArray: array_, data: array});          
}

checkColumn(){
 // alert(this.state.valueArray.length)
  console.log("valueArray - checkColumn", this.state.valueArray)
  console.log("data - checkColumn",this.state.data)

  var selects_undefined = false;
  var array_column = new Array()
  var array_select = new Array()
  // valueArray 하나씩 꺼낸다.
  this.state.valueArray.map(( item, key ) =>
      {           
           let select_val = 'select'+item.index+'_val'
           let select_all = 'selectall'+item.index+'_val'
           let _name =  'column'+item.index+'_name'
           let _type = 'column'+item.index+'_type'       
          console.log("get valueArray - checkColumn", this.state[_name] + this.state[_type])


           // column name과 위치 검색해서 array_column에 column, type, order값에 삽입.
          const itemToFind_ = this.state.data.find(function(item_) {return item_.label == item.index}) 
          const idx_ = this.state.data.indexOf(itemToFind_) 

          console.log("check order - checkColumn",item.index + "|" +   idx_)

          array_column.push({column:this.state[_name], type:this.state[_type], order:  idx_})
          if(this.state[_type] == 'select'){
            if(this.state[select_all] !== undefined && this.state[select_all].length !==0){              
              console.log( "check selects - checkColumn", this.state[_name] + this.state[select_all])
              var arrays = new Array()
              //arrays = this.state[select_val].split(',');
              arrays = this.state[select_all]
              //select의 경우에 array_select에 column, select값으로 삽입
              arrays.map(( item, key ) =>
               array_select.push({column:this.state[_name], select:item})
              )              
            }else{
              alert("add Selects!")
              selects_undefined = true
             // array_select.push({column:this.state[_name], select:this.state[select_val]})
            }
          }        
        
      })
    console.log("get columns array - checkColumn",array_column)
    console.log("get selects array - checkColumn",array_select)
    const itemToFind = array_column.find(function(item) {return item.column === undefined}) 
    const idx = array_column.indexOf(itemToFind) 

    const itemToFind4 = array_column.find(function(item) {return item.column == ""}) 
    const idx4 = array_column.indexOf(itemToFind4) 


    const itemToFind2 = array_column.find(function(item) {return item.type === undefined}) 
    const idx2 = array_column.indexOf(itemToFind2) 
    if (idx2 > -1 || idx > -1 ||  idx4 > -1){
      alert("please fill the column name and type")
    }

    const itemToFind3 = array_select.find(function(item) {return item.select ===undefined}) 
    const idx3 = array_select.indexOf(itemToFind3) 
    if (idx3 > -1){
      alert("please fill select")
    }

    if(this.state.table_name == undefined){
      alert("please fill table name")
    }

    if(array_column.length == 0){
      alert("add column")
    }


    var tmpA, tmpB;
    // column name 같은 경우 확인
    for(i = 1; i < array_column.length; i++){
      for(j = 0; j < i ; j++){
      // 값비교
         tmpA = array_column[i].column;
         tmpB = array_column[j].column;

         if(tmpA == tmpB){
           alert("column name should be different")
           return false;
         }
      }
   }

    if(idx == -1 && idx2 == -1 && idx3 == -1 && this.state.table_name !== undefined && array_column.length !== 0 && !selects_undefined){
      alert("table made successfully")
      this.InsertTable(this.state.table_name, array_column, array_select)
    }
}


InsertTable(table_name, array_column, array_select){
  
  const InsertTypes = (val, val2, val3)=> this.InsertTypes(val, val2, val3);
  db.transaction(tx => {
    db.transaction(function(tx) {
      tx.executeSql(
        'SELECT table_id FROM tableinfo where table_name = ?',
        [table_name],
        (tx, results) => {
          var len = results.rows.length;
        //  값이 없는 경우에 삽입
          if (len == 0) {      
            tx.executeSql(
              'INSERT INTO tableinfo (table_name, created_at) VALUES (?,?)',
              [table_name, '113-33-33'],
              (tx, results) => {
                  if (results.rowsAffected > 0) {
                      console.log('insertData : ', "success")                        
                      tx.executeSql(
                        'SELECT table_id FROM tableinfo where table_name = ?',
                        [table_name],
                        (tx, results) => {
                          var len = results.rows.length;
                        //  값이 있는 경우에 
                          if (len > 0) {       
                            console.log('insertData : ', "success" + results.rows.item(0).table_id)   
                            var id = results.rows.item(0).table_id
                            try {
                              AsyncStorage.setItem('table', table_name);
                            } catch (error) {
                              console.error('AsyncStorage error: ' + error.message);
                            }
                            InsertTypes( id, array_column, array_select)
                          }
                        }
                      );      
                   
                  } else {
                      console.log('insertData : ', "success")      
                  }
              }
              );
          }else{               
            alert('table name exists!!')   
          }
        }
      );      
      
    }); 
  });
}



InsertTypes(table_id, array_column, array_select){
  const navi = (_var) => this.props.navigation.navigate("TodayScreen", {otherParam: _var})
  console.log("columns - InsertTypes", array_column)
  var arrays = new Array()
  var add = ''
  array_column.map(( item ) =>
      {
        arrays.push(table_id, item.column, item.type, item.order )
        add = add+"(?,?,?,?),"  
      }  
  )

  add = add.substr(0, add.length -1);
  console.log("arrays - InsertTypes", arrays)
  console.log("add - InsertTypes", add)
  // typeinfo에 삽입
  db.transaction(function(tx) {
    tx.executeSql(
      'INSERT INTO typeinfo (table_id, column_name, column_type, column_order) VALUES '+add,
      arrays,
      (tx, results) => {                            
        if (results.rowsAffected > 0) {
          console.log('type insert : ', "success") 
          navi("fromAddtable")
        } else {
          console.log('type insert : ', "failed")
        }
      }
    )
  });  
     

  var arrays_select = new Array()
  var add_select = ''
  if(array_select.length !== 0){
  array_select.map(( item ) =>
      {
        arrays_select.push(table_id, item.column, item.select )
        add_select = add_select+"(?,?,?),"  
      }  
  )

  add_select = add_select.substr(0, add_select.length -1);
  console.log("selects - InsertTypes",arrays_select)
  console.log("add_selects - InsertTypes",add_select)

  //select삽입
  db.transaction(function(tx) {
    tx.executeSql(
      'INSERT INTO selectinfo (table_id, column_name, select_value) VALUES '+add_select,
      arrays_select,
      (tx, results) => {                            
        if (results.rowsAffected > 0) {
          console.log('select insert : ', "success") 
        } else {
          console.log('select insert : ', "failed")
        }
      }
    );
  });  
}

}

  render() {
    
  const renderItem =  ({ item, move, moveEnd, isActive }) => {
   // console.log("item - renderItem", item )
   // console.log("label - renderItem", item.label)
    const key = item.label
    if(( item.label ) == this.index)
    { 
      console.log("get data - renderItem // add ")
    
      const animationValue = this.animatedValue.interpolate(
        {
            inputRange: [ 0, 1 ],
            outputRange: [ -59, 0 ]
        });
  
      let inx = item.label
      let readonly = 'readonly'+item.label
      let index = 'select'+item.label
      let select_all = 'selectall'+item.label+'_val'
      let select_val = 'select'+item.label+'_val'
      let _name =  'column'+item.label+'_name'
      let _type = 'column'+item.label+'_type'
    //  console.log(index + _name + _type)
      const setName = (_var) => this.setState({[_name]:_var})
      const setType= (_var) => this.setState({[_type]:_var})
      const setSelect= (_var) => this.setState({[select_val]:_var})
      const onSelect = (_var) => this.onSelect(_var)
      const Reload = (_var) => this.setState({reload:_var})
      const setAll = (_var) => this.setState({[select_all] : _var})
      const RemoveColumn = (_var) => this.RemoveColumn(_var)
        
        return(
            <Animated.View key = { key } style = {[ styles.viewHolder, { opacity: this.animatedValue, transform: [{ translateY: animationValue }] }]}>           
              <TouchableOpacity
                key = { key } style = {styles.viewHolder} 
                style={this.state[_type] == "select" ? { 
                  height: 100, 
                  borderColor:isActive ? '#01579b' : "#000",
                  borderBottomWidth:isActive ?  1 : 0,
                  borderTopWidth:isActive ?  1 : 0,
                  borderLeftWidth:isActive ?  2 : 0,
                  borderRightWidth:isActive ?  2 : 0,
                 // backgroundColor: isActive ? 'blue' : item.ackgroundColor,
                  alignItems: 'center', 
                  justifyContent: 'center' 
                } : 
                { 
                  height: 70, 
                  borderColor:isActive ? '#01579b' : "#000",
                  borderBottomWidth:isActive ?  1 : 0,
                  borderTopWidth:isActive ?  1 : 0,
                  borderLeftWidth:isActive ?  2 : 0,
                  borderRightWidth:isActive ?  2 : 0,
                 // backgroundColor: isActive ? 'blue' : item.ackgroundColor,
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }
              }
              >                      
                <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                <View style={{flexDirection: "column", flexWrap: 'wrap', width: '10%'}}>
                <TouchableOpacity
                onLongPress={move}
                onPressOut={moveEnd}
                >
               <Icon name={'navicon'} size={20} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
                </TouchableOpacity>   
               </View>          
                <View style={{flexDirection: "column", flexWrap: 'wrap', width: '40%'}} pointerEvents={this.state[readonly] ? 'none' : null}>
                    <TextInput                
                    placeholder={"column name"}      
                    value={this.state[_name]}
                    onChangeText={_name => setName(_name)}    
                    underlineColorAndroid='transparent' 
                    style={[styles.TextInputStyleClass, {width:'100%', paddingRight:'1%', fontSize: 15}]}
                    />
                  </View>
                  <View style={{flexDirection: "column", flexWrap: 'wrap', width: '40%'}}>
                    <RNPickerSelect
                        placeholder={placeholder}
                        items={select}
                        onValueChange={(value) => {
                          this.onSelect(_type, value, item.label)
                        }}
                        style={pickerSelectStyles}
                        value={this.state[_type]}
                      //  ref={(el) => {
                        //   this.inputRefs.favSport0 = el;
                      // }}
                    />   
                  </View>
                  <View style={{flexDirection: "column", flexWrap: 'wrap', width: '10%'}}>
                  <TouchableOpacity 
                    activeOpacity = {0.9}
                    onPress={()=> RemoveColumn(item.label)} 
                    >
                     <Icon name={'close-o'} size={30} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
  
                    </TouchableOpacity>
                  </View>
                  <View style={this.state[index]  != undefined && this.state[index] == true ? {flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 10} : {display:'none'}}>
                  <View style={{flexDirection: "column", flexWrap: 'wrap', width: '40%'}}>
                  <TextInput                
                    placeholder={'add items'}       
                    returnKeyType = {'done'}
                    returnKeyLabel ={"send"}
                    onSubmitEditing={()=> (this.state[select_val] !== "" && this.state[select_all].indexOf(this.state[select_val]) == -1) ? [setSelect(""), this.state[select_all].push(this.state[select_val])] : {}}
                    value={this.state[select_val]}
                    onChangeText={_value =>setSelect(_value)} 
                   // underlineColorAndroid='transparent' 
                    style={[styles.TextInputStyleClass, {width:'100%', paddingRight:'1%', fontSize: 15}]}
                    />
                    </View>
                    <View style={{flexDirection: "column", flexWrap: 'wrap', width: '60%' }}>
                    <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center'}} >
  
                    { this.state[select_all] !== undefined ? this.state[select_all].map((item, key)=>(
                    <View key={ item } style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center'}} >
                    <View style={{flexDirection: "column", flexWrap: 'wrap'}}>
                    <Text> { item }</Text>
                    </View>
                     <View style={{flexDirection: "column", flexWrap: 'wrap'}}>
                    <TouchableOpacity 
                    activeOpacity = {0.9}
                    onPress={()=> [setSelect(""), this.state[select_all].splice(this.state[select_all].indexOf(item),1)]} 
                    >
                    <Icon name={'close'} size={20} color={"#000"} style={{paddingTop:2, textAlign:'left', paddingRight:10}} />
                    </TouchableOpacity>
                    </View>
                    </View>
                    )
                    ) : setAll([])}
                    </View>
                    </View>
                 
                    </View>                         
                </View>
            </TouchableOpacity>
            </Animated.View>
        );
    }
    else
    {
      console.log("get data - renderItem")
      let inx = item.label
      let readonly = 'readonly'+item.label
      let index = 'select'+item.label
      let select_all = 'selectall'+item.label+'_val'
      let select_val = 'select'+item.label+'_val'
      let _name =  'column'+item.label+'_name'
      let _type = 'column'+item.label+'_type'
        const setName = (_var) => this.setState({[_name]:_var})
        const setType= (_var) => this.setState({[_type]:_var})
        const setSelect= (_var) => this.setState({[select_val]:_var})
        const onSelect = (_var) => this.onSelect(_var)
        const Reload = (_var) => this.setState({reload:_var})
        const setAll = (_var) => this.setState({[select_all] : _var})
        const RemoveColumn = (_var) => this.RemoveColumn(_var)
       
        return(     
          <TouchableOpacity
            key = { key } style = {styles.viewHolder} 
            style={this.state[_type] == "select" ? { 
              height: 100, 
              borderColor:isActive ? '#01579b' : "#000",
              borderBottomWidth:isActive ?  1 : 0,
              borderTopWidth:isActive ?  1 : 0,
              borderLeftWidth:isActive ?  2 : 0,
              borderRightWidth:isActive ?  2 : 0,
             // backgroundColor: isActive ? 'blue' : item.ackgroundColor,
              alignItems: 'center', 
              justifyContent: 'center' 
            } : 
            { 
              height: 70, 
              borderColor:isActive ? '#01579b' : "#000",
              borderBottomWidth:isActive ?  1 : 0,
              borderTopWidth:isActive ?  1 : 0,
              borderLeftWidth:isActive ?  2 : 0,
              borderRightWidth:isActive ?  2 : 0,
             // backgroundColor: isActive ? 'blue' : item.ackgroundColor,
              alignItems: 'center', 
              justifyContent: 'center' 
            }
          }
        >              
                <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}  pointerEvents={isActive ? 'none' : null}>
                <View style={{flexDirection: "column", flexWrap: 'wrap', width: '10%'}}>
                <TouchableOpacity
                onLongPress={move}
                onPressOut={moveEnd}
                >
               <Icon name={'navicon'} size={20} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
                </TouchableOpacity>   
               </View>          
                <View style={{flexDirection: "column", flexWrap: 'wrap', width: '40%'}} pointerEvents={this.state[readonly] ? 'none' : null}>
                    <TextInput                
                    placeholder={"column name"}      
                    value={this.state[_name]}
                    onChangeText={_name => setName(_name)}    
                    underlineColorAndroid='transparent' 
                    style={[styles.TextInputStyleClass, {width:'100%', paddingRight:'1%', fontSize: 15}]}
                    />
                  </View>
                  <View style={{flexDirection: "column", flexWrap: 'wrap', width: '40%'}}>
                    <RNPickerSelect
                        placeholder={placeholder}
                        items={select}
                        onValueChange={(value) => {
                          this.onSelect(_type, value, item.label)
                        }}
                        style={pickerSelectStyles}
                        value={this.state[_type]}
                    />   
                  </View>
                  <View style={{flexDirection: "column", flexWrap: 'wrap', width: '10%'}}>
                  <TouchableOpacity 
                    activeOpacity = {0.9}
                    onPress={()=> RemoveColumn(item.label)} 
                    >
                     <Icon name={'close-o'} size={30} color={"#000"} style={{paddingTop:8, textAlign:'right', paddingRight:10}} />
  
                    </TouchableOpacity>
                  </View>
                  <View style={this.state[index]  != undefined && this.state[index] == true ? {flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 0} : {display:'none'}}>
                  <View style={{flexDirection: "column", flexWrap: 'wrap', width: '40%'}}>
                  <TextInput                
                    placeholder={'add items'}       
                    returnKeyType = {'done'}
                    returnKeyLabel ={"send"}
                    onSubmitEditing={()=> (this.state[select_val] !== "" && this.state[select_all].indexOf(this.state[select_val]) == -1) ? [setSelect(""), this.state[select_all].push(this.state[select_val])] : {}}
                    value={this.state[select_val]}
                    onChangeText={_value =>setSelect(_value)} 
                   // underlineColorAndroid='transparent' 
                    style={[styles.TextInputStyleClass, {width:'100%', paddingRight:'1%', fontSize: 15}]}
                    />
                    </View>
                    <View style={{flexDirection: "column", flexWrap: 'wrap', width: '60%' }}>
                    <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center'}} >
  
                    { this.state[select_all] !== undefined ? this.state[select_all].map((item, key)=>(
                    <View key={ item } style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center'}} >
                    <View style={{flexDirection: "column", flexWrap: 'wrap'}}>
                    <Text> { item }</Text>
                    </View>
                     <View style={{flexDirection: "column", flexWrap: 'wrap'}}>
                    <TouchableOpacity 
                    activeOpacity = {0.9}
                    onPress={()=> [setSelect(""), this.state[select_all].splice(this.state[select_all].indexOf(item),1)]} 
                    >
                    <Icon name={'close'} size={20} color={"#000"} style={{paddingTop:2, textAlign:'left', paddingRight:10}} />
                    </TouchableOpacity>
                    </View>
                    </View>
                    )
                    ) : setAll([])}
                    </View>
                    </View>
                 
                    </View>                         
                </View>
              </TouchableOpacity>
            
        );
    }
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
          <KeyboardAwareScrollView extraHeight={10} onScrollEndDrag={({ nativeEvent }) => { this.setState({ scrollOffset: nativeEvent.contentOffset['y'] }); }}
            onMomentumScrollEnd={({ nativeEvent }) => { this.setState({scrollOffset: nativeEvent.contentOffset['y']})}}> 
        <View style={{ flex: 1, alignItems: 'center'}}>
        <Text>table name</Text>
        <TextInput                
        placeholder="table name"        
        value={this.state.table_name}
        onChangeText={table_name => this.setState({table_name})}    
        underlineColorAndroid='transparent' 
        style={[styles.TextInputStyleClass, {width:'98%', margin:'1%', fontSize: 15}]}
        />
        <DraggableFlatList
          data={this.state.data}
          scrollingContainerOffset={this.state.scrollOffset}
          renderItem={renderItem}
          keyExtractor={(item, index) => `draggable-item-${item.key}`}
          scrollPercent={5}
        //   onMoveBegin={(index) => index.active}
          onMoveEnd={({ data }) => this.setState({ data })}
        />
        <TouchableOpacity 
        activeOpacity = {0.9}
        onPress={()=> this.AddColumn(this.index)} 
        >
          <Icon name={'plus'} size={30} color={"#000"} style={{paddingTop:8, textAlign:'center', paddingRight:10}} />
        </TouchableOpacity>
       
         <View style={{width:'100%', marginTop:0, marginBottom: 15, padding:10}}>                
        <TouchableOpacity 
        activeOpacity = {0.9}
        style={styles.Button}
        onPress={()=> this.checkColumn()} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
            make table
          </Text>
        </TouchableOpacity>
      </View>
      </View>
      </KeyboardAwareScrollView>
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
  borderColor: '#2196F3', 
  backgroundColor: '#FFF',
  borderRadius: 5,
  elevation: 2,
 
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