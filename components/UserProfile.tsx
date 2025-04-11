'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge'; // Adjust import based on your UI library

export const UserProfile = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center space-x-4">
        <div className="relative">
          Loading user information...
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Please sign in</div>;
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Image 
          src={user.imageUrl || '/default-avatar.png'} 
          alt={`${user.fullName || 'User'}'s profile picture`}
          width={64} 
          height={64} 
          className="rounded-full"
        />
      </div>
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">{user.fullName}</h2>
          <Badge variant="secondary">
            {user.primaryEmailAddress?.emailAddress}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">
          Joined {user.createdAt?.toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
