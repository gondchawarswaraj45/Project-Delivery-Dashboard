import React from 'react';
import { ProjectProvider, useProjectContext } from './context/ProjectContext';
import { Header } from './components/Header/Header';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProjectDetail } from './components/ProjectDetail/ProjectDetail';

const MainContent: React.FC = () => {
  const { selectedProjectId } = useProjectContext();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {selectedProjectId ? <ProjectDetail /> : <Dashboard />}
      </main>
    </div>
  );
};

export function App() {
  return (
    <ProjectProvider>
      <MainContent />
    </ProjectProvider>
  );
}

export default App;
