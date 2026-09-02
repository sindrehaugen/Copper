export interface AsOfState {
  asOf: string | null;
  isAsOfActive: () => boolean;
  setAsOf: (asOf: string | null) => void;
  clearAsOf: () => void;
}

export interface AsOfControlProps {
  className?: string;
  onAsOfChange?: (asOf: string | null) => void;
}

export interface AsOfReadEnvelope {
  parse_as_of?: string;
}
