import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SceneView } from './SceneView';

// Mock Canvas to avoid WebGL requirements in tests
vi.mock('three/examples/jsm/exporters/GLTFExporter.js', () => ({ GLTFExporter: class { parse() {} } }));
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-canvas"></div>, useThree: () => ({ scene: {} }),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="mock-orbit-controls" />, Html: ({ children }: any) => <div>{children}</div>,
}));

describe('SceneView', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<SceneView />);
    expect(getByTestId('mock-canvas')).toBeDefined();
    
  });
});




