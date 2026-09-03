import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NamespacesAndUsers } from "./NamespacesAndUsers";
import "../../locales/i18n";

describe("NamespacesAndUsers", () => {
  it("renders correctly", () => {
    render(<NamespacesAndUsers />);
    expect(screen.getByTestId("namespaces-users-surface")).toBeTruthy();
  });
});
