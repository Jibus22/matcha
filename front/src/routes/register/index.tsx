import { redirect } from "react-router-dom";
import { apiGetUser } from "../utils";

export async function loader() {
  const user = apiGetUser();

  // Redirige vers root ou une étape d'enregistrement
  return redirect(user.registration);
}

export default function RegisterIndex() {
  return <h1>Index</h1>;
}
