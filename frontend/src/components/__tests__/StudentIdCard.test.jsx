import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import StudentIdCard from '../StudentIdCard';

describe('Frontend Component Tests: Student ID Card (StudentIdCard.jsx)', () => {
  test('TC_UI_CARD_01: should render university logo and official title', () => {
    render(
      <StudentIdCard
        universityName="Dhaka University"
        universityLogo="/logos/du.svg"
        studentName="Mahmudul Hasan"
        deptCode="CSE"
        batchOrIntakeLabel="Batch"
        batchOrIntakeValue="54th Batch"
        studentId="CSE5426001"
      />
    );

    expect(screen.getByText(/Dhaka University/i)).toBeInTheDocument();
    expect(screen.getByText('STUDENT IDENTITY CARD')).toBeInTheDocument();
    expect(screen.getByText('Mahmudul Hasan')).toBeInTheDocument();
    expect(screen.getByText('CSE5426001')).toBeInTheDocument();
    
    // Check that logo image rendered with src /logos/du.svg
    const logoImg = screen.getByAltText('Logo');
    expect(logoImg).toHaveAttribute('src', '/logos/du.svg');
  });

  test('TC_UI_CARD_02: should render default photo placeholder when photo is null', () => {
    render(
      <StudentIdCard
        studentName="Amina Khatun"
        studentId="CSE26FL002"
        photo={null}
      />
    );

    expect(screen.getByText('PHOTO')).toBeInTheDocument();
  });

  test('TC_UI_CARD_03: should render custom photo when photo data URL is provided', () => {
    const samplePhoto = 'data:image/jpeg;base64,sampleStudentPhoto';
    render(
      <StudentIdCard
        studentName="Amina Khatun"
        studentId="CSE26FL002"
        photo={samplePhoto}
      />
    );

    const studentPhotoImg = screen.getByAltText('Amina Khatun');
    expect(studentPhotoImg).toBeInTheDocument();
    expect(studentPhotoImg).toHaveAttribute('src', samplePhoto);
  });
});
