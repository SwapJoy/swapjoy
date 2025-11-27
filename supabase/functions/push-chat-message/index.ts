import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessageRecord {
  id: number
  chat_id: string
  sender_id: string
  content_text: string | null
  content_type: 'text' | 'image'
  media_url: string | null
  created_at: string
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: ChatMessageRecord
  schema: 'public'
  old_record: ChatMessageRecord | null
}

function getServiceAccount() {
  const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
  if (serviceAccountJson) {
    return JSON.parse(serviceAccountJson)
  }
  const fileContent = Deno.readTextFileSync('../service-account.json')
  return JSON.parse(fileContent)
}

async function getFCMAccessToken(serviceAccount: any): Promise<string> {
  const jwtClient = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  })

  const tokens = await jwtClient.authorize()
  if (!tokens || !tokens.access_token) {
    throw new Error('Failed to get FCM access token')
  }
  return tokens.access_token
}

async function sendFCMNotification(
  fcmToken: string,
  accessToken: string,
  projectId: string,
  notification: {
    title: string
    body: string
    data?: Record<string, string>
    badge?: number
  }
) {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: fcmToken,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data,
          apns: notification.badge !== undefined ? {
            payload: {
              aps: {
                badge: notification.badge,
              },
            },
          } : undefined,
          android: notification.badge !== undefined ? {
            notification: {
              notificationCount: notification.badge,
            },
          } : undefined,
        },
      }),
    }
  )

  if (!response.ok) {
    const data = await response.json()
    console.error('FCM error:', data)
    const message = data?.error?.message || 'FCM send failed'
    if (message.includes('Invalid registration token')) {
      return { success: false, error: 'INVALID_TOKEN' as const }
    }
    return { success: false, error: message as string }
  }

  return { success: true as const }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload: WebhookPayload = await req.json()

    if (payload.type !== 'INSERT') {
      return new Response(JSON.stringify({ message: 'Ignoring non-INSERT event' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const message = payload.record

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Fetch chat with participants
    const { data: chat, error: chatError } = await supabaseClient
      .from('chats')
      .select('id, offer_id, buyer_id, seller_id')
      .eq('id', message.chat_id)
      .single()

    if (chatError || !chat) {
      console.error('Failed to fetch chat for message', message.id, chatError)
      return new Response(JSON.stringify({ success: false, error: 'Chat not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    const senderId = message.sender_id
    const receiverId = senderId === chat.buyer_id ? chat.seller_id : chat.buyer_id

    // Fetch sender profile for display name
    const { data: sender, error: senderError } = await supabaseClient
      .from('users')
      .select('id, username, first_name, last_name')
      .eq('id', senderId)
      .single()

    if (senderError) {
      console.warn('Failed to fetch sender profile:', senderError.message)
    }

    const senderName =
      (sender?.first_name || '') + ' ' + (sender?.last_name || '') ||
      sender?.username ||
      'Someone'

    // Fetch receiver devices
    const { data: devices, error: devicesError } = await supabaseClient
      .from('devices')
      .select('id, device_id, fcm_token, platform')
      .eq('user_id', receiverId)
      .eq('enabled', true)
      .not('fcm_token', 'is', null)

    if (devicesError) {
      throw new Error(`Failed to fetch devices: ${devicesError.message}`)
    }

    if (!devices || devices.length === 0) {
      console.log(`No enabled devices found for user ${receiverId}`)
      return new Response(
        JSON.stringify({ success: true, message: 'No devices to notify', devicesCount: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
      )
    }

    // Compute unread notifications
    let unreadNotifications = 0
    try {
      const { count, error: unreadError } = await supabaseClient
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', receiverId)
        .eq('is_read', false)

      if (!unreadError && typeof count === 'number') {
        unreadNotifications = count
      }
    } catch (err) {
      console.warn('Failed to compute unread notifications count:', err)
    }

    // Compute chats with unread messages for receiver
    let unreadChats = 0
    try {
      const { data: chatsWithUnread, error: unreadChatError } = await supabaseClient
        .from('chat_messages')
        .select('chat_id, sender_id, is_read')
        .eq('is_read', false)
        .neq('sender_id', receiverId)

      if (!unreadChatError && Array.isArray(chatsWithUnread)) {
        const uniqueChatIds = new Set<string>()
        chatsWithUnread.forEach((row: any) => {
          uniqueChatIds.add(row.chat_id)
        })
        unreadChats = uniqueChatIds.size
      }
    } catch (err) {
      console.warn('Failed to compute unread chats count:', err)
    }

    const badgeCount = unreadNotifications + unreadChats

    const serviceAccount = getServiceAccount()
    const projectId = serviceAccount.project_id
    const accessToken = await getFCMAccessToken(serviceAccount)

    const title = `${senderName} sent a message`
    const body =
      message.content_type === 'image'
        ? 'Sent you an image'
        : (message.content_text || 'New message')

    const data: Record<string, string> = {
      type: 'chat_message',
      chatId: String(chat.id),
      offerId: String(chat.offer_id),
      senderId: String(senderId),
      badge: String(badgeCount),
    }

    const results = await Promise.all(
      devices.map(async (device) => {
        const result = await sendFCMNotification(device.fcm_token, accessToken, projectId, {
          title,
          body,
          data,
          badge: badgeCount,
        })

        if (!result.success && result.error === 'INVALID_TOKEN') {
          await supabaseClient
            .from('devices')
            .update({ enabled: false })
            .eq('id', device.id)
        }

        return {
          deviceId: device.id,
          success: result.success,
          error: result.success ? undefined : result.error,
        }
      }),
    )

    const successful = results.filter((r) => r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        devicesCount: devices.length,
        successful,
        failed: devices.length - successful,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error: any) {
    console.error('Error in push-chat-message function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})


