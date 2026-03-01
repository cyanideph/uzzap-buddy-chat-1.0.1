import React from 'react';
import { InfoScreen } from '@/components/settings/InfoScreen';

export default function TermsOfServiceScreen() {
  return (
    <InfoScreen
      title="Terms of Service"
      subtitle="By using Uzzap Buddy Chat, you agree to these terms."
      sections={[
        {
          heading: 'Use of service',
          body: [
            'You must follow all applicable laws and platform policies.',
            'You are responsible for activity performed through your account.',
            'We may suspend accounts involved in abuse or fraud.',
          ],
        },
        {
          heading: 'Content and moderation',
          body: [
            'You retain ownership of your content but grant app display rights.',
            'We can remove content that violates community guidelines.',
            'Repeated violations can result in permanent account removal.',
          ],
        },
      ]}
    />
  );
}
