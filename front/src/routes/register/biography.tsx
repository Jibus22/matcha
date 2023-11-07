import { registrationLoader } from "./utils";

export const loader = registrationLoader(/\/register\/biography\/?/);

export async function action() {
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.
  return null;
}

// 3rd
export default function Biography() {
  return <h1>Biography</h1>;
}
