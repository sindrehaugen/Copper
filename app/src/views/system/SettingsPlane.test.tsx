import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SettingsPlane } from "./SettingsPlane";
import "../../locales/i18n";

describe("SettingsPlane", () => {
  it("renders correctly and switches tabs", () => {
    render(<SettingsPlane />);
    
    // Default tab
    expect(screen.getByText("Interface Language")).toBeTruthy();
    
    // Switch tab
    const routingTab = screen.getByText("Routing Preferences");
    fireEvent.click(routingTab);
    
    // Check content
    expect(screen.getByText("AI Execution Region")).toBeTruthy();
  });
});
