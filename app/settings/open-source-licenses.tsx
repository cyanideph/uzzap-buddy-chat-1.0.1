import React from 'react';
import { InfoScreen } from './components/InfoScreen';

export default function OpenSourceLicensesScreen() {
  return (
    <InfoScreen
      title="Open-Source Licenses"
      subtitle="Uzzap Buddy Chat is built with open-source projects."
      sections={[
        {
          heading: 'Core libraries',
          body: [
            'React and React Native are licensed under the MIT License.',
            'Expo and Expo Router are licensed under the MIT License.',
            'Supabase JavaScript client is licensed under the MIT License.',
          ],
        },
        {
          heading: 'Additional dependencies',
          body: [
            'Vector icons, gesture libraries, and UI helpers are MIT licensed.',
            'See package.json for a full list of bundled dependencies.',
            'Request a full attribution report through Contact Support.',
          ],
        },
      ]}
    />
  );
}
