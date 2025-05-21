import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {Pressable, View} from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import {CalenderTab} from '../../assets/svgs';
import {
  AppointmentTimeline,
  Box,
  NoAppointment,
  Screen,
} from '../../components';
import {CircularLoader} from '../../components/Loader';
import {Header} from '../../components/Verification';
import {useFirestore} from '../../hooks';
import {StackNavigation} from '../../navigators';
import {colors} from '../../theme';
import {fonts} from '../../theme/typography';
import {DAYS, formatDate, moderateScale} from '../../utils';
import {$calendarStrip, $dateNameStyle, $dateNumberStyle} from './styles';

export const Appointment = () => {
  const day = new Date().getDay();
  const navigation = useNavigation<StackNavigation>();
  const calendarStripRef = useRef<CalendarStrip>(null);
  const [selectedDate, setSelectedDate] = useState<string>();
  const [appointments, setAppointments] = useState<any[]>([]);
  const endOfTheYear = new Date(new Date().getFullYear(), 11, 31);
  const {appointmentTiming, data, getUser, loading} = useFirestore();

  const onPress = () => {
    navigation.navigate('ManageAppointment');
  };

  const onDateSelected = (date: moment.Moment) => {
    setSelectedDate(moment(date).format('YYYY-MM-DD'));
  };

  useEffect(() => {
    if (selectedDate) {
      appointmentTiming(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!data || data.length === 0) {
        setAppointments([]);
        return;
      }
  
      const grouped: { [time: string]: any[] } = {};
  
      for (const item of data) {
        console.log('startTime:', item.appointmentTime[0].startTime);
        const seconds = item.appointmentTime[0].startTime.seconds;
        const time = moment(seconds * 1000).format('h:mm a');
        const user = await getUser(item.patientID);
  
        const enrichedItem = {
          ...item,
          patientName: user?.fullName,
          selfie: user?.selfie,
        };
  
        if (grouped[time]) {
          grouped[time].push(enrichedItem);
        } else {
          grouped[time] = [enrichedItem];
        }
      }
  
      // Convert grouped object to array format (if needed)
      const groupedAppointments = Object.entries(grouped).map(([time, data]) => ({
        time,
        data,
      }));
  
      setAppointments(groupedAppointments);
    };
  
    fetchAppointments();
  }, [data]);

  useEffect(() => {
    appointmentTiming(moment().format('YYYY-MM-DD'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <Screen styles={{backgroundColor: 'white'}} useAlignment useDefault>
      <Box
        flexDirection="row"
        mt="l"
        justifyContent="space-between"
        alignItems="center">
        <Header
          title={DAYS[day]}
          summary={formatDate(new Date())}
          addDefault={false}
        />
        <Pressable onPress={onPress}>
          <Box
            justifyContent="center"
            alignItems="center"
            height={46}
            width={46}
            backgroundColor="secondary2"
            borderRadius={moderateScale(100)}>
            <CalenderTab />
          </Box>
        </Pressable>
      </Box>
      <CalendarStrip
        ref={calendarStripRef}
        calendarAnimation={undefined}
        useIsoWeekday={false}
        scrollerPaging={false}
        scrollable
        disabledDateOpacity={0.27}
        highlightDateNameStyle={{
          fontFamily: fonts.montserratAlternates.Bold,
        }}
        highlightDateNumberStyle={{
          fontFamily: fonts.montserratAlternates.Bold,
        }}
        selectedDate={moment()}
        // startingDate={moment()}
        // datesBlacklist={datesBlacklistFunc}
        // minDate={moment()}
        maxDate={endOfTheYear}
        // selectedDate={selectedCalendarDate}
        daySelectionAnimation={{
          type: 'background',
          duration: 100,
          highlightColor: colors.secondary2,
        }}
        onDateSelected={onDateSelected}
        style={$calendarStrip}
        dateNumberStyle={$dateNumberStyle}
        dateNameStyle={$dateNameStyle}
      />
      {loading ? (
        <Box flex={1} justifyContent="center" alignItems="center">
          <CircularLoader isLoading={loading} />
        </Box>
      ) : (
        <Box flex={1}>
          {appointments.length === 0 ? (
            <NoAppointment />
          ) : (
            <>
              <AppointmentTimeline appointments={appointments} />
            </>
          )}
        </Box>
      )}
    </Screen>
  );
};
