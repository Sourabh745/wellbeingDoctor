import React, { Text, View } from 'react-native';
import {Loader} from '../../assets/lottie';
import LottieView from 'lottie-react-native';

type CircularLoaderProps = {
  isLoading: boolean;
};

export const CircularLoader = ({isLoading}: CircularLoaderProps) => {
  return (
    <>
      {isLoading && (
        <View style={{flex:1,alignItems:"center",justifyContent:"center"}}>
          <LottieView style={{width:100,height:100}} source={Loader} autoPlay loop />
        </View>
      )}
    </>
  );
};
