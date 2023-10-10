import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
*,
::after,
::before {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  font-size: calc(1.05rem + 0.1vw);
  font-weight: 200;
  line-height: 1.5;
  color: #2d3748;
  transition: all 0.12s ease-out 0s;
  background: #f7fafc;
}

::selection {
  background: #c6f6d5;
}

ul {
  list-style-type: none;
}

a {
  text-decoration: none;
  color: #2d3748;
}
`;
