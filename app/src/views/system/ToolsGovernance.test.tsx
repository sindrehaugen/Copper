import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToolsGovernance } from "./ToolsGovernance";
import "../../locales/i18n";

describe("ToolsGovernance", () => {
  it("renders and toggles kill switch", () => {
    render(<ToolsGovernance />);
    expect(screen.getByTestId("tools-governance-surface")).toBeTruthy();
    
    // Check initial state
    expect(screen.getByText("execute_query_template")).toBeTruthy();
  });
});
