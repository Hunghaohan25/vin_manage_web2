import React from 'react';
import { useAuth } from '../context/AuthContext';

interface UserAvatarProps {
  user: {
    name: string;
    avatar: string | null;
  };
  size?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'h-8 w-8' }) => {
  const { apiBaseUrl } = useAuth();
  const [error, setError] = React.useState(false);
  
  const initials = user.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  if (user.avatar && !error) {
    const avatarUrl = user.avatar.startsWith('http') 
      ? user.avatar 
      : `${apiBaseUrl}${user.avatar}`;
      
    return (
      <img 
        src={avatarUrl} 
        alt={user.name} 
        className={`${size} rounded-full object-cover shrink-0 border border-surface-200/50`}
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className={`flex ${size} items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-accent-400 text-[10px] font-bold text-white shrink-0 shadow-sm border border-white/20`}>
      {initials}
    </div>
  );
};

export default UserAvatar;
