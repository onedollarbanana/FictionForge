import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

describe("UI Components", () => {
  describe("Button", () => {
    it("renders with text", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    });

    it("renders different variants", () => {
      render(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole("button")).toHaveClass("border");
    });

    it("can be disabled", () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("Input", () => {
    it("renders with placeholder", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("accepts different types", () => {
      render(<Input type="email" placeholder="Email" />);
      expect(screen.getByPlaceholderText("Email")).toHaveAttribute("type", "email");
    });
  });

  describe("Card", () => {
    it("renders with content", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
          </CardHeader>
        </Card>
      );
      expect(screen.getByText("Test Card")).toBeInTheDocument();
    });
  });
});
