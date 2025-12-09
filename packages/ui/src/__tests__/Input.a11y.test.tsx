import { describe, it, expect } from "vitest";
import { Input } from "../Input";
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

describe("Input a11y", () => {
  it("should have no accessibility violations", async () => {
    const { container } = render(<Input placeholder="Accessible input" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
