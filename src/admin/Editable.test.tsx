import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { EditableText } from './Editable';
import { editText } from '@/test/utils';

const renderField = (props: Partial<Parameters<typeof EditableText>[0]> = {}) => {
  const onChange = vi.fn();
  const utils = render(<EditableText value="Saved" onChange={onChange} label="Field" {...props} />);
  return { onChange, field: screen.getByRole('textbox', { name: 'Field' }), ...utils };
};

describe('EditableText', () => {
  it('shows the value and the placeholder for empty fields', () => {
    const { field } = renderField({ value: '', placeholder: 'Built-in text' });
    expect(field).toHaveTextContent('');
    expect(field).toHaveAttribute('data-placeholder', 'Built-in text');
    expect(field).toHaveAttribute('contenteditable', 'plaintext-only');
  });

  it('commits the trimmed text on blur', () => {
    const { field, onChange } = renderField();
    editText(field, '  New text  ');
    expect(onChange).toHaveBeenCalledWith('New text');
    expect(field).toHaveTextContent('New text');
  });

  it('does not report an unchanged value', () => {
    const { field, onChange } = renderField();
    editText(field, 'Saved');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('joins lines in single-line fields but keeps them in multiline ones', () => {
    const single = renderField();
    editText(single.field, 'one\n  two');
    expect(single.onChange).toHaveBeenCalledWith('one two');
    single.unmount();

    const multi = renderField({ multiline: true });
    editText(multi.field, 'one\ntwo');
    expect(multi.onChange).toHaveBeenCalledWith('one\ntwo');
  });

  it('restores the previous value when normalize rejects the text', () => {
    const { field, onChange } = renderField({
      value: '10',
      normalize: (s) => (Number.isFinite(Number(s)) ? s : null),
    });
    editText(field, 'ten');
    expect(onChange).not.toHaveBeenCalled();
    expect(field).toHaveTextContent('10');
  });

  it('reverts typing on Escape and keeps Enter from adding a line', () => {
    const { field } = renderField();
    field.textContent = 'typo';
    fireEvent.keyDown(field, { key: 'Escape' });
    expect(field).toHaveTextContent('Saved');

    // fireEvent returns false when the handler called preventDefault
    expect(fireEvent.keyDown(field, { key: 'Enter' })).toBe(false);
  });

  it('shows a new value from the parent', () => {
    const { field, rerender, onChange } = renderField();
    rerender(<EditableText value="From server" onChange={onChange} label="Field" />);
    expect(field).toHaveTextContent('From server');
  });

  it('marks unsaved fields', () => {
    expect(renderField({ dirty: true }).field).toHaveAttribute('data-dirty', 'true');
  });
});
