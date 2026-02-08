import React, { useState, useEffect } from 'react';
import '../../styles/EmployeePersonalStats.css';

const EmployeePersonalStats = ({ user, employeeRequests, events, notes, sanctions, onTabChange }) => {
  const [stats, setStats] = useState({
    pendingRequests: 0,
    approvedRequests: 0,
    totalRequests: 0,
    upcomingEvents: 0,
    unreadNotes: 0,
    activeSanctions: 0,
    leaveDaysUsed: 0,
    leaveDaysRemaining: 25 // À calculer depuis l'API
  });

  useEffect(() => {
    if (!employeeRequests) return;

    const pending = employeeRequests.filter(req => 
      (req.status === 'pending' || req.status === 'En attente')
    ).length;
    
    const approved = employeeRequests.filter(req => 
      (req.status === 'approved' || req.status === 'Approuvé')
    ).length;

    setStats(prev => ({
      ...prev,
      pendingRequests: pending,
      approvedRequests: approved,
      totalRequests: employeeRequests.length,
      upcomingEvents: events?.length || 0,
      unreadNotes: notes?.length || 0,
      activeSanctions: sanctions?.filter(s => s.statut === 'En cours').length || 0
    }));
  }, [employeeRequests, events, notes, sanctions]);

  const statCards = [
    {
      id: 'requests',
      title: 'Demandes en attente',
      value: stats.pendingRequests,
      icon: 'fa-clock',
      color: '#ffdd57',
      bgColor: 'rgba(255, 221, 87, 0.1)',
      tab: 'requests'
    },
    {
      id: 'events',
      title: 'Événements à venir',
      value: stats.upcomingEvents,
      icon: 'fa-calendar-check',
      color: '#00d1b2',
      bgColor: 'rgba(0, 209, 178, 0.1)',
      tab: 'events'
    },
    {
      id: 'notes',
      title: 'Notes de service',
      value: stats.unreadNotes,
      icon: 'fa-clipboard-list',
      color: '#295785',
      bgColor: 'rgba(41, 87, 133, 0.1)',
      tab: 'notes'
    }
  ];

  return (
    <div className="employee-personal-stats">
      <div className="stats-grid">
        {statCards.map((card) => (
          <div 
            key={card.id} 
            className="stat-card-personal"
            style={{ 
              borderTop: `4px solid ${card.color}`,
              cursor: 'pointer'
            }}
            onClick={() => {
              if (onTabChange && card.tab) {
                onTabChange(card.tab);
              }
            }}
          >
            <div className="stat-card-content-personal">
              <div 
                className="stat-icon-personal"
                style={{ 
                  backgroundColor: card.bgColor,
                  color: card.color
                }}
              >
                <i className={`fas ${card.icon}`}></i>
              </div>
              <div className="stat-info-personal">
                <div className="stat-value-personal">{card.value}</div>
                <div className="stat-label-personal">{card.title}</div>
              </div>
            </div>
            {card.id === 'requests' && stats.totalRequests > 0 && (
              <div className="stat-footer-personal">
                <span className="stat-subtext">
                  {stats.approvedRequests} approuvée{stats.approvedRequests > 1 ? 's' : ''} sur {stats.totalRequests}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};

export default EmployeePersonalStats;

