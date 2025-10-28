# Add New Item Implementation

## Overview
This document describes the complete implementation of the "Add New Item" flow in SwapJoy.

## Flow Summary
1. **Camera/Gallery Selection** → User captures/selects up to 5 photos
2. **Item Details Form** → User fills in title, description, category, condition, estimated value
3. **Preview Screen** → User reviews the listing before submission
4. **Submission** → Item is created in Supabase with images

## Files Created

### 1. Type Definitions
**File:** `types/item.ts`
- `ItemDraft` - Draft structure stored in AsyncStorage
- `DraftImage` - Image metadata with upload status
- `Category`, `Item`, `ItemImage` - Database entity types
- `ItemCondition` - Type for item conditions
- `CreateItemInput`, `CreateItemImageInput` - API input types

### 2. Services

#### Draft Manager (`services/draftManager.ts`)
Manages draft storage in AsyncStorage:
- `createDraft()` - Create new draft from image URIs
- `saveDraft()` - Save draft to storage
- `getDraft()` - Retrieve draft by ID
- `updateDraft()` - Update draft fields
- `updateDraftImage()` - Update image upload status
- `deleteDraft()` - Remove draft after submission
- `isDraftComplete()` - Validation check
- `getDraftCompletionPercentage()` - Progress tracking

#### Image Upload Service (`services/imageUpload.ts`)
Handles Supabase Storage uploads:
- `uploadImage()` - Upload single image with progress
- `uploadMultipleImages()` - Batch upload with retry logic (3 attempts)
- `deleteImage()` - Remove image from storage
- `validateImageSize()` - Check file size (max 10MB)
- Upload path: `{userId}/{draftId}/{imageId}.jpg`
- Target bucket: `images`

### 3. Screens

#### Camera Screen (`screens/CameraScreen.tsx`)
**Updated with new features:**
- Multiple photo capture (up to 5)
- Gallery selection via ImagePicker
- Thumbnail carousel showing captured photos
- Photo removal functionality
- "Next" button (top-right) when photos are captured
- Creates draft and navigates to ItemDetailsFormScreen

#### Item Details Form Screen (`screens/ItemDetailsFormScreen.tsx`)
**Form fields:**
- Title (required, max 100 chars)
- Description (required, max 1000 chars, multiline)
- Category (required, picker modal)
- Condition (required, picker modal with icons)
- Estimated Value (required, decimal input with $ prefix)

**Features:**
- Auto-save with 500ms debounce
- Background image upload with progress bar
- Real-time upload status indicators on thumbnails
- Category and Condition picker modals
- Form validation before navigation
- "Next" button disabled until images uploaded

#### Item Preview Screen (`screens/ItemPreviewScreen.tsx`)
**Features:**
- Full-width image carousel with indicators
- Formatted item details display
- Category and condition tags
- Price display
- Complete item information section
- Edit button (goes back to form)
- Submit button with confirmation dialog
- Creates item in database on submit
- Deletes draft after successful submission
- Navigates to ItemDetails screen

### 4. Navigation Updates

**New Routes Added:**
- `Camera` - Full screen modal for camera
- `ItemDetailsForm` - Form screen (params: draftId, imageUris)
- `ItemPreview` - Preview screen (params: draftId)

**Navigation Flow:**
```
AddItem → Camera → ItemDetailsForm → ItemPreview → ItemDetails
```

### 5. API Methods

**Added to `services/api.ts`:**
- `getCategories()` - Fetch active categories (cached 1 hour)
- `createItem()` - Create item with user_id and status='available'
- `createItemImages()` - Batch insert item images
- `getItemById()` - Fetch item with relations (category, user, images)

**Updated:**
- `createItem()` - Now sets user_id from AuthService.getCurrentUser()

## Database Schema Requirements

### Tables Used:
1. **categories** - Item categories
2. **items** - Main items table
3. **item_images** - Item image URLs and metadata

### Storage Bucket:
- **Bucket name:** `images`
- **Access:** Public read, authenticated write
- **Path structure:** `{userId}/{draftId}/{imageId}.jpg`

## Dependencies Added

Installed packages:
- `expo-image-picker` - Gallery selection
- `expo-file-system` - File operations
- `uuid` - Draft ID generation

## Draft Management

### Storage Strategy:
- **Metadata:** AsyncStorage (`@swapjoy_drafts`)
- **Images:** Local URIs, uploaded to Supabase Storage
- **Persistence:** Survives app restarts
- **Cleanup:** Deleted after successful submission

### Draft Structure:
```typescript
{
  id: string,
  title: string,
  description: string,
  category_id: string | null,
  condition: ItemCondition | null,
  estimated_value: string,
  currency: string,
  images: [{
    id: string,
    uri: string,
    uploaded: boolean,
    supabaseUrl?: string,
    uploadProgress?: number
  }],
  created_at: string,
  updated_at: string
}
```

## Error Handling

### Upload Failures:
- Automatic retry (3 attempts with exponential backoff)
- Individual image error tracking
- User can proceed if most images upload successfully

### Form Validation:
- All required fields must be filled
- All images must be uploaded before proceeding
- Value must be numeric

### Network Issues:
- Graceful fallback for Redis cache failures
- Error alerts with retry options
- Draft preserved on failure

## Future Enhancements (Not in Current Scope)

1. **Drafts Collection in Profile**
   - View all saved drafts
   - Resume from any draft
   - Delete old drafts

2. **Image Editing**
   - Crop/rotate images
   - Add filters
   - Reorder images

3. **Location Selection**
   - Manual location picker
   - GPS-based location

4. **Advanced Fields**
   - Multiple categories
   - Custom tags
   - Shipping options

## Testing Checklist

- [ ] Camera capture works on iOS/Android
- [ ] Gallery selection works
- [ ] Multiple photos (up to 5)
- [ ] Image upload with progress
- [ ] Draft auto-save
- [ ] Form validation
- [ ] Category loading
- [ ] Preview display
- [ ] Item submission
- [ ] Draft cleanup
- [ ] Navigation flow
- [ ] Back button preserves draft
- [ ] App restart preserves draft

## Notes

- Maximum 5 photos per item
- Images uploaded during form screen (background)
- Draft saved on every field change (debounced)
- User can edit from preview screen
- Draft deleted only after successful submission
- Categories cached for 1 hour

