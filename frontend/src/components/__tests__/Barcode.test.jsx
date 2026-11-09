import { render } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import Barcode from '../Barcode';

describe('Frontend Component Tests: Barcode Generation (Barcode.jsx)', () => {
  test('TC_UI_BARCODE_01: should render an SVG element representing Code 128 barcode', () => {
    const { container } = render(<Barcode value="CSE26FL001" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  test('TC_UI_BARCODE_02: should render clean empty placeholder if value is blank', () => {
    const { container } = render(<Barcode value="" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeNull();
  });
});
