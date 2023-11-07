import { Form } from "react-router-dom";
import styled from "styled-components";
import { device } from "../style/breakpoints";

export const Header = styled.nav`
  z-index: 100;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.5em 2em;
  a,
  button {
    background: rgb(255, 19, 93);
    border-radius: 3em;
    border: 1px solid black;
    border-radius: 1em;
    color: black;
    padding: 0.4em;
  }
  button {
    font-size: calc(1.05rem + 0.1vw);
    font-weight: 300;
    cursor: pointer;
  }
`;

export const PageContent = styled.div`
  position: relative;
  height: 100vh;
  min-height: 1200px;
  padding-top: 60px;
  background: rgb(216, 248, 255);
  background: linear-gradient(
    135deg,
    rgba(216, 248, 255, 1) 0%,
    rgba(171, 156, 255, 1) 48%,
    rgba(255, 129, 194, 1) 100%
  );
`;

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

  @media ${device.md} {
    padding: 1em 0.7em;
  }
  @media ${device.sm} {
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
  backdrop-filter: blur(7px);
  border-radius: 10px;

  @media ${device.sm} {
    width: 100%;
  }
`;

export const FormStyleInput = styled.input<{ $errors?: boolean }>`
  font-weight: 300;
  color: #1f1f1f;
  background-color: rgba(230, 230, 230, 0.5);
  padding: 5px 12px;
  border-radius: 6px;
  border: ${(p) => (p?.$errors ? "1px red solid" : "none")};
  font-size: 1em;
  width: 100%;

  &::placeholder {
    color: rgba(129, 51, 255, 0.5);
    letter-spacing: 1px;
  }
`;

export const FormError = styled.p`
  font-size: 12px;
  color: red;
  line-height: 1.2;
  margin-top: 4px;
`;

export const FormValidMsg = styled.p`
  font-size: 14px;
  color: green;
  line-height: 1.2;
  margin-top: 4px;
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

  @media ${device.lg} {
    width: 65%;
  }
  @media (max-width: 1000px) {
    width: 78%;
  }
  @media ${device.md} {
    width: 88%;
  }
  @media ${device.sm} {
    width: 100%;
  }
`;
