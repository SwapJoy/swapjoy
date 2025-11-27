import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { JWT } from 'npm:google-auth-library@9'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Interface for notification webhook payload
interface NotificationRecord {
  id: string
  user_id: string
  type: string
  title: string | null
  message: string
  data: Record<string, any> | null
  created_at: string
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: NotificationRecord
  schema: 'public'
  old_record: NotificationRecord | null
}

// Get Firebase service account from environment or file
function getServiceAccount() {
  const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT')
  if (serviceAccountJson) {
    return JSON.parse(serviceAccountJson)
  }
  
  // Fallback: try to read from file (for local development)
  // Check parent directory first (supabase/functions/service-account.json)
  try {
    const fileContent = Deno.readTextFileSync('../service-account.json')
    return JSON.parse(fileContent)
  } catch {
    // Fallback to same directory
    try {
      const fileContent = Deno.readTextFileSync('./service-account.json')
      return JSON.parse(fileContent)
    } catch {
      throw new Error('Firebase service account not found. Set FIREBASE_SERVICE_ACCOUNT env var or provide service-account.json file in supabase/functions/ directory.')
    }
  }
}

// Get FCM access token using service account
async function getFCMAccessToken(serviceAccount: any): Promise<string> {
  const jwtClient = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  })

  try {
    const tokens = await jwtClient.authorize()

    if (!tokens || !tokens.access_token) {
      console.error('FCM access token response missing access_token:', tokens)
      throw new Error('Failed to get FCM access token')
    }

    return tokens.access_token
  } catch (error) {
    console.error('Error fetching FCM access token:', error)
    throw error
  }
}

// Send FCM notification to a single device
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
): Promise<{ success: boolean; error?: string }> {
  try {
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
            data: notification.data ? 
              Object.fromEntries(
                Object.entries(notification.data).map(([k, v]) => [k, String(v)])
              ) : undefined,
            // Include badge count for iOS & Android if provided
            apns: notification.badge !== undefined ? {
              payload: {
                aps: {
                  // iOS app icon badge count
                  badge: notification.badge,
                },
              },
            } : undefined,
            android: notification.badge !== undefined ? {
              notification: {
                // Shown as a badge on supported Android launchers
                notificationCount: notification.badge,
              },
            } : undefined,
          },
        }),
      }
    )

    const responseData = await response.json()

    if (!response.ok) {
      // Check for invalid token errors
      if (response.status === 404 || 
          responseData.error?.status === 'NOT_FOUND' ||
          responseData.error?.message?.includes('Invalid registration token')) {
        return { success: false, error: 'INVALID_TOKEN' }
      }
      
      return { 
        success: false, 
        error: responseData.error?.message || 'FCM send failed' 
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending FCM notification:', error)
    return { 
      success: false, 
      error: error.message || 'Unknown error' 
    }
  }
}

// Retry function with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded')
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse webhook payload
    const payload: WebhookPayload = await req.json()
    
    // Only handle INSERT events
    if (payload.type !== 'INSERT') {
      return new Response(
        JSON.stringify({ message: 'Ignoring non-INSERT event' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const notification = payload.record
    const userId = notification.user_id

    console.log(`Processing notification for user ${userId}:`, {
      type: notification.type,
      title: notification.title,
      message: notification.message,
    })

    // Create Supabase client
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

    // Fetch all enabled devices for the user
    const { data: devices, error: devicesError } = await supabaseClient
      .from('devices')
      .select('id, device_id, fcm_token, platform')
      .eq('user_id', userId)
      .eq('enabled', true)
      .not('fcm_token', 'is', null)

    if (devicesError) {
      throw new Error(`Failed to fetch devices: ${devicesError.message}`)
    }

    if (!devices || devices.length === 0) {
      console.log(`No enabled devices found for user ${userId}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No devices to notify',
          devicesCount: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`Found ${devices.length} device(s) for user ${userId}`)

    // Compute unread notifications count to use for badge
    let unreadNotifications = 0
    try {
      const { error: unreadError, count } = await supabaseClient
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (unreadError) {
        console.warn('Failed to compute unread notifications count:', unreadError.message)
      } else if (typeof count === 'number') {
        unreadNotifications = count
      }
    } catch (countError) {
      console.warn('Exception while computing unread notifications count:', countError)
    }

    console.log(`Unread notifications for user ${userId}: ${unreadNotifications}`)

    // Compute chats with unread messages for consolidated badge
    let unreadChats = 0
    try {
      const { data: chatsWithUnread, error: unreadChatError } = await supabaseClient
        .from('chat_messages')
        .select('chat_id, sender_id, is_read')
        .eq('is_read', false)
        .neq('sender_id', userId)

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

    const totalBadge = unreadNotifications + unreadChats

    // Get Firebase service account and access token
    const serviceAccount = getServiceAccount()
    const projectId = serviceAccount.project_id
    const accessToken = await getFCMAccessToken(serviceAccount)

    // Prepare notification payload
    const notificationTitle = notification.title || 
      `SwapJoy ${notification.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`
    const notificationBody = notification.message
    
    // Prepare data payload for deep linking
    // FCM data fields must be strings
    const notificationData: Record<string, string> = {
      type: notification.type,
      notificationId: notification.id,
      badge: String(totalBadge),
      ...(notification.data ? 
        Object.fromEntries(
          Object.entries(notification.data).map(([k, v]) => [k, String(v)])
        ) : {}
      ),
    }

    // Send notifications to all devices
    const results = await Promise.allSettled(
      devices.map(async (device) => {
        const result = await retryWithBackoff(
          () => sendFCMNotification(
            device.fcm_token,
            accessToken,
            projectId,
            {
              title: notificationTitle,
              body: notificationBody,
              data: notificationData,
              badge: totalBadge,
            }
          ),
          3, // max retries
          1000 // initial delay 1s
        )

        // Handle invalid tokens - disable the device
        if (!result.success && result.error === 'INVALID_TOKEN') {
          console.log(`Disabling device ${device.id} due to invalid token`)
          await supabaseClient
            .from('devices')
            .update({ enabled: false })
            .eq('id', device.id)
        }

        return {
          deviceId: device.id,
          deviceIdentifier: device.device_id,
          platform: device.platform,
          success: result.success,
          error: result.error,
        }
      })
    )

    // Process results
    const successful = results.filter(r => 
      r.status === 'fulfilled' && r.value.success
    ).length
    const failed = results.length - successful

    console.log(`Notification delivery: ${successful} successful, ${failed} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications sent to ${successful} device(s)`,
        devicesCount: devices.length,
        successful,
        failed,
        results: results.map(r => 
          r.status === 'fulfilled' ? r.value : { error: r.reason }
        ),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in push function:', error)
    const errorDetails = (() => {
      try {
        if (error && typeof error === 'object') {
          return JSON.stringify(error)
        }
        return String(error)
      } catch (_) {
        return 'Unable to stringify error'
      }
    })()

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error',
        details: errorDetails,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

