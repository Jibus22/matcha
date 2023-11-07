export const apiGetUser = () => {
  const user = sessionStorage.user;
  const sid = sessionStorage.getItem("session_id");

  if (!sid || !user) return null;

  return JSON.parse(user);
};
