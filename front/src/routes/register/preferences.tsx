import { registrationLoader } from "./utils";

export const loader = registrationLoader(/\/register\/preferences\/?/);

export async function action() {
  // Requete API pour post/update les données et retour éventuel d'erreurs sinon
  // redirection vers la page suivante.
  return null;
}

// 2nd
export default function Preferences() {
  return <h1>Preferences</h1>;
}
