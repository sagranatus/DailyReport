import React from 'react';
import { View, FlatList, StyleSheet, Text, VirtualizedList, TouchableOpacity  } from 'react-native';
import CustomRow from './CustomRow';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});


const CustomListview = ({ itemList, tableName, onChange }) => (
    <View style={styles.container}>
        <VirtualizedList
         getItem={(data, index) => data[index]}
         getItemCount={data => data.length}
                data={itemList}
                renderItem={({ item }) => <CustomRow                
                onChange={(title, value) => onChange(title, value)}
                title={item.title}
                type={item.type}
                val={item.value}
                select={item.select}
                tableName={tableName}
                image_url={item.image_url}
                />}
            />      
    </View>
);

export default CustomListview;

