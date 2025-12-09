import { describe, it, expect } from "vitest";
import { Card, CardHeader, CardTitle, CardContent } from "../Card";
import { render, screen } from "@testing-library/react";

describe("Card", () => {
  it("renders Card with children", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Content</CardContent>
      </Card>
    );
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});
