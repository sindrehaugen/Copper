import { create } from 'zustand';

interface SettingsState {
  wireSpacing: number;
  portPadding: number; // ELK edgeEdge spacing
  showCableLabels: boolean;
  cableLabelPosition: 'start' | 'middle' | 'end';
  terminalSpacing: number; // Height of port rows in px
  terminalFontSize: number; // Font size of port names in px
  headerFontSize: number; // Font size of device header in px

  setWireSpacing: (v: number) => void;
  setPortPadding: (v: number) => void;
  setShowCableLabels: (v: boolean) => void;
  setCableLabelPosition: (v: 'start' | 'middle' | 'end') => void;
  setTerminalSpacing: (v: number) => void;
  setTerminalFontSize: (v: number) => void;
  setHeaderFontSize: (v: number) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  wireSpacing: 4,
  portPadding: 30,
  showCableLabels: true,
  cableLabelPosition: 'middle',
  terminalSpacing: 20,
  terminalFontSize: 8,
  headerFontSize: 10,

  setWireSpacing: (v) => set({ wireSpacing: v }),
  setPortPadding: (v) => set({ portPadding: v }),
  setShowCableLabels: (v) => set({ showCableLabels: v }),
  setCableLabelPosition: (v) => set({ cableLabelPosition: v }),
  setTerminalSpacing: (v) => set({ terminalSpacing: v }),
  setTerminalFontSize: (v) => set({ terminalFontSize: v }),
  setHeaderFontSize: (v) => set({ headerFontSize: v }),
}));



