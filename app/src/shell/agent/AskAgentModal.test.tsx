import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AskAgentModal } from "./AskAgentModal";
import "../../locales/i18n";

describe("AskAgentModal", () => {
  it("renders when cmd+k is pressed and shows context pill", () => {
    render(<AskAgentModal />);
    
    // Initially hidden
    expect(screen.queryByTestId("ask-agent-modal")).toBeNull();
    
    // Press cmd+k
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    
    // Should be visible
    expect(screen.getByTestId("ask-agent-modal")).toBeTruthy();
    
    // Should show context pill
    expect(screen.getByTestId("context-pill")).toBeTruthy();
    
    // Press escape
    fireEvent.keyDown(window, { key: "Escape" });
    
    // Should be hidden again
    expect(screen.queryByTestId("ask-agent-modal")).toBeNull();
  });
});
