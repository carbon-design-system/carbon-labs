import '../extended-button';
import { html } from 'lit';
import ArrowRight16 from '@carbon/web-components/es/icons/arrow--right/16';

// More on how to set up stories at: https://storybook.js.org/docs/web-components/writing-stories/introduction
export default {
  title: 'Components/Extended button',
  tags: ['autodocs'],
};

// More on writing stories with args: https://storybook.js.org/docs/web-components/writing-stories/args
export const Default = {
  args: {
    label: 'Extended button',
  },

  render: (args) =>
    html` <c4ai-extended-button>
      ${args.label}${ArrowRight16({ slot: 'icon' })}
    </c4ai-extended-button>`,
};
