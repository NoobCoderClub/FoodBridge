'use client';

import * as React from 'react';
import { Menu } from '@base-ui/react/menu';

import { cn } from '../lib/utils';

const DropdownMenu = Menu.Root;
const DropdownMenuTrigger = Menu.Trigger;
const DropdownMenuGroup = Menu.Group;

function DropdownMenuContent({
  className,
  align = 'end',
  ...props
}: Menu.Popup.Props & { align?: 'start' | 'center' | 'end' }) {
  return (
    <Menu.Portal>
      <Menu.Positioner sideOffset={6} align={align} className="z-50 outline-none">
        <Menu.Popup
          className={cn(
            'min-w-44 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lift outline-none',
            'origin-[var(--transform-origin)] transition-[transform,opacity] duration-150',
            'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
            'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
            className,
          )}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

function DropdownMenuItem({
  className,
  destructive,
  ...props
}: Menu.Item.Props & { destructive?: boolean }) {
  return (
    <Menu.Item
      className={cn(
        "flex cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none select-none [&_svg:not([class*='size-'])]:size-4",
        'data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        destructive &&
          'text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive',
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({ className, ...props }: Menu.Separator.Props) {
  return <Menu.Separator className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />;
}

function DropdownMenuLabel({ className, ...props }: Menu.GroupLabel.Props) {
  return (
    <Menu.GroupLabel
      className={cn('px-3 py-1.5 text-xs font-medium text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
};
