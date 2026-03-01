import React from 'react';
import { InfoScreen } from '@/components/settings/InfoScreen';

export default function ChangelogScreen() {
  return (
    <InfoScreen
      title="What’s New"
      subtitle="Track recent updates and improvements in the app."
      sections={[
        {
          heading: 'Version 1.0.1',
          body: [
            'Added a dedicated Help, Legal & Trust hub in settings.',
            'Introduced support, feedback, and policy information screens.',
            'Improved discoverability of legal and safety resources.',
          ],
        },
        {
          heading: 'Version 1.0.0',
          body: [
            'Launched onboarding, buddies, and chatroom discovery flows.',
            'Added profile customization and notification preferences.',
            'Included foundational privacy and security settings.',
          ],
        },
      ]}
    />
  );
}
