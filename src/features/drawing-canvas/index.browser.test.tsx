import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { DrawingCanvas } from "./index";

test("DrawingCanvas renders correctly", async () => {
  const { container } = render(<DrawingCanvas />);
  await expect.element(container).toBeInTheDocument();
});
