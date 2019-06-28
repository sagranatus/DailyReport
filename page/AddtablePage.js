// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, StyleSheet, TextInput, TouchableOpacity  } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage'
var db = openDatabase({ name: 'TableDatabase.db' })

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
    this.InsertTable = this.InsertTable.bind(this);
    this.InsertTypes = this.InsertTypes.bind(this);
}

InsertTypes(table_name){
  const c1 = this.state.c1
  const c1_type = this.state.c1_type
  const c2 = this.state.c2
  const c2_type = this.state.c2_type
  const add = '(?,?,?), (?,?,?)'

  db.transaction(tx => {
    tx.executeSql(
    'SELECT table_id FROM tableinfo where table_name = ?',
    [table_name],
    (tx, results) => {
      var len = results.rows.length;
    //  값이 있는 경우에 
      if (len > 0) {       
        const table_id = results.rows.item(0).table_id          
        console.log(table_id)
          db.transaction(function(tx) {
            tx.executeSql(
              'INSERT INTO typeinfo (table_id, column_name, column_type) VALUES '+add,
              [table_id, c1, c1_type, table_id, c2, c2_type],
              (tx, results) => {                            
                if (results.rowsAffected > 0) {
                  console.log('type insert : ', "success") 
                } else {
                  console.log('type insert : ', "failed")
                }
              }
            );
          });  
      }   
    });
  });
}

InsertTable(){
  const table_name = this.state.table_name
  const InsertTypes = (val)=> this.InsertTypes(val);
  db.transaction(tx => {
    db.transaction(function(tx) {
        tx.executeSql(
        'INSERT INTO tableinfo (table_name, created_at) VALUES (?,?)',
        [table_name, '113-33-33'],
        (tx, results) => {
            if (results.rowsAffected > 0) {
                console.log('insertData : ', "success")                 
                InsertTypes(table_name)
            } else {
                console.log('insertData : ', "success")      
            }
        }
        );
    }); 
  });
}


  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center'}}>
        <Text>table name</Text>
        <TextInput                
        placeholder="table_name"        
        value={this.state.table_name}
        onChangeText={table_name => this.setState({table_name})}    
        underlineColorAndroid='transparent' 
        style={[styles.TextInputStyleClass, {width:'48%', paddingRight:'1%', fontSize: 15}]}
        />

        <Text>column1 name</Text>
        <TextInput                
        placeholder="column1_name"        
        value={this.state.column1_name}
        onChangeText={column1_name => this.setState({column1_name})}    
        underlineColorAndroid='transparent' 
        style={[styles.TextInputStyleClass, {width:'48%', paddingRight:'1%', fontSize: 15}]}
        />
         <TextInput                
        placeholder="column1_type"        
        value={this.state.column1_type}
        onChangeText={column1_type => this.setState({column1_type})}    
        underlineColorAndroid='transparent' 
        style={[styles.TextInputStyleClass, {width:'48%', paddingRight:'1%', fontSize: 15}]}
        />

        <Text>column2 name</Text>
        <TextInput                
        placeholder="column2_name"        
        value={this.state.column2_name}
        onChangeText={column2_name => this.setState({column2_name})}    
        underlineColorAndroid='transparent' 
        style={[styles.TextInputStyleClass, {width:'48%', paddingRight:'1%', fontSize: 15}]}
        />
        <TextInput                
        placeholder="column2_type"        
        value={this.state.column2_type}
        onChangeText={column2_type => this.setState({column2_type})}    
        underlineColorAndroid='transparent' 
        style={[styles.TextInputStyleClass, {width:'48%', paddingRight:'1%', fontSize: 15}]}
        />
         <View style={{width:'100%', marginTop:0, marginBottom: 15, padding:10}}>                
        <TouchableOpacity 
        activeOpacity = {0.9}
        style={styles.Button}
        onPress={()=> this.InsertTable()} 
        >
          <Text style={{color:"#fff", textAlign:'center'}}>
          등록하기
          </Text>
        </TouchableOpacity>
      </View>

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