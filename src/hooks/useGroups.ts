import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService, Group, CreateGroupRequest, UpdateGroupRequest } from '@/services/api/groupService';

/**
 * Hook to fetch groups with pagination and search
 */
export function useGroups(page: number = 0, size: number = 20, search?: string) {
  return useQuery({
    queryKey: ['groups', page, size, search],
    queryFn: () => groupService.getGroups({ page, size, search }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch a specific group by name
 */
export function useGroupByName(groupName: string) {
  return useQuery({
    queryKey: ['group', groupName],
    queryFn: () => groupService.getGroupByName(groupName),
    enabled: !!groupName,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to check if a group exists
 */
export function useGroupExists(groupName: string) {
  return useQuery({
    queryKey: ['group-exists', groupName],
    queryFn: () => groupService.checkGroupExists(groupName),
    enabled: !!groupName,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/**
 * Hook to search groups
 */
export function useSearchGroups(searchTerm: string) {
  return useQuery({
    queryKey: ['groups-search', searchTerm],
    queryFn: () => groupService.getGroups({ search: searchTerm }),
    enabled: !!searchTerm && searchTerm.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    retry: 1,
  });
}

/**
 * Hook for group management operations (CRUD)
 */
export function useGroupManager() {
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: (data: CreateGroupRequest) => groupService.createGroup(data),
    onSuccess: () => {
      // Invalidate and refetch groups
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups-search'] });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: UpdateGroupRequest }) =>
      groupService.updateGroup(groupId, data),
    onSuccess: () => {
      // Invalidate and refetch groups
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups-search'] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: (groupId: string) => groupService.deleteGroup(groupId),
    onSuccess: () => {
      // Invalidate and refetch groups
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['groups-search'] });
    },
  });

  return {
    createGroup: createGroupMutation.mutateAsync,
    updateGroup: updateGroupMutation.mutateAsync,
    deleteGroup: deleteGroupMutation.mutateAsync,
    isCreating: createGroupMutation.isPending,
    isUpdating: updateGroupMutation.isPending,
    isDeleting: deleteGroupMutation.isPending,
    createError: createGroupMutation.error,
    updateError: updateGroupMutation.error,
    deleteError: deleteGroupMutation.error,
  };
}

/**
 * Hook for group validation
 */
export function useGroupValidation() {
  const { data: existingGroups } = useGroups(0, 999); // Get all groups for validation

  const validateGroupName = (name: string): string | null => {
    if (!name || name.trim().length === 0) {
      return 'Group name is required';
    }

    if (name.trim().length < 2) {
      return 'Group name must be at least 2 characters long';
    }

    if (name.trim().length > 50) {
      return 'Group name must be less than 50 characters';
    }

    // Check for valid group name format (alphanumeric, underscores, hyphens)
    const validGroupNameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!validGroupNameRegex.test(name.trim())) {
      return 'Group name can only contain letters, numbers, underscores, and hyphens';
    }

    // Check if group name already exists
    if (existingGroups?.some(group => group.name.toLowerCase() === name.trim().toLowerCase())) {
      return 'Group name already exists';
    }

    return null;
  };

  const validateGroupDescription = (description: string): string | null => {
    if (description && description.length > 200) {
      return 'Description must be less than 200 characters';
    }
    return null;
  };

  return {
    validateGroupName,
    validateGroupDescription,
  };
}
