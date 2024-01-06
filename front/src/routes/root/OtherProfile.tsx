import { LoaderFunctionArgs, redirect, useLoaderData } from "react-router-dom";
import { apiGetUserByUsername } from "../../controllers/user";
import { IFullUser } from "../../models/user";
import UserProfileCard from "../../components/UserProfileCard";
import styled from "styled-components";

export async function loader({ params }: LoaderFunctionArgs) {
  const user = params.username
    ? await apiGetUserByUsername(params.username)
    : null;

  if (!user) return redirect("/");

  return user;
}

export default function OtherProfile() {
  const user = useLoaderData() as IFullUser;

  return (
    <>
      <OtherProfileBody>
        <CardContainer>
          <UserProfileCard user={user}></UserProfileCard>
        </CardContainer>
      </OtherProfileBody>
    </>
  );
}

const OtherProfileBody = styled.div`
  padding: 0.8em 0.4em;
  display: flex;
  justify-content: center;
`;

const CardContainer = styled.div`
  width: 40vw;
  min-width: 380px;
  box-shadow: 0 12px 60px 0px rgba(0, 0, 0, 0.25);
  border-radius: 8px;
`;
