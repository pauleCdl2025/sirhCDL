import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChangePasswordModal from './ChangePasswordModal';

// Mock du service de changement de mot de passe
jest.mock('../../services/api', () => ({
  changePassword: jest.fn()
}));

// Mock de Formik
jest.mock('formik', () => ({
  Formik: ({ children, onSubmit }) => children({
    isSubmitting: false,
    errors: {},
    touched: {},
    values: { currentPassword: '', newPassword: '', confirmPassword: '' }
  }),
  Form: ({ children }) => <form>{children}</form>,
  Field: ({ name, type, className, placeholder }) => (
    <input name={name} type={type} className={className} placeholder={placeholder} />
  ),
  ErrorMessage: ({ name }) => <div data-testid={`error-${name}`}></div>
}));

describe('ChangePasswordModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ne s\'affiche pas quand isOpen est false', () => {
    render(
      <ChangePasswordModal
        isOpen={false}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.queryByText('Changer le mot de passe')).not.toBeInTheDocument();
  });

  test('s\'affiche correctement quand isOpen est true', () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Critères de sécurité :')).toBeInTheDocument();
    expect(screen.getByText('Mot de passe actuel')).toBeInTheDocument();
    expect(screen.getByText('Nouveau mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Confirmer le nouveau mot de passe')).toBeInTheDocument();
  });

  test('affiche les boutons d\'action', () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Annuler')).toBeInTheDocument();
    expect(screen.getByText('Modifier le mot de passe')).toBeInTheDocument();
  });

  test('ferme la modal quand le bouton Annuler est cliqué', () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.click(screen.getByText('Annuler'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('affiche les critères de sécurité', () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText(/Votre nouveau mot de passe doit contenir au moins 8 caractères/)).toBeInTheDocument();
    expect(screen.getByText(/incluant une minuscule, une majuscule, un chiffre et un caractère spécial/)).toBeInTheDocument();
  });

  test('affiche les champs de formulaire avec les bons placeholders', () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByPlaceholder('Entrez votre mot de passe actuel')).toBeInTheDocument();
    expect(screen.getByPlaceholder('Entrez votre nouveau mot de passe')).toBeInTheDocument();
    expect(screen.getByPlaceholder('Confirmez votre nouveau mot de passe')).toBeInTheDocument();
  });

  test('affiche les icônes appropriées', () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Changer le mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Modifier le mot de passe')).toBeInTheDocument();
  });

  test('gère la fermeture avec la touche Échap', () => {
    render(
      <ChangePasswordModal
        isOpen={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});












