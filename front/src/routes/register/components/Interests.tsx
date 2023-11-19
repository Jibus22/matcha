import { ReactElement } from "react";
import { Body, FormStyleInput, RegisterForm } from "../../styles";
import { NavBtnContainer } from "../styles";
import styled from "styled-components";

export default function Interests({
  backBtn,
  nextBtn,
  onKeyUp,
  onClick,
  interests,
}: {
  backBtn?: ReactElement;
  nextBtn?: ReactElement;
  onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  interests: Set<string>;
}) {
  return (
    <>
      <Body>
        <h2>List 3 to 8 of your interests</h2>
        <InterestsForm onSubmit={(e) => e.preventDefault()}>
          {interests.size > 0 && (
            <InterestsGrid>
              {[...interests].map((elem, idx) => {
                return (
                  <InterestCard key={idx}>
                    <button type="button" onClick={onClick}>
                      X
                    </button>
                    <p>{elem}</p>
                  </InterestCard>
                );
              })}
            </InterestsGrid>
          )}
          <div>
            <label htmlFor="biography">
              Hit enter when you finished typing
            </label>
            <FormStyleInput
              onKeyUp={onKeyUp}
              type="text"
              id="interests"
              name="interests"
              placeholder="court hunting, weightlifting, tuning..."
              minLength={3}
              maxLength={16}
              pattern="^[a-z]+([\- ][a-z]+$)?"
              title="Enter only [a-z] characters (one space or dash allowed)"
              autoFocus
              required
              disabled={interests.size == 8}
            ></FormStyleInput>
            <span className="validity"></span>
          </div>
          <NavBtnContainer>
            <div>{backBtn && backBtn}</div>
            <div>{interests.size >= 3 && nextBtn && nextBtn}</div>
          </NavBtnContainer>
        </InterestsForm>
      </Body>
    </>
  );
}

const InterestsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-bottom: 1em;
`;

const InterestCard = styled.div`
  position: relative;
  min-height: 35px;
  font-size: 0.85em;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 25px;
  border-radius: 0.5rem;
  background-color: rgba(230, 200, 200, 0.2);
  box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.25);

  > p {
    word-break: break-word;
  }

  > button {
    position: absolute;
    background-color: rgba(250, 250, 250, 0.4);
    left: 2px;
    padding: 4px;
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 20px;
  }

  > button:hover {
    cursor: pointer;
  }
`;

const InterestsForm = styled(RegisterForm)`
  label,
  p {
    font-size: calc(0.85rem + 0.1vw);
  }

  div {
    position: relative;

    span {
      position: absolute;
      right: 6px;
      bottom: 0;
    }

    input:invalid {
      border: 2px solid rgba(255, 30, 30, 0.6);
    }

    input:invalid + span:after {
      content: "✖";
    }

    input:valid + span:after {
      content: "✓";
    }
  }
`;
