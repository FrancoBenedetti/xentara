'use client'

import { useEffect, useState } from 'react'
import { getHubMembers, updateMemberRole, removeMember, HubMember } from '@/app/dashboard/actions'
import InviteMemberForm from './InviteMemberForm'

export default function TeamManager({ hubId, userRole }: { hubId: string, userRole: string }) {
  const [members, setMembers] = useState<HubMember[]>([])
  const [loading, setLoading] = useState(true)

  const isOwner = userRole === 'owner'

  useEffect(() => {
    getHubMembers(hubId).then(data => {
      setMembers(data)
      setLoading(false)
    })
  }, [hubId])

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    await updateMemberRole(hubId, userId, newRole)
    const updatedMembers = members.map(m => m.user_id === userId ? { ...m, role: newRole as any } : m)
    setMembers(updatedMembers)
  }

  const handleRemove = async (userId: string) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return
    await removeMember(hubId, userId)
    setMembers(members.filter(m => m.user_id !== userId))
  }

  if (loading) return <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>SYNCING TEAM...</div>

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '0.875rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '0.05em' }}>
        TEAM COLLABORATORS
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {members.map(member => (
          <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--indigo), #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '0.75rem' }}>
                    {member.profiles.email[0].toUpperCase()}
                </div>
                <div>
                   <div style={{ fontSize: '0.875rem', fontWeight: 800 }}>{member.profiles.display_name || member.profiles.email.split('@')[0]}</div>
                   <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>{member.profiles.email.toUpperCase()}</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div
                    style={{
                      background: member.role === 'owner' ? 'var(--indigo-soft)' : 'transparent',
                      color: member.role === 'owner' ? 'var(--indigo)' : 'var(--text-muted)',
                      border: member.role === 'owner' ? '1px solid var(--indigo)' : '1px solid var(--border)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      fontWeight: 900,
                      textTransform: 'uppercase'
                    }}
                >
                    {member.role}
                </div>

                {isOwner && member.role !== 'owner' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            defaultValue={member.role}
                            onChange={(e) => handleRoleUpdate(member.user_id, e.target.value)}
                            style={{ background: 'transparent', border: '1px solid var(--border)', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem', color: 'var(--text-main)', borderRadius: '4px' }}
                        >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="owner">Promote to Owner</option>
                        </select>
                        <button
                            onClick={() => handleRemove(member.user_id)}
                            style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}
                        >
                            REMOVE
                        </button>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {isOwner && <InviteMemberForm hubId={hubId} />}
    </div>
  )
}
