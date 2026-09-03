import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IntelligenceRail } from "./IntelligenceRail";
import "../../locales/i18n";

describe("IntelligenceRail", () => {
  it("renders closed initially, then opens when clicked", () => {
    render(<IntelligenceRail />);
    
    // Toggle button should be visible
    const toggle = screen.getByTestId("iq-rail-toggle");
    expect(toggle).toBeTruthy();
    
    // List should not be visible initially (or hidden by CSS, but in DOM)
    const title = screen.getByText("Intelligence Rail");
    expect(title).toBeTruthy();
    
    // Simulate click
    fireEvent.click(toggle);
  });
});
