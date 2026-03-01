import React from 'react';
import { InfoScreen } from './components/InfoScreen';

export default function PrivacyPolicyScreen() {
  return (
    <InfoScreen
      title="Privacy Policy"
      subtitle="We collect only what is needed to provide and secure your experience."
      sections={[
        {
          heading: 'Data we collect',
          body: [
            'Account details such as email and profile metadata.',
            'Usage data related to chatroom participation and notifications.',
            'Device and diagnostics data for reliability and abuse prevention.',
          ],
        },
        {
          heading: 'How data is used',
          body: [
            'To operate chatrooms, buddies, and account authentication.',
            'To detect abuse, enforce rules, and improve performance.',
            'To communicate product updates and support responses.',
          ],
        },
      ]}
    />
  );
}
