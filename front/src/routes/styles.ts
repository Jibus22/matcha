import { Form } from "react-router-dom";
import styled from "styled-components";

export const Body = styled.div`
  margin-top: 2em;
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  min-height: 80vh;
  margin-inline-start: auto;
  margin-inline-end: auto;
  width: 85%;
  padding: 1em 3em;

  @media (max-width: 870px) {
    padding: 1em 0.7em;
  }
  @media (max-width: 600px) {
    width: 100%;
  }
`;

export const CustomForm = styled(Form)`
  display: grid;
  gap: 12px;
  width: 60%;
  margin-inline-start: auto;
  margin-inline-end: auto;
  padding: 3em 1em;
  background-color: rgba(218, 167, 250, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 10px;

  & input {
    font-weight: 300;
    color: #1f1f1f;
    background-color: rgba(230, 230, 230, 0.5);
    padding: 5px 12px;
    border-radius: 6px;
    border: none;
    font-size: 1em;

    &::placeholder {
      color: rgba(129, 51, 255, 0.5);
      letter-spacing: 1px;
    }
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

export const Button = styled.button`
  border-radius: 6px;
  border: 1px solid rgba(98, 91, 102, 0.2);
  padding: 5px 12px;
  font-size: 1em;
  background-color: #ff1a5e;
  color: #dadae5;
  &:hover {
    cursor: pointer;
  }
`;

export const BgImage = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;

  img {
    object-fit: contain;
    width: 100%;
  }

  @media (max-width: 1220px) {
    width: 65%;
  }
  @media (max-width: 1000px) {
    width: 78%;
  }
  @media (max-width: 870px) {
    width: 88%;
  }
  @media (max-width: 700px) {
    width: 100%;
  }
`;
