import { registrationLoader } from "./utils";

export const loader = registrationLoader(/\/register\/gender\/?/);

export async function action() {
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.
  return null;
}

// 1st
export default function Gender() {
  return <h1>Gender</h1>;
}
