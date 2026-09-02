export interface MaskingState {
  readonly isMasked: boolean;
  setMasked: (masked: boolean) => void;
  toggleMasked: () => void;
}
