import profileEmpty from "../../assets/profile_empty.svg";

// Get user avatar with fallback
export function getUserAvatar(user: { avatar?: string; name: string }) {
  // Use actual avatar if available and valid
  if (user.avatar && user.avatar.trim() !== '') {
    return user.avatar;
  }
  // Fallback to default avatar
  return profileEmpty;
}
