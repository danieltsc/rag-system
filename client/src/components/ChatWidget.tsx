import React, { useState } from 'react';
import styled from 'styled-components';
import ChatPage from '../pages/chat';

const LauncherButton = styled.button`
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 50%;
  width: 3.5rem;
  height: 3.5rem;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 1000;
`;

const WidgetContainer = styled.div`
  position: fixed;
  bottom: 5rem;
  right: 1.5rem;
  width: 360px;
  height: 600px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: scroll;
`;

const CloseButton = styled.button`
  align-self: flex-end;
  margin: 0.5rem;
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
`;

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <LauncherButton onClick={() => setOpen(true)}>💬</LauncherButton>
      {open && (
        <WidgetContainer>
          <CloseButton onClick={() => setOpen(false)}>×</CloseButton>
          <ChatPage />
        </WidgetContainer>
      )}
    </>
  );
}