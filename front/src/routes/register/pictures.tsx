import { registrationLoader } from "./utils";

export const loader = registrationLoader(/\/register\/pictures\/?/);

export async function action() {
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.
  return null;
}

// 5th (last)
export default function Pictures() {
  return <h1>Pictures</h1>;
}
