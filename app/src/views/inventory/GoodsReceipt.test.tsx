import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { GoodsReceipt } from './GoodsReceipt';
import { EntityLens } from '../../shell/lens/EntityLens';
import { findingRegistry, THREE_WAY_MATCH_PRODUCER_ID } from '../../shell/finding/registry';
import '../../locales/i18n';

describe('GoodsReceipt (B180)', () => {
  beforeEach(() => {
    findingRegistry.clearAll();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders Receipt Capture header and PO mock data (PO-123 with 50 expected units)', () => {
    render(
      <MemoryRouter>
        <GoodsReceipt />
      </MemoryRouter>
    );

    expect(screen.getByTestId('goods-receipt-surface')).toBeTruthy();
    expect(screen.getByText('Receipt Capture')).toBeTruthy();
    expect(screen.getAllByText(/PO-123/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('50').length).toBeGreaterThan(0);
    expect(screen.getByTestId('received-quantity-input')).toBeTruthy();
    expect(screen.getByTestId('record-receipt-button')).toBeTruthy();
  });

  it('allows user to input received quantity', () => {
    render(
      <MemoryRouter>
        <GoodsReceipt />
      </MemoryRouter>
    );

    const input = screen.getByTestId('received-quantity-input') as HTMLInputElement;
    expect(input.value).toBe('50');

    fireEvent.change(input, { target: { value: '45' } });
    expect(input.value).toBe('45');
  });

  it('recording receipt with matching quantity does not produce a finding', () => {
    const onRecorded = vi.fn();
    render(
      <MemoryRouter>
        <GoodsReceipt onReceiptRecorded={onRecorded} />
      </MemoryRouter>
    );

    // Initial value is 50 matching expected 50
    const recordBtn = screen.getByTestId('record-receipt-button');
    fireEvent.click(recordBtn);

    expect(findingRegistry.getAllFindings()).toHaveLength(0);
    expect(screen.getByTestId('goods-receipt-feedback')).toBeTruthy();
    expect(onRecorded).toHaveBeenCalledWith(
      expect.objectContaining({
        hasDiscrepancy: false,
        findingsCount: 0,
      })
    );
  });

  it('recording a mismatched receipt raises a 3-way-match finding via findingRegistry.addFindings', () => {
    const onRecorded = vi.fn();
    render(
      <MemoryRouter>
        <GoodsReceipt onReceiptRecorded={onRecorded} />
      </MemoryRouter>
    );

    const input = screen.getByTestId('received-quantity-input');
    fireEvent.change(input, { target: { value: '42' } });

    const recordBtn = screen.getByTestId('record-receipt-button');
    fireEvent.click(recordBtn);

    const findings = findingRegistry.getAllFindings();
    expect(findings.length).toBe(1);

    const finding = findings[0]!;
    expect(finding.producerId).toBe(THREE_WAY_MATCH_PRODUCER_ID);
    expect(finding.severity).toMatch(/^(risk|blocker)$/);
    expect(finding.rule).toBe('receipt-quantity-mismatch');
    expect(finding.entityRef).toEqual({
      type: 'PURCHASE_ORDER',
      id: 'PO-123',
    });
    expect(finding.evidence).toMatchObject({
      poNumber: 'PO-123',
      expectedQuantity: 50,
      receivedQuantity: 42,
      variance: -8,
    });

    // Verify UI alert feedback
    const feedback = screen.getByTestId('goods-receipt-feedback');
    expect(feedback.getAttribute('role')).toBe('alert');

    expect(onRecorded).toHaveBeenCalledWith(
      expect.objectContaining({
        hasDiscrepancy: true,
        findingsCount: 1,
      })
    );
  });

  it('allows applying fix action on the raised finding to clear it', async () => {
    render(
      <MemoryRouter>
        <GoodsReceipt />
      </MemoryRouter>
    );

    const input = screen.getByTestId('received-quantity-input');
    fireEvent.change(input, { target: { value: '40' } });

    const recordBtn = screen.getByTestId('record-receipt-button');
    fireEvent.click(recordBtn);

    expect(findingRegistry.getAllFindings()).toHaveLength(1);
    const finding = findingRegistry.getAllFindings()[0]!;

    expect(finding.fix).toBeDefined();
    await finding.fix!.apply();

    expect(findingRegistry.getAllFindings()).toHaveLength(0);
  });

  it('resets received quantity back to expected upon clicking Reset to Expected', () => {
    render(
      <MemoryRouter>
        <GoodsReceipt />
      </MemoryRouter>
    );

    const input = screen.getByTestId('received-quantity-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '25' } });
    expect(input.value).toBe('25');

    const resetBtn = screen.getByTestId('reset-to-expected-button');
    fireEvent.click(resetBtn);

    expect(input.value).toBe('50');
  });

  it('renders within EntityLens when isGoodsReceipt is true', () => {
    render(
      <MemoryRouter>
        <EntityLens isGoodsReceipt={true} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('goods-receipt-surface')).toBeTruthy();
    expect(screen.getByText('Receipt Capture')).toBeTruthy();
  });

  it('renders within EntityLens when viewMode is "goods-receipt"', () => {
    render(
      <MemoryRouter>
        <EntityLens viewMode="goods-receipt" />
      </MemoryRouter>
    );

    expect(screen.getByTestId('goods-receipt-surface')).toBeTruthy();
    expect(screen.getByText('Receipt Capture')).toBeTruthy();
  });
});
