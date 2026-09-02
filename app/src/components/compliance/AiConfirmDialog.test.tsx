import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AiConfirmDialog } from './AiConfirmDialog';

describe('AiConfirmDialog', () => {
  const defaultProps = {
    title: 'Test AI Suggestion',
    proposedAction: 'Delete user data',
    confidenceString: 'High' as const,
    provenance: 'AI detected duplicate data',
    onConfirm: vi.fn(),
    onReject: vi.fn(),
  };

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<AiConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Test AI Suggestion')).toBeTruthy();
    expect(screen.getByText('Delete user data')).toBeTruthy();
    expect(screen.getByText('High')).toBeTruthy();
    expect(screen.getByText('AI detected duplicate data')).toBeTruthy();
  });

  it('calls onReject when Reject button is clicked', () => {
    render(<AiConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Reject'));
    expect(defaultProps.onReject).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when Approve button is clicked', () => {
    render(<AiConfirmDialog {...defaultProps} />);
    fireEvent.click(screen.getByText('Approve AI Action'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('changes confirm button text when Human Override is checked', () => {
    render(<AiConfirmDialog {...defaultProps} />);
    const checkbox = screen.getByLabelText('Human Override - I am modifying this action');
    fireEvent.click(checkbox);
    
    expect(screen.getByText('Confirm with Override')).toBeTruthy();
    expect(screen.queryByText('Approve AI Action')).not.toBeTruthy();
    
    fireEvent.click(screen.getByText('Confirm with Override'));
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });
});

