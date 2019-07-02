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
        padding: 10,
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
    },
    container_text: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 12,
        justifyContent: 'center',
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
    {label: 'Good', value: 'good' },
    {label: 'Bad', value: 'bad' }
  ];
export default class CustomRow extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saea: "ddd",
        };
      }
    
    componentWillMount(){  
    }

    render() {
        const type = this.props.type
        const title = this.props.title
        const val = this.props.val
        const select = this.props.select
      switch (this.props.type) {
        case 'select':
        console.log(title, this.state[title])
          return (
            <View style={styles.container}>
            <View style={styles.container_text}>
                <Text style={styles.title}>
                    {title}
                </Text>
                <RNPickerSelect
                    placeholder={placeholder}
                    items={select}
                    onValueChange={(value) => {
                        this.props.onChange(title, value)
                    }}
                    style={pickerSelectStyles}
                    value={val==undefined ? this.state[title] : val}
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
                <TextInput  
                ref="firstInput"              
                placeholder={'add text'}       
                value={val==undefined ? this.state[title] : val}
                onChangeText={(value) => {
                    this.props.onChange(title, value)
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
                <TextInput                
                placeholder={'add description'}       
                value={val==undefined ? this.state[title] : val}
                onChangeText={(value) => {
                    this.props.onChange(title, value)
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
                <TextInput                
                placeholder={'add number'}       
                value={val==undefined ? this.state[title] : val}
                onChangeText={(value) => {
                    this.props.onChange(title, value)
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
                    <RadioForm
                    radio_props={radio_props} 
                    formHorizontal={true}
                    labelHorizontal={true}
                    buttonColor={'#50C900'}
                  //  labelColor={'#50C900'}
                    selectedButtonColor={'#50C900'}
                    buttonSize={10}
                    buttonOuterSize={20}
                    animation={true}
                    initial={0}
                    onPress={(value) => {
                        this.props.onChange(title, value)
                    }}
                    />
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
                    <CheckBox
                     title='Click Here'
                     checked={val==undefined ? this.state[title] : val}
                     onPress={(value) => {
                        [this.props.onChange(title, !this.state[title]), this.setState({[title]:!this.state[title]})]
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
