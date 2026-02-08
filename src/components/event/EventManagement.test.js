import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EventManagement from './EventManagement';

// Mock des services
jest.mock('../../services/api', () => ({
  evenementService: {
    getAll: jest.fn(() => Promise.resolve([])),
    create: jest.fn(() => Promise.resolve({ id: 1, name: 'Test Event' })),
    update: jest.fn(() => Promise.resolve({ id: 1, name: 'Updated Event' })),
    delete: jest.fn(() => Promise.resolve({ success: true }))
  }
}));

describe('EventManagement Component', () => {
  beforeEach(() => {
    // Reset des mocks
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<EventManagement />);
    expect(screen.getByText('Gestion des Événements')).toBeInTheDocument();
  });

  test('shows filters panel when filters button is clicked', () => {
    render(<EventManagement />);
    const filtersButton = screen.getByText('Filtres');
    
    fireEvent.click(filtersButton);
    
    expect(screen.getByText('Recherche')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Lieu')).toBeInTheDocument();
  });

  test('shows new event modal when button is clicked', () => {
    render(<EventManagement />);
    const newEventButton = screen.getByText('+ Nouvel Événement');
    
    fireEvent.click(newEventButton);
    
    expect(screen.getByText('Nouvel événement')).toBeInTheDocument();
  });

  test('displays notification on successful event creation', async () => {
    render(<EventManagement />);
    
    // Ouvrir le modal
    const newEventButton = screen.getByText('+ Nouvel Événement');
    fireEvent.click(newEventButton);
    
    // Remplir le formulaire
    const nameInput = screen.getByLabelText('Nom de l\'événement *');
    const dateInput = screen.getByLabelText('Date *');
    const locationInput = screen.getByLabelText('Lieu *');
    const descriptionInput = screen.getByLabelText('Description *');
    
    fireEvent.change(nameInput, { target: { value: 'Test Event' } });
    fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    // Soumettre le formulaire
    const submitButton = screen.getByText('Enregistrer');
    fireEvent.click(submitButton);
    
    // Vérifier que la notification apparaît
    await waitFor(() => {
      expect(screen.getByText('Événement créé avec succès!')).toBeInTheDocument();
    });
  });

  test('filters events by search term', () => {
    render(<EventManagement />);
    
    // Ouvrir les filtres
    const filtersButton = screen.getByText('Filtres');
    fireEvent.click(filtersButton);
    
    // Saisir un terme de recherche
    const searchInput = screen.getByPlaceholderText('Rechercher un événement...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    expect(searchInput.value).toBe('test');
  });

  test('resets filters when reset button is clicked', () => {
    render(<EventManagement />);
    
    // Ouvrir les filtres
    const filtersButton = screen.getByText('Filtres');
    fireEvent.click(filtersButton);
    
    // Saisir des valeurs dans les filtres
    const searchInput = screen.getByPlaceholderText('Rechercher un événement...');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    
    // Cliquer sur réinitialiser
    const resetButton = screen.getByText('Réinitialiser les filtres');
    fireEvent.click(resetButton);
    
    // Vérifier que les filtres sont réinitialisés
    expect(searchInput.value).toBe('');
  });
});











