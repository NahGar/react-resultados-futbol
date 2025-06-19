import React, { useState, useEffect } from 'react';
import { getMatches } from '../services/api';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const MatchList = ({ competitionId, competitionName }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      if (!competitionId) return;
      
      setLoading(true);
      try {
        const data = await getMatches(competitionId);
        setMatches(data.matches);
        setError(null);
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError(err.message || "Error cargando partidos");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [competitionId]);

  if (!competitionId) return null;

  if (loading) {
    return (
      <div className="loading-container">
        <Skeleton height={40} width="50%" style={{ marginBottom: '20px' }} />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton-match-card">
            <Skeleton height={24} width="30%" />
            <div className="skeleton-teams">
              <Skeleton circle height={50} width={50} />
              <Skeleton height={20} width={60} />
              <Skeleton circle height={50} width={50} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return (
    <div className="error-card">
      <h3>Error al cargar partidos</h3>
      <p>{error}</p>
    </div>
  );

  // Agrupar partidos por fecha
  const matchesByDate = matches.reduce((acc, match) => {
    const date = match.utcDate.substring(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  // Ordenar fechas
  const sortedDates = Object.keys(matchesByDate).sort();

  return (
    <div className="match-list">
      <h2>{competitionName}</h2>
      
      {sortedDates.length === 0 ? (
        <div className="no-matches">
          <p>No hay partidos programados</p>
        </div>
      ) : (
        sortedDates.map(date => (
          <div key={date} className="match-date-group">
            <div className="match-date-header">
              {format(parseISO(date), "EEEE, d 'de' MMMM", { locale: es })}
            </div>
            
            {matchesByDate[date].map(match => (
              <div key={match.id} className="match-card">
                <div className="match-time">
                  {format(parseISO(match.utcDate), "HH:mm", { locale: es })}
                </div>
                <div className="match-teams">
                  <div className="team home-team">
                    <span className="team-name">{match.homeTeam.shortName || match.homeTeam.name}</span>
                    {match.homeTeam.crest ? (
                      <img 
                        src={match.homeTeam.crest} 
                        alt={match.homeTeam.name} 
                        className="team-crest"
                        onError={(e) => e.target.src = '/default-crest.svg'}
                      />
                    ) : (
                      <div className="crest-placeholder">⚽</div>
                    )}
                  </div>
                  <div className="vs">vs</div>
                  <div className="team away-team">
                    {match.awayTeam.crest ? (
                      <img 
                        src={match.awayTeam.crest} 
                        alt={match.awayTeam.name} 
                        className="team-crest"
                        onError={(e) => e.target.src = '/default-crest.svg'}
                      />
                    ) : (
                      <div className="crest-placeholder">⚽</div>
                    )}
                    <span className="team-name">{match.awayTeam.shortName || match.awayTeam.name}</span>
                  </div>
                </div>
                <div className="match-venue">
                  {match.venue || 'Estadio no disponible'}
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default MatchList;