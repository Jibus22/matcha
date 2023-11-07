import { redirect } from "react-router-dom";
import { apiGetUser } from "../utils";

export async function loader() {
  const user = apiGetUser();

  if (!user.registration.match(/\/register\/pictures\/?/))
    return redirect(user.registration);

  //TODO: Checker si la route racine suffit à faire les checks + redirection
  return null;
}

export async function action() {
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.
  return null;
}

// 5th (last)
export default function Pictures() {
  return <h1>Pictures</h1>;
}
