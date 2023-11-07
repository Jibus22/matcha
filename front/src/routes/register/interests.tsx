import { registrationLoader } from "./utils";

export const loader = registrationLoader(/\/register\/interests\/?/);

export async function action() {
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.
  return null;
}

// 4th
export default function Interests() {
  return <h1>Interests</h1>;
}
