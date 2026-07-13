import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";

import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SelectItemProps {
  label: string;
  data: any[];
  placeholder?: string;
  onSelect: (data: any) => void;
  emptyMessage: string;
  searchPlaceholder: string;
  error?: string;
}
export const SelectItemView = ({
  label,
  data = [],
  placeholder,
  emptyMessage,
  onSelect,
  searchPlaceholder,
  error,
}: SelectItemProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const filteredData = useMemo(() => {
    return data.filter((item: any) =>
      item.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const onSelectItem = (item: any) => {
    setSelectedItem(item.name);
    setOpen(false);
    setSearch("");
    onSelect(item);
  };
  return (
    <View className=" mb-3">
      {/* Header Select */}
      <Text className="text-gray-400 text-xs mb-2">{label}</Text>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(!open)}
        className="bg-[#6F3FA0] rounded-3xl p-3 flex-row items-center justify-between shadow"
      >
        <View className="flex-row items-center">
          <View className="bg-[#59308A] p-3 rounded-2xl mr-4">
            <Ionicons name="location-outline" size={22} color="#F3C6E6" />
          </View>

          <Text className="text-white text-lg font-semibold">
            {selectedItem ? selectedItem : placeholder}
          </Text>
        </View>

        <Ionicons
          name={open ? "chevron-up-outline" : "chevron-down-outline"}
          size={24}
          color="#CFAEF4"
        />
      </TouchableOpacity>
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}

      {/* Dropdown */}
      {open && (
        <View className="bg-white rounded-[28px] mt-2 overflow-hidden shadow-lg border border-gray-200">
          {/* Search */}
          <View className="mx-4 mt-4 mb-2 flex-row items-center bg-gray-100 rounded-2xl px-4 py-3">
            <Ionicons name="search" size={20} color="#6B7280" />

            <TextInput
              placeholder={searchPlaceholder}
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-base text-gray-700"
            />

            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          <ScrollView
            style={{ maxHeight: 280 }}
            showsVerticalScrollIndicator={false}
          >
            {filteredData.map((item: any) => {
              const selected = item.name === selectedItem;

              return (
                <TouchableOpacity
                  key={item._id.toString()}
                  activeOpacity={0.7}
                  onPress={() => onSelectItem(item)}
                  className={`px-6 py-5 border-b border-gray-100 flex-row justify-between items-center ${
                    selected ? "bg-purple-50" : ""
                  }`}
                >
                  <Text
                    className={`text-lg ${
                      selected ? "text-[#6F3FA0] font-bold" : "text-gray-700"
                    }`}
                  >
                    {item.name}
                  </Text>

                  {selected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#6F3FA0"
                    />
                  )}
                </TouchableOpacity>
              );
            })}

            {filteredData.length === 0 && (
              <View className="py-8 items-center">
                <Ionicons name="search-outline" size={32} color="#D1D5DB" />
                <Text className="mt-2 text-gray-400">{emptyMessage}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};
