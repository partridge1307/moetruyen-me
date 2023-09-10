const MangaTagSkeleton = () => {
  return (
    <div className="space-y-2">
      <label htmlFor="tag-skeleton" className="text-sm">
        Thể loại
      </label>
      <div
        id="tag-skeleton"
        className="h-10 rounded-md animate-pulse dark:bg-zinc-900"
      />
    </div>
  );
};

export default MangaTagSkeleton;
