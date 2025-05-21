import { withObservables } from '@nozbe/watermelondb/react';
import { RouteProp, useRoute } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Pressable, TextInput } from 'react-native';
import { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Attachment, SendFill } from '../../assets/svgs';
import {
  AnimatedBox,
  Box,
  MessageHeader,
  Screen,
} from '../../components';
import { $input } from '../../components/Chat/styles';
import { $container } from '../../components/LinearGradient/styles';
import { localStore } from '../../data';
import {
  observeMessage,
  observeUnreadCount,
} from '../../db/helper';
import MessagesModel from '../../db/messagesModel';
import { AppStackParamList } from '../../navigators';
import { colors } from '../../theme';
import { spacing } from '../../theme/spacing';
import { isAndroid } from '../../utils';
import { FirebaseFirestoreTypes, getFirestore } from '@react-native-firebase/firestore';
import { MessageItem } from '../../components/Chat';
import { firebase } from '@react-native-firebase/database';
import firestore from '@react-native-firebase/firestore';
type MessagesProps = {
  messages: MessagesModel[];
  unread: number;
  route?: any
};

const Messages = ({ messages, unread, route }: MessagesProps) => {
  const { params } = useRoute<RouteProp<AppStackParamList, 'Messages'>>();
  const { UID } = localStore();
  // const navigation = useNavigation<StackTabNavigation>();
  const { patientID, channelName, channelSelfie } = params;
  const [messageInput, setMessageInput] = useState<string>('');
  const [msgLists, setMessageLists] = useState<any>()
  const [channelExist, setChannelExist] = useState<any>()
  const [resolvedRoomId, setResolvedRoomId] = useState<string | null>(route?.params?.roomId ?? null);
  const flashListRef = useRef<FlashList<MessagesModel>>(null);
  const db = getFirestore();

  const getRoomId = async () => {
    const db = firebase.firestore();
    const ids = [UID!, patientID!].sort();

    const channelExist = await db
      .collection('wellbeingMessages')
      .where('ids', '==', ids)
      .get();
    setChannelExist(channelExist)
    if (!channelExist.empty) {
      return channelExist.docs[0]?.data()?.roomId
    } else {
      return null
    }
  }

  useEffect(() => {
    // Only fetch roomId if it's not provided in route.params
    const fetchRoomId = async () => {
      const roomID = await getRoomId();
      if (!resolvedRoomId && !route?.params?.roomId) {
        try {
          setResolvedRoomId(roomID);
        } catch (error) {
          console.error('Error fetching room ID:', error);
        }
      };
    }
    fetchRoomId();
  }, [route?.params?.roomId]);

  useEffect(() => {
    const roomId = resolvedRoomId || route?.params?.roomId;
    if (!roomId) return;
  
    const unsubscribe = db
      .collection('wellbeingMessages')
      .doc(roomId)
      .onSnapshot(async (docSnap) => {
        if (!docSnap.exists) {
          setMessageLists([]);
          return;
        }
  
        const data = docSnap.data();
        const messages = data?.messages || [];
  
        setMessageLists(messages);
  
        // Mark unread messages for current user as "read"
        const updatedMessages = messages.map((msg:any) => {
          if (msg.reciever == UID && msg.deliveryStatus !== 'read') {
            return {
              ...msg,
              deliveryStatus: 'read',
            };
          }
          return msg;
        });
  
        // If any message was updated, push the change
        const hasUpdates = messages.some(
          (msg:any, i:any) => msg.deliveryStatus !== updatedMessages[i].deliveryStatus
        );
  
        if (hasUpdates) {
          try {
            await db.collection('wellbeingMessages')
              .doc(roomId)
              .update({ messages: updatedMessages });
          } catch (error) {
            console.error('Error updating read messages:', error);
          }
        }
      }, error => {
        console.error('Error in realtime listener:', error);
      });
  
    return () => unsubscribe();
  }, [resolvedRoomId, route?.params?.roomId, UID]);
  

  const onPress = async () => {
    try {
      const db = firebase.firestore();
      const ids = [UID!, patientID!].sort();
      let channelRef;
      let channelId;

      // Fetch user data
      const senderSnap = await db.collection('wellbeingUsers').doc(UID).get();
      const receiverSnap = await db.collection('wellbeingUsers').doc(patientID).get();
      // Fetch FullName 
      const senderName = senderSnap.data()?.fullName || 'Unknown';
      const receiverName = receiverSnap.data()?.fullName || 'Unknown';

      if (!channelExist.empty) {
        channelRef = channelExist.docs[0].ref
        channelId = channelExist.docs[0].id
      }
      else {
        channelRef = db.collection('wellbeingMessages').doc();
        channelId = channelRef.id;

        await channelRef.set({
          ids: ids,
          usernames: {
            [UID!]: senderName,
            [patientID]: receiverName,
          },
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          messages: [],
        });

        //====== Update both users to store the channelId ======
        const senderRef = db.collection('wellbeingUsers').doc(UID);
        const receiverRef = db.collection('wellbeingUsers').doc(patientID);

        await senderRef.update({
          channels: firebase.firestore.FieldValue.arrayUnion(channelId),
        });
        await receiverRef.update({
          channels: firebase.firestore.FieldValue.arrayUnion(channelId),
        });
      }

      const newMessage = {
        id: Date.now().toString(),
        message: messageInput,
        sender: UID,
        reciever: patientID,
        createdAt: new Date().toISOString(),
        deliveryStatus: 'sent'
      };

      await channelRef.set(
        {
          ids: ids,
          usernames: {
            [UID!]: senderName,
            [patientID]: receiverName,
          },
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastMessage: messageInput,
          lastMessageTime: firebase.firestore.FieldValue.serverTimestamp(),
          messages: firebase.firestore.FieldValue.arrayUnion({ ...newMessage }),
        },
        { merge: true }
      );
      setMessageInput('')
    } catch (error) { }

    if (messageInput?.length > 0) {
      flashListRef.current?.scrollToIndex({
        animated: true,
        index: messages?.length - 1,
        viewOffset: 100,
      });
    }
  };

  const sendStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: messageInput?.length > 0 ? withSpring(1.27) : withSpring(0) },
      ],
    };
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        style={$container}
        keyboardVerticalOffset={40}
        behavior={!isAndroid ? 'padding' : undefined}>
        <Box flex={1}>
          {/* HEADER */}
          <MessageHeader
            patientID={patientID}
            channelName={channelName}
            channelSelfie={channelSelfie}
          />

          {/* Messages */}
          <Box flexGrow={6} paddingHorizontal="l">
            <FlashList
              ref={flashListRef}
              data={msgLists}
              showsVerticalScrollIndicator={false}
              getItemType={item => item.sender}
              estimatedItemSize={200}
              onLayout={() =>
                msgLists?.length > 0 &&
                flashListRef?.current?.scrollToEnd({ animated: true })
              }
              keyExtractor={item => item?.id?.toString()}
              renderItem={({ item }) => (
                <MessageItem item={item} UID={UID} />
              )}
            />
          </Box>

          {/* Message Input */}
          <Box flexGrow={0.37}>
            <Box marginVertical="m" height={0.9} backgroundColor="line" />

            <Box
              overflow="hidden"
              alignItems="center"
              paddingHorizontal="l"
              gap="n"
              flexDirection="row">
              <Box
                borderWidth={1}
                height={45}
                width={45}
                alignItems="center"
                backgroundColor="line"
                justifyContent="center"
                borderRadius={spacing.borderRadius}
                borderColor="line2">
                <Attachment />
              </Box>
              <AnimatedBox flex={1} borderRadius={spacing.borderRadius}>
                <TextInput
                  style={$input}
                  multiline={true}
                  value={messageInput}
                  keyboardType="default"
                  placeholder=" Type Something!"
                  placeholderTextColor={colors.primary}
                  onChangeText={value => {
                    setMessageInput(value);
                  }}
                />
              </AnimatedBox>

              {messageInput.length > 0 && (
                <AnimatedBox style={sendStyle}>
                  <Pressable onPress={onPress} hitSlop={40}>
                    <SendFill />
                  </Pressable>
                </AnimatedBox>
              )}
            </Box>
          </Box>
        </Box>
      </KeyboardAvoidingView>
    </Screen>
  );
};
const enhance = withObservables(['route'], ({ route }) => ({
  messages: observeMessage(route?.params?.patientID),
  unread: observeUnreadCount(route?.params?.patientID),
}));
export const EnhancedMessages = enhance(Messages);
