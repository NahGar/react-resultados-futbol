import React, { useState, useEffect } from 'react';
import { getCompetitions } from '../services/api';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CompetitionList = ({ onSelectCompetition }) => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        const data = await getCompetitions();
        setCompetitions(data.competitions);
        setError(null);
      } catch (err) {
        console.error("Error fetching competitions:", err);
        setError(err.message || "Error cargando competiciones");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompetitions();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-card">
            <Skeleton height={120} />
            <div className="skeleton-content">
              <Skeleton width="80%" height={24} />
              <Skeleton width="60%" height={18} />
              <Skeleton width="40%" height={16} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return (
    <div className="error-card">
      <h3>Error al cargar datos</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()}>Reintentar</button>
    </div>
  );

  return (
    <div className="competition-list">
      <h2>Competiciones Principales</h2>
      <div className="competitions-container">
        {competitions.map(comp => (
          <div 
            key={comp.id} 
            className="competition-card"
            onClick={() => onSelectCompetition(comp)}
          >
            <div className="competition-flag">
              {comp.area.flag ? (
                <img 
                  src={comp.area.flag} 
                  alt={`Bandera de ${comp.area.name}`} 
                  className="flag"
                  onError={(e) => e.target.src = '/default-flag.svg'}
                />
              ) : (
                <div className="flag-placeholder">{comp.area.code}</div>
              )}
            </div>
            <div className="competition-info">
              <h3>{comp.name}</h3>
              <p>{comp.area.name} • {comp.type === 'LEAGUE' ? 'Liga' : 'Copa'}</p>
              <div className="competition-meta">
                <span className="season">
                  Temporada {comp.currentSeason?.startDate?.substring(0,4)}/
                  {comp.currentSeason?.endDate?.substring(2,4)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompetitionList;