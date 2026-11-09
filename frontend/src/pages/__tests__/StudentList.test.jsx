import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import StudentList from '../StudentList';
import api from '../../api/axios';
import * as authContext from '../../context/AuthContext';

// Mock axios
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('Frontend UI Tests: Student Directory (StudentList.jsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 1, name: 'NSU Admin', email: 'nsu_admin@smartid.com', role: 'client_admin', university_id: 1 },
      logout: vi.fn(),
    });

    api.get.mockImplementation((url) => {
      if (url === '/departments') {
        return Promise.resolve({ data: [{ id: 1, name: 'CSE' }] });
      }
      if (url === '/batches') {
        return Promise.resolve({
          data: [{ id: 10, department_id: 1, department_name: 'CSE', year: 2026, semester_code: 'FL' }]
        });
      }
      if (url === '/students') {
        return Promise.resolve({
          data: [
            {
              id: 101,
              student_id: 'CSE26FL001',
              name: 'Arafat Rahman',
              department_name: 'CSE',
              semester_code: 'FL',
              year: 2026,
              email: 'arafat@email.com',
              phone: '01711111111',
              admitted_at: '2026-10-30T10:00:00.000Z'
            }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <StudentList />
      </BrowserRouter>
    );

  test('TC_UI_LIST_01 [Roster Rendering]: should render student record with monospace ID badge and details', async () => {
    renderComponent();

    // Verify Page Heading
    expect(screen.getByRole('heading', { name: /Student Directory/i })).toBeInTheDocument();

    // Verify Roster Record
    await waitFor(() => {
      expect(screen.getByText('CSE26FL001')).toBeInTheDocument();
      expect(screen.getByText('Arafat Rahman')).toBeInTheDocument();
      expect(screen.getByText('arafat@email.com')).toBeInTheDocument();
    });
  });

  test('TC_UI_LIST_02 [Action Buttons]: should display Export CSV and Print/PDF buttons', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CSE26FL001')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print \/ PDF/i })).toBeInTheDocument();
  });

  test('TC_UI_LIST_03 [Empty State]: should display empty state when student list has 0 records', async () => {
    // Override /students to return empty list
    api.get.mockImplementation((url) => {
      if (url === '/students') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/No students found/i)).toBeInTheDocument();
    });
  });

  test('TC_UI_LIST_04 [Option B Modal]: should open ID Card modal on button click and display card credentials', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CSE26FL001')).toBeInTheDocument();
    });

    // Click "ID Card" action button
    const idCardBtn = screen.getByRole('button', { name: /ID Card/i });
    fireEvent.click(idCardBtn);

    // Verify modal elements
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Identity Card/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Upload Student Photo/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Print Card/i })).toBeInTheDocument();
    });
  });

  test('TC_UI_LIST_05 [Modal Dismiss]: should close modal when Close button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CSE26FL001')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /ID Card/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Student Identity Card/i })).toBeInTheDocument();
    });

    // Click Close button (title="Close modal")
    fireEvent.click(screen.getByTitle('Close modal'));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Student Identity Card/i })).not.toBeInTheDocument();
    });
  });
});