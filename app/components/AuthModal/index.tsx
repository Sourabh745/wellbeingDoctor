import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {BottomSheetModalMethods} from '@gorhom/bottom-sheet/lib/typescript/types';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import React, {useMemo, useState} from 'react';
import {appleSign, googleSignIn} from '../../services';
import {Box} from '../Box';

import {SocialButton} from './SocialButton';
import {
  $bottomSheetContainer,
  $buttonGroup,
  $container,
  $indicator,
} from './style';

GoogleSignin.configure({
  // scopes: ['profile', 'email'],
  // webClientId: Config.WEB_CLIENT_ID,
  webClientId: "564511324214-njb77j6ph0mrnf116id9kkjmo76rekuj.apps.googleusercontent.com",
});

type AuthModalProps = {
  bottomSheetModalRef: React.RefObject<BottomSheetModalMethods>;
};
export const AuthModal = ({bottomSheetModalRef}: AuthModalProps) => {
  const snapPoints = useMemo(() => ['1', '24%'], []);
  const [auth, setAuth] = useState<'google' | 'apple' | undefined>(undefined);

  const continueWithApple = () => {
    setAuth('apple');
    appleSign()
      .then(() => setAuth(undefined))
      .catch(() => setAuth(undefined));
  };
  const continueWithGoogle = () => {
    setAuth('google');
    googleSignIn()
      .then(() => setAuth(undefined))
      .catch(() => setAuth(undefined));
  };
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      backgroundStyle={$container}
      handleIndicatorStyle={$indicator}
      backdropComponent={BottomSheetBackdrop}
      snapPoints={snapPoints}>
      <BottomSheetView style={[$bottomSheetContainer]}>
        <Box
          pointerEvents={auth ? 'none' : 'auto'}
          justifyContent="center"
          gap="s"
          style={$buttonGroup}>
          <SocialButton
            type="google"
            onPress={continueWithGoogle}
            isLoading={auth === 'google' ? true : false}
          />
          <SocialButton
            type="apple"
            onPress={continueWithApple}
            isLoading={auth === 'apple' ? true : false}
          />
        </Box>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
