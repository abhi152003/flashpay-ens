'use client';

import { ProfileSettingsForm } from '@/components/profile/ProfileSettingsForm';

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payment Preferences</h1>
        <p className="mt-1 text-zinc-400">
          Configure how you receive payments via ENS text records
        </p>
      </div>

      <ProfileSettingsForm />
    </div>
  );
}
