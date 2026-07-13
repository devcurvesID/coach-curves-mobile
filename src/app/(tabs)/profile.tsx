import Container from "@/components/ui/container";
import MenuItem from "@/components/ui/menu-item";
import Text from "@/components/ui/text";
import { useAuth } from "@/context/auth";
import { useUpdateUser } from "@/hooks/useUsers";
import { imageProfileURL } from "@/services/image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, View } from "react-native";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-[#6F3FA0] dark:bg-[#BB86FC] border border-white/10 rounded-2xl p-4 items-center">
      <Text className="text-[#ffffff] text-xl font-bold">{value}</Text>
      <Text className="text-[#F5F5F5] text-xs mt-1">{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const { mutate: updateUserIdFn } = useUpdateUser();

  const user_personal = user.user_personal;
  const onSignOutUser = async () => {
    try {
      await updateUserIdFn({
        is_online: false,
      });
      await signOut();
    } catch (error) {
      console.log("error logout", error);
    }
  };
  return (
    <Container>
      <ScrollView
        contentContainerClassName="px-6 pt-14 pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center">
          <LinearGradient
            colors={["#6F3FA0", "#BB86FC"]}
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              source={{
                uri: imageProfileURL(user_personal.photo),
              }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
              }}
            />
          </LinearGradient>

          <Text className="text-2xl font-bold mt-4">{user.name}</Text>
          <Text className=" text-sm mt-1">Premium Member</Text>
        </View>

        {/* Stats */}
        {/* <View className="flex-row gap-3 mt-8">
          <StatCard label="Workouts" value="124" />
          <StatCard label="Calories" value="32k" />
          <StatCard label="Hours" value="87h" />
        </View> */}

        {/* Divider */}
        <View className="h-[1px] bg-white/10 my-8" />

        {/* Menu */}
        <MenuItem
          icon="person-outline"
          title="Informasi Profile"
          onPress={() => router.push("/user")}
        />
        <MenuItem
          icon="notifications-outline"
          title="Notifikasi"
          onPress={() => router.push("/notification")}
        />
        <MenuItem
          icon="settings-outline"
          title="Seting"
          onPress={() => router.push("/setting")}
        />
        <MenuItem icon="help-circle-outline" title="Help & Support" />
        <MenuItem
          icon="log-out-outline"
          title="Logout"
          danger
          onPress={onSignOutUser}
        />
      </ScrollView>
    </Container>
  );
}

// import DashboardContainer from "@/components/dashboard-container";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import React from "react";
// import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// const ProfileScreen = () => {
//   const [search, setSearch] = React.useState("");

//   const stats = [
//     { label: "Orders", value: "128", icon: "bag-handle-outline" as const },
//     { label: "Revenue", value: "Rp 12.4jt", icon: "cash-outline" as const },
//     { label: "Users", value: "1,342", icon: "people-outline" as const },
//     { label: "Tickets", value: "7", icon: "help-circle-outline" as const },
//   ];

//   const actions = [
//     { label: "New Order", icon: "add-circle-outline" as const },
//     { label: "Scan", icon: "scan-outline" as const },
//     { label: "Send", icon: "paper-plane-outline" as const },
//     { label: "Report", icon: "stats-chart-outline" as const },
//   ];

//   const activities = [
//     {
//       title: "Payment received",
//       desc: "INV-1024 • Rp 450.000",
//       time: "2m ago",
//       icon: "checkmark-circle-outline" as const,
//     },
//     {
//       title: "New order created",
//       desc: "ORD-7781 • 3 items",
//       time: "18m ago",
//       icon: "bag-add-outline" as const,
//     },
//     {
//       title: "User signed up",
//       desc: "jonviter@…",
//       time: "1h ago",
//       icon: "person-add-outline" as const,
//     },
//   ];

//   return (
//     <DashboardContainer isSearch>
//       <ScrollView
//         className="flex-1"
//         contentContainerClassName="px-5 pb-35" // penting biar CTA gak ketutup tabbar
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Stats grid */}
//         <View className="-mt-6 flex-row flex-wrap justify-between">
//           {stats.map((s) => (
//             <View
//               key={s.label}
//               className="mb-4 w-[48%] rounded-2xl bg-white p-4 border border-slate-100 shadow"
//             >
//               <View className="flex-row items-center justify-between">
//                 <View className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
//                   <Ionicons name={s.icon} size={20} color="#0f172a" />
//                 </View>
//                 <Text className="text-xs text-slate-500">Today</Text>
//               </View>

//               <Text className="mt-3 text-3xl font-semibold text-slate-900">
//                 {s.value}
//               </Text>
//               <Text className="mt-1 text-sm text-slate-500">{s.label}</Text>
//             </View>
//           ))}
//         </View>

//         {/* Quick Actions */}
//         <View className="rounded-2xl bg-white p-4 border border-slate-100 shadow">
//           <View className="flex-row items-center justify-between">
//             <Text className="text-lg font-semibold text-slate-900">
//               Quick actions
//             </Text>
//             <Pressable className="active:opacity-70">
//               <Text className="text-sm text-slate-500">Customize</Text>
//             </Pressable>
//           </View>

//           <View className="mt-4 flex-row justify-between">
//             {actions.map((a) => (
//               <Pressable
//                 key={a.label}
//                 className="w-[23%] items-center rounded-2xl bg-slate-50 py-3 border border-slate-100 active:opacity-80"
//               >
//                 <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white border border-slate-100">
//                   <Ionicons name={a.icon} size={22} color="#0f172a" />
//                 </View>
//                 <Text className="mt-2 text-[12px] font-medium text-slate-700">
//                   {a.label}
//                 </Text>
//               </Pressable>
//             ))}
//           </View>
//         </View>

//         {/* Recent activity */}
//         <View className="mt-4 rounded-2xl bg-white p-4 border border-slate-100 shadow">
//           <View className="flex-row items-center justify-between">
//             <Text className="text-lg font-semibold text-slate-900">
//               Recent activity
//             </Text>
//             <Pressable className="active:opacity-70">
//               <Text className="text-sm text-sky-600 font-medium">View all</Text>
//             </Pressable>
//           </View>

//           <View className="mt-2">
//             {activities.map((it, idx) => (
//               <View
//                 key={it.title + idx}
//                 className={`flex-row items-start py-4 ${
//                   idx !== activities.length - 1
//                     ? "border-b border-slate-100"
//                     : ""
//                 }`}
//               >
//                 <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
//                   <Ionicons name={it.icon} size={20} color="#0f172a" />
//                 </View>

//                 <View className="flex-1">
//                   <View className="flex-row items-center justify-between">
//                     <Text className="text-sm font-semibold text-slate-900">
//                       {it.title}
//                     </Text>
//                     <Text className="text-xs text-slate-400">{it.time}</Text>
//                   </View>
//                   <Text className="mt-1 text-sm text-slate-500">{it.desc}</Text>
//                 </View>
//               </View>
//             ))}
//           </View>
//         </View>

//         {/* CTA */}
//         {/* <LinearGradient
//           colors={["rgba(15,23,42,1)", "rgba(30,41,59,1)"]}
//           className="mt-4 rounded-2xl p-5"
//         >
//           <Text className="text-white text-lg font-semibold">
//             Weekly performance
//           </Text>
//           <Text className="mt-1 text-white/70 text-sm leading-5">
//             Your conversion rate is up 12% compared to last week.
//           </Text>

//           <Pressable className="mt-4 self-start rounded-xl bg-white px-4 py-3 active:opacity-90">
//             <Text className="text-slate-900 font-semibold">Open report</Text>
//           </Pressable>
//         </LinearGradient> */}
//       </ScrollView>
//     </DashboardContainer>
//   );
// };

// export default ProfileScreen;

// const styles = StyleSheet.create({});
