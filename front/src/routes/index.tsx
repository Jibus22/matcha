import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";

const Body = styled.div`
  padding: calc(0.1em + 8vh) 5em;
  display: grid;
  grid-template-columns: 2fr 1fr;
  @media (max-width: 940px) {
    padding: calc(0.1em + 7vh) 0.2em;
  }
  @media (max-width: 700px) {
    padding: calc(0.1em + 2vh) 0.2em;
    display: flex;
    flex-direction: column;
  }
`;

const Section = styled.section`
  padding: 1em;
  position: relative;
`;

const ImageContainer = styled.div`
  width: 100%;

  img {
    object-fit: contain;
    width: 100%;
    height: 100%;
    max-height: 400px;
  }
`;

const HomePrez = styled.div`
  max-width: 700px;
  width: 100%;
  padding-top: 4em;
  padding-bottom: 2em;
  padding-left: 5em;
  margin: 0 auto;
  p {
    padding: 1em 2em;
  }
  @media (max-width: 700px) {
    padding-left: 0em;
  }
`;

const glitch = keyframes`
    0% {
      transform: translate(0);
    }
    20% {
      transform: translate(-2px, 1px);
    }
    40% {
      transform: translate(-1px, -2px);
    }
    60% {
      transform: translate(1px, 2px);
    }
    80% {
      transform: translate(2px, -1px);
    }
    to {
      transform: translate(0);
    }
`;

const GlitchWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  > h1 {
    font-size: 3em;
    letter-spacing: 3px;
    position: relative;
    font-weight: bold;
    z-index: 1;

    &::before,
    &::after {
      display: block;
      content: attr(data-text);
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0.8;
    }

    &::before {
      animation: ${glitch} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) both
        infinite;
      color: #26d8ff;
      z-index: -1;
    }

    &::after {
      animation: ${glitch} 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) reverse
        both infinite;
      color: #ff2193;
      z-index: -2;
    }
  }
`;

const ButtonLink = styled(Link)`
  margin-left: 30%;
  padding: 1em;
  background: rgb(255, 19, 93);
  border-radius: 3em;
  border: 1px solid black;
`;

export default function Index() {
  const title = "Take your love dose.";
  return (
    <Body>
      <Section>
        <HomePrez>
          <GlitchWrapper>
            <h1 data-text={title}>{title}</h1>
          </GlitchWrapper>
          <p>
            At Matcha, our products are fresh and high quality. You can consume
            organic and local thanks to the choice we offer. Be careful, you can
            also be consumed, we never know. Good tasting
          </p>
        </HomePrez>
        <ButtonLink to="/signup">start&nbsp;shopping</ButtonLink>
      </Section>
      <Section>
        <ImageContainer>
          <img src="/home-love2.png" alt="A couple"></img>
        </ImageContainer>
      </Section>
    </Body>
  );
}
