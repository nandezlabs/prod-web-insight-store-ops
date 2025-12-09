import { describe, it, expect } from "vitest";
import { Button } from "../Button";
import { render, screen, fireEvent } from "@testing-library/react";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(onClick).toHaveBeenCalled();
  });

  it("shows loading state", () => {
    render(<Button loading>Loading...</Button>);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
