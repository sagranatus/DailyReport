// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Button,KeyboardAvoidingView,Animated, ScrollView  } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import RNPickerSelect from 'react-native-picker-select';
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

export default class AddtablePage extends React.Component {

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

    this.InsertTable = this.InsertTable.bind(this);
    this.InsertTypes = this.InsertTypes.bind(this);
    this.onSelect = this.onSelect.bind(this);
}

componentWillMount(){
 
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

AddColumn = () =>
{
    this.animatedValue.setValue(0);

    let newlyAddedValue = { index: this.index }

    this.setState({ disabled: true, valueArray: [ ...this.state.valueArray, newlyAddedValue ] }, () =>
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
  console.log("Index"+index)
  //alert(this.state.valueArray)  
  console.log(this.state.valueArray)
  var array = new Array()
  array = this.state.valueArray
  console.log(array)
  const itemToFind = array.find(function(item) {return item.index === index}) 
  const idx = array.indexOf(itemToFind) 
  if (idx > -1) array.splice(idx, 1)
  console.log(array)
    this.setState({ valueArray: array });              
}

checkColumn(){
 // alert(this.state.valueArray.length)
  console.log(this.state.valueArray)
  var array_column = new Array()
  var array_select = new Array()
  this.state.valueArray.map(( item, key ) =>
      {             
          
           let select_val = 'select'+item.index+'_val'
           let _name =  'column'+item.index+'_name'
           let _type = 'column'+item.index+'_type'       
          console.log( this.state[_name] + this.state[_type])
          array_column.push({column:this.state[_name], type:this.state[_type]})
          if(this.state[_type] == 'select'){
            if(this.state[select_val] !== undefined){              
              console.log( this.state[_name] + this.state[select_val])
              var arrays = new Array()
              arrays = this.state[select_val].split(',');
              arrays.map(( item, key ) =>
               array_select.push({column:this.state[_name], select:item})
              )              
            }else{
              array_select.push({column:this.state[_name], select:this.state[select_val]})
            }
          }        
        
      })
    console.log(array_column)
    console.log(array_select)
    const itemToFind = array_column.find(function(item) {return item.column === undefined}) 
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
    if(idx2 == -1 && idx2 == -1 && idx3 == -1 && this.state.table_name !== undefined && array_column.length !== 0){
      alert("all")
      this.InsertTable(this.state.table_name, array_column, array_select)
    }

}

InsertTypes(table_id, array_column, array_select){
  console.log("here", array_column)
  var arrays = new Array()
  var add = ''
  array_column.map(( item ) =>
      {
        arrays.push(table_id, item.column, item.type )
        add = add+"(?,?,?),"  
      }  
  )

  add = add.substr(0, add.length -1);
  console.log(arrays)
  console.log(add)
  db.transaction(function(tx) {
    tx.executeSql(
      'INSERT INTO typeinfo (table_id, column_name, column_type) VALUES '+add,
      arrays,
      (tx, results) => {                            
        if (results.rowsAffected > 0) {
          console.log('type insert : ', "success") 
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
        //  값이 있는 경우에 
          if (len == 0) {      
            tx.executeSql(
              'INSERT INTO tableinfo (table_name, created_at) VALUES (?,?)',
              [table_name, '113-33-33'],
              (tx, results) => {
                  if (results.rowsAffected > 0) {
                      console.log('insertData : ', "success" )              
                      tx.executeSql(
                        'SELECT table_id FROM tableinfo where table_name = ?',
                        [table_name],
                        (tx, results) => {
                          var len = results.rows.length;
                        //  값이 있는 경우에 
                          if (len > 0) {       
                            console.log('insertData : ', "success" + results.rows.item(0).table_id)     
                            console.log(array_column)
                            var id = results.rows.item(0).table_id
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


  render() {
    const animationValue = this.animatedValue.interpolate(
      {
          inputRange: [ 0, 1 ],
          outputRange: [ -59, 0 ]
      });

      let newArray = this.state.valueArray.map(( item, key ) =>
      {
          if(( key ) == this.index)
          { 
              let index = 'select'+item.index
              let select_val = 'select'+item.index+'_val'
              let _name =  'column'+item.index+'_name'
              let _type = 'column'+item.index+'_type'
              const setName = (_var) => this.setState({[_name]:_var})
              const setType= (_var) => this.setState({[_type]:_var})
              const setSelect= (_var) => this.setState({[select_val]:_var})
              const onSelect = (_var) => this.onSelect(_var)
              return(
                  <Animated.View key = { key } style = {[ styles.viewHolder, { opacity: this.animatedValue, transform: [{ translateY: animationValue }] }]}>           
                      <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                        <View style={{flexDirection: "column", flexWrap: 'wrap', width: '50%'}}>
                          <TextInput                
                          placeholder={_name}       
                          value={this.state[_name]}
                          onChangeText={_name =>setName(_name)}    
                          underlineColorAndroid='transparent' 
                          style={[styles.TextInputStyleClass, {width:'100%', paddingRight:'1%', fontSize: 15}]}
                          />
                        </View>
                        <View style={{flexDirection: "column", flexWrap: 'wrap', width: '50%'}}>
                          <RNPickerSelect
                              placeholder={placeholder}
                              items={select}
                              onValueChange={(value) => {
                               // this.setState({_type: value})
                               onSelect(_type,value,item.index)
                              }}/*
                              onUpArrow={() => {
                                  this.inputRefs.firstTextInput.focus();
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
                        <TextInput                
                          placeholder={'add items'}       
                          value={this.state[select_val]}
                          onChangeText={_value =>setSelect(_value)}    
                          underlineColorAndroid='transparent' 
                          style={this.state[index] != undefined && this.state[index] == true ? [styles.TextInputStyleClass, {width:'100%', paddingRight:'1%', fontSize: 15}] : {display:'none'}}
                          />
                      </View>
                  </Animated.View>
              );
          }
          else
          {
              let inx = item.index
              let index = 'select'+item.index
              let select_val = 'select'+item.index+'_val'
              let _name =  'column'+item.index+'_name'
              let _type = 'column'+item.index+'_type'
              const setName = (_var) => this.setState({[_name]:_var})
              const setType= (_var) => this.setState({[_type]:_var})
              const setSelect= (_var) => this.setState({[select_val]:_var})
              const onSelect = (_var) => this.onSelect(_var)
              const Reload = (_var) => this.setState({reload:_var})
              const RemoveColumn = (_var) => this.RemoveColumn(_var)
              return(
                  <View key = { key } style = { styles.viewHolder }>                   
                      <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}}>
                        <View style={{flexDirection: "column", flexWrap: 'wrap', width: '50%'}}>
                          <TextInput                
                          placeholder={_name}      
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
                          style={styles.Button}
                          onPress={()=> RemoveColumn(item.index)} 
                          >
                            <Text style={{color:"#fff", textAlign:'center'}}>
                            X
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <TextInput                
                          placeholder={'add items'}       
                          value={this.state[select_val]}
                          onChangeText={_value =>setSelect(_value)} 
                          underlineColorAndroid='transparent' 
                          style={this.state[index]  != undefined && this.state[index] == true ? [styles.TextInputStyleClass, {width:'100%', paddingRight:'1%', fontSize: 15}] : {display:'none'}}
                          />
                      </View>
                  </View>
              );
          }
      });
      

    array = newArray

    return (
      <View style={{ flex: 1}}>
        <TouchableOpacity
              activeOpacity = {0.9}
              style={{backgroundColor: '#01579b', padding: 10}}
              onPress={() =>  this.props.navigation.navigate("TabScreen", {otherParam: "saea2"})} 
              >
              <Text style={{color:"#FFF", textAlign:'left'}}>
                  {"<"} BACK
              </Text>
          </TouchableOpacity>  
        <KeyboardAwareScrollView extraHeight={10}>    
        <View style={{ flex: 1, alignItems: 'center'}}>
        <Text>table name</Text>
        <TextInput                
        placeholder="table_name"        
        value={this.state.table_name}
        onChangeText={table_name => this.setState({table_name})}    
        underlineColorAndroid='transparent' 
        style={[styles.TextInputStyleClass, {width:'48%', paddingRight:'1%', fontSize: 15}]}
        />
        <ScrollView>
            <View style = {{ flex: 1, padding: 4 }}>
            {
                newArray
            }
            </View>
        </ScrollView>
        <TouchableOpacity 
        activeOpacity = {0.9}
        style={styles.Button}
        onPress={()=> this.AddColumn()} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
          add column
          </Text>
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