import React, { useCallback, useEffect, useState } from 'react';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { FlashList } from '@shopify/flash-list';
import { Box, Screen } from '../../components';
import { Header } from '../../components/Verification';
import { ChannelListItem } from '../../components/Chat';
import { Text, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFocusEffect } from '@react-navigation/native';

type ChatRoom = {
  roomId: string;
  lastMessage: string;
  lastMessageTime: Date;
  senderName: string;
  senderId: string;
  senderSelfie: string
};

export const Chat = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  // const [senderData, setSenderData] = useState<any>()
  const [loading, setLoading] = useState(false)

  const getSenderInfo = async (senderId: any) => {
    const senderInfo = await firestore().collection('wellbeingUsers').doc(senderId).get();
    return senderInfo?.data()
  }

  useFocusEffect(
    useCallback(() => {
      const userId = auth().currentUser?.uid;
      if (!userId) return;
  
      let messageUnsubscribers: (() => void)[] = [];
      let userUnsubscriber: () => void;
  
      setLoading(true);
  
      const setupListeners = async () => {
        const userRef = firestore().collection('wellbeingUsers').doc(userId);
  
        // Listen to user's channels in real-time
        userUnsubscriber = userRef.onSnapshot(async (userSnap) => {
          const userData = userSnap.data();
          const channels: string[] = userData?.channels || [];
  
          // Clean up previous listeners
          messageUnsubscribers.forEach(unsub => unsub());
          messageUnsubscribers = [];
  
          const newRoomData: ChatRoom[] = [];
  
          channels.forEach((roomId) => {
            const unsub = firestore()
              .collection('wellbeingMessages')
              .doc(roomId)
              .onSnapshot(async (roomSnap) => {
                const data = roomSnap.data();
                if (!data) return;
  
                const senderId = data.ids.find((uid: string) => uid !== userId);
                const senderData = await getSenderInfo(senderId);
  
                const updatedRoom = {
                  roomId,
                  lastMessage: data.lastMessage || '',
                  lastMessageTime: data.lastMessageTime?.toDate?.() || new Date(0),
                  senderName: senderData?.fullName || 'Unknown',
                  senderId,
                  senderSelfie: senderData?.pic || '',
                };
  
                // Update room if already exists or push new
                setChatRooms((prevRooms) => {
                  const others = prevRooms.filter(room => room.roomId !== roomId);
                  const updated = [...others, updatedRoom];
                  updated.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
                  return updated;
                });
              });
  
            messageUnsubscribers.push(unsub);
          });
  
          setLoading(false);
        });
      };
  
      setupListeners();
  
      return () => {
        // Cleanup listeners
        userUnsubscriber?.();
        messageUnsubscribers.forEach(unsub => unsub());
      };
    }, [])
  );

  return (
    <Screen styles={{ backgroundColor: 'white' }} useAlignment useDefault>
      <Box mt="l">
        <Header addDefault={false} title="Chats" summary=" " />
      </Box>
      <Box flex={1}>
        {chatRooms?.length > 0 ? <FlashList
          data={chatRooms}
          estimatedItemSize={200}
          keyExtractor={(item) => item.roomId}
          renderItem={({ item }) => <ChannelListItem channel={item} />}
        /> : (loading == true) ?
          new Array(5).fill(4)?.map((res) => {
            return <View style={{ marginTop: 13 }}>
              <SkeletonPlaceholder borderRadius={4}>
                <SkeletonPlaceholder.Item flexDirection="row" alignItems="center">
                  <SkeletonPlaceholder.Item width={60} height={60} borderRadius={50} />
                  <SkeletonPlaceholder.Item marginLeft={20}>
                    <SkeletonPlaceholder.Item width={120} height={20} />
                    <SkeletonPlaceholder.Item marginTop={6} width={80} height={20} />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder>
            </View>
          })
          :
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "black", textAlign: "center" }}>No chat available</Text>
          </View>}
      </Box>
    </Screen>
  );
};

export const EnhancedChat = Chat;
