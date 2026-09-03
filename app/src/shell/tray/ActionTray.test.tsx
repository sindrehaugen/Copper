import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActionTray } from "./ActionTray";
import "../../locales/i18n";

describe("ActionTray", () => {
  it("renders closed initially, then opens when clicked", () => {
    render(<ActionTray />);
    
    // Toggle button should be visible
    const toggle = screen.getByTestId("action-tray-toggle");
    expect(toggle).toBeTruthy();
    
    // List should not be visible initially
    expect(screen.queryByText("Convert Quote to Project")).toBeNull();
    
    // Click toggle
    fireEvent.click(toggle);
    
    // List should now be visible
    expect(screen.getByText("Convert Quote to Project")).toBeTruthy();
  });
});
