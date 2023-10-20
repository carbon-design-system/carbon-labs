import "../test-input";
import { html } from "lit";

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: "Components/Test input",
  tags: ["autodocs"],
};

export const Default = {
  render: () => html` <c4ai-test-input> </c4ai-test-input>`,
};
