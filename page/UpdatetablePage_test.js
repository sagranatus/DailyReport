// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Button,KeyboardAvoidingView,Animated, ScrollView,Keyboard, Dimensions } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icon from 'react-native-vector-icons/EvilIcons';
import RNPickerSelect from 'react-native-picker-select';
import SortableList from 'react-native-sortable-list';
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
  label: 'number',
  value: 'number'
},
];

const window = Dimensions.get('window');
const placeholder = {
  label: 'Select Types',
  value: null,
  color: '#9EA0A4',
};

export default class UpdatetablePage extends React.Component {

constructor(props) {
    super(props);
  
    this.state = { table: undefined,
      table_name: undefined,
      valueArray: [], 
      disabled: false,  
      data: {
      0: {
        index:0
      },
      1: {
        index:1
      },
      2: {
        index:2
      }
    }
   }

    this.index = 0;

    this.animatedValue = new Animated.Value(0);
    this.onSelect = this.onSelect.bind(this);
}

componentWillMount(){
    this.getValueArray() 
}

// 맨처음에 값 가져오기
getValueArray(){
    addArray.length = 0
    removeArray.length = 0
    const { params } = this.props.navigation.state;
    if(params != null){
      console.log("navigation params existed - getValueArray",params.otherParam)     
    // alert(params.otherParam)
      var table_id = params.otherParam
      // table_id, table_name setState()
      this.setState({table_id: params.otherParam, table_name: params.otherParam2})

      const setState = (_var1, _var2) => this.setState({[_var1]: _var2})
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
              // tableArray 값 삽입후 setState
              tableArray.push({
                index: i
              });              
              let readonly = 'readonly'+i
              let _name =  'column'+i+'_name'
              let _type = 'column'+i+'_type'
              let select_all = 'selectall'+i+'_val'
              let index = 'select'+i
              // setState() 각 column, type을 세팅한다.
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
                    // setState() 각 select_all 값을 세팅한다.
                    if (len > 0) {                              
                        var selects = new Array()
                        for(var i=0; i<results_.rows.length; i++){
                        column = results_.rows.item(i).column_name
                        select_val = results_.rows.item(i).select_value
                        //console.log(column+select_val)
                        selects.push(select_val)
                        } 
                        console.log("selects - getValueArray",column + "|" + selects)
                        setState(select_all, selects)         
                        setState(index, true)  
                    }
                    }
                );
                }
              console.log("columns - getValueArray", _name + column_name)
              console.log("types - getValueArray", _type + column_type)
              }               
            }
              console.log("tableArray - getValueArray", tableArray)
              setState("valueArray", tableArray)
              var data = {}
           //   tableArray.map((d, index) =>{ obj.index = index})
             // setState("data",  {0:{index:1}, 1:{index:2}, 2:{index:3}})
             tableArray.map((d, index) => (
             data[index] = {index:index}
           ))
            setState("data",  data)             
            console.log("data - getValueArray",data) 
          }else{
          }
        })
       })
    }
}

// selects선택한 경우에 selects삽입 보이게
onSelect(_type, selected, index){
 this.setState({[_type]: selected})
  if(selected == 'select'){
    this.setState({['select'+index]:true})
   // alert(this.state.select1)
  }else{
    this.setState({['select'+index]:false})
  }
}

// 컬럼삽입시 이벤트
AddColumn = (index) =>
{  
    console.log("index - AddColumn", index)   
    //addArray에 삽입
    if(addArray.indexOf(index) == -1){
        addArray.push(index)
    }  
    
  //  this.animatedValue.setValue(0);

    let newlyAddedValue = { index: this.index }
    var tableArray = [ ...this.state.valueArray, newlyAddedValue ]
    var data = this.state.data
     data[index] = {index:index}
    console.log("valueArray - AddColumn", tableArray)   
    console.log("data - AddColumn", data)   
    // valueArray, data 추가후에 setState
    this.setState({ valueArray: tableArray, data: data })
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

//컬럼삭제시 이벤트
RemoveColumn = (index) =>
{
  console.log("Index - RemoveColumn", index)
  let _name =  'column'+index+'_name'  
  removeArray.push(this.state[_name])
  
  var array = new Array()
  array = this.state.data   
/*
  const itemToFind = array.find(function(item) {return item.label === index}) 
  const idx = array.indexOf(itemToFind) 
  if (idx > -1) {
    array.splice(idx, 1)
   // let select_all = 'selectall'+idx+'_val'
   // let _name =  'column'+idx+'_name'
   // let _type = 'column'+idx+'_type' 
  //  this.setState({[select_all]:[], [_name]:"", [_type]:""})
    
    console.log("RemoveColumn - ", idx +"|"+ array.length)
  }
 
  console.log("data - RemoveColumn", array)
   */
  delete array[index]
  var array_ = new Array()
  array_ = this.state.valueArray
  console.log(array_)
  const itemToFind_ = array_.find(function(item) {return item.index === index}) 
  const idx_ = array_.indexOf(itemToFind_) 
  if (idx_ > -1) {
    array_.splice(idx_, 1) 
  }
  console.log("valueArray - RemoveColumn", array_)
  this.setState({ valueArray: array_, data: array});      
}

checkColumn(){
  console.log("valueArray - checkColumn", this.state.valueArray)
  console.log("data - checkColumn",this.state.data)

  var array_column = new Array()
  var array_select = new Array()
  var array_column_select = new Array()
  var selects_undefined = false;
  this.state.valueArray.map(( item, key ) =>
      {                       
        array_select.length == 0
        let select_val = 'select'+item.index+'_val'
        let select_all = 'selectall'+item.index+'_val'
        let _name =  'column'+item.index+'_name'
        let _type = 'column'+item.index+'_type'    
        console.log("column, type- checkColumn", this.state[_name] + "|" +this.state[_type])

         // column name과 위치 검색하기
         const itemToFind_ = this.state.data.find(function(item_) {return item_.label == item.index}) 
         const idx_ = this.state.data.indexOf(itemToFind_) 

         array_column.push({column:this.state[_name], type:this.state[_type], order:  idx_})
         
        if(this.state[_type] == 'select'){
          array_column_select.push(this.state[_name])
          if(this.state[select_all] !== undefined && this.state[select_all].length !== 0){              
          //  console.log( this.state[_name] + this.state[select_val])
            var arrays = new Array()
            //arrays = this.state[select_val].split(',');
            arrays = this.state[select_all]
            console.log("selects - checkColumn", this.state[_name] + "|" + arrays)
            arrays.map(( item, key ) =>
              array_select.push({column:this.state[_name], select:item})
            )              
          }else{
            alert("add Selects!")
            selects_undefined = true
          }
        }        
        
      })
    console.log("columns - checkColumn", array_column)
    console.log("selects - checkColumn", array_select)
    console.log("selects columns - checkColumn", array_column_select)
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
      alert("table update successfully")
      this.UpdateType(this.state.table_id, array_column, array_select, array_column_select)
   
    }

}

// update진행
UpdateType(table_id, array_column, array_select, array_column_select){
console.log("@remove@ - UpdateType", removeArray)
console.log("@add@ - UpdateType", addArray)


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

    console.log("add column - UpdateType",item + "|" +   idx_)
    arrays_.push(table_id,this.state['column'+item+'_name'], this.state['column'+item+'_type'], idx_)
    add_ = add_+"(?,?,?,?),"  
    })
    add_ = add_.substr(0, add_.length -1);
    console.log("add column arrays - UpdateType",arrays_)
    console.log("add column add - UpdateType",add_)
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

console.log("refresh selects columns - UpdateType", array_column_select )
  
//일단 모두 삭제하고 삽입한다
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

console.log("all array_select - UpdateType", array_select)
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
console.log("add selects arrays - UpdateType",arrays_select)
console.log("add selects add - UpdateType",add_select)

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

// 기존 컬럼 변경된 것 수정
  console.log("columns update - UpdateType", array_column)
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
  console.log("columns update arrays - UpdateType",arrays)
  console.log("columns update add - UpdateType",add)
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

_renderRow = ({data, active}) => {
  
  console.log("Data!!!", data)
// console.log("item - renderItem", item )
// console.log("label - renderItem", item.label)
  const key =data.index
  console.log("get data - renderItem")
  let inx = data.index
  let readonly = 'readonly'+data.index
  let index = 'select'+data.index
  let select_all = 'selectall'+data.index+'_val'
  let select_val = 'select'+data.index+'_val'
  let _name =  'column'+data.index+'_name'
  let _type = 'column'+data.index+'_type'
    const setName = (_var) => this.setState({[_name]:_var})
    const setType= (_var) => this.setState({[_type]:_var})
    const setSelect= (_var) => this.setState({[select_val]:_var})
    const onSelect = (_var) => this.onSelect(_var)
    const Reload = (_var) => this.setState({reload:_var})
    const setAll = (_var) => this.setState({[select_all] : _var})
    const RemoveColumn = (_var) => this.RemoveColumn(_var)
    console.log(inx + index + this.state[_name] + this.state[_type]  + this.state[select_all])
    return(     
   
          <Animated.View
          active={active}
          key={data.index}
          style={this.state[_type] == "select" ? {flex:1, height:90} : {flex:1, height:70}}
          >              
            <View style={{flexDirection: "row", flexWrap: 'wrap', justifyContent: 'center', marginTop: 10}} >             
              <View style={{flexDirection: "column", flexWrap: 'wrap', width: '50%'}}  pointerEvents={this.state[readonly] ? 'none' : null}>
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
                      this.onSelect(_type, value, data.index)
                    }}
                    style={pickerSelectStyles}
                    value={this.state[_type]}
               
                />   
              </View>
              <View style={{flexDirection: "column", flexWrap: 'wrap', width: '10%'}}>
              <TouchableOpacity 
                activeOpacity = {0.9}
                onPress={()=> RemoveColumn(inx)} 
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
            </Animated.View>
        
    );

}
  render() {
    
    console.log("this.state.Data!!!", this.state.data)
    var data =this.state.data
    
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
            <SortableList
              data={data}
              onChangeOrder={(nextOrder) => console.log(nextOrder)}
              renderRow={(data)=>this._renderRow(data)}
              //style={{}}
              contentContainerStyle={{flex:1, paddingHorizontal:10, width:window.width}}
              //keyExtractor={(item, index) => `draggable-item-${item.key}`}
             // scrollPercent={5}
             // onMoveBegin={(index) => index.active}
            //  onMoveEnd={({ data }) => this.setState({ data })}
            />
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
  width:'100%'},
  list: {
    flex: 1,
  },

  contentContainer: {
    width: '100%'  
    
  }, 
 
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