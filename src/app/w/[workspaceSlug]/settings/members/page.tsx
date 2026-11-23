'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  ShieldCheck,
  Eye,
  Trash2,
  Check,
  X,
  Info,
  Lock,
  Unlock,
  Edit3,
  KeyRound,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { useApp } from '@/lib/store';
import { Avatar } from '@/components/ui/Avatar';
import { WorkspaceRole } from '@/lib/types';

interface MemberRecord {
  id: string;
  username: string;
  email: string;
  fullName: string;
  initials: string;
  color: string;
  role: WorkspaceRole;
  isFrozen: boolean;
  createdAt: string;
}

export default function WorkspaceMembersPage() {
  const { workspace, currentUser, setCurrentUser, updateWorkspaceName, showToast } = useApp();

  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Company Name editing state (Workspace Owner exclusive)
  const [companyNameInput, setCompanyNameInput] = useState(workspace.name);
  const [isEditingCompany, setIsEditingCompany] = useState(false);

  // Add Member Modal state (Only User ID, Full Name, Password, Role required)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<WorkspaceRole>('member');

  // Edit Member Modal state
  const [editingMember, setEditingMember] = useState<MemberRecord | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editRole, setEditRole] = useState<WorkspaceRole>('member');
  const [editNewPassword, setEditNewPassword] = useState('');

  // Fetch real members from SQLite database
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success && data.members) {
        setMembers(data.members);
      }
    } catch (e) {
      console.error('Error fetching members:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const isCurrentUserOwner = currentUser.role === 'owner';
  const isCurrentUserAdmin = currentUser.role === 'owner' || currentUser.role === 'admin';

  // Handle Create Member
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newFullName.trim() || !newPassword.trim()) return;

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername.trim(),
          fullName: newFullName.trim(),
          password: newPassword.trim(),
          role: newRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to create member');
        return;
      }

      showToast(`Member @${newUsername} created successfully`);
      setNewUsername('');
      setNewFullName('');
      setNewPassword('');
      setIsAddModalOpen(false);
      fetchMembers();
    } catch {
      showToast('Network error while adding member');
    }
  };

  // Handle Edit Member
  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    try {
      const isOwnerAccount = editingMember.role === 'owner';
      const res = await fetch(`/api/members/${editingMember.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFullName.trim(),
          role: isOwnerAccount ? 'owner' : editRole,
          newPassword: editNewPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update member');
        return;
      }

      if (editingMember.id === currentUser.id) {
        setCurrentUser({ ...currentUser, fullName: editFullName.trim() });
      }

      showToast(`Updated @${editingMember.username}'s account`);
      setEditingMember(null);
      fetchMembers();
    } catch {
      showToast('Error updating member');
    }
  };

  // Handle Freeze / Unfreeze
  const toggleFreezeMember = async (member: MemberRecord) => {
    if (member.role === 'owner') {
      showToast('Cannot freeze the Workspace Owner');
      return;
    }

    const nextFreezeState = !member.isFrozen;
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFrozen: nextFreezeState }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to update freeze status');
        return;
      }

      showToast(
        nextFreezeState
          ? `Account @${member.username} is now FROZEN (Cannot log in)`
          : `Account @${member.username} has been UN-FROZEN`
      );
      fetchMembers();
    } catch {
      showToast('Error modifying freeze state');
    }
  };

  // Handle Delete Member
  const handleDeleteMember = async (member: MemberRecord) => {
    if (member.role === 'owner') {
      showToast('Cannot delete the Workspace Owner');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete @${member.username}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/members/${member.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to delete member');
        return;
      }

      showToast(`Member @${member.username} permanently deleted`);
      fetchMembers();
    } catch {
      showToast('Error deleting member');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-800" />
            Team Members & Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Exclusive Workspace Owner controls to configure roles, freeze logins, reset credentials, and govern member access in{' '}
            <strong className="text-slate-700">{workspace.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Change My Password button */}
          <button
            type="button"
            onClick={() => {
              const myRecord = members.find((m) => m.id === currentUser.id);
              if (myRecord) {
                setEditingMember(myRecord);
                setEditFullName(myRecord.fullName);
                setEditRole(myRecord.role);
                setEditNewPassword('');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 hover:border-teal-700 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition-all hover:bg-slate-50"
            title="Change your own password"
          >
            <KeyRound className="w-4 h-4 text-teal-800" />
            <span>Change My Password</span>
          </button>

          {isCurrentUserOwner && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all hover:scale-102"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Governance Matrix Notice */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-teal-800 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-teal-950 leading-relaxed space-y-1">
          <div>
            <strong className="font-bold text-teal-900">👑 Workspace Owner Exclusive Authority:</strong> Only the Workspace Owner has the authority to <span className="font-semibold text-rose-800">Freeze</span> accounts to immediately suspend login access, <span className="font-semibold text-slate-800">Edit</span> credentials / reset passwords, and <span className="font-semibold text-rose-800">Delete</span> member accounts from the database.
          </div>
          <div className="text-[11px] text-teal-800">
            <strong>🛡️ Admin Privileges:</strong> Standard project administration — managing public spaces, lists, sprint schedules, and task workflows.
          </div>
        </div>
      </div>

      {/* Company / Entity Profile & Renaming Card */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Company Entity Name
              </span>
              {isCurrentUserOwner && (
                <span className="text-[10px] bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded font-bold">
                  Owner Editable
                </span>
              )}
            </div>

            {isEditingCompany ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (companyNameInput.trim()) {
                    updateWorkspaceName(workspace.id, companyNameInput.trim());
                    setIsEditingCompany(false);
                  }
                }}
                className="flex items-center gap-2 mt-1"
              >
                <input
                  type="text"
                  value={companyNameInput}
                  onChange={(e) => setCompanyNameInput(e.target.value)}
                  className="px-3 py-1 text-xs border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/40"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1 bg-teal-800 text-white rounded-lg text-xs font-bold hover:bg-teal-900"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCompanyNameInput(workspace.name);
                    setIsEditingCompany(false);
                  }}
                  className="px-2.5 py-1 text-slate-500 hover:text-slate-700 text-xs"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{workspace.name}</span>
                {isCurrentUserOwner && (
                  <button
                    type="button"
                    onClick={() => {
                      setCompanyNameInput(workspace.name);
                      setIsEditingCompany(true);
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-teal-800 transition-colors"
                    title="Rename Company"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
            <div className="text-[11px] text-slate-500 font-mono">
              Slug: /w/{workspace.slug} &bull; {workspace.spaces.length} spaces &bull; {members.length} members
            </div>
          </div>
        </div>

        {isCurrentUserOwner && !isEditingCompany && (
          <button
            type="button"
            onClick={() => {
              setCompanyNameInput(workspace.name);
              setIsEditingCompany(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-500" />
            <span>Rename Company</span>
          </button>
        )}
      </div>

      {/* Members Table */}
      <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-xs">
        <div className="grid grid-cols-12 bg-[#f8f7f4] px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
          <div className="col-span-4">Member / User ID</div>
          <div className="col-span-3">Role & Access</div>
          <div className="col-span-2">Account Status</div>
          <div className="col-span-3 text-right">Owner Controls</div>
        </div>

        <div className="divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading members from database...</div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className={`grid grid-cols-12 items-center px-5 py-3.5 text-xs transition-colors ${
                  member.isFrozen ? 'bg-rose-50/40' : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Member Info */}
                <div className="col-span-4 flex items-center gap-3 overflow-hidden pr-2">
                  <Avatar user={member} size="md" />
                  <div className="truncate">
                    <div className="font-bold text-slate-900 truncate flex items-center gap-2">
                      <span>{member.fullName}</span>
                      {member.id === currentUser.id && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600 font-semibold">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      ID: @{member.username}
                    </div>
                  </div>
                </div>

                {/* Role Badge */}
                <div className="col-span-3">
                  {member.role === 'owner' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-navy text-white shadow-2xs">
                      <ShieldCheck className="w-3 h-3 text-teal-300" />
                      Workspace Owner
                    </span>
                  ) : member.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
                      <Shield className="w-3 h-3 text-teal-800" />
                      Admin
                    </span>
                  ) : member.role === 'member' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Member
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <Eye className="w-3 h-3 text-amber-600" />
                      Viewer
                    </span>
                  )}
                </div>

                {/* Status Badge (Active vs Frozen) */}
                <div className="col-span-2">
                  {member.isFrozen ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                      <Lock className="w-3 h-3 text-rose-600" />
                      FROZEN
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Controls Column */}
                <div className="col-span-3 flex items-center justify-end gap-1.5">
                  {/* Freeze / Unfreeze Button (only for other accounts, never owner) */}
                  {isCurrentUserOwner && member.role !== 'owner' && (
                    <button
                      type="button"
                      onClick={() => toggleFreezeMember(member)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                        member.isFrozen
                          ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title={member.isFrozen ? 'Un-freeze account' : 'Freeze account (block login)'}
                    >
                      {member.isFrozen ? (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-rose-700" />
                          <span className="hidden sm:inline">Unfreeze</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                          <span className="hidden sm:inline">Freeze</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Edit / Change Password Button: available for Owner on ANY account (including their own!) */}
                  {(isCurrentUserOwner || member.id === currentUser.id) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMember(member);
                        setEditFullName(member.fullName);
                        setEditRole(member.role);
                        setEditNewPassword('');
                      }}
                      className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                        member.id === currentUser.id
                          ? 'border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                      title={member.id === currentUser.id ? 'Change My Password / Edit Profile' : 'Edit Profile & Password'}
                    >
                      <KeyRound className="w-3.5 h-3.5 text-teal-800" />
                      <span className="hidden sm:inline">
                        {member.id === currentUser.id ? 'Change Password' : 'Edit'}
                      </span>
                    </button>
                  )}

                  {/* Delete Button (only for non-owner accounts) */}
                  {isCurrentUserOwner && member.role !== 'owner' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Permanently Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Member Modal (ONLY User ID, Full Name, Password, Role required) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateMember}
            className="w-full max-w-md bg-white rounded-2xl shadow-modal border border-slate-200 p-6 animate-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-800" />
                Add Team Member
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  User ID / Username <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. dev_jordan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password <span className="text-rose-600">*</span>
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Create temporary or permanent password..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Team Role <span className="text-rose-600">*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as WorkspaceRole)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 font-medium"
                >
                  <option value="admin">Admin - Can manage spaces, members, and freeze accounts</option>
                  <option value="member">Member - Standard contributor (tasks, docs)</option>
                  <option value="viewer">Viewer - Read-only stakeholder</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg shadow-xs"
              >
                Create Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUpdateMember}
            className="w-full max-w-md bg-white rounded-2xl shadow-modal border border-slate-200 p-6 animate-in zoom-in-95 duration-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-800" />
                Edit Account: @{editingMember.username}
              </h3>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role</label>
                {editingMember.role === 'owner' ? (
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center justify-between">
                    <span>Workspace Owner (Non-transferable)</span>
                    <ShieldCheck className="w-4 h-4 text-teal-800" />
                  </div>
                ) : (
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as WorkspaceRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 font-medium"
                  >
                    <option value="admin">Admin - Can manage spaces and members</option>
                    <option value="member">Member - Standard sprint contributor</option>
                    <option value="viewer">Viewer - Read-only stakeholder</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Reset Password <span className="font-normal text-slate-400">(leave blank to keep unchanged)</span>
                </label>
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="Enter new password to overwrite..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="px-3.5 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-lg shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
