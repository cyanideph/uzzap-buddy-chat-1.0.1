import React from 'react';
import { InfoScreen } from './components/InfoScreen';

export default function FeedbackScreen() {
  return (
    <InfoScreen
      title="Feedback & Feature Requests"
      subtitle="Share product feedback and vote on features to help us shape the roadmap."
      sections={[
        {
          heading: 'How to submit feedback',
          body: [
            'Include the feature idea, who it helps, and expected outcome.',
            'Attach mockups or examples when possible.',
            'Keep one suggestion per submission for easier triage.',
          ],
        },
        {
          heading: 'Roadmap process',
          body: [
            'Ideas are reviewed weekly by product and engineering.',
            'Popular requests are grouped and prioritized by impact.',
            'Accepted requests appear in the changelog when released.',
          ],
        },
      ]}
    />
  );
}
