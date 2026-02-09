# SEO Integration Examples

Quick reference for adding SEO-friendly links to your components.

## 📖 Story Cards

**Before:**
```tsx
<div onClick={() => navigate(`/story/view/${story.id}`)}>
  {story.storyTitle}
</div>
```

**After:**
```tsx
import { getPublicStoryUrl } from '../../utils/seoLinks';

<div onClick={() => navigate(getPublicStoryUrl(story.storyTitle, story.id))}>
  {story.storyTitle}
</div>
```

## 📝 Poem Cards

**Before:**
```tsx
<div onClick={() => navigate(`/poem/view/${poem.id}`)}>
  {poem.title}
</div>
```

**After:**
```tsx
import { getPublicPoemUrl } from '../../utils/seoLinks';

<div onClick={() => navigate(getPublicPoemUrl(poem.title, poem.id))}>
  {poem.title}
</div>
```

## 👤 User Profiles

**Before:**
```tsx
<div onClick={() => navigate(`/profile/${username}`)}>
  {username}
</div>
```

**After:**
```tsx
import { getPublicUserUrl } from '../../utils/seoLinks';

<div onClick={() => navigate(getPublicUserUrl(username))}>
  {username}
</div>
```

## 🔗 Share Button with Copy Link

```tsx
import { getShareableStoryUrl } from '../../utils/seoLinks';

function ShareButton({ story }) {
  const handleShare = async () => {
    const shareUrl = getShareableStoryUrl(story.storyTitle, story.id);
    
    // Try Web Share API first
    if (navigator.share) {
      await navigator.share({
        title: story.storyTitle,
        text: story.excerptBody,
        url: shareUrl
      });
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return <button onClick={handleShare}>Share Story</button>;
}
```

## 🔍 Check if Content is Publicly Visible

```tsx
import { isPubliclyAccessible } from '../../utils/seoLinks';

function StoryItem({ story }) {
  const showPublicBadge = isPubliclyAccessible(story.privacy, story.status);
  
  return (
    <div>
      {story.storyTitle}
      {showPublicBadge && <span>🌐 Public</span>}
    </div>
  );
}
```

## 📱 Trending/Dashboard Feed

Update your existing feed components to use SEO links:

```tsx
// In TrendingPage.tsx or DashboardPage.tsx
import { getPublicStoryUrl, getPublicPoemUrl } from '../../utils/seoLinks';

// For stories:
const handleStoryClick = (story) => {
  const url = getPublicStoryUrl(story.storyTitle, story.id);
  navigate(url);
};

// For poems:
const handlePoemClick = (poem) => {
  const url = getPublicPoemUrl(poem.title, poem.id);
  navigate(url);
};
```

## 🏷️ Add Meta Tags to Existing Pages

For pages that already exist but need better SEO:

```tsx
import SEOHead from '../../components/seo/SEOHead';
import { generateCanonicalUrl } from '../../utils/seo';

function MyPage() {
  return (
    <>
      <SEOHead
        title="Page Title"
        description="Page description for search engines"
        canonical={generateCanonicalUrl('/my-page')}
      />
      
      {/* Your existing content */}
    </>
  );
}
```

## ⚠️ Private Content Protection

Always check privacy before showing public links:

```tsx
import { isPubliclyAccessible, getShareableStoryUrl } from '../../utils/seoLinks';

function StoryActions({ story }) {
  const canShare = isPubliclyAccessible(story.privacy, story.status);
  
  if (!canShare) {
    return <p>This story is private</p>;
  }
  
  const shareUrl = getShareableStoryUrl(story.storyTitle, story.id);
  
  return (
    <button onClick={() => navigator.clipboard.writeText(shareUrl)}>
      Copy Public Link
    </button>
  );
}
```

## 🔄 Backward Compatibility

The old routes still work! Users with bookmarked `/story/view/:id` URLs will still access content.

To support both:
```tsx
// In App.tsx (already added)
// Old routes (kept for backward compatibility)
<Route path="/story/view/:storyId" element={<ProtectedRoute><StoryReaderPage /></ProtectedRoute>} />

// New SEO routes (public, no auth)
<Route path="/story/:slug" element={<PublicStoryPage />} />
```

## 🎯 Key Benefits

✅ **SEO-Friendly**: URLs like `/story/the-dark-forest-a1b2c3d4` instead of `/story/view/a1b2c3d4-e5f6-7890`
✅ **Human Readable**: Users can read what the story is about from the URL
✅ **Stable**: Changing the title doesn't break old links (ID-based lookup)
✅ **Shareable**: Perfect for social media, messaging, bookmarks
✅ **Google Indexed**: Public content appears in search results

## 📊 Priority Updates

High priority components to update:
1. ✅ `TrendingPage.tsx` - Already using IDs, update to slugs
2. ✅ `DashboardPage.tsx/TrendingFeed.tsx` - Story/poem cards
3. ✅ `ProfilePage.tsx` - Published content display
4. ✅ `StoryCard.tsx` / `PoemCard.tsx` - Reusable cards
5. ✅ Share buttons and social sharing features
