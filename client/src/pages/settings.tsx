// src/pages/settings.tsx
'use client'

import dynamic from 'next/dynamic';
const ReactQuill = dynamic(
  () => import('react-quill').then((mod) => mod.default),
  { ssr: false }
);
import 'react-quill/dist/quill.snow.css';

import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useDropzone } from 'react-dropzone';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../lib/api';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;
const fadeOut = keyframes`from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); }`;

const SnackbarContainer = styled.div<{ type: 'success' | 'error'; open: boolean }>`
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ type }) => (type === 'success' ? '#4caf50' : '#f44336')};
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  animation: ${({ open }) => (open ? fadeIn : fadeOut)} 0.3s forwards;
  pointer-events: none;
`;

// Styled components
const Container = styled.main`
  max-width: 960px;
  margin: 2rem auto;
  padding: 0 1rem;
`;
const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid #eee;
  margin-bottom: 1.5rem;
`;
const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem 1rem;
  background: ${({ $active }) => ($active ? '#fff' : '#f9f9f9')};
  border: none;
  border-bottom: ${({ $active }) => ($active ? '3px solid #0070f3' : 'none')};
  font-size: 1rem;
  cursor: pointer;
  &:hover { background: #fff; }
`;
const Content = styled.section`
  background: #fff;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border-radius: 8px;
`;
const UploadArea = styled.div`
  border: 2px dashed #ccc;
  padding: 2rem;
  text-align: center;
  color: #666;
  cursor: pointer;
`;
const Button = styled.button`
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #0070f3;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover { background: #005bb5; }
`;
const List = styled.ul`
  list-style: none;
  padding: 0;
`;
const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #eee;
`;
const ActionGroup = styled.div`
  button { margin-left: 0.5rem; }
`;
const TextArea = styled.textarea`
  width: 100%;
  height: 8rem;
  font-family: monospace;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const Toolbar = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  button {
    padding: 0.4rem 0.6rem;
    border: 1px solid #ccc;
    background: #fafafa;
    cursor: pointer;
    border-radius: 4px;
    &.active {
      background: #e0f3ff;
      border-color: #0070f3;
    }
    &:hover { background: #f0f0f0; }
  }
`
const EditorWrapper = styled.div`
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 200px;
  padding: 0.75rem;

  .ProseMirror {
    min-height: 200px;
    outline: none;
  }
`

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'editor' | 'manage' | 'embed'>('upload');
  const [editorContent, setEditorContent] = useState('');
  const [snack, setSnack] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  // Initialize TipTap editor
  const editor = useEditor({ extensions: [StarterKit], content: '', onUpdate: ({ editor }) => setEditorContent(editor.getHTML()) });

  // Snackbar helper
  const showSnackbar = (message: string, type: 'success' | 'error') => {
    setSnack({ open: true, message, type });
    setTimeout(() => setSnack(prev => ({ ...prev, open: false })), 3000);
  };

  // Dropzone for file upload
  const onDrop = useCallback(async (files: File[]) => {
    try {
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      await api.post('/upload/file', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      showSnackbar('File uploaded successfully', 'success');
    } catch (err) {
      console.error(err);
      showSnackbar('File upload failed', 'error');
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop } as any);

  // Submit editor content
  const submitEditor = async () => {
    if (!editorContent) return;
    try {
      await api.post('/upload/text', { text: editorContent });
      editor?.commands.clearContent();
      setEditorContent('');
      showSnackbar('Text embedded successfully', 'success');
    } catch (err) {
      console.error(err);
      showSnackbar('Text submission failed', 'error');
    }
  };

  return (
    <>
      <Header />
      <Container>
        <Tabs>
          <Tab $active={activeTab === 'upload'} onClick={() => setActiveTab('upload')}>Upload File</Tab>
          <Tab $active={activeTab === 'editor'} onClick={() => setActiveTab('editor')}>Rich Text Editor</Tab>
        </Tabs>

        <Content>
          {activeTab === 'upload' && (
            <UploadArea {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive ? 'Drop files here…' : 'Drag & drop PDF, DOCX, or Markdown—or click to select'}
            </UploadArea>
          )}
          {activeTab === 'editor' && editor && (
            <>
              <Toolbar>Try making it as LLM friendly as possible.</Toolbar>
              <EditorWrapper>
                <EditorContent editor={editor} />
              </EditorWrapper>
              <Button onClick={submitEditor}>Embed Text</Button>
            </>
          )}
        </Content>
      </Container>
      {snack.open && <SnackbarContainer type={snack.type} open={snack.open}>{snack.message}</SnackbarContainer>}
      <Footer />
    </>
  );
}
