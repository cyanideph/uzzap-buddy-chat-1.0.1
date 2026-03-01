import React from 'react';
import { InfoScreen } from './components/InfoScreen';

export default function HelpCenterScreen() {
  return (
    <InfoScreen
      title="Help Center / FAQ"
      subtitle="Find quick answers to common questions about buddies, chatrooms, and account access."
      sections={[
        {
          heading: 'Account & Access',
          body: [
            'Use Forgot Password on login if you cannot sign in.',
            'You can edit your display name and status message from Profile.',
            'Email verification helps keep your account secure.',
          ],
        },
        {
          heading: 'Chatrooms',
          body: [
            'Discover chatrooms by category or keywords from Chatrooms.',
            'Saved chatrooms are available in the Saved tab for quick rejoin.',
            'Room hosts can review member requests in Join Requests.',
          ],
        },
        {
          heading: 'Safety',
          body: [
            'Block or mute users by using your device-level controls for now.',
            'Avoid sharing sensitive personal information in public rooms.',
            'Report suspicious activity through Contact Support.',
          ],
        },
      ]}
    />
  );
}
