import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmployeePortal from './EmployeePortal';

// Mock des services
jest.mock('../../services/api', () => ({
  employeeService: {
    getById: jest.fn()
  },
  requestService: {
    getByEmployeeId: jest.fn(),
    create: jest.fn(),
    delete: jest.fn()
  },
  sanctionService: {
    getByEmployeeName: jest.fn()
  },
  evenementService: {
    getUpcoming: jest.fn()
  },
  noteService: {
    getPublicNotes: jest.fn()
  }
}));

// Mock de sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage
});

// Mock de navigate
const mockNavigate = jest.fn();

// Wrapper pour le composant avec le router
const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('EmployeePortal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock des données de session
    mockSessionStorage.getItem.mockReturnValue(JSON.stringify({
      id: 1,
      nom_prenom: 'John Doe',
      email: 'john.doe@example.com'
    }));
  });

  test('affiche l\'écran de chargement initialement', () => {
    renderWithRouter(<EmployeePortal />);
    expect(screen.getByText('Chargement de votre espace personnel...')).toBeInTheDocument();
  });

  test('affiche le tableau de bord après chargement', async () => {
    const { employeeService, evenementService, sanctionService, noteService } = require('../../services/api');
    
    employeeService.getById.mockResolvedValue({
      id: 1,
      nom_prenom: 'John Doe',
      email: 'john.doe@example.com',
      entity: 'IT'
    });
    
    evenementService.getUpcoming.mockResolvedValue([
      {
        id: 1,
        name: 'Réunion équipe',
        date: '2025-06-25',
        location: 'Salle conférence',
        description: 'Réunion mensuelle'
      }
    ]);
    
    sanctionService.getByEmployeeName.mockResolvedValue([]);
    noteService.getPublicNotes.mockResolvedValue([]);

    renderWithRouter(<EmployeePortal />);

    await waitFor(() => {
      expect(screen.getByText('Bienvenue, John')).toBeInTheDocument();
    });
  });

  test('permet de naviguer entre les onglets', async () => {
    const { employeeService, evenementService, sanctionService, noteService } = require('../../services/api');
    
    employeeService.getById.mockResolvedValue({
      id: 1,
      nom_prenom: 'John Doe',
      email: 'john.doe@example.com'
    });
    
    evenementService.getUpcoming.mockResolvedValue([]);
    sanctionService.getByEmployeeName.mockResolvedValue([]);
    noteService.getPublicNotes.mockResolvedValue([]);

    renderWithRouter(<EmployeePortal />);

    await waitFor(() => {
      expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
    });

    // Cliquer sur l'onglet Documents
    fireEvent.click(screen.getByText('Documents'));
    expect(screen.getByText('Mes documents')).toBeInTheDocument();

    // Cliquer sur l'onglet Demandes
    fireEvent.click(screen.getByText('Mes demandes'));
    expect(screen.getByText('Mes demandes')).toBeInTheDocument();
  });

  test('affiche les messages d\'erreur appropriés', async () => {
    const { employeeService } = require('../../services/api');
    
    employeeService.getById.mockRejectedValue(new Error('Erreur API'));

    renderWithRouter(<EmployeePortal />);

    await waitFor(() => {
      expect(screen.getByText('Impossible de charger les données utilisateur. Veuillez vous reconnecter.')).toBeInTheDocument();
    });
  });

  test('permet la déconnexion', async () => {
    const { employeeService, evenementService, sanctionService, noteService } = require('../../services/api');
    
    employeeService.getById.mockResolvedValue({
      id: 1,
      nom_prenom: 'John Doe',
      email: 'john.doe@example.com'
    });
    
    evenementService.getUpcoming.mockResolvedValue([]);
    sanctionService.getByEmployeeName.mockResolvedValue([]);
    noteService.getPublicNotes.mockResolvedValue([]);

    renderWithRouter(<EmployeePortal />);

    await waitFor(() => {
      expect(screen.getByText('Déconnexion')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Déconnexion'));
    
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('employeeUser');
    expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('token');
  });
});












