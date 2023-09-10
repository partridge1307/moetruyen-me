import EditorSkeleton from './EditorSkeleton';
import MangaAuthorSkeleton from './MangaAuthorSkeleton';
import MangaTagSkeleton from './MangaTagSkeleton';

const MangaUploadSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="image-skeleton"
          className="text-sm after:content-['*'] after:text-red-500 after:pl-0.5"
        >
          Ảnh bìa
        </label>
        <div
          id="image-skeleton"
          className="rounded-md animate-pulse dark:bg-zinc-900"
          style={{ aspectRatio: 4 / 3 }}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="name-skeleton" className="text-sm">
          Tên truyện
        </label>
        <div
          id="name-skeleton"
          className="h-10 rounded-md animate-pulse dark:bg-zinc-900"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="slug-skeleton" className="text-sm">
          Slug
        </label>
        <div
          id="slug-skeleton"
          className="h-10 rounded-md animate-pulse dark:bg-zinc-900"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="altName-skeleton" className="text-sm">
          Tên khác (nếu có)
        </label>
        <div
          id="altName-skeleton"
          className="h-10 rounded-md animate-pulse dark:bg-zinc-900"
        />
      </div>

      <MangaAuthorSkeleton />

      <MangaTagSkeleton />

      <div className="space-y-2">
        <label htmlFor="description-skeleton" className="text-sm">
          Mô tả
        </label>
        <EditorSkeleton />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="review-skeleton"
          className="after:content-['*'] after:text-red-500 after:pl-0.5 text-sm"
        >
          Sơ lược
        </label>
        <div
          id="review-skeleton"
          className="h-10 rounded-md animate-pulse dark:bg-zinc-900"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="fb-skeleton" className="text-sm">
          Link Facebook (Nếu có)
        </label>
        <div
          id="fb-skeleton"
          className="h-10 rounded-md animate-pulse dark:bg-zinc-900"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="disc-skeleton" className="text-sm">
          Link Discord (Nếu có)
        </label>
        <div
          id="disc-skeleton"
          className="h-10 rounded-md animate-pulse dark:bg-zinc-900"
        />
      </div>

      <div className="h-10 rounded-md animate-pulse dark:bg-zinc-900" />
    </div>
  );
};

export default MangaUploadSkeleton;
