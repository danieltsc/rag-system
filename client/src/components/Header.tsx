import React from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
`;

const LogoLink = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: #000;
  text-decoration: none;
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLinkStyled = styled(Link)`
  font-size: 1rem;
  color: #000;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Header: React.FC = () => (
  <HeaderContainer>
    <LogoLink href="/">🚀 SupportCopilot</LogoLink>
    <Nav>
      <NavLinkStyled href="/settings">Settings</NavLinkStyled>
      <NavLinkStyled href="/chat">Chat</NavLinkStyled>
    </Nav>
  </HeaderContainer>
);

export default Header;