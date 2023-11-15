export const create = () => {
  sessionStorage.setItem("session_id", "false_session_id_0123456789");
};

export const remove = () => {
  sessionStorage.removeItem("session_id");
};

export const get = () => {
  return sessionStorage.getItem("session_id");
};
