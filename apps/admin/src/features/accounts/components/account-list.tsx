'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, UserX } from 'lucide-react';
import type { AccountStatus } from '@repo/types';
import { EmptyState } from '@repo/ui/empty-state';
import { ErrorState } from '@repo/ui/error-state';
import { Input } from '@repo/ui/input';
import { StatusBadge } from '@repo/ui/status-badge';
import { TableSkeleton } from '@repo/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper,
} from '@repo/ui/table';
import { formatDate } from '@repo/ui/lib/format';
import { useAccounts } from '../hooks/use-accounts';
import { AccountActions } from './account-actions';

const TABS: { value: AccountStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
];

function AccountTable({ status, query }: { status: AccountStatus; query: string }) {
  const { data, isLoading, error, refetch } = useAccounts(status);

  const filtered = useMemo(() => {
    if (!data) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return data;
    return data.filter(
      (account) =>
        account.name.toLowerCase().includes(needle) || account.email.toLowerCase().includes(needle),
    );
  }, [data, query]);

  if (isLoading) {
    return (
      <TableWrapper>
        <TableSkeleton rows={4} columns={5} />
      </TableWrapper>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn’t load accounts"
        description={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<UserX aria-hidden="true" />}
        title={query ? 'No matching accounts' : `No ${status} accounts`}
        description={
          query
            ? 'Try a different name or email address.'
            : status === 'pending'
              ? 'Nothing is waiting for review right now.'
              : `No accounts currently have the ${status} status.`
        }
      />
    );
  }

  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/accounts/${account.id}`}
                  className="rounded hover:text-primary hover:underline focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
                >
                  {account.name}
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground">{account.email}</TableCell>
              <TableCell className="capitalize">{account.role}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">
                {formatDate(account.created_at)}
              </TableCell>
              <TableCell>
                <StatusBadge status={account.status} />
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <AccountActions account={account} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}

export function AccountList() {
  const [query, setQuery] = useState('');

  return (
    <Tabs defaultValue="pending" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="relative sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Search name or email"
            aria-label="Search accounts"
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      {TABS.map((tab) => (
        <TabsContent key={tab.value} value={tab.value} className="mt-0">
          <AccountTable status={tab.value} query={query} />
        </TabsContent>
      ))}
    </Tabs>
  );
}
