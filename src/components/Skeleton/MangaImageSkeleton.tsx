const MangaImageSkeleton = () => {
  return (
    <div className="space-y-2">
      <p className="text-sm after:content-['*'] after:text-red-500 after:pl-0.5">
        Ảnh
      </p>
      <div
        className="w-1/4 rounded-md animate-pulse dark:bg-zinc-900"
        style={{ aspectRatio: 5 / 7 }}
      />
    </div>
  );
};

export default MangaImageSkeleton;
