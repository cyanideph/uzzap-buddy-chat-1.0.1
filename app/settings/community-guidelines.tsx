import React from 'react';
import { InfoScreen } from './components/InfoScreen';

export default function CommunityGuidelinesScreen() {
  return (
    <InfoScreen
      title="Community Guidelines"
      subtitle="Help keep Uzzap Buddy Chat welcoming, safe, and inclusive for everyone."
      sections={[
        {
          heading: 'Be respectful',
          body: [
            'Harassment, hate speech, and threats are not allowed.',
            'Respect personal boundaries and consent in all conversations.',
            'Do not impersonate others or spread misinformation.',
          ],
        },
        {
          heading: 'Keep it safe',
          body: [
            'Never share private financial or identity information.',
            'Avoid posting explicit, violent, or illegal content.',
            'Report behavior that puts others at risk.',
          ],
        },
      ]}
    />
  );
}
