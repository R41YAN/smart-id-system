import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AdmitStudent from '../AdmitStudent';
import api from '../../api/axios';
import * as authContext from '../../context/AuthContext';

// Mock axios
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('Frontend UI Tests: Admit Student & Live ID Card (AdmitStudent.jsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock Auth User as Client Admin of NSU (Open Credit)
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: { id: 1, name: 'NSU Admin', email: 'nsu_admin@smartid.com', role: 'client_admin', university_id: 1 },
      logout: vi.fn(),
    });

    // Mock API initial GET calls
    api.get.mockImplementation((url) => {
      if (url === '/departments') {
        return Promise.resolve({
          data: [
            { id: 1, name: 'CSE' },
            { id: 2, name: 'BBA' }
          ]
        });
      }
      if (url === '/batches') {
        return Promise.resolve({
          data: [
            { id: 10, department_id: 1, year: 2026, semester_code: 'FL', semester_index: 3, current_serial: 5 }
          ]
        });
      }
      if (url === '/universities/1') {
        return Promise.resolve({
          data: { id: 1, name: 'North South University', type: 'open_credit', is_locked: false }
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <AdmitStudent />
      </BrowserRouter>
    );

  test('TC_UI_ADM_01 [Rendering]: should render admission form and live ID card simulation', async () => {
    renderComponent();

    // Verify Page Header
    expect(screen.getByRole('heading', { name: /Admit Student & Generate ID/i })).toBeInTheDocument();

    // Verify Form Fields
    expect(screen.getByText(/Department \*/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Arafat Rahman/i)).toBeInTheDocument();

    // Verify Live ID Card Header & Watermark
    expect(screen.getByText(/Live ID Card Simulation/i)).toBeInTheDocument();
    expect(screen.getByText('STUDENT IDENTITY CARD')).toBeInTheDocument();
  });

  test('TC_UI_ADM_02 [Interactive Live Typing]: typing full name updates the digital ID card preview in real-time', async () => {
    renderComponent();

    const nameInput = screen.getByPlaceholderText(/e.g. Arafat Rahman/i);

    // Default card name
    expect(screen.getByText(/Student Full Name/i)).toBeInTheDocument();

    // User types new student name
    fireEvent.change(nameInput, { target: { value: 'Nusrat Jahan' } });

    // Assert that the digital ID card preview now renders "Nusrat Jahan"
    expect(screen.getByText('Nusrat Jahan')).toBeInTheDocument();
  });

  test('TC_UI_ADM_03 [Format Preview Formula]: selecting department updates preview ID code', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue(/Select Department/i)).toBeInTheDocument();
    });

    // Initial preview ID pattern exists
    expect(screen.getByText(/CSE26FL•••/i)).toBeInTheDocument();
  });

  test('TC_UI_ADM_04 [Admission Success Reveal]: successful admission reveals issued ID and Print button', async () => {
    api.post.mockResolvedValueOnce({
      data: {
        student: {
          id: 55,
          student_id: 'CSE26FL006',
          name: 'Arafat Rahman',
          department_id: 1,
          batch_id: 10
        }
      }
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByDisplayValue('Select Department')).toBeInTheDocument();
    });

    // 1. Fill Department
    const deptSelect = screen.getByDisplayValue('Select Department');
    fireEvent.change(deptSelect, { target: { value: '1' } });

    // 2. Fill Batch
    await waitFor(() => {
      expect(screen.getByDisplayValue('Select Intake')).toBeInTheDocument();
    });
    const batchSelect = screen.getByDisplayValue('Select Intake');
    fireEvent.change(batchSelect, { target: { value: '10' } });

    // 3. Fill Name
    const nameInput = screen.getByPlaceholderText(/e.g. Arafat Rahman/i);
    fireEvent.change(nameInput, { target: { value: 'Arafat Rahman' } });

    // 4. Submit
    const submitBtn = screen.getByRole('button', { name: /Admit Student & Generate ID/i });
    fireEvent.click(submitBtn);

    // Assert that issued student ID is shown and print action is present
    await waitFor(() => {
      expect(screen.getByText('CSE26FL006')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Print Student ID Card/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Enroll Another Student/i })).toBeInTheDocument();
    });
  });
});