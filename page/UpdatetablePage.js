// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Button,KeyboardAvoidingView,Animated, ScrollView,AsyncStorage, Keyboard } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icon from 'react-native-vector-icons/EvilIcons';
import RNPickerSelect from 'react-native-picker-select';
import DraggableFlatList from 'react-native-draggable-flatlist'
var db = openDatabase({ name: 'TableDatabase.db' })

var array = new Array()
var addArray = new Array()
var removeArray = new Array()
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
  label: 'good/bad',
  value: 'good/bad'
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

export default class UpdatetablePage extends React.Component {

constructor(props) {
    super(props);
    this.state={ table: undefined,
                 table_name: undefined,
                 column1_name: undefined,
                 column1_type: undefined,
                 column2_name: undefined,
                 column2_type: undefined
                }
    this.state = { valueArray: [], disabled: false }

    this.index = 0;

    this.animatedValue = new Animated.Value(0);
    this.onSelect = this.onSelect.bind(this);
}

componentWillMount(){
    this.getValueArray()
 
}

getValueArray(){
    addArray.length = 0
    removeArray.length = 0
    const { params } = this.props.navigation.state;
    if(params != null){
      console.log("navigation params existed : ",params.otherParam)     
    // alert(params.otherParam)
      const setState = (_var1, _var2) => this.setState({[_var1]: _var2})
      var table_id = params.otherParam
      this.setState({table_id: params.otherParam, table_name: params.otherParam2})

      db.transaction(tx => {
        tx.executeSql(
        'SELECT * FROM typeinfo where table_id = ? ORDER BY ABS(column_order)',
        [table_id],
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
            if(tableArray.indexOf(column_name) < 0 ){
              console.log(column_name)
              tableArray.push({
                index: i//,
               // column: column_name,
               // type: column_type,
              });              
              let readonly = 'readonly'+i
              let _name =  'column'+i+'_name'
              let _type = 'column'+i+'_type'
              let select_all = 'selectall'+i+'_val'
              let index = 'select'+i
              setState(readonly , true)
              setState(_name , column_name)
              setState(_type, column_type)
              if(column_type == "select"){
                tx.executeSql(
                    'SELECT * FROM selectinfo where table_id = ? AND column_name=?',
                    [table_id, column_name],
                    (tx, results_) => {
                    
                    var len = results_.rows.length;
                    var column, select_val
                    //  값이 있는 경우에 
                    if (len > 0) {                              
                        var selects = new Array()
                        for(var i=0; i<results_.rows.length; i++){
                        column = results_.rows.item(i).column_name
                        select_val = results_.rows.item(i).select_value
                        console.log(column+select_val)
                        selects.push(select_val)
                        } 
                        console.log("selects2",selects)
                        setState(select_all, selects)         
                        setState(index, true)  
                    }
                    }
                );
                }
              console.log(_name + column_name)
              console.log(_type + column_type)
              }               
            }
          //  setState(tableArray)
              console.log(tableArray)
              setState("valueArray", tableArray)
            //  console.log("valueArray", this.state.valueArray)
              let data = tableArray.map((d, index) => ({
                key: `item-${index}`,
                label: index,
                backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${index * 5}, ${132})`,
              }))
              setState("data",  data)

              console.log("data",data)
          }else{
          }
        })
       })
    }
}

onSelect(_type, selected, index){
 // alert(selected+_type)
 this.setState({[_type]: selected})
  if(selected == 'select'){
    this.setState({['select'+index]:true})
   // alert(this.state.select1)
  }else{
    this.setState({['select'+index]:false})
  }
}

AddColumn = (index) =>
{  
    console.log(index)   
    if(addArray.indexOf(index) == -1){
        addArray.push(index)
    }  
    
    this.animatedValue.setValue(0);

    let newlyAddedValue = { index: this.index }
    var tableArray = [ ...this.state.valueArray, newlyAddedValue ]
    var data = this.state.data
     data.push({
      key: `item-${this.index}`,
      label:this.index,
      backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${index * 5}, ${132})`,
    })

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

RemoveColumn = (index) =>
{

  let _name =  'column'+index+'_name'  
  removeArray.push(this.state[_name])

  console.log("Index+remove%%%"+index)
  //alert(this.state.valueArray)  
  console.log(this.state.valueArray)
  var array = new Array()
  array = this.state.data
  console.log(array)
   

  const itemToFind = array.find(function(item) {return item.label === index}) 
  const idx = array.indexOf(itemToFind) 
  if (idx > -1) {
    array.splice(idx, 1)
   // let select_all = 'selectall'+idx+'_val'
   // let _name =  'column'+idx+'_name'
   // let _type = 'column'+idx+'_type' 
  //  this.setState({[select_all]:[], [_name]:"", [_type]:""})
    
    console.log("array", idx +"|"+ array.length)
  }

  var array_ = new Array()
  array_ = this.state.valueArray
  console.log(array_)
  const itemToFind_ = array_.find(function(item) {return item.index === index}) 
  const idx_ = array_.indexOf(itemToFind_) 
  if (idx_ > -1) {
    array_.splice(idx_, 1) 
  }
  console.log(array_)
  this.setState({ valueArray: array_});      
}

checkColumn(){
  console.log(this.state.valueArray)
  console.log(this.state.data)

  var array_column = new Array()
  var array_select = new Array()
  var array_column_select = new Array()
  this.state.valueArray.map(( item, key ) =>
      {                       
        array_select.length == 0
        let select_val = 'select'+item.index+'_val'
        let select_all = 'selectall'+item.index+'_val'
        let _name =  'column'+item.index+'_name'
        let _type = 'column'+item.index+'_type'    
        console.log("select_all", select_all)   
        console.log( this.state[_name] + this.state[_type])

         // column name과 위치 검색하기
         const itemToFind_ = this.state.data.find(function(item_) {return item_.label == item.index}) 
         const idx_ = this.state.data.indexOf(itemToFind_) 

         console.log("####",item.index + "|" +   idx_)

         array_column.push({column:this.state[_name], type:this.state[_type], order:  idx_})
         
        if(this.state[_type] == 'select'){
          array_column_select.push(this.state[_name])
          if(this.state[select_all] !== undefined){              
          //  console.log( this.state[_name] + this.state[select_val])
            var arrays = new Array()
            //arrays = this.state[select_val].split(',');
            arrays = this.state[select_all]
            console.log("Selects!!!", this.state[_name] + "|" + arrays)
            arrays.map(( item, key ) =>
              array_select.push({column:this.state[_name], select:item})
            )              
          }//else{
           // array_select.push({column:this.state[_name], select:this.state[select_val]})
          //}
        }        
        
      })
    console.log(array_column)
    console.log(array_select)
    const itemToFind = array_column.find(function(item) {return item.column === undefined || item.column === ""}) 
    const idx = array_column.indexOf(itemToFind) 

    const itemToFind2 = array_column.find(function(item) {return item.type === undefined}) 
    const idx2 = array_column.indexOf(itemToFind2) 
    if (idx2 > -1 || idx > -1){
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

    if(idx2 == -1 && idx2 == -1 && idx3 == -1 && this.state.table_name !== undefined && array_column.length !== 0){
      alert("table made successfully")
      this.UpdateType(this.state.table_id, array_column, array_select, array_column_select)
   
    }

}

UpdateType(table_id, array_column, array_select, array_column_select){
console.log("@remove@", removeArray)
console.log("@add@", addArray)


//컬럼삭제
if(removeArray.length !== 0){
    removeArray.map(( item, key ) =>
    {        

        db.transaction(function(tx) {
            tx.executeSql(
                'DELETE FROM typeinfo where table_id = ? AND column_name = ?',
                [table_id, item ],
                (tx, results) => {                          
                          if (results.rowsAffected > 0) {
                            console.log('column delete : ', "success") 
                          } else {
                            console.log('column delete : ', "failed")
                          }               
                }
              )           
          });  
    })   
}


//컬럼추가
const navi = (_var) => this.props.navigation.navigate("TodayScreen", {otherParam: _var})

if(addArray.length !== 0){
    var arrays_ = new Array()
    var add_ = ''
    addArray.map(( item ) =>
    {
        // column name과 위치 검색하기
    const itemToFind_ = this.state.data.find(function(item_) {return item_.label == item}) 
    const idx_ = this.state.data.indexOf(itemToFind_) 

    console.log("####",item + "|" +   idx_)
    arrays_.push(table_id,this.state['column'+item+'_name'], this.state['column'+item+'_type'], idx_)
    add_ = add_+"(?,?,?,?),"  
    })
    add_ = add_.substr(0, add_.length -1);
    console.log("add1",arrays_)
    console.log("add2",add_)
    db.transaction(function(tx) {
        tx.executeSql(
        'INSERT INTO typeinfo (table_id, column_name, column_type, column_order) VALUES '+add_,
        arrays_,
        (tx, results) => {                            
            if (results.rowsAffected > 0) {
            console.log('type insert : ', "success") 
            } else {
            console.log('type insert : ', "failed")
            }
        }
        )
    }); 
}

console.log("refresh selects", array_column_select )
  
array_column_select.map(( item, key ) =>{
db.transaction(function(tx) {  
  tx.executeSql(
      'DELETE FROM selectinfo where table_id = ? AND column_name = ?',
      [table_id, item ],
      (tx, results) => { 
          if (results.rowsAffected > 0) {
              console.log('delete insert : ', "success") 
            } else {
              console.log('delete insert : ', "failed")
            }
      }
    )   
});  
})

console.log("array_select", array_select)
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
console.log(arrays_select)
console.log(add_select)

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
  console.log("here", array_column)
  var arrays = new Array()
  var add = ""
  array_column.map(( item ) =>
  {
    arrays.push(item.column, item.type )
    add = add+"WHEN ? THEN ? "  
  }   
 )
 array_column.map(( item ) =>
 {
   arrays.push(item.column, item.order )
 }) 
  arrays.push(table_id)
  console.log(arrays)
  console.log(add)
  db.transaction(function(tx) {
    tx.executeSql(
      'UPDATE typeinfo SET column_type = CASE column_name '+add+' ELSE column_type END, column_order = CASE column_name '+add+' ELSE column_order END where table_id=?',
      arrays,
      (tx, results) => {                            
        if (results.rowsAffected > 0) {
          console.log('type update : ', "success") 
          navi("saea")
         // navi("saea")
        } else {
          console.log('type update : ', "failed")
          navi("saea")
        }
      }
    )
  });  

}


  render() {

  var renderItem =  ({ item, index, move, moveEnd, isActive }) => {
    console.log("length%%%", item.length)
  console.log("item", item )
  console.log("label", item.label)
  const key = item.label
  if(( item.label ) == this.index)
  { 
    console.log("get data*********************")
  
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
    console.log(index + _name + _type)
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
        style={{ 
          height: 100, 
          backgroundColor: isActive ? 'blue' : item.ackgroundColor,
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >              
              <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                <View style={{flexDirection: "column", flexWrap: 'wrap', width: '50%'}} pointerEvents={this.state[readonly] ? 'none' : null}>
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
                      }}/*
                      onUpArrow={() => {
                          this.inputRefs.firstTextInput.focus();r
                      }}
                      onDownArrow={() => {
                          this.inputRefs.favSport1.togglePicker();
                      }} */
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
    console.log("get data2*********************")
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
        style={{ 
          height: 100, 
          backgroundColor: isActive ? 'blue' : item.ackgroundColor,
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
        onLongPress={move}
        onPressOut={moveEnd}
      >              
              <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                <View style={{flexDirection: "column", flexWrap: 'wrap', width: '50%'}} pointerEvents={this.state[readonly] ? 'none' : null}>
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
                      }}/*
                      onUpArrow={() => {
                          this.inputRefs.firstTextInput.focus();r
                      }}
                      onDownArrow={() => {
                          this.inputRefs.favSport1.togglePicker();
                      }} */
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
          
      );
  }
}
    
    const animationValue = this.animatedValue.interpolate(
      {
          inputRange: [ 0, 1 ],
          outputRange: [ -59, 0 ]
      });

      let newArray = this.state.valueArray.map(( item, key ) =>
      {
          if(( key ) == this.index)
          { 
            let inx = item.index
            let readonly = 'readonly'+item.index
            let index = 'select'+item.index
            let select_all = 'selectall'+item.index+'_val'
            let select_val = 'select'+item.index+'_val'
            let _name =  'column'+item.index+'_name'
            let _type = 'column'+item.index+'_type'
            const setName = (_var) => this.setState({[_name]:_var})
            const setType= (_var) => this.setState({[_type]:_var})
            const setSelect= (_var) => this.setState({[select_val]:_var})
            const onSelect = (_var) => this.onSelect(_var)
            const Reload = (_var) => this.setState({reload:_var})
            const setAll = (_var) => this.setState({[select_all] : _var})
            const RemoveColumn = (_var) => this.RemoveColumn(_var)
              
              return(
                  <Animated.View key = { key } style = {[ styles.viewHolder, { opacity: this.animatedValue, transform: [{ translateY: animationValue }] }]}>           
                       <View key = { key } style = { styles.viewHolder }>                   
                      <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                        <View style={{flexDirection: "column", flexWrap: 'wrap', width: '50%'}} pointerEvents={this.state[readonly] ? 'none' : null}>
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
                                this.onSelect(_type, value, item.index)
                              }}/*
                              onUpArrow={() => {
                                  this.inputRefs.firstTextInput.focus();r
                              }}
                              onDownArrow={() => {
                                  this.inputRefs.favSport1.togglePicker();
                              }} */
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
                          onPress={()=> RemoveColumn(item.index)} 
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
                  </View>
                  </Animated.View>
              );
          }
          else
          {
              let inx = item.index
              let readonly = 'readonly'+item.index
              let index = 'select'+item.index
              let select_all = 'selectall'+item.index+'_val'
              let select_val = 'select'+item.index+'_val'
              let _name =  'column'+item.index+'_name'
              let _type = 'column'+item.index+'_type'
              const setName = (_var) => this.setState({[_name]:_var})
              const setType= (_var) => this.setState({[_type]:_var})
              const setSelect= (_var) => this.setState({[select_val]:_var})
              const onSelect = (_var) => this.onSelect(_var)
              const Reload = (_var) => this.setState({reload:_var})
              const setAll = (_var) => this.setState({[select_all] : _var})
              const RemoveColumn = (_var) => this.RemoveColumn(_var)
             
              return(
                  <View key = { key } style = { styles.viewHolder }>                   
                      <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                        <View style={{flexDirection: "column", flexWrap: 'wrap', width: '50%'}} pointerEvents={this.state[readonly] ? 'none' : null}>
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
                                this.onSelect(_type, value, item.index)
                              }}/*
                              onUpArrow={() => {
                                  this.inputRefs.firstTextInput.focus();r
                              }}
                              onDownArrow={() => {
                                  this.inputRefs.favSport1.togglePicker();
                              }} */
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
                          onPress={()=> RemoveColumn(item.index)} 
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
                  </View>
              );
          }
      });
      
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
        <KeyboardAwareScrollView extraHeight={10}>    
        <View style={{ flex: 1, alignItems: 'center'}}>
        <Text>table name</Text>
        <View style={{ flex: 1, alignItems: 'center', width:'100%'}} pointerEvents={'none'}>
        <TextInput                
        placeholder="table name"        
        value={this.state.table_name}
        onChangeText={table_name => this.setState({table_name})}    
        underlineColorAndroid='transparent' 
        style={[styles.TextInputStyleClass, {width:'98%', margin:'1%', fontSize: 15}]}
        />
        </View>
        <ScrollView>
            <View style = {{ flex: 1, padding: 4 }}>
            <DraggableFlatList
              data={this.state.data}
              renderItem={renderItem}
              keyExtractor={(item, index) => `draggable-item-${item.key}`}
              scrollPercent={5}
              onMoveEnd={({ data }) => this.setState({ data })}
            />
            </View>
        </ScrollView>
        <View style={{width:'100%', marginTop:0, marginBottom: 0, padding:10}}>   
        <TouchableOpacity 
        activeOpacity = {0.9}
        style={[styles.Button, {backgroundColor:"#fff", borderColor:"#01579b", borderWidth:0.5}]}
        onPress={()=> this.AddColumn(this.index)} 
        >
          <Text style={{color:"#01579b", textAlign:'center'}}>
            add column
          </Text>
        </TouchableOpacity>
        </View>
         <View style={{width:'100%', marginTop:-10, marginBottom: 15, padding:10}}>                
        <TouchableOpacity 
        activeOpacity = {0.9}
        style={styles.Button}
        onPress={()=> this.checkColumn()} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
            update table
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