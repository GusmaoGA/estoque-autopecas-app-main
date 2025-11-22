import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
export default function CustomerCard({ item, onEdit, onDelete, onHistory }) {
  return (
    <View style={{ backgroundColor:"#fff", padding:12, borderRadius:10, marginBottom:10 }}>
      <Text style={{ fontWeight:"700" }}>{item.name}</Text>
      <Text>{item.phone} • {item.email}</Text>
      <View style={{ flexDirection:"row", marginTop:8 }}>
        <TouchableOpacity onPress={() => onHistory(item)} style={{ padding:8, backgroundColor:"#efefef", borderRadius:8 }}><Text>Histórico</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onEdit(item)} style={{ padding:8, marginLeft:8, backgroundColor:"#efefef", borderRadius:8 }}><Text>Editar</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={{ padding:8, marginLeft:8, backgroundColor:"#ffdddd", borderRadius:8 }}><Text>Excluir</Text></TouchableOpacity>
      </View>
    </View>
  );
}
