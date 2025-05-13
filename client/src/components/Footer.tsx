import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #f8f8f8;
  color: #666;
  font-size: 0.875rem;
`;

const Footer: React.FC = () => (
  <FooterContainer>
    &copy; {new Date().getFullYear()} Support Copilot. All rights reserved.
  </FooterContainer>
);

export default Footer;