import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import api from '../../api/axios';
import { AuthProvider } from '../../context/AuthContext';

// Mock axios
vi.mock('../../api/axios', () => ({
  default: {
    post: vi.fn(),
  }
}));

describe('Frontend UI Tests: Login Page (Login.jsx)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );

  test('TC_UI_AUTH_01 [Rendering]: should render brand title, inputs, and sign in button', () => {
    renderComponent();

    // Verify Title & Subtitle
    expect(screen.getByRole('heading', { name: /Smart ID Formatting System/i })).toBeInTheDocument();
    expect(screen.getByText(/Institutional ID Management Platform/i)).toBeInTheDocument();

    // Verify Input Fields
    expect(screen.getByPlaceholderText(/name@university.edu/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••••••/i)).toBeInTheDocument();

    // Verify Sign In Button
    expect(screen.getByRole('button', { name: /Sign In to Dashboard/i })).toBeInTheDocument();
  });

  test('TC_UI_AUTH_02 [Input Handling]: should update values when user types in email and password', () => {
    renderComponent();

    const emailInput = screen.getByPlaceholderText(/name@university.edu/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••••••/i);

    fireEvent.change(emailInput, { target: { value: 'staff@nsu.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'secretPass123' } });

    expect(emailInput.value).toBe('staff@nsu.edu');
    expect(passwordInput.value).toBe('secretPass123');
  });

  test('TC_UI_AUTH_03 [Failed Login]: should display error alert when invalid credentials provided', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials or login failed' } }
    });

    renderComponent();

    const emailInput = screen.getByPlaceholderText(/name@university.edu/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@uni.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials or login failed/i)).toBeInTheDocument();
    });
  });

  test('TC_UI_AUTH_04 [Loading State]: should display spinner/loading text while submitting', async () => {
    // Return a pending promise that does not resolve immediately
    api.post.mockReturnValueOnce(new Promise(() => {}));

    renderComponent();

    const emailInput = screen.getByPlaceholderText(/name@university.edu/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });

    fireEvent.change(emailInput, { target: { value: 'admin@uni.edu' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Authenticating.../i)).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
  });
});