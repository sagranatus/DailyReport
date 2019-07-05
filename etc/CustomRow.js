import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, TouchableOpacity } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { openDatabase } from 'react-native-sqlite-storage'
import CustomListview from '../etc/CustomListview'
import { CheckBox } from 'react-native-elements'
import RadioForm, {RadioButton, RadioButtonInput, RadioButtonLabel} from 'react-native-simple-radio-button';

var db = openDatabase({ name: 'TableDatabase.db' })

const styles = StyleSheet.create({
    outer: {
        flex:1
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        padding: 5,
        marginLeft:16,
        marginRight:16,
        marginTop: 8,
        marginBottom: 8,
        borderRadius: 5,
        backgroundColor: '#FFF',
        elevation: 2,
    },
    title: {
        fontSize: 16,
        color: '#000',
        marginTop:8
    },
    container_text: {
        flexDirection: 'column',
        width:'20%',
        paddingLeft: 12
    },
    container_val: {
        flexDirection: 'column',
        width:'80%',
        height:40
    },
    type: {
        fontSize: 11,
        fontStyle: 'italic',
    },
    photo: {
        height: 50,
        width: 50,
    },
    Button:{
        backgroundColor: '#01579b', 
        padding: 10, 
        marginBottom:5, 
        } 
       
});


  const placeholder = {
    label: 'Select Types',
    value: null,
    color: '#9EA0A4',
  };

  var radio_props = [
    {label: 'Good', value: 0 },
    {label: 'Bad', value: 1 }
  ];
export default class CustomRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
      }
    
    componentWillMount(){         
        
    }

    render() {
        const type = this.props.type
        const title = this.props.title
        const val = this.props.val
        const date = this.props.date
        const select = this.props.select
        const readonly = this.props.readonly
        console.log("readonly1", readonly)
      switch (this.props.type) {
        case 'select':
        console.log("select",this.state[title])
          return (
            <View style={styles.container}>
            <View style={styles.container_text}>
                <Text style={styles.title}>
                    {title}
                </Text>
            </View>
            <View style={styles.container_val} pointerEvents={readonly ? 'none' : null}>
                <RNPickerSelect
                   // disabled={readonly ? true : false}
                    placeholder={placeholder}
                    items={select}
                    onValueChange={(value) => {val !== "" ? {} :  [this.props.onChange(title, value), this.setState({[title+date] : value})]
                    }}  
                    style={pickerSelectStyles}
                    value={this.state[title+date] == undefined ? val : this.state[title+date]}
                />   
              </View>            
            </View>
            );
        case 'text':      
        console.log(this.state[title])  
          return (
            <View style={styles.container}>
            <View style={styles.container_text}>
               <Text style={styles.title}>
                    {title} 
                </Text>
                </View>
                <View style={styles.container_val} pointerEvents={readonly ? 'none' : null}>
                <TextInput              
                placeholder={'add text'} 
                value={this.state[title+date] == undefined ? val : this.state[title+date]}
                onChangeText={(value) => {
                    [this.props.onChange(title, value), this.setState({[title+date] : value})]
                }}  
                underlineColorAndroid='transparent' 
                style={[styles.TextInputStyleClass, {width:'100%', paddingRight:'1%', fontSize: 15}]}
                />
              </View>
            </View>
            );
        case 'description':
          console.log(this.state[title])   
          return (
            <View style={styles.container}>
            <View style={styles.container_text}>
                <Text style={styles.title}>
                    {title} 
                </Text>
                </View>
                <View style={[styles.container_val, {height:70}]} pointerEvents={readonly ? 'none' : null}>
                <TextInput           
                multiline={true}     
                placeholder={'add description'}       
                value={this.state[title+date] == undefined ? val : this.state[title+date]}
                onChangeText={(value) => {
                    [this.props.onChange(title, value), this.setState({[title+date] : value})]
                }}  
                underlineColorAndroid='transparent' 
                style={[styles.TextInputStyleClass, {width:'100%', paddingRight:'1%', fontSize: 15}]}
                />
              </View>
            </View>
            );
        case 'number':
          console.log(this.state[title])   
          return (
            <View style={styles.container}>
            <View style={styles.container_text}>
                <Text style={styles.title}>
                    {title}
                </Text>
                </View>
                <View style={styles.container_val} pointerEvents={readonly ? 'none' : null}>
                <TextInput                
                placeholder={'add number'}       
                value={this.state[title+date] == undefined ? val : this.state[title+date]}
                onChangeText={(value) => {
                    [this.props.onChange(title, value), this.setState({[title+date] : value})]
                }}  
                underlineColorAndroid='transparent' 
                keyboardType={'numeric'}
                style={[styles.TextInputStyleClass, {width:'100%', paddingRight:'1%', fontSize: 15}]}
                />
              </View>
            </View>
            );
        case 'good/bad':
            return (
                <View style={styles.container}>
                <View style={styles.container_text}>
                    <Text style={styles.title}>
                        {title}
                    </Text>
                </View>
                <View style={styles.container_val} pointerEvents={readonly ? 'none' : null}>
                  
                    <RadioForm
                    style={{marginTop:8}}
                    buttonColor={readonly ? '#01579b' : '#298A08'}
                    //  labelColor={'#50C900'}
                    selectedButtonColor={readonly ? '#01579b' : '#298A08'}
                    buttonSize={10}
                    buttonOuterSize={20}
                    formHorizontal={true}
                    animation={true}
                    >
                     <RadioButton labelHorizontal={true} key={0} >
                        <RadioButtonInput
                            index={0}
                            obj = {{label: 'Good', value: 'good' }}
                            isSelected={this.state[title+date] == undefined ? val === 'good' : this.state[title+date] === 'good'}
                            onPress={() => {
                                [this.props.onChange(title, 'good'), this.setState({[title+date] : 'good'})]
                            }}  
                            borderWidth={3}
                            buttonInnerColor={readonly ? '#01579b' : '#298A08'}
                            buttonOuterColor={readonly ? '#01579b' : '#298A08'}
                            buttonSize={10}
                            buttonOuterSize={20}
                            buttonStyle={{}}
                            buttonWrapStyle={{marginLeft: 10}}
                        />
                        <RadioButtonLabel
                            index={0}
                            obj = {{label: 'Good', value: 'good' }}
                            labelHorizontal={true}
                            onPress={() => {
                            [this.props.onChange(title, 'good'), this.setState({[title] : 'good'})]
                          }}  
                            labelStyle={{color: readonly ? '#01579b' : '#298A08'}}
                            labelWrapStyle={{}}
                        />
                        </RadioButton>
                        <RadioButton labelHorizontal={true} key={1} >
                        <RadioButtonInput
                            index={1}
                            obj = {{label: 'Bad', value: 'bad' }}
                            isSelected={this.state[title+date] == undefined ? val === 'bad' : this.state[title+date] === 'bad'}
                            onPress={() => {
                                [this.props.onChange(title, 'bad'), this.setState({[title+date] : 'bad'})]
                            }}  
                            borderWidth={3}
                            buttonInnerColor={readonly ? '#01579b' : '#298A08'}
                            buttonOuterColor={readonly ? '#01579b' : '#298A08'}
                            buttonSize={10}
                            buttonOuterSize={20}
                            buttonStyle={{}}
                            buttonWrapStyle={{marginLeft: 10}}
                        />
                        <RadioButtonLabel
                            index={1}
                            obj = {{label: 'Bad', value: 'bad' }}
                            labelHorizontal={true}
                            onPress={() => {
                            [this.props.onChange(title, 'bad'), this.setState({[title+date] : 'bad'})]
                          }}                            
                            labelStyle={{color: readonly ? '#01579b' : '#298A08'}}
                           // labelStyle={{fontSize: 20, color: '#2ecc71'}}
                            labelWrapStyle={{}}
                        />
                        </RadioButton>
                    </RadioForm>
                </View>
                </View>
                );
        case 'check box':
            return (
                <View style={styles.container}>
                <View style={styles.container_text}>
                    <Text style={styles.title}>
                        {title}
                    </Text>
                </View>
                <View style={styles.container_val} pointerEvents={readonly ? 'none' : null}>
                    <CheckBox
                    // title='Click Here'
                     checked={this.state[title+date] == undefined ? (val == "1" ? true : false ) : this.state[title+date]}
                     checkedColor={readonly ? '#01579b' : '#298A08'}
                     uncheckedColor={readonly ? '#01579b' : '#298A08'}
                     containerStyle={{padding:3}}
                  //   disabled = {readonly ? true : false}
                     onPress={(value) => {
                        [this.props.onChange(title, this.state[title+date] == undefined ? (val == "1" ? false : true ) : !this.state[title+date]), this.state[title+date] == undefined ? this.setState({[title+date]: (val == "1" ? false : true )}) : this.setState({[title+date]:!this.state[title+date]})]
                    }}  
                    />
                </View>
                </View>
                );
        default:
          return (
            <View style={styles.container}>
            <View style={styles.container_text}>
                <Text style={styles.title}>
                    {title} 
                </Text>
                <Text style={styles.type}>
                    {type}
                </Text>
              </View>
            </View>
            );
        }
       
      }
     }


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
