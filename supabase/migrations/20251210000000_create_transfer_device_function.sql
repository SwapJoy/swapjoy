set search_path = public;

-- Function to register or transfer a device to a user
-- This function bypasses RLS to allow transferring devices between users
-- when a new user signs in on the same device (same FCM token)
CREATE OR REPLACE FUNCTION register_or_transfer_device(
  p_user_id UUID,
  p_device_id TEXT,
  p_platform TEXT,
  p_fcm_token TEXT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  device_id TEXT,
  platform TEXT,
  fcm_token TEXT,
  enabled BOOLEAN,
  last_seen TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER -- Bypass RLS
AS $$
DECLARE
  v_device_record RECORD;
BEGIN
  -- Check if device with this FCM token already exists
  SELECT * INTO v_device_record
  FROM devices
  WHERE devices.fcm_token = p_fcm_token
  LIMIT 1;

  IF v_device_record IS NOT NULL THEN
    -- Device exists - update it to the new user
    UPDATE devices
    SET
      user_id = p_user_id,
      device_id = p_device_id,
      platform = p_platform,
      enabled = true,
      last_seen = NOW()
    WHERE devices.fcm_token = p_fcm_token
    RETURNING * INTO v_device_record;

    RETURN QUERY SELECT
      v_device_record.id,
      v_device_record.user_id,
      v_device_record.device_id,
      v_device_record.platform,
      v_device_record.fcm_token,
      v_device_record.enabled,
      v_device_record.last_seen;
  ELSE
    -- Device doesn't exist - insert new one
    INSERT INTO devices (user_id, device_id, platform, fcm_token, enabled, last_seen)
    VALUES (p_user_id, p_device_id, p_platform, p_fcm_token, true, NOW())
    RETURNING * INTO v_device_record;

    RETURN QUERY SELECT
      v_device_record.id,
      v_device_record.user_id,
      v_device_record.device_id,
      v_device_record.platform,
      v_device_record.fcm_token,
      v_device_record.enabled,
      v_device_record.last_seen;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION register_or_transfer_device(UUID, TEXT, TEXT, TEXT) TO authenticated;

