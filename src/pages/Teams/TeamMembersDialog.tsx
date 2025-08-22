import React, { useState } from 'react';
import { useGetUsersQuery } from '../../features/users/usersApi';
import { useUpdateTeamMembersMutation } from '../../features/teams/teamsApi';
import { TeamWithDetails } from '../../types/team';
import { User } from '../../types/auth';
import Button from '../../components/Common/Button';
import { Search, UserPlus, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';

interface TeamMembersDialogProps {
  team: TeamWithDetails;
  onClose: () => void;
}

const TeamMembersDialog: React.FC<TeamMembersDialogProps> = ({ team, onClose }) => {
  const [search, setSearch] = useState('');
  const { data: users } = useGetUsersQuery({});
  const [updateMembers, { isLoading }] = useUpdateTeamMembersMutation();

  const currentMemberIds = team.members?.map(m => m.id) || [];
  const [selectedMembers, setSelectedMembers] = useState<string[]>(currentMemberIds);

  const filteredUsers = users?.data.filter(user => 
    (user.firstName + ' ' + user.lastName).toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleToggleMember = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      await updateMembers({
        teamId: team.id,
        memberIds: selectedMembers,
      }).unwrap();
      toast.success('Team members updated successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to update team members');
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Users List */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Button
                variant={selectedMembers.includes(user.id) ? 'danger' : 'secondary'}
                size="sm"
                icon={selectedMembers.includes(user.id) ? UserMinus : UserPlus}
                onClick={() => handleToggleMember(user.id)}
              >
                {selectedMembers.includes(user.id) ? 'Remove' : 'Add'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          loading={isLoading}
          onClick={handleSave}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default TeamMembersDialog;
