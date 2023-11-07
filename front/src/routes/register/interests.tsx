import { redirect } from "react-router-dom";
import { apiGetUser } from "../utils";

export async function loader() {
  const user = apiGetUser();

  if (!user.registration.match(/\/register\/interests\/?/))
    return redirect(user.registration);

  return null;
}

export async function action() {
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.
  return null;
}

// 4th
export default function Interests() {
  return <h1>Interests</h1>;
}
