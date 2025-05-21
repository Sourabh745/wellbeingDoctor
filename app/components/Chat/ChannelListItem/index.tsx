import {withObservables} from '@nozbe/watermelondb/react';
import {useNavigation} from '@react-navigation/native';
import React, {memo} from 'react';
import {Pressable} from 'react-native';
import {localStore} from '../../../data';
import ChannelModel from '../../../db/channelModel';
import {observeChannelCount, observeUnreadCount} from '../../../db/helper';
import {StackNavigation} from '../../../navigators';
import {formatAMPM, moderateScale} from '../../../utils';
import {Avatar} from '../../Avatar';
import {Box} from '../../Box';
import {Text} from '../../Text';
import {DeliveryStatus} from '../DeliveryStatus';

type ChannelListItemProps = {
  channel: any
};

export const ChannelListItem = memo(({channel:{roomId, lastMessage, lastMessageTime, senderName, senderId, senderSelfie}}: ChannelListItemProps) => {
  const {UID} = localStore();
  const navigation = useNavigation<StackNavigation>();
  const onPress = () => {
    navigation.navigate('Messages', {
      patientID: senderId,
      channelName: senderName,
      channelSelfie: senderSelfie,
      roomId:roomId
    });
  };
  return (
    <>
      <Pressable
        onPress={onPress}
        style={({pressed}) => [pressed ? {opacity: 0.4,marginTop:15} : {marginTop:15}]}>
        <Box flexDirection="row" gap="n">
          <Avatar
            uri={senderSelfie||""}
            wnh={50}
            patientID={senderId}
          />
          <Box paddingVertical="i" flex={1}>
            <Box flex={1} flexDirection="row" justifyContent="space-between">
              <Text
                color="primary"
                variant="semiBold"
                fontSize={moderateScale(15)}>
                {senderName}
              </Text>
              <Box justifyContent="space-between">
                <Text color="darkLabel" fontSize={moderateScale(12)}>
                  {formatAMPM(lastMessageTime)}
                </Text>
              </Box>
            </Box>
            <Box
              flex={1}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center">
              <Box flex={2}>
                <Text
                  variant={'regular'}
                  numberOfLines={1}
                  fontSize={moderateScale(14.5)}>
                  {lastMessage}
                </Text>
              </Box>
              {/* <Box flex={0.3} alignItems="flex-end">
                {senderId === UID ? (
                  <DeliveryStatus status={"channel.deliverStatus"} />
                ) : (
                  <>
                    {21 > 0 && (
                      <Box
                        borderRadius={100}
                        height={25}
                        width={25}
                        alignItems="center"
                        justifyContent="center"
                        backgroundColor="primary">
                        <Text
                          color="white"
                          variant="mSemiBold"
                          fontSize={moderateScale(12)}>
                          {"unread"}
                        </Text>
                      </Box>
                    )}
                  </>
                )}
              </Box> */}
            </Box>
          </Box>
        </Box>
      </Pressable>
    </>
  );
});
const enhance = withObservables(['channel'], ({channel}) => ({
  count: observeChannelCount(),
  unread: observeUnreadCount(channel?.patient),
}));

export const EnhancedChannelList = enhance(ChannelListItem);
