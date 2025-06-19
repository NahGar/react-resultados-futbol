import React, { useState } from 'react';
import CompetitionList from './components/CompetitionList';
import MatchList from './components/MatchList';
import './App.css';

function App() {
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [view, setView] = useState('competitions');
  const [error, setGlobalError] = useState(null);

  const handleSelectCompetition = (competition) => {
    setSelectedCompetition(competition);
    setView('matches');
    setGlobalError(null);
  };

  const handleBackToCompetitions = () => {
    setSelectedCompetition(null);
    setView('competitions');
    setGlobalError(null);
  };

  const handleApiError = (error) => {
    setGlobalError(error.message);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>⚽ Resultados de Fútbol</h1>
        <p>Datos en tiempo real de competiciones de fútbol mundial</p>
      </header>
      
      {error && (
        <div className="global-error">
          <h3>Error en la aplicación</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Recargar aplicación</button>
        </div>
      )}
      
      <main className="app-main">
        {view === 'competitions' ? (
          <CompetitionList 
            onSelectCompetition={handleSelectCompetition} 
            onError={handleApiError}
          />
        ) : (
          <div className="matches-view">
            <button 
              onClick={handleBackToCompetitions}
              className="back-button"
            >
              &larr; Volver a competiciones
            </button>
            {selectedCompetition && (
              <MatchList 
                competitionId={selectedCompetition.id} 
                competitionName={selectedCompetition.name} 
                onError={handleApiError}
              />
            )}
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>Datos proporcionados por Football-Data.org</p>
        <p>© {new Date().getFullYear()} Resultados de Fútbol App</p>
        <p className="api-note">
          Esta aplicación utiliza la API de Football-Data.org. 
          Por favor, consulte sus términos de uso en 
          <a href="https://www.football-data.org" target="_blank" rel="noopener noreferrer"> football-data.org</a>.
        </p>
      </footer>
    </div>
  );
}

export default App;