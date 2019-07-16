import React from 'react';
import { View, FlatList, StyleSheet, Text, VirtualizedList, TouchableOpacity,RefreshControl  } from 'react-native';
import CustomRow from './CustomRow';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});


export default class CustomListView extends React.Component {
    constructor(props) {
        super(props);
        console.log("constructor CustomListView")
   
    }
    componentWillMount(){         
        
    }   
   
    componentWillReceiveProps(nextProps){
    }

    render() {
    const itemList = this.props.itemList
    const tableName =  this.props.tableName
    const onChange = this.props.onChange 
    const date = this.props.date
    const readonly = this.props.readonly
    //console.log("readonly", readonly)
   // console.log("itemList", itemList)
    return(
    <View style={styles.container}>
        <VirtualizedList
        //  refreshing={this.state.refreshing}
        //  onRefresh={this._onRefresh}
         getItem={(data, index) => data[index]}
         getItemCount={data => data.length}
                data={itemList}
              //  date={date}
                renderItem={({ item }) => <CustomRow                
                onChange={(title, value) => onChange(title, value)} // onChange이벤트 : setState()
                title={item.title}
                type={item.type}
                val={item.value}
                date={date} // 선택된 날짜         
                readonly={readonly}
                select={item.select}
                tableName={tableName}
              //  image_url={item.image_url}
                />}
            />      
    </View>
    )
    }

}


