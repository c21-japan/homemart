import * as React from 'react';
import { cn } from '@/lib/utils';

interface SelectProps {
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
  name?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

const Select = ({
  value,
  defaultValue,
  required,
  disabled,
  onValueChange,
  className,
  children,
  name
}: SelectProps) => {
  const { placeholder, items, hasEmptyValueItem } = extractSelectParts(children);

  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        defaultValue={defaultValue}
        required={required}
        disabled={disabled}
        onChange={(e) => onValueChange?.(e.target.value)}
        className={cn(
          'flex h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        {placeholder && !hasEmptyValueItem ? (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        ) : null}
        {items}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
        ▾
      </span>
    </div>
  );
};
Select.displayName = 'Select';

const SelectTrigger = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder }: { placeholder?: string }) => null;
SelectValue.displayName = 'SelectValue';

const SelectContent = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
SelectContent.displayName = 'SelectContent';

const SelectItem = ({ value, children }: SelectItemProps) => (
  <option value={value}>{children}</option>
);
SelectItem.displayName = 'SelectItem';

function extractSelectParts(children: React.ReactNode) {
  let placeholder: string | undefined;
  let hasEmptyValueItem = false;
  const items: React.ReactNode[] = [];

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement<{ children?: React.ReactNode }>(child)) return;

    if (child.type === SelectTrigger) {
      React.Children.forEach(child.props.children, (triggerChild) => {
        if (
          React.isValidElement<{ placeholder?: string }>(triggerChild) &&
          triggerChild.type === SelectValue
        ) {
          placeholder = triggerChild.props.placeholder;
        }
      });
    }

    if (child.type === SelectContent) {
      React.Children.forEach(child.props.children, (contentChild) => {
        if (
          React.isValidElement<SelectItemProps>(contentChild) &&
          contentChild.type === SelectItem
        ) {
          if (contentChild.props.value === '') {
            hasEmptyValueItem = true;
          }
          items.push(
            <option key={contentChild.props.value} value={contentChild.props.value}>
              {contentChild.props.children}
            </option>
          );
        }
      });
    }
  });

  return { placeholder, items, hasEmptyValueItem };
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
};
