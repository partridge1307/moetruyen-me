const MangaAuthorSkeleton = () => {
  return (
    <div className="space-y-2">
      <label htmlFor="author-skeleton" className="text-sm">
        Tác giả
      </label>
      <div
        id="author-skeleton"
        className="h-10 rounded-md animate-pulse dark:bg-zinc-900"
      />
    </div>
  );
};

export default MangaAuthorSkeleton;
