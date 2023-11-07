import { redirect } from "react-router-dom";
import { apiGetUser } from "../utils";

export async function loader() {
  const user = apiGetUser();

  if (!user.registration.match(/\/register\/gender\/?/))
    return redirect(user.registration);

  return null;
}

export async function action() {
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.
  return null;
}

// 1st
export default function Gender() {
  return <h1>Gender</h1>;
}
