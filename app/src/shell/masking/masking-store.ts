import { DATA_CUSTOMER_VIEW_ATTR } from "./masking-headers.js";

type MaskingListener = (isMasked: boolean) => void;

export class MaskingStore {
  private _isMasked = false;
  private readonly _listeners = new Set<MaskingListener>();

  constructor() {
    if (typeof document !== "undefined" && document.body) {
      this._isMasked = document.body.hasAttribute(DATA_CUSTOMER_VIEW_ATTR);
    }
  }

  public get isMasked(): boolean {
    return this._isMasked;
  }

  public setMasked(masked: boolean): void {
    if (this._isMasked === masked) return;
    this._isMasked = masked;
    this._syncDom();
    this._notify();
  }

  public toggleMasked(): void {
    this.setMasked(!this._isMasked);
  }

  public subscribe(listener: MaskingListener): () => void {
    this._listeners.add(listener);
    return () => {
      this._listeners.delete(listener);
    };
  }

  private _syncDom(): void {
    if (typeof document !== "undefined" && document.body) {
      if (this._isMasked) {
        document.body.setAttribute(DATA_CUSTOMER_VIEW_ATTR, "true");
      } else {
        document.body.removeAttribute(DATA_CUSTOMER_VIEW_ATTR);
      }
    }
  }

  private _notify(): void {
    for (const listener of this._listeners) {
      listener(this._isMasked);
    }
  }
}

export const maskingStore = new MaskingStore();
