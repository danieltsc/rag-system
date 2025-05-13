import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import ChatWidget from '@/components/ChatWidget';
import Link from 'next/link';

const HeroSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #6B73FF 0%, #000DFF 100%);
  color: #fff;
`;

const Title = styled.h1`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  max-width: 600px;
  text-align: center;
`;

const CTAButton = styled.button`
  margin-top: 2rem;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  background-color: #FF8A00;
  border-radius: 9999px;
  color: #000;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s;

  &:hover {
    background-color: #e67600;
  }
`;

const Features = styled.section`
  padding: 4rem 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background: #fff;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  color: #000;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`;

const FeatureText = styled.p`
  font-size: 1rem;
  line-height: 1.5;
`;

const Home: React.FC = () => (
  <>
    <Head>
      <title>Support Copilot — AI-Powered Technical Support</title>
      <meta name="description" content="Embed an AI support window on your site to handle user questions with RAG-powered answers." />
    </Head>
    <Header />

    <main>

      <HeroSection>
        <Title>Meet Your AI Technical Support Copilot</Title>
        <Subtitle>
          Instantly answer user queries on your site with context-aware AI powered by your own docs and data. Easy to embed, fully customizable, and lightning fast.
        </Subtitle>
        <CTAButton>
          <Link href="/chat" passHref legacyBehavior>
            Get Started
          </Link>
        </CTAButton>
      </HeroSection>

      <Features>
        <FeatureCard>
          <FeatureTitle>Contextual Answers</FeatureTitle>
          <FeatureText>Upload your docs and let the AI reference them in real time for accurate support.</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>Easy Integration</FeatureTitle>
          <FeatureText>Embed the support window anywhere with a single snippet and configure its look and feel.</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>Customizable</FeatureTitle>
          <FeatureText>Tweak settings in the dashboard to match your brand and tone.</FeatureText>
        </FeatureCard>
        <FeatureCard>
          <FeatureTitle>Save Time</FeatureTitle>
          <FeatureText>Reduce support load by giving instant, AI-driven responses 24/7.</FeatureText>
        </FeatureCard>
      </Features>
    </main>


    <ChatWidget />
    <Footer />
  </>
);

export default Home;