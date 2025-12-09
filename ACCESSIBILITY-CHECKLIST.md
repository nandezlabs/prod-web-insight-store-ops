# Color Contrast & Accessibility Checklist

- Use sufficient color contrast for text and UI elements (WCAG 2.1 AA)
- Test with Storybook a11y addon and browser extensions (axe, Lighthouse)
- Ensure all interactive elements have accessible labels
- Use semantic HTML and ARIA roles where needed
- Keyboard navigation: all controls reachable and usable
- Focus states: visible and distinct
- Responsive font sizes and tap targets
- Avoid color-only indicators for status or errors
- Test with screen readers (VoiceOver, NVDA)

## Example Tools

- [axe DevTools](https://www.deque.com/axe/devtools/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Storybook a11y](https://storybook.js.org/addons/@storybook/addon-a11y)

## Next Steps

- Review all pages/components with these tools
- Document and fix any issues found
