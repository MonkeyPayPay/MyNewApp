import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { track } from '../lib/analytics'

export function useCircle() {
  const { user } = useAuth()
  const [circle, setCircle] = useState(null)
  const [recipient, setRecipient] = useState(null)
  const [members, setMembers] = useState([])
  const [myRole, setMyRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    fetchCircle()
  }, [user])

  async function fetchCircle() {
    setLoading(true)
    // Get first circle the user belongs to
    const { data: memberRow } = await supabase
      .from('circle_members')
      .select(`
        circle_id,
        role,
        care_circles (
          id,
          care_recipients (*)
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: true })
      .limit(1)
      .single()

    if (memberRow) {
      const c = memberRow.care_circles
      setCircle(c)
      setRecipient(c.care_recipients)
      setMyRole(memberRow.role)

      // Fetch all members
      const { data: memberList } = await supabase
        .from('circle_members')
        .select('user_id, role, profiles(full_name, avatar_url)')
        .eq('circle_id', c.id)

      setMembers(memberList || [])
    }

    setLoading(false)
  }

  async function createCircle({ recipientName, recipientDob }) {
    // 1. Create recipient
    const { data: rec, error: recErr } = await supabase
      .from('care_recipients')
      .insert({ full_name: recipientName, date_of_birth: recipientDob, created_by: user.id })
      .select()
      .single()

    if (recErr) return { error: recErr }

    // 2. Create circle
    const { data: circ, error: circErr } = await supabase
      .from('care_circles')
      .insert({ care_recipient_id: rec.id, created_by: user.id })
      .select()
      .single()

    if (circErr) return { error: circErr }

    // 3. Add creator as owner
    await supabase
      .from('circle_members')
      .insert({ circle_id: circ.id, user_id: user.id, role: 'owner' })

    await fetchCircle()
    return { circle: circ }
  }

  async function inviteMember(email, role = 'member') {
    if (!circle) return { error: new Error('No circle') }
    const { data, error } = await supabase
      .from('invitations')
      .insert({ circle_id: circle.id, invited_by: user.id, email, role })
      .select()
      .single()

    // Send the email immediately — no Database Webhook config required.
    // (If you configure the invitations DB webhook instead, remove this
    // invoke to avoid duplicate emails.)
    if (!error && data) {
      supabase.functions.invoke('send-invite', { body: { invitation_id: data.id } }).catch(() => {})
      track('invite_sent')
    }

    return { data, error }
  }

  return { circle, recipient, members, myRole, loading, createCircle, inviteMember, refetch: fetchCircle }
}
