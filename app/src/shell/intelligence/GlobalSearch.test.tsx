import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlobalSearch } from "./GlobalSearch";
import "../../locales/i18n";

describe("GlobalSearch", () => {
  it("renders when cmd+p is pressed", () => {
    render(<GlobalSearch />);
    
    // Initially hidden
    expect(screen.queryByTestId("global-search-modal")).toBeNull();
    
    // Press cmd+p
    fireEvent.keyDown(window, { key: "p", metaKey: true });
    
    // Should be visible
    expect(screen.getByTestId("global-search-modal")).toBeTruthy();
    
    // Press escape
    fireEvent.keyDown(window, { key: "Escape" });
    
    // Should be hidden again
    expect(screen.queryByTestId("global-search-modal")).toBeNull();
  });
});
