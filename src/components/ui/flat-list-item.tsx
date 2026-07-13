import React from "react";
import { FlatList, FlatListProps, StyleSheet, Text, View } from "react-native";

export interface IFlatListItem<T> extends Omit<FlatListProps<T>, "renderItem"> {
  data: T[];
  CustomComponent: React.ComponentType<{ data: T }>;
  emptyMessage?: string;
}
function FlatListItemComponent<T>({
  data,
  CustomComponent,
  emptyMessage,
  ...props
}: IFlatListItem<T>) {
  const renderItem = React.useCallback(
    ({ item }: any) => <CustomComponent data={item} />,
    [CustomComponent],
  );
  return (
    <FlatList
      {...props}
      data={data}
      onEndReachedThreshold={0.5}
      renderItem={renderItem}
      ListEmptyComponent={() => (
        <View className="items-center mt-10">
          <Text className="text-gray-800 dark:text-white">
            {emptyMessage ? emptyMessage : "Data tidak ditemukan"}
          </Text>
        </View>
      )}
    />
  );
}

export const FlatListItem = React.memo(
  FlatListItemComponent,
) as typeof FlatListItemComponent;

const styles = StyleSheet.create({});
