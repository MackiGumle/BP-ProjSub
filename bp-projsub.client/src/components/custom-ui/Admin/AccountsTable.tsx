import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Ban, Undo2 } from 'lucide-react';

interface User {
    id: string;
    userName: string;
    email: string;
    roles: string[];
    lockoutEnabled: boolean;
    lockoutEnd?: string;
}

export function AccountsTable() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [processingUserId, setProcessingUserId] = useState<string | null>(null);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedTerm(searchTerm), 500);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const { data: users, isLoading, isError } = useQuery<User[]>({
        queryKey: ['accounts', debouncedTerm],
        queryFn: async () => {
            const response = await axios.get('/api/Admin/getAccounts', {
                params: { searchTerm: debouncedTerm },
            });
            return response.data;
        },
    });

    const mutation = useMutation({
        mutationFn: async ({ userId, action }: { userId: string; action: 'ban' | 'unban' }) => {
            const endpoint = action === 'ban' ? '/api/Admin/lockAccount' : '/api/Admin/unlockAccount';
            return axios.post(endpoint, userId, {
                headers: { 'Content-Type': 'application/json' },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['accounts'] });
            toast({ title: 'Success', description: 'Operation completed successfully' });
        },
        onError: (error: any) => {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'An error occurred',
                variant: 'destructive',
            });
        },
        onSettled: () => setProcessingUserId(null),
    });

    const handleBan = (userId: string) => {
        setProcessingUserId(userId);
        mutation.mutate({ userId, action: 'ban' });
    };

    const handleUnban = (userId: string) => {
        setProcessingUserId(userId);
        mutation.mutate({ userId, action: 'unban' });
    };

    const isLocked = (user: User) => {
        if (!user.lockoutEnd) return false;
        const lockoutDate = new Date(user.lockoutEnd);
        return lockoutDate > new Date();
    };

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <div className="flex justify-center">
                <Input
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-blue-200"
                />
            </div>

            {isError && (
                <div className="text-red-500 text-center">Error loading accounts</div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden border">
                <Table>
                    <TableHeader className="bg-gray-100">
                        <TableRow>
                            <TableHead className="px-4 py-2 text-left">Username</TableHead>
                            <TableHead className="px-4 py-2 text-left">Email</TableHead>
                            <TableHead className="px-4 py-2 text-left">Roles</TableHead>
                            <TableHead className="px-4 py-2 text-left">Status</TableHead>
                            <TableHead className="px-4 py-2 text-left">Lockout End</TableHead>
                            <TableHead className="px-4 py-2 text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading
                            ? Array(5)
                                .fill(0)
                                .map((_, i) => (
                                    <TableRow key={i} className="hover:bg-gray-50">
                                        <TableCell className="px-4 py-2">
                                            <Skeleton className="h-4 w-[150px]" />
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <Skeleton className="h-4 w-[200px]" />
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <Skeleton className="h-4 w-[100px]" />
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <Skeleton className="h-4 w-[100px]" />
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <Skeleton className="h-4 w-[100px]" />
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-center">
                                            <Skeleton className="h-4 w-[100px]" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            : users?.map((user) => {
                                const locked = isLocked(user);
                                return (
                                    <TableRow key={user.id} className="hover:bg-gray-50">
                                        <TableCell className="px-4 py-2">{user.userName}</TableCell>
                                        <TableCell className="px-4 py-2">{user.email}</TableCell>
                                        <TableCell className="px-4 py-2">
                                            <div className="flex gap-1 flex-wrap">
                                                {user.roles?.map((role) => (
                                                    <Badge
                                                        key={role}
                                                        variant="default"
                                                        className={`capitalize ${role === 'Admin'
                                                            ? 'bg-red-500 text-white'
                                                            : role === 'Teacher'
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-400 text-white'
                                                            }`}
                                                    >
                                                        {role.toLowerCase()}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            <Badge variant={locked ? 'destructive' : 'default'}>
                                                {locked ? 'Banned' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-2">
                                            {user.lockoutEnd ? new Date(user.lockoutEnd).toLocaleString() : 'N/A'}
                                        </TableCell>
                                        <TableCell className="px-4 py-2 text-center">
                                            <Button
                                                size="sm"
                                                variant={locked ? 'default' : 'destructive'}
                                                onClick={() => (locked ? handleUnban(user.id) : handleBan(user.id))}
                                                disabled={processingUserId === user.id}
                                            >
                                                {processingUserId === user.id ? (
                                                    <span>Processing...</span>
                                                ) : locked ? (
                                                    <Undo2 />
                                                ) : (
                                                    <Ban />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
