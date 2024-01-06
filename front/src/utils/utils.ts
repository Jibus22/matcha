import { IFullUser } from "../models/user";

export const calculateUserAge = (user: IFullUser) => {
  const birthDate = new Date(user.age || "");
  const nowDate = new Date();
  const monthDiff = nowDate.getMonth() - birthDate.getMonth();
  const dayDiff = nowDate.getDate() - birthDate.getDate();
  let age = nowDate.getFullYear() - birthDate.getFullYear();

  if (monthDiff < 0 || (monthDiff == 0 && dayDiff < 0)) age -= 1;

  return age;
};

export function isMobileDevice() {
  return (
    (navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)) !== null
  );
}
