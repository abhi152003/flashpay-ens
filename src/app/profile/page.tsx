'use client';

import { ProfileSettingsForm } from '@/components/profile/ProfileSettingsForm';

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 md:space-y-8 animate-fade-in">
      <div className="space-y-2 md:space-y-3">
        <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-text-primary">
          Payment Preferences
        </h1>
        <p className="text-base md:text-lg text-text-secondary">
          Configure how you receive payments via ENS text records
        </p>
      </div>

      <ProfileSettingsForm />
    </div>
  );
}
