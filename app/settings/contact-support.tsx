import React from 'react';
import { InfoScreen } from '@/components/settings/InfoScreen';

export default function ContactSupportScreen() {
  return (
    <InfoScreen
      title="Contact Support"
      subtitle="Submit a support ticket by emailing support@uzzapbuddy.app with the details below."
      sections={[
        {
          heading: 'What to include',
          body: [
            'Your account email and the device you are using.',
            'A short summary of what happened and what you expected.',
            'Any screenshots and the time the issue occurred.',
          ],
        },
        {
          heading: 'Ticket priorities',
          body: [
            'Urgent: account access and safety concerns.',
            'Normal: bugs, chatroom issues, and notification problems.',
            'Low: improvement suggestions and general questions.',
          ],
        },
      ]}
    />
  );
}
