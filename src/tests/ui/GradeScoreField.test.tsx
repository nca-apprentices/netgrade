import type { Mock } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { GradeScoreField } from '@/features/add-grade/fields/grade-score-field';
import { useFieldContext } from '@/shared/components/form';
import '@testing-library/jest-dom';

vi.mock('@/shared/components/form');
vi.mock('@ionic/react', () => ({
  IonInput: (props: {
    value?: number;
    type?: string;
    onIonChange?: (e: { detail: { value: string } }) => void;
    onIonBlur?: () => void;
  }) => (
    <input
      type={props.type}
      value={props.value}
      onChange={(e) =>
        props.onIonChange?.({ detail: { value: e.target.value } })
      }
      onBlur={props.onIonBlur}
    />
  ),
  IonNote: (props: { children?: React.ReactNode; color?: string }) => (
    <div
      data-testid="ion-note"
      className={props.color ? `ion-note-${props.color}` : ''}
    >
      {props.children}
    </div>
  ),
}));
vi.mock('@/shared/components/form-field/form-input.tsx', () => ({
  default: (props: { children: React.ReactNode; error?: string }) => (
    <div>
      {props.error && <span data-testid="error-message">{props.error}</span>}
      {props.children}
    </div>
  ),
}));

describe('GradeScoreField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update the score when the user enters a valid grade', () => {
    const mockField = {
      state: {
        value: 0,
        meta: { errors: [] },
      },
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<GradeScoreField label="Note" />);

    const input = screen.getByDisplayValue('0') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '5.5' } });

    expect(mockField.handleChange).toHaveBeenCalledWith(5.5);
  });

  it('should display error message when score is below minimum (< 1)', () => {
    const mockField = {
      state: {
        value: 0.5,
        meta: {
          errors: [{ message: 'Gib eine Zahl zwischen 1-6 ein' }],
        },
      },
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<GradeScoreField label="Note" />);

    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toHaveTextContent('Gib eine Zahl zwischen 1-6 ein');
  });

  it('should display error message when score is above maximum (> 6)', () => {
    const mockField = {
      state: {
        value: 7,
        meta: {
          errors: [{ message: 'Gib eine Zahl zwischen 1-6 ein' }],
        },
      },
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<GradeScoreField label="Note" />);

    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toHaveTextContent('Gib eine Zahl zwischen 1-6 ein');
  });

  it('should display error message when value is not a valid number', () => {
    const mockField = {
      state: {
        value: NaN,
        meta: {
          errors: [{ message: 'Gib eine gültige Zahl ein' }],
        },
      },
      handleChange: vi.fn(),
      handleBlur: vi.fn(),
    };

    (useFieldContext as Mock).mockReturnValue(mockField);

    render(<GradeScoreField label="Note" />);

    const errorMessage = screen.getByTestId('error-message');
    expect(errorMessage).toHaveTextContent('Gib eine gültige Zahl ein');
  });
});
