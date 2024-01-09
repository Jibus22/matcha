import {
  ActionFunctionArgs,
  Form,
  Link,
  LoaderFunctionArgs,
} from "react-router-dom";
import { useUsers } from "../../store/users.rxjs";
import { IFullUser } from "../../models/user";
import styled from "styled-components";
import { calculateUserAge } from "../../utils/utils";
import {
  resetFineTunings,
  useOpenFilter,
  useOpenSorting,
} from "./store/rootOptionsButtons.rxjs";
import { updateSortOption, useSortOption } from "./store/sortOptions.rxjs";

export async function loader({ params }: LoaderFunctionArgs) {
  console.log("RootIndex Loader");
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  console.log(request);
  return null;
}

export default function RootIndex() {
  const users = useUsers();

  return (
    <>
      <RootBody>
        <FineTuning></FineTuning>
        <ProfileList>
          {users.map((user, idx) => {
            return (
              <ProfileItem key={idx}>
                <UserCard user={user}></UserCard>
              </ProfileItem>
            );
          })}
        </ProfileList>
      </RootBody>
    </>
  );
}

const RootBody = styled.div`
  padding: 0.4em 0.4em;
`;

function FineTuning() {
  const filter = useOpenFilter();
  const sort = useOpenSorting();
  return (
    <>
      {!sort && !filter ? (
        <></>
      ) : (
        <OptionOverlay onClick={resetFineTunings}>
          <OptionWindow
            onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
              e.stopPropagation();
            }}
          >
            <OptionWindowBtn type="button" onClick={resetFineTunings}>
              X
            </OptionWindowBtn>
            {sort ? <SortList></SortList> : <FilterList></FilterList>}
          </OptionWindow>
        </OptionOverlay>
      )}
    </>
  );
}

const OptionOverlay = styled.div`
  background: rgba(10, 10, 10, 0.6);
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: start;
`;

const OptionWindow = styled.div`
  min-width: 300px;
  margin-top: 40px;
  backdrop-filter: blur(4px);
  background: rgba(200, 200, 200, 0.4);
  border: 1px solid rgba(180, 180, 180, 0.4);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4em;
  position: relative;
`;

const OptionWindowBtn = styled.button`
  position: absolute;
  top: -8px;
  left: -8px;
  padding: 0.2em;
  font-weight: 100;
  width: 1.4em;
  height: 1.4em;
  border-radius: 1.4em;
  border: 1px solid rgba(250, 250, 250, 0.3);
  background: rgba(235, 235, 235, 0.6);
  color: rgb(40, 40, 40);

  &:hover {
    cursor: pointer;
  }
`;

function SortList() {
  const option = useSortOption();

  return (
    <>
      <FineTuneTitle>SORT BY</FineTuneTitle>
      <SortForm>
        <SortInput
          type="radio"
          id="none"
          value="none"
          name="none"
          checked={option === "none"}
          onChange={updateSortOption}
        />
        <SortLabel htmlFor="none">none</SortLabel>
        <SortInput
          type="radio"
          id="age"
          value="age"
          name="age"
          checked={option === "age"}
          onChange={updateSortOption}
        />
        <SortLabel htmlFor="age">age</SortLabel>
        <SortInput
          type="radio"
          id="tags"
          value="tags"
          name="tags"
          checked={option === "tags"}
          onChange={updateSortOption}
        />
        <SortLabel htmlFor="tags">common tags</SortLabel>
      </SortForm>
    </>
  );
}

const FineTuneTitle = styled.div`
  border-bottom: 1px solid rgba(240, 240, 240, 0.2);
  font-weight: 500;
`;

const SortForm = styled(Form)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.4em;
  margin: 0.4em;
  gap: 6px;
`;

const SortInput = styled.input`
  display: none;

  &[type="radio"]:checked + label {
    background: rgba(240, 240, 240, 0.5);
    box-shadow: 0 0px 5px 3px rgba(240, 240, 240, 0.5);
  }

  &[type="radio"]:hover + label {
    cursor: pointer;
  }
`;

const SortLabel = styled.label`
  border: 1px solid rgba(240, 240, 240, 0.3);
  padding: 0.2em;
  border-radius: 8px;
  background: rgba(240, 240, 240, 0.3);
  width: 100%;
  text-align: center;
`;

function FilterList() {
  return <div>FILTER</div>;
}

const ProfileList = styled.ul`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;
`;

const ProfileItem = styled.li`
  width: 300px;
  min-height: 350px;
  background: rgba(250, 250, 250, 0.8);
  border-radius: 6px;
  box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.25);
`;

function UserCard({ user }: { user: IFullUser }) {
  console.log(user);
  return (
    <>
      <PhotoContainer>
        <Link to={user.username || "/"}>
          <ImgContainer
            src={user.photos?.at(0)?.path || ""}
            alt={`${user.username} profile picture`}
          />
        </Link>
      </PhotoContainer>
      <InfoLayout>
        <InfoContainer>
          <NameContainer>{user.username}</NameContainer>
          <AgeContainer>{calculateUserAge(user)}</AgeContainer>
        </InfoContainer>
        <InterestsContainer>
          {user.interests?.map((interest, idx) => {
            return <TagContainer key={idx}>{interest}</TagContainer>;
          })}
        </InterestsContainer>
      </InfoLayout>
    </>
  );
}

const PhotoContainer = styled.div`
  height: 280px;
`;

const ImgContainer = styled.img`
  object-fit: cover;
  width: 100%;
  height: 100%;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
`;

const InfoLayout = styled.div`
  padding: 0.4em;
`;

const InfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NameContainer = styled.p`
  font-size: 1.4em;
  color: rgba(20, 20, 20, 0.8);
`;

const AgeContainer = styled.p`
  color: rgba(100, 100, 100, 0.8);
  font-size: 0.9em;
  font-weight: 200;
  font-style: italic;
`;

const InterestsContainer = styled.ul`
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 4px;
`;

const TagContainer = styled.li`
  padding: 0.13em;
  font-size: 0.78em;
  border-radius: 10px;
  background: rgba(204, 204, 254, 0.2);
`;
