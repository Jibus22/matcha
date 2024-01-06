import { Body } from "../styles";
import UserProfileCard from "../../components/UserProfileCard";
import { useUser } from "../../store/user.rxjs";

export default function Profile() {
  const user = useUser();

  //TODO: afficher le mail et bouton pour proposer de changer le profile
  return (
    <>
      <Body>
        <UserProfileCard user={user}></UserProfileCard>
      </Body>
    </>
  );
}
