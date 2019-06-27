// Home screen
import React, { Component } from 'react';
//import react in our code.
import { Text, View, StyleSheet } from 'react-native';

export default class AddtablePage extends React.Component {
constructor(props) {
    super(props);
    this.state={ table: undefined }
  
}
  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Home1 Screen</Text>
      </View>
    );
  }
}

