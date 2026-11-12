import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import RecycleBin from '../RecycleBin';
import api from '../../api/axios';

vi.mock('../../api/axios');

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Client Admin',
      email: 'admin@uits.edu',
      role: 'client_admin',
      university_id: 1,
      university_name: 'UITS'
    },
    logout: vi.fn()
  })
}));

const mockTrashData = {
  students: [
    {
      id: 101,
      student_id: 'CSE5426099',
      name: 'Deleted Student One',
      department_name: 'Computer Science and Engineering',
      department_code: 'CSE',
      batch_number: 54,
      year: 2026,
      deleted_at: '2026-11-13T01:00:00Z'
    }
  ],
  batches: [
    {
      id: 201,
      batch_number: 53,
      year: 2025,
      department_name: 'CSE',
      deleted_at: '2026-11-12T01:00:00Z'
    }
  ],
  departments: [
    {
      id: 301,
      code: 'ARC',
      name: 'Architecture',
      deleted_at: '2026-11-11T01:00:00Z'
    }
  ],
  totalCount: 3
};

describe('Frontend UI Tests: Recycle Bin (RecycleBin.jsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: mockTrashData });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <RecycleBin />
      </MemoryRouter>
    );
  };

  test('TC_UI_TRASH_01 [Page & Tabs Render]: should render Recycle Bin title and entity tabs', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Recycle Bin & Data Recovery/i })).toBeInTheDocument();
      expect(screen.getByText(/Restore accidentally removed students/i)).toBeInTheDocument();
      expect(screen.getByText(/Students \(1\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Batches \(1\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Departments \(1\)/i)).toBeInTheDocument();
    });
  });

  test('TC_UI_TRASH_02 [Deleted Records Display]: should display student details with restore action', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('CSE5426099')).toBeInTheDocument();
      expect(screen.getByText('Deleted Student One')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Restore/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
    });
  });

  test('TC_UI_TRASH_03 [Restore Action]: should call restore API when clicking Restore', async () => {
    api.post.mockResolvedValueOnce({ data: { message: 'Student restored successfully' } });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Deleted Student One')).toBeInTheDocument();
    });

    const restoreBtn = screen.getByRole('button', { name: /Restore/i });
    fireEvent.click(restoreBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/trash/restore', { type: 'student', id: 101 });
    });
  });
});
